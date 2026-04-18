# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shannav** is a travel planning web app focused on three core dimensions: time spent, money spent, and location relative to the user. It is a Python-first project hosted on AWS Elastic Beanstalk.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Database**: PostgreSQL on AWS RDS
- **Hosting**: AWS Elastic Beanstalk
- **Location/Maps**: TBD (Google Maps API or OpenStreetMap)

## Project Structure (planned)

```
shannav/
├── backend/          # FastAPI app
│   ├── main.py       # App entry point
│   ├── models/       # SQLAlchemy ORM models
│   ├── routes/       # API route handlers
│   ├── schemas/      # Pydantic request/response schemas
│   └── db.py         # Database connection/session
├── frontend/         # React app
├── .ebextensions/    # AWS Elastic Beanstalk config
└── requirements.txt
```

## Development Commands

> Commands will be added here as the project is scaffolded.

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run dev server
uvicorn backend.main:app --reload

# Run tests
pytest
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## AWS Elastic Beanstalk

- The Beanstalk environment expects a Python application entry point (`application.py` or via `Procfile`).
- Environment variables (DB credentials, API keys) are set via EB environment configuration — never hardcoded.
- `.ebextensions/` contains environment setup scripts (e.g., installing dependencies, DB migrations).

## Core Data Model (planned)

- **Trip**: top-level entity with destination, dates, total budget
- **ItineraryItem**: individual activities/stays linked to a trip, with time, cost, and location
- **User**: owns trips, provides home location for relative distance calculations
