# Project Overview

Shannav is a travel planning web app built around three core dimensions: **time**, **money**, and **location**. Users can plan trips by building itineraries where each activity tracks how long it takes, what it costs, and where it is relative to the user's home.

## Architecture

```
Browser (React)
      |
      | HTTP (REST)
      v
FastAPI (Python) — AWS Elastic Beanstalk
      |
      | SQLAlchemy ORM
      v
PostgreSQL — AWS RDS
```

The frontend and backend are decoupled. In development, Vite proxies `/api` requests to the FastAPI server. In production, both are served from Elastic Beanstalk (frontend as static files, backend as the API).

## Docs Index

- [Backend](./backend.md) — FastAPI app, models, routes, schemas, database
- [Frontend](./frontend.md) — React app structure and Vite config
- [Infrastructure](./infrastructure.md) — AWS setup, Elastic Beanstalk, RDS, deployment
