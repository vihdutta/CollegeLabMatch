from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pgvector.sqlalchemy import Vector
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/collegeresearch")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Lab(Base):
    __tablename__ = "labs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    university = Column(Text, nullable=False)
    pi = Column(Text, nullable=False)
    email = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    embedding = Column(Vector(384))  # all-MiniLM-L6-v2 produces 384-dim embeddings
    updated_at = Column(DateTime, default=func.now())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # create vector extension
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.commit()
    
    Base.metadata.create_all(bind=engine) 