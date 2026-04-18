# Technical Debt

Items to address before a production-ready release, roughly ordered by priority.

---

## Critical (fix before real users)

### 1. No authentication
The API has zero auth. Any request to `POST /users` or `POST /trips` succeeds with no identity verification. Every route needs to be protected. Options: AWS Cognito (integrates naturally with EB), Auth0, or a simple JWT implementation via `python-jose`.

### 2. Weak database password
The RDS master password is `shannav-admin` — a guessable, hyphenated, low-entropy string. Rotate it before launch and use a randomly generated password stored in AWS Secrets Manager rather than plaintext in the EB environment variable.

### 3. CORS wildcard in production
`allow_origins=["*"]` in `backend/main.py` allows any domain to call the API. Lock this down to the actual frontend domain before going live.

### 4. No database migrations (Alembic not initialized)
`alembic` is in `requirements.txt` but was never initialized. There is no migration history, no `alembic.ini`, and no `versions/` folder. The DB tables don't exist yet. This must be set up before the app can function at all.

### 5. No error handling in routes
Routes return `None` silently when a record isn't found (e.g. `GET /users/{user_id}` returns a 200 with null body if the user doesn't exist). All routes need proper `404` / `422` responses via `HTTPException`.

### 6. No input validation beyond schema types
`POST /trips` accepts any `user_id` without checking the user exists. `POST /trips/{trip_id}/items` accepts any `trip_id` without verifying the trip exists or belongs to the caller.

---

## Infrastructure

### 7. Consider migrating off Elastic Beanstalk
EB is the fastest path to deploy but has limitations — opaque configuration, slow deploys, harder to scale, and less control over the runtime. Alternatives to evaluate at scale:
- **ECS Fargate** — containerized, more control, better for microservices
- **AWS Lambda + API Gateway** — serverless, cost-efficient at low traffic, but cold start latency matters
- **App Runner** — simpler than ECS, good middle ground

### 8. Frontend has no deployment strategy
The React app exists as source only — there's no build step wired into the deployment pipeline. Decision needed: serve the Vite build as static files from FastAPI (simple, one server), or host on S3 + CloudFront (better performance, separate deploys). Currently users can't access the frontend at all.

### 9. No CI/CD pipeline
Deployments are currently manual (zip → S3 → EB version → deploy). A GitHub Actions workflow should handle this automatically on push to `main`.

### 10. RDS is publicly accessible
The RDS instance was created with `--publicly-accessible`. For production, this should be disabled and access restricted to the EB security group only.

### 11. No RDS backups configured
Automated backups are not explicitly configured. Set a retention window (e.g. 7 days) and verify snapshots are enabled.

---

## Code Quality

### 12. `psycopg2-binary` in production
`psycopg2-binary` is fine for development but the binary distribution is not recommended for production use. Switch to `psycopg2` (compiled from source) or `psycopg` (v3) before launch.

### 13. No connection pooling
`db.py` creates a plain SQLAlchemy engine with no pool configuration. Under real load, this will exhaust DB connections. Configure `pool_size`, `max_overflow`, and `pool_pre_ping`.

### 14. No tests
There are zero tests. At minimum, route-level integration tests using `pytest` + `httpx` (FastAPI's `TestClient`) should cover the happy path for each endpoint.

### 15. Models lack `created_at` / `updated_at` timestamps
None of the ORM models track when records were created or modified. These are useful for debugging, auditing, and sorting.

### 16. `Trip.user_id` exposed in `TripCreate` schema
Callers supply `user_id` directly in the request body. Once auth exists, the user ID should be derived from the authenticated session, not trusted from the client.

### 17. Pinned dependency versions may be stale
`requirements.txt` pins exact versions (good for reproducibility) but these were set at project creation. Run `pip list --outdated` periodically and update, especially for security patches.
