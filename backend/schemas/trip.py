from datetime import datetime
from pydantic import BaseModel


class ItineraryItemBase(BaseModel):
    name: str
    cost: float = 0.0
    duration_minutes: int = 0
    lat: float | None = None
    lon: float | None = None


class ItineraryItemCreate(ItineraryItemBase):
    pass


class ItineraryItem(ItineraryItemBase):
    id: int
    trip_id: int

    class Config:
        from_attributes = True


class TripBase(BaseModel):
    destination: str
    start_date: datetime | None = None
    end_date: datetime | None = None
    budget: float | None = None


class TripCreate(TripBase):
    user_id: int


class Trip(TripBase):
    id: int
    user_id: int
    items: list[ItineraryItem] = []

    class Config:
        from_attributes = True
