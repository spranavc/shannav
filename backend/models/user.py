from sqlalchemy import Column, Integer, String, Float
from backend.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    home_lat = Column(Float, nullable=True)
    home_lon = Column(Float, nullable=True)
