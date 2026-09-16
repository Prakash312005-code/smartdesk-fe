from fastapi import FastAPI

from database.connection import engine, Base
from models.ticket import Ticket
from routes.ticket_route import router as ticket_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(ticket_router)

@app.get("/")
def home():
    return {"message": "Welcome to SmartDesk"}