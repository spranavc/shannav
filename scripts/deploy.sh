#!/bin/bash
# Usage: bash scripts/deploy.sh dev
#        bash scripts/deploy.sh prod

set -e

ENV=$1
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: bash scripts/deploy.sh [dev|prod]"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WIN_ROOT="$(cygpath -w "$ROOT")"
S3_BUCKET="shannav-eb-deployments-113827721990"
EB_APP="shannav"
EB_ENV="shannav-$ENV"
VERSION="v-$(date +%Y%m%d-%H%M%S)"
ZIP_NAME="$VERSION.zip"
ZIP_PATH="$ROOT/$ZIP_NAME"
WIN_ZIP="$(cygpath -w "$ZIP_PATH")"

echo ""
echo "Deploying to: $EB_ENV ($VERSION)"
echo ""

# Step 1: Build frontend
echo "[1/4] Building frontend..."
cd "$ROOT/frontend"
npm run build
echo "Frontend built."

# Step 2: Package
echo "[2/4] Packaging..."
cd "$ROOT"
py -c "
import zipfile, os

base = r'$WIN_ROOT'
out = r'$WIN_ZIP'
HARD_EXCLUDE = {'.git', '__pycache__', '.venv', 'node_modules'}

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if d not in HARD_EXCLUDE]
        for file in files:
            if file == '.env' or file.endswith('.pyc') or file == os.path.basename(out):
                continue
            path = os.path.join(root, file)
            arcname = os.path.relpath(path, base)
            zf.write(path, arcname)

size = os.path.getsize(out) / 1024
print(f'Package size: {size:.1f} KB')
"
echo "Packaged."

# Step 3: Upload to S3
echo "[3/4] Uploading to S3..."
aws s3 cp "$ZIP_PATH" "s3://$S3_BUCKET/$ZIP_NAME" --region us-east-1
echo "Uploaded."

# Step 4: Create EB version and deploy
echo "[4/4] Deploying to $EB_ENV..."
aws elasticbeanstalk create-application-version \
  --region us-east-1 \
  --application-name "$EB_APP" \
  --version-label "$VERSION" \
  --source-bundle S3Bucket="$S3_BUCKET",S3Key="$ZIP_NAME" \
  --output text > /dev/null

aws elasticbeanstalk update-environment \
  --region us-east-1 \
  --environment-name "$EB_ENV" \
  --version-label "$VERSION" \
  --output text > /dev/null

echo "Waiting for environment to be ready..."
while true; do
  STATUS=$(aws elasticbeanstalk describe-environments \
    --region us-east-1 \
    --environment-names "$EB_ENV" \
    --query 'Environments[0].Status' \
    --output text)
  echo "  Status: $STATUS"
  [ "$STATUS" = "Ready" ] && break
  sleep 15
done

HEALTH=$(aws elasticbeanstalk describe-environments \
  --region us-east-1 --environment-names "$EB_ENV" \
  --query 'Environments[0].Health' --output text)

URL=$(aws elasticbeanstalk describe-environments \
  --region us-east-1 --environment-names "$EB_ENV" \
  --query 'Environments[0].CNAME' --output text)

# Clean up local zip
rm "$ZIP_PATH"

echo ""
echo "Deployed successfully!"
echo "  Environment : $EB_ENV"
echo "  Version     : $VERSION"
echo "  Health      : $HEALTH"
echo "  URL         : http://$URL"
echo ""
