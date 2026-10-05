# Migraciones PostgreSQL

Formato de nombres: 001_nombre_descriptivo.sql.

Se ejecutan en orden y se registran con una huella SHA-256.
No modificar ni eliminar migraciones aplicadas.

El ejecutor proporciona la transacción.
Los archivos SQL no deben incluir BEGIN, COMMIT ni ROLLBACK.

Comandos: db:migrate y db:migrate:test.
Reconstruir la API después de modificar el ejecutor TypeScript.
