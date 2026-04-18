# Backend

The backend is a FastAPI application written in Python. It exposes a REST API consumed by the React frontend.

---

## Entry Point

### `backend/main.py`
Creates the FastAPI app instance, registers CORS middleware (allowing all origins in development), and mounts the `users` and `trips` routers. Also exposes a `GET /health` endpoint for Beanstalk health checks.

---

## Database

### `backend/db.py`
Sets up the SQLAlchemy engine and session factory using the `DATABASE_URL` environment variable. Exports:
- `Base` — declarative base that all ORM models inherit from
- `SessionLocal` — session factory
- `get_db()` — FastAPI dependency that yields a DB session and closes it after the request

---

## Models

ORM models map Python classes to database tables via SQLAlchemy.

### `backend/models/user.py` → table: `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer | Primary key |
| `email` | String | Unique, indexed |
| `name` | String | |
| `home_lat` | Float | User's home latitude for distance calculations |
| `home_lon` | Float | User's home longitude for distance calculations |

### `backend/models/trip.py` → tables: `trips`, `itinerary_items`

**Trip**
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer | Primary key |
| `user_id` | Integer | FK → users.id |
| `destination` | String | |
| `start_date` | DateTime | |
| `end_date` | DateTime | |
| `budget` | Float | Total trip budget |

**ItineraryItem**
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer | Primary key |
| `trip_id` | Integer | FK → trips.id |
| `name` | String | Activity/stay name |
| `cost` | Float | Cost of this item |
| `duration_minutes` | Integer | Time spent on this item |
| `lat` / `lon` | Float | Location coordinates |

### `backend/models/__init__.py`
Re-exports `User`, `Trip`, and `ItineraryItem` so Alembic and other modules can import all models from one place, ensuring they're registered with `Base.metadata`.

---

## Schemas

Pydantic schemas validate request bodies and shape API responses. Each resource has a `Base` (shared fields), `Create` (input), and full schema (output with DB-generated fields).

### `backend/schemas/user.py`
- `UserBase` — email, name, home_lat, home_lon
- `UserCreate` — used for POST request body
- `User` — full response including `id`

### `backend/schemas/trip.py`
- `TripBase` / `TripCreate` / `Trip` — trip fields + nested list of items
- `ItineraryItemBase` / `ItineraryItemCreate` / `ItineraryItem` — item fields

---

## Routes

### `backend/routes/users.py` — prefix: `/users`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/users/` | Create a new user |
| GET | `/users/{user_id}` | Fetch a user by ID |

### `backend/routes/trips.py` — prefix: `/trips`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/trips/` | Create a new trip |
| GET | `/trips/{trip_id}` | Fetch a trip with its itinerary items |
| POST | `/trips/{trip_id}/items` | Add an itinerary item to a trip |

---

## Dependencies

Defined in `requirements.txt`:

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `sqlalchemy` | ORM |
| `psycopg2-binary` | PostgreSQL driver |
| `pydantic[email]` | Schema validation |
| `alembic` | Database migrations |
| `python-dotenv` | Load `.env` in development |
