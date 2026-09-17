from uuid import uuid4

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from schemas.ticket_schema import TicketRequest
from database.connection import get_db
from models.ticket import Ticket

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

    
@router.get("/")
def get_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).all()

    return {
        "message": "Tickets fetched successfully",
        "tickets": tickets
    }
    return {
        "message": "Ticket created successfully",
        "ticket": new_ticket
    }


    # get ticket by id 
@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket