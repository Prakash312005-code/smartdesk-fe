from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from schemas.ticket_schema import TicketRequest
from database.connection import get_db
from models.ticket import Ticket

from dependencies.auth import get_current_admin
from models.admin import Admin

from models.status_history import StatusHistory
from schemas.status_schema import StatusUpdateRequest
from dependencies.auth import get_current_admin
from models.admin import Admin

router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket: TicketRequest,
    db: Session = Depends(get_db)
):
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

    # Get the auto-generated database ID
    db.flush()

    # Generate the final customer reference number
    new_ticket.reference_number = f"TKT-{new_ticket.id:05d}"

    db.commit()
    db.refresh(new_ticket)

    return {
        "message": "Ticket created successfully",
        "ticket": new_ticket
    }

# paginatiom
@router.get("/")
def get_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
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

    # Total matching records
    total = query.count()

    # Pagination
    skip = (page - 1) * page_size

    tickets = query.offset(skip).limit(page_size).all()

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "tickets": tickets
    }

# get ticket by ID
@router.get("/{ticket_id}")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

ALLOWED_STATUSES = {
    "Open",
    "In Progress",
    "Resolved",
    "Closed"
}

# patch by id
@router.patch("/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    status_data: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if status_data.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=422,
            detail="Invalid ticket status"
        )

    old_status = ticket.status

    ticket.status = status_data.status

    history = StatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status=status_data.status,
        remark=status_data.remark,
        changed_by=current_admin.username
    )

    db.add(history)
    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket status updated successfully",
        "ticket": ticket
    }
    return ticket