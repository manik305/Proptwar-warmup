variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "balmy-state-495705-q0"
}

variable "region" {
  description = "GCP region (India)"
  type        = string
  default     = "asia-south1"
}

variable "backend_image" {
  description = "Artifact Registry image URL for FastAPI backend"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "frontend_image" {
  description = "Artifact Registry image URL for React frontend"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
