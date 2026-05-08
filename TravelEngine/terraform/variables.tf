variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources in"
  type        = string
  default     = "asia-south1" # Defaulting to India region for a Travel India app
}

variable "backend_image" {
  description = "Docker image for the FastAPI backend (Update after building/pushing)"
  type        = string
  default     = "gcr.io/cloudrun/hello" # Placeholder
}

variable "frontend_image" {
  description = "Docker image for the React frontend (Update after building/pushing)"
  type        = string
  default     = "gcr.io/cloudrun/hello" # Placeholder
}
