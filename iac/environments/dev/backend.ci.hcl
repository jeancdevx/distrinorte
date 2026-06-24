# Backend parcial para CI — el bucket se pasa por secret en el workflow.
# Debe coincidir con backend.hcl local (misma key/region).

key            = "env/dev/terraform.tfstate"
region         = "us-east-2"
use_lockfile   = true
encrypt        = true
