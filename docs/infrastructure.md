# Infrastructure

Shannav is hosted on AWS. All resources are in `us-east-1`.

---

## AWS Resources

### RDS — PostgreSQL Database
- **Instance ID**: `shannav-db`
- **Endpoint**: `shannav-db.cqtamkcm4aun.us-east-1.rds.amazonaws.com`
- **Port**: `5432`
- **Database name**: `shannav`
- **Master user**: `shannav_admin`
- **Instance class**: `db.t3.micro`
- **Security group**: `shannav-rds-sg` (sg-07c672d091ed72138) — allows port 5432 from within the VPC only

### Elastic Beanstalk
- **Application name**: `shannav`
- **Platform**: Python
- **Deployment S3 bucket**: `shannav-eb-deployments-113827721990`

### VPC
- Uses the AWS default VPC (`vpc-0aa215083b752801e`, CIDR `172.31.0.0/16`) with subnets across all `us-east-1` availability zones.

---

## Configuration Files

### `Procfile`
Tells Elastic Beanstalk how to start the application:
```
web: uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### `.ebextensions/python.config`
Beanstalk environment settings — sets `PYTHONPATH` so the `backend` package is importable from the app root.

### `.env.example`
Template for local environment variables. Copy to `.env` for development:
```
DATABASE_URL=postgresql://shannav_admin:PASSWORD@shannav-db.cqtamkcm4aun.us-east-1.rds.amazonaws.com:5432/shannav
```
Never commit `.env` — it is gitignored.

---

## Deployment (pending EB environment creation)

The deployment flow once the EB environment is created:

1. Zip the project (excluding `.git`, `node_modules`, `__pycache__`)
2. Upload zip to `s3://shannav-eb-deployments-113827721990/`
3. Create a new EB application version pointing to the S3 object
4. Deploy the version to the EB environment

Environment variables (`DATABASE_URL`, API keys) are set directly in the Beanstalk environment configuration — never hardcoded or committed.

---

## Pending Setup

- [ ] EB environment creation and first deploy
- [ ] Alembic migrations to create DB tables on RDS
- [ ] Frontend build strategy (static files via FastAPI or S3 + CloudFront)
- [ ] ASGI fix in `.ebextensions` for uvicorn worker config
