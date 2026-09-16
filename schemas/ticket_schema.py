from pydantic import BaseModel


class TicketRequest(BaseModel):
    name: str
    email: str
    subject: str
    description: str