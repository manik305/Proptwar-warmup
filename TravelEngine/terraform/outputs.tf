output "artifact_registry_url" {
  description = "Docker registry URL for pushing images"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.travel_repo.repository_id}"
}

output "backend_url" {
  description = "Live URL of the SafarEngine backend"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "Live URL of the SafarEngine frontend"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "github_actions_sa_email" {
  description = "Service account email for GitHub Actions secrets"
  value       = google_service_account.github_actions_sa.email
}

output "github_actions_key_base64" {
  description = "Base64 encoded service account key — add to GH Secret GCP_SA_KEY"
  value       = google_service_account_key.github_actions_key.private_key
  sensitive   = true
}
