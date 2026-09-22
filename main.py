from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import engine, Base
from models.ticket import Ticket
from models.admin import Admin
from models.status_history import StatusHistory

from routes.ticket_route import router as ticket_router
from routes.auth_route import router as auth_router
from routes.dashboard_route import router as dashboard_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Creates database tables
Base.metadata.create_all(bind=engine)
# . Registers those routes
app.include_router(ticket_router)
app.include_router(auth_router)
app.include_router(dashboard_router)

@app.get("/")
def home():
    return {"message": "Welcome to SmartDesk"}