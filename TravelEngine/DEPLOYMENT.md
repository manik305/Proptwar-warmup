# 🚀 SafarEngine Deployment Guide (GCP)

This guide explains how to deploy the SafarEngine (Frontend & Backend) to Google Cloud Platform using Terraform and GitHub Actions.

## 🛠️ Prerequisites
1. **Google Cloud SDK** installed on your local machine.
2. **Terraform** installed.
3. A **GCP Project** created: `balmy-state-495705-q0`.
4. A **GitHub Repository** with your code.

---

## 📍 Step 1: Initial GCP Setup
Before GitHub can deploy anything, you need to create the "State Bucket" where Terraform stores its configuration.

1. Open your terminal (Powershell or Bash).
2. Run the following commands to create the bucket:
   ```powershell
   # Create the bucket for Terraform state
   gcloud storage buckets create "gs://balmy-state-495705-q0-tfstate" --project="balmy-state-495705-q0" --location="asia-south1" --uniform-bucket-level-access
   
   # Enable versioning to prevent data loss
   gcloud storage buckets update "gs://balmy-state-495705-q0-tfstate" --versioning
   ```

---

## 🔐 Step 2: Configure GitHub Secrets
GitHub needs permission to communicate with your GCP project.

1. **Create a Service Account Key**:
   - Go to **IAM & Admin > Service Accounts** in GCP Console.
   - Find the service account: `github-actions-sa@balmy-state-495705-q0.iam.gserviceaccount.com`.
   - Click **Keys > Add Key > Create New Key (JSON)**.
   - Download the file.

2. **Add to GitHub**:
   - Go to your GitHub Repository **Settings > Secrets and variables > Actions**.
   - Click **New repository secret**.
   - Name: `GCP_SA_KEY`
   - Value: Paste the **entire content** of the JSON file you just downloaded.

---

## 🏗️ Step 3: Deployment Process

### Automatic Deployment (Recommended)
Every time you push code to the `main` branch, the GitHub Action (`.github/workflows/deploy.yml`) will:
1. **Infrastructure**: Run Terraform to ensure Cloud Run, Artifact Registry, and Secrets are created.
2. **Backend**: Build the Python Docker image and push it to GCP.
3. **Frontend**: Build the React Docker image (automatically linking it to the backend URL).
4. **Go Live**: Deploy both to Cloud Run and provide the live URLs.

### Manual Deployment (Alternative)
If you want to run Terraform manually from your machine:
```powershell
cd TravelEngine/terraform
terraform init
terraform apply -auto-approve
```

---

## 🔍 Step 4: Verification
After the GitHub Action completes:
1. Go to the **Cloud Run** dashboard in GCP.
2. You will see `safar-backend` and `safar-frontend`.
3. Click on `safar-frontend` to find your public website URL.

---

## ⚠️ Important Troubleshooting
- **EURI_API_KEY**: The deployment expects a secret named `euri-api-key`. After the first deployment, go to **Security > Secret Manager**, find `euri-api-key`, and click **Create Secret Version** to paste your actual API key.
- **Permissions**: Ensure the `github-actions-sa` has the `Owner` role in your GCP project for the initial setup.
