from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database.connection import Base

# we create class  and name the database table and also some information also 
class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    reference_number = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="Open", nullable=False)
    category = Column(String(30), default="General", nullable=False)
    priority = Column(String(20), default="Medium", nullable=False)
    summary = Column(String(500), nullable=True)
created_at = Column(DateTime, default=datetime.utcnow, nullable=False)