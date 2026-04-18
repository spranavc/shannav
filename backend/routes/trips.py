from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models.trip import Trip, ItineraryItem
from backend.schemas.trip import TripCreate, Trip as TripSchema, ItineraryItemCreate, ItineraryItem as ItemSchema

router = APIRouter()


@router.post("/", response_model=TripSchema)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    db_trip = Trip(**trip.model_dump())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/{trip_id}", response_model=TripSchema)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    return db.query(Trip).filter(Trip.id == trip_id).first()


@router.post("/{trip_id}/items", response_model=ItemSchema)
def add_item(trip_id: int, item: ItineraryItemCreate, db: Session = Depends(get_db)):
    db_item = ItineraryItem(trip_id=trip_id, **item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
