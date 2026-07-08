check "github_repository_required" {
  assert {
    condition     = !var.enable_github_ci || var.github_repository != null
    error_message = "Set github_repository (owner/repo) when enable_github_ci is true."
  }
}

check "invoice_worker_zip_present" {
  assert {
    condition     = local.invoice_worker_zip_path != null
    error_message = "invoice-worker zip no encontrado en packages/invoice-worker/dist/handler.zip. Ejecuta: pnpm --filter @distrinorte/invoice-worker package:lambda"
  }
}
