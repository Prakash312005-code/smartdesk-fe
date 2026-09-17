from fastapi import FastAPI
from models.admin import Admin
from database.connection import engine, Base
from models.ticket import Ticket
from routes.ticket_route import router as ticket_router
from routes.auth_route import router as auth_router
from models.status_history import StatusHistory

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(ticket_router)
app.include_router(auth_router)
@app.get("/")
def home():
    return {"message": "Welcome to SmartDesk"}