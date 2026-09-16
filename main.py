from fastapi import FastAPI
from database.connection import engine, Base
from models.ticket import Ticket

app = FastAPI()

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Welcome to SmartDesk"}
































