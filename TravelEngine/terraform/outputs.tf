output "artifact_registry_url" {
  description = "The URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.travel_repo.repository_id}"
}

output "backend_url" {
  description = "The public URL of the backend Cloud Run service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "The public URL of the frontend Cloud Run service"
  value       = google_cloud_run_v2_service.frontend.uri
}
