# Datos demo — DistriNorte

Dataset pequeño para desarrollo y pruebas E2E. Ver
[docs/04-seed-y-datos.md](../../docs/04-seed-y-datos.md).

| Archivo          | Uso                                                                 |
| ---------------- | ------------------------------------------------------------------- |
| `products.json`  | DynamoDB, RDS `inventory`, S3 keys, Redis warm-up                   |
| `customers.json` | RDS `customers` + `accounts`; IDs para Cognito `custom:customer_id` |

**Almacenes:** `chiclayo`, `piura`  
**Productos:** 25 (24 activos + 1 inactivo de prueba)
