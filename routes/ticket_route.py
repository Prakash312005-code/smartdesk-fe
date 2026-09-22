from uuid import uuid4
import logging
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session
from datetime import datetime

from database.connection import get_db
from dependencies.auth import get_current_admin
from models.admin import Admin
from models.status_history import StatusHistory
from models.ticket import Ticket
from schemas.status_schema import StatusUpdateRequest
from schemas.ticket_schema import TicketRequest
from services.ai_service import classify_ticket


router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)

# db parameter/variable
# Allowed AI values
ALLOWED_CATEGORIES = {
    "Technical",
    "Billing",
    "Account",
    "General"
}

ALLOWED_PRIORITIES = {
    "Low",
    "Medium",
    "High"
}

ALLOWED_STATUSES = {
    "Open",
    "In Progress",
    "Resolved",
    "Closed"
}

logger = logging.getLogger(__name__)


# 1. CUSTOMER - CREATE TICKET
# PUBLIC API
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket: TicketRequest,
    db: Session = Depends(get_db)
):
    # Create ticket with default values
    new_ticket = Ticket(
        reference_number=f"TEMP-{uuid4().hex[:8]}",
        name=ticket.name,
        email=ticket.email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open",
        category="General",
        priority="Medium"
    )

    db.add(new_ticket)

    # Get auto-generated database ID
    db.flush()

    # Generate final reference number
    new_ticket.reference_number = f"TKT-{new_ticket.id:05d}"

    # Gemini AI classification
    try:
        ai_result = classify_ticket(
            ticket.subject,
            ticket.description
        )

        print("AI RESULT:", ai_result)

        category = ai_result.get("category")
        priority = ai_result.get("priority")
        summary = ai_result.get("summary")

        # Validate category
        if category not in ALLOWED_CATEGORIES:
            raise ValueError("Invalid AI category")

        # Validate priority
        if priority not in ALLOWED_PRIORITIES:
            raise ValueError("Invalid AI priority")

        # Validate summary
        if not isinstance(summary, str) or not summary.strip():
            raise ValueError("Invalid AI summary")

        # Save AI results
        new_ticket.category = category
        new_ticket.priority = priority
        new_ticket.summary = summary.strip()
# whatis ai fails
    except Exception as e:
        logger.error(
            "Gemini classification failed for %s: %s",
            new_ticket.reference_number,
            e
        )

        print("AI FALLBACK ERROR:", e)

        # Keep default values
        new_ticket.category = "General"
        new_ticket.priority = "Medium"
        new_ticket.summary = None

    # Save ticket
    db.commit()
    db.refresh(new_ticket)

    return {
        "message": "Ticket created successfully",
        "ticket": new_ticket
    }


# 2. ADMIN - GET ALL TICKETS
# SEARCH + FILTER + PAGINATION
@router.get("/")
def get_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    priority: str | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Ticket)

    # Search
    if search:
        search_text = f"%{search}%"

        query = query.filter(
            or_(
                Ticket.reference_number.ilike(search_text),
                Ticket.name.ilike(search_text),
                Ticket.email.ilike(search_text),
                Ticket.subject.ilike(search_text)
            )
        )

    # Status filter
    if status:
        query = query.filter(Ticket.status == status)

    # Category filter
    if category:
        query = query.filter(Ticket.category == category)

    # Priority filter
    if priority:
        query = query.filter(Ticket.priority == priority)

    if from_date:
        query = query.filter(Ticket.created_at >= from_date)

    if to_date:
        query = query.filter(Ticket.created_at <= to_date)

    # Total matching tickets
    total = query.count()

    # Pagination
    skip = (page - 1) * page_size

    tickets = (
        query
        .offset(skip)
        .limit(page_size)
        .all()
    )

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "tickets": tickets
    }


    


# 3. ADMIN - EXPORT FILTERED TICKETS AS CSV
@router.get("/export/csv")
def export_tickets_csv(
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Ticket)

    # Search
    if search:
        search_text = f"%{search}%"

        query = query.filter(
            or_(
                Ticket.reference_number.ilike(search_text),
                Ticket.name.ilike(search_text),
                Ticket.email.ilike(search_text),
                Ticket.subject.ilike(search_text)
            )
        )

    # Filters
    if status:
        query = query.filter(Ticket.status == status)

    if category:
        query = query.filter(Ticket.category == category)

    if priority:
        query = query.filter(Ticket.priority == priority)

    # Get all matching tickets
    tickets = (
        query
        .order_by(Ticket.id.asc())
        .all()
    )

    # Create CSV in memory
    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Reference",
        "Name",
        "Email",
        "Subject",
        "Description",
        "Status",
        "Category",
        "Priority",
        "Summary",
        "Created At"
    ])

    for ticket in tickets:
        writer.writerow([
            ticket.reference_number,
            ticket.name,
            ticket.email,
            ticket.subject,
            ticket.description,
            ticket.status,
            ticket.category,
            ticket.priority,
            ticket.summary or "",
            ticket.created_at
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=tickets.csv"
        }
    )


# 4. ADMIN - GET ONE TICKET
# TICKET DETAILS + STATUS HISTORY
@router.get("/{ticket_id}")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Get status history
    history = (
        db.query(StatusHistory)
        .filter(StatusHistory.ticket_id == ticket.id)
        .order_by(
            StatusHistory.changed_at.asc(),
            StatusHistory.id.asc()
        )
        .all()
    )

    return {
        "ticket": {
            "id": ticket.id,
            "reference_number": ticket.reference_number,
            "name": ticket.name,
            "email": ticket.email,
            "subject": ticket.subject,
            "description": ticket.description,
            "status": ticket.status,
            "category": ticket.category,
            "priority": ticket.priority,
            "summary": ticket.summary,
            "created_at": ticket.created_at
        },

        "status_history": [
            {
                "id": item.id,
                "old_status": item.old_status,
                "new_status": item.new_status,
                "remark": item.remark,
                "changed_by": item.changed_by,
                "changed_at": item.changed_at
            }
            for item in history
        ]
    }


# 5. ADMIN - UPDATE TICKET STATUS
@router.patch("/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    status_data: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    # Find ticket
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )
# Check if ticket exists
    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Validate status
    if status_data.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=422,
            detail="Invalid ticket status"
        )

    # Store old status
    old_status = ticket.status

    # Update ticket
    ticket.status = status_data.status

    # Create history record
    history = StatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status=status_data.status,
        remark=status_data.remark,
        changed_by=current_admin.username
    )

    db.add(history)

    # Save changes
    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket status updated successfully",
        "ticket": ticket
    }