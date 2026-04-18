# Infrastructure

Shannav is hosted on AWS. All resources are in `us-east-1`.

---

## AWS Resources

### RDS — PostgreSQL Database
- **Instance ID**: `shannav-db`
- **Endpoint**: `shannav-db.cqtamkcm4aun.us-east-1.rds.amazonaws.com`
- **Port**: `5432`
- **Master user**: `shannav_admin`
- **Instance class**: `db.t3.micro`
- **Security group**: `shannav-rds-sg` (sg-07c672d091ed72138) — allows port 5432 from within the VPC only

| Database | Used by |
|----------|---------|
| `shannav` | prod environment |
| `shannav_dev` | dev environment |

> To connect locally (e.g. to run migrations), temporarily add your IP to `sg-07c672d091ed72138` on port 5432, then remove it when done.

### Elastic Beanstalk

- **Application name**: `shannav`
- **Platform**: Python 3.11 on Amazon Linux 2023
- **Deployment S3 bucket**: `shannav-eb-deployments-113827721990`

| Environment | URL | Database | Branch | Version |
|-------------|-----|----------|--------|---------|
| `shannav-prod` | `shannav-prod.eba-u9uk39gk.us-east-1.elasticbeanstalk.com` | `shannav` | `main` | v5 |
| `shannav-dev` | `shannav-dev.eba-u9uk39gk.us-east-1.elasticbeanstalk.com` | `shannav_dev` | `dev` | v5 |

### IAM Roles
- `aws-elasticbeanstalk-ec2-role` — instance profile attached to EB EC2 instances
- `aws-elasticbeanstalk-service-role` — EB service role

### VPC
- Default VPC (`vpc-0aa215083b752801e`, CIDR `172.31.0.0/16`) with subnets across all `us-east-1` AZs.

---

## Configuration Files

### `Procfile`
Tells Elastic Beanstalk how to start the application:
```
web: uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### `.ebextensions/python.config`
Sets `PYTHONPATH` so the `backend` package is importable from the app root.

### `.env.example`
Template for local development. Copy to `.env`:
```
DATABASE_URL=postgresql://shannav_admin:PASSWORD@shannav-db.cqtamkcm4aun.us-east-1.rds.amazonaws.com:5432/shannav_dev
```
Never commit `.env` — it is gitignored.

---

## Deployment Workflow

Always deploy to **dev first**, verify, then promote to **prod**.

```bash
# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Package (Python, since zip may not be available)
py -c "
import zipfile, os
base = '.'
out = '../shannav-vX.zip'
HARD_EXCLUDE = {'.git', '__pycache__', '.venv', 'node_modules'}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in HARD_EXCLUDE]
        for file in files:
            if file == '.env' or file.endswith('.pyc'): continue
            path = os.path.join(root, file)
            zf.write(path, os.path.relpath(path, base))
"

# 3. Upload to S3
aws s3 cp shannav-vX.zip s3://shannav-eb-deployments-113827721990/shannav-vX.zip --region us-east-1

# 4. Create application version
aws elasticbeanstalk create-application-version \
  --region us-east-1 --application-name shannav \
  --version-label vX \
  --source-bundle S3Bucket=shannav-eb-deployments-113827721990,S3Key=shannav-vX.zip

# 5. Deploy to dev, verify, then prod
aws elasticbeanstalk update-environment --region us-east-1 --environment-name shannav-dev --version-label vX
aws elasticbeanstalk update-environment --region us-east-1 --environment-name shannav-prod --version-label vX
```

---

## Database Migrations

When models change, generate and apply migrations locally before deploying:

```bash
# Temporarily open RDS security group for your IP, then:
alembic revision --autogenerate -m "description"
alembic upgrade head   # run against dev first

# Set DATABASE_URL to prod and run again for prod
# Then remove your IP from the security group
```
