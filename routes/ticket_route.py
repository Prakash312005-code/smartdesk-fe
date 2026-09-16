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
        reference_number="TKT-00001",
        name=ticket.name,
        email=ticket.email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open",
        category="General",
        priority="Medium"
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "message": "Ticket created successfully",
        "ticket": new_ticket
    }