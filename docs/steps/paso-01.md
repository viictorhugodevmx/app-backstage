# Paso 1 — PostgreSQL, migraciones y datos iniciales

## Objetivo

Preparar almacenamiento PostgreSQL, conexiones desde la API,
migraciones y datos iniciales comprobados con pruebas.

## Subpasos

1.1 Registrar metodología y plan.
1.2 Agregar PostgreSQL a Compose con almacenamiento persistente.
1.3 Comprobar conexión, persistencia y guardar el avance en Git.
1.4 Crear bases y usuarios separados para desarrollo y pruebas.
1.5 Configurar el cliente PostgreSQL en la API.
1.6 Preparar el ejecutor y el historial de migraciones.
1.7 Crear la primera migración del esquema de eventos.
1.8 Preparar un seed repetible con eventos ficticios.
1.9 Probar migraciones, restricciones y aislamiento de pruebas.
1.10 Comprobar disponibilidad de PostgreSQL desde la API.
1.11 Ejecutar verificaciones generales.
1.12 Documentar, guardar commits, subir cambios y solicitar visto bueno.

## Criterios de aceptación

- PostgreSQL funciona en Docker y conserva sus datos.
- Desarrollo y pruebas utilizan bases y usuarios separados.
- La API puede conectarse con su usuario correspondiente.
- Las migraciones registran su ejecución y no se repiten.
- El seed es repetible.
- Las pruebas no modifican la base de desarrollo.
- Las verificaciones generales pasan.
- Los cambios quedan documentados y subidos a GitHub.
- El usuario da el visto bueno para cerrar el paso.
