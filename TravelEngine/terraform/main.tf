terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required Google Cloud APIs
resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Artifact Registry to store Docker images
resource "google_artifact_registry_repository" "travel_repo" {
  location      = var.region
  repository_id = "travel-engine-repo"
  description   = "Docker repository for Travel Engine images"
  format        = "DOCKER"
  
  depends_on = [google_project_service.artifactregistry_api]
}

# Backend Cloud Run Service (FastAPI)
resource "google_cloud_run_v2_service" "backend" {
  name     = "travel-engine-backend"
  location = var.region

  template {
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
      }
    }
  }

  depends_on = [google_project_service.run_api]
}

# Make backend publicly accessible
resource "google_cloud_run_service_iam_member" "backend_invoker" {
  location = google_cloud_run_v2_service.backend.location
  project  = google_cloud_run_v2_service.backend.project
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Frontend Cloud Run Service (React + Nginx)
resource "google_cloud_run_v2_service" "frontend" {
  name     = "travel-engine-frontend"
  location = var.region

  template {
    containers {
      image = var.frontend_image
      ports {
        container_port = 80
      }
      env {
        name  = "VITE_BACKEND_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
      resources {
        limits = {
          cpu    = "1000m"
          memory = "256Mi"
        }
      }
    }
  }

  depends_on = [google_project_service.run_api, google_cloud_run_v2_service.backend]
}

# Make frontend publicly accessible
resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  location = google_cloud_run_v2_service.frontend.location
  project  = google_cloud_run_v2_service.frontend.project
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
