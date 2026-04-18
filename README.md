# Shannav

A travel planning web app built around three core dimensions: **time**, **money**, and **location**.

Plan trips efficiently by understanding how long things take, what they cost, and how far they are from you — all in one place.

## Features (planned)

- **Time** — estimate and track time spent on each activity, transit, and stay
- **Budget** — set trip budgets, log expenses per item, and see cost breakdowns
- **Location** — view destinations relative to your location, with distance and travel time context

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Frontend | React |
| Database | PostgreSQL (AWS RDS) |
| Hosting | AWS Elastic Beanstalk |
| Maps | TBD (Google Maps API / OpenStreetMap) |

## Getting Started

> Setup instructions will be added as the project is scaffolded.

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

Hosted on AWS Elastic Beanstalk. Environment variables (database credentials, API keys) are managed via EB environment configuration.
