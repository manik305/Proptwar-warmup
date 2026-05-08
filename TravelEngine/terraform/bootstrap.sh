#!/bin/bash
# ─────────────────────────────────────────────────────────────
# bootstrap.sh — Run ONCE before terraform init
# Creates the GCS bucket for Terraform remote state
# Usage: bash bootstrap.sh
# ─────────────────────────────────────────────────────────────
set -e

PROJECT_ID="balmy-state-495705-q0"
REGION="asia-south1"
BUCKET_NAME="${PROJECT_ID}-tfstate"

echo "🚀 Creating Terraform state bucket: gs://${BUCKET_NAME}"

gcloud storage buckets create "gs://${BUCKET_NAME}" \
  --project="${PROJECT_ID}" \
  --location="${REGION}" \
  --uniform-bucket-level-access

gcloud storage buckets update "gs://${BUCKET_NAME}" \
  --versioning

echo "✅ Bucket created. Now run:"
echo "   cd TravelEngine/terraform"
echo "   terraform init"
echo "   terraform apply"
