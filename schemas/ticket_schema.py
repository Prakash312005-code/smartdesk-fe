from pydantic import BaseModel

# customer ticket creation.
class TicketRequest(BaseModel):
    name: str
    email: str
    subject: str
    description: str