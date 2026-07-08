check "github_repository_required" {
  assert {
    condition     = !var.enable_github_ci || var.github_repository != null
    error_message = "Set github_repository (owner/repo) when enable_github_ci is true."
  }
}
