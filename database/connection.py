import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
# loads variables on .env intp app env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
# don't automatically save changes
#  don't automatically flush changes
#  use our database engine



Base = declarative_base()

# creates a database session, provides it to the API, and closes it after the request is completed.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()