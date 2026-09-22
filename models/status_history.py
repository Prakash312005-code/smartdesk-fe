from datetime import datetime
# SQLAlchemy types used to define table columns.
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from database.connection import Base


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    old_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    remark = Column(String(500), nullable=False)
    changed_by = Column(String(100), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)