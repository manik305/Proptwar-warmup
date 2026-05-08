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
  default     = "asia-south1-docker.pkg.dev/balmy-state-495705-q0/travel-engine-repo/safar-backend:latest"
}

variable "frontend_image" {
  description = "Artifact Registry image URL for React frontend"
  type        = string
  default     = "asia-south1-docker.pkg.dev/balmy-state-495705-q0/travel-engine-repo/safar-frontend:latest"
}
