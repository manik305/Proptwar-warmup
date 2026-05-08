terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Remote state in GCS — bucket created separately via bootstrap
  backend "gcs" {
    bucket = "balmy-state-495705-q0-tfstate"
    prefix = "travel-engine/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ────────────────────────────────────────────────────────────
# Enable required APIs
# ────────────────────────────────────────────────────────────
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

# ────────────────────────────────────────────────────────────
# Artifact Registry — Docker image repository
# ────────────────────────────────────────────────────────────
resource "google_artifact_registry_repository" "travel_repo" {
  location      = var.region
  repository_id = "travel-engine-repo"
  description   = "Docker images for SafarEngine"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}

# ────────────────────────────────────────────────────────────
# Secret Manager — EURI API Key
# ────────────────────────────────────────────────────────────
resource "google_secret_manager_secret" "euri_api_key" {
  secret_id = "euri-api-key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

# ────────────────────────────────────────────────────────────
# Service Account — for Cloud Run services
# ────────────────────────────────────────────────────────────
resource "google_service_account" "cloud_run_sa" {
  account_id   = "travel-engine-sa"
  display_name = "SafarEngine Cloud Run Service Account"
}

resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ────────────────────────────────────────────────────────────
# Backend Cloud Run Service — FastAPI
# ────────────────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "backend" {
  name     = "safar-backend"
  location = var.region

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    containers {
      image = var.backend_image

      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
        cpu_idle = true
      }

      # Inject secret as environment variable
      env {
        name = "EURI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.euri_api_key.secret_id
            version = "latest"
          }
        }
      }

      liveness_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 10
        period_seconds        = 30
      }
    }
  }

  depends_on = [google_project_service.apis, google_artifact_registry_repository.travel_repo]
}

# Make backend publicly accessible
resource "google_cloud_run_service_iam_member" "backend_invoker" {
  location = google_cloud_run_v2_service.backend.location
  project  = google_cloud_run_v2_service.backend.project
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ────────────────────────────────────────────────────────────
# Frontend Cloud Run Service — React + Nginx
# ────────────────────────────────────────────────────────────
resource "google_cloud_run_v2_service" "frontend" {
  name     = "safar-frontend"
  location = var.region

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    containers {
      image = var.frontend_image

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "256Mi"
        }
        cpu_idle = true
      }

      env {
        name  = "VITE_BACKEND_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
    }
  }

  depends_on = [google_project_service.apis, google_cloud_run_v2_service.backend]
}

# Make frontend publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  location = google_cloud_run_v2_service.frontend.location
  project  = google_cloud_run_v2_service.frontend.project
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ────────────────────────────────────────────────────────────
# GitHub Actions Service Account — for CI/CD
# ────────────────────────────────────────────────────────────
resource "google_service_account" "github_actions_sa" {
  account_id   = "github-actions-sa"
  display_name = "GitHub Actions CI/CD Service Account"
}

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/storage.admin",
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

# Key for GitHub Actions (store in GH Secrets)
resource "google_service_account_key" "github_actions_key" {
  service_account_id = google_service_account.github_actions_sa.name
}
