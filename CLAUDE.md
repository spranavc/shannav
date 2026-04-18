# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shannav** is a travel planning web app focused on three core dimensions: time spent, money spent, and location relative to the user. It is a Python-first project hosted on AWS Elastic Beanstalk.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL on AWS RDS
- **Hosting**: AWS Elastic Beanstalk (prod + dev environments)
- **Migrations**: Alembic
- **Location/Maps**: TBD (Google Maps API or OpenStreetMap)

## Project Structure

```
shannav/
├── backend/
│   ├── main.py           # App entry point — also serves frontend/dist as static files
│   ├── db.py             # SQLAlchemy engine + session, reads DATABASE_URL from env
│   ├── models/           # SQLAlchemy ORM models (user.py, trip.py)
│   ├── routes/           # API route handlers (users.py, trips.py)
│   └── schemas/          # Pydantic request/response schemas
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root component + routes
│   │   ├── main.jsx              # React entry point
│   │   ├── index.css             # Tailwind directives
│   │   ├── components/ui/        # shadcn/ui components (Button, Card, etc.)
│   │   └── lib/utils.js          # cn() utility for Tailwind class merging
│   ├── tailwind.config.js
│   ├── vite.config.js            # Path alias @ → src/, dev proxy /api → :8000
│   └── dist/                     # Built frontend — bundled into EB deployment
├── alembic/                      # Migration scripts
│   ├── env.py                    # Reads DATABASE_URL, imports all models
│   └── versions/                 # Migration files
├── alembic.ini
├── .ebextensions/python.config   # Sets PYTHONPATH for EB
├── Procfile                      # uvicorn startup command for EB
├── requirements.txt
└── .env.example
```

## Development Commands

### Backend
```bash
# Create and activate virtual environment
py -m venv .venv
.venv\Scripts\activate   # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Run dev server (requires .env with DATABASE_URL)
uvicorn backend.main:app --reload

# Run tests
pytest
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # dev server at localhost:5173, proxies /api to :8000
npm run build    # outputs to frontend/dist/ — required before deploying
```

### Database Migrations
```bash
# Generate migration from model changes
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# To run against dev database, set DATABASE_URL env var accordingly
```

## Environments

| Environment | URL | Database | Branch |
|-------------|-----|----------|--------|
| prod | `shannav-prod.eba-u9uk39gk.us-east-1.elasticbeanstalk.com` | `shannav` | `main` |
| dev  | `shannav-dev.eba-u9uk39gk.us-east-1.elasticbeanstalk.com`  | `shannav_dev` | `dev` |

## Deployment

Always build the frontend before deploying — `frontend/dist/` must be present in the zip.

```bash
# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Zip project (exclude .git, node_modules, __pycache__, .venv, .env)
# 3. Upload zip to s3://shannav-eb-deployments-113827721990/
# 4. Create EB application version pointing to S3 object
# 5. Update environment: shannav-dev first, then shannav-prod
```

Deploy to **dev first**, verify, then promote to **prod**.

## AWS

- **Region**: `us-east-1`
- **RDS**: `shannav-db.cqtamkcm4aun.us-east-1.rds.amazonaws.com` (db.t3.micro, PostgreSQL)
- **RDS security group**: `sg-07c672d091ed72138` — allows port 5432 from VPC only. To run migrations locally, temporarily add your IP, then remove it after.
- **EB application**: `shannav`
- **Deployment bucket**: `s3://shannav-eb-deployments-113827721990`
- Environment variables (`DATABASE_URL`, API keys) are set in EB environment config — never hardcoded.

## Core Data Model

- **User**: owns trips, stores home lat/lon for relative distance calculations
- **Trip**: destination, dates, total budget — belongs to a User
- **ItineraryItem**: individual activity/stay linked to a Trip, tracks cost, duration, and coordinates
