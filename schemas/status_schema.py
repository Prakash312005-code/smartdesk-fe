from pydantic import BaseModel

# admin changes a ticket status.
class StatusUpdateRequest(BaseModel):
    status: str
    remark: str