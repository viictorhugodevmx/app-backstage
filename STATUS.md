# Backstage — Estado

- Blueprint: v1.0.
- Paso actual: 0 — Preparación.
- Estado: en construcción.
- Último paso cerrado: ninguno.
- Entorno confirmado: Ubuntu 22.04.5, Node 22.19.0,
  npm 10.9.3, Docker 28.0.4 y Compose 2.34.0.
- GitHub CLI: instalado y autenticado según confirmación de Víctor.
- Jenkins existente: detenido; revisión pendiente en su etapa.
- Pendiente: aplicaciones, pruebas, Docker, documentación,
  validación integral, primer commit y push.

## Auditoría final del Paso 0

- Git y GitHub CLI comprobados.
- Archivos privados de entorno ignorados y ejemplos versionables.
- Documentación inicial creada.
- Verificación general ejecutada correctamente.
- Pendientes: primer commit, remoto, push y registro de cierre.

## Paso 0 — Preparación completada

- Aplicaciones Next.js, NestJS/Fastify y Flask preparadas.
- Siete pruebas iniciales aprobadas.
- Formato, lint, tipos y builds comprobados.
- Tres servicios Docker con healthchecks y respuesta HTTP comprobados.
- Configuración de entorno y documentación inicial preparadas.
- Primer commit creado y subido a GitHub.
- Siguiente paso: PostgreSQL, migraciones y datos iniciales.

## Paso 1 — En progreso

- Mapa de subpasos y acuerdos de ejecución documentados.
- PostgreSQL 17.11 agregado a Docker Compose.
- Credencial administrativa local almacenada fuera de Git.
- Conexión SQL y persistencia tras recrear el contenedor comprobadas.
- Pendiente: bases y usuarios de desarrollo/pruebas, cliente API,
  migraciones, seed y verificaciones.
- El paso todavía no está cerrado.

## Paso 1 — En progreso

- Mapa de subpasos y acuerdos de ejecución documentados.
- PostgreSQL 17.11 agregado a Docker Compose.
- Credencial administrativa local almacenada fuera de Git.
- Conexión SQL y persistencia tras recrear el contenedor comprobadas.
- Pendiente: bases y usuarios de desarrollo/pruebas, cliente API,
  migraciones, seed y verificaciones.
- El paso todavía no está cerrado.

## Paso 1 — Bases, migraciones y seed

- Bases y usuarios de desarrollo/pruebas preparados.
- Conexiones Node a ambas bases comprobadas.
- Ejecutor de migraciones con historial, checksum y bloqueo.
- Migración de eventos aplicada y repetición sin cambios comprobada.
- Seed de tres eventos ficticios ejecutado sin duplicados.
- Nueve tests de base aprobados.
- Pendiente: disponibilidad desde la API, verificación general y cierre.

## Paso 1 — Verificación técnica completada

- PostgreSQL, usuarios y bases preparados.
- Migraciones y seed comprobados.
- Diecinueve tests del proyecto aprobados.
- Formato, lint, tipos y builds correctos.
- Disponibilidad de PostgreSQL desde la API comprobada.
- Documentación actualizada.
- Pendiente: visto bueno del usuario para cerrar oficialmente el Paso 1.

## Visto bueno del Paso 1

El usuario confirmó: APP Backstage — PASO 1 — LISTO ✅.

## Paso 2 — En progreso

Objetivo: API de eventos con validación, persistencia y pruebas.
Contrato y mapa de puntos registrados en docs/steps/paso-02.md.

## Paso 2 — Verificación técnica completada

- API de eventos implementada con validación y persistencia.
- Listado paginado y filtro por estado.
- Creación, edición parcial y cancelación repetible.
- Errores HTTP 400, 404 y 409 comprobados.
- Smoke HTTP completado.
- Cuarenta y tres tests del proyecto aprobados.
- Formato, lint, tipos y builds correctos.
- Pendiente: visto bueno del usuario para cerrar oficialmente el Paso 2.

## Paso 2 — Verificación técnica completada

- API de eventos implementada con validación y persistencia.
- Listado paginado y filtro por estado.
- Creación, edición parcial y cancelación repetible.
- Errores HTTP 400, 404 y 409 comprobados.
- Smoke HTTP completado.
- Cuarenta y tres tests del proyecto aprobados.
- Formato, lint, tipos y builds correctos.
- Pendiente: visto bueno del usuario para cerrar oficialmente el Paso 2.

## Paso 2 — VOBO recibido

- API de eventos validada con smoke HTTP y reporte general.
- 43 pruebas aprobadas en la verificación final.
- Paso 2 cerrado por el usuario.

## Paso 3 — Autenticación y autorización

- Inicio de configuración de Auth0.
- Alcance: sesión en Next.js y validación de JWT/permisos en NestJS.
- Plan detallado en docs/steps/paso-03.md.

## Paso 3 — Cierre técnico

- Auth0 integrado con sesión en Next.js.
- Access tokens RS256 y permisos verificados en NestJS.
- Login, logout y consultas comprobados con administrador y lector.
- 75 pruebas automáticas aprobadas.
- Smoke real de Auth0 y permisos aprobado.
- Endpoint de tokens del navegador deshabilitado.
- Pendiente: revisión del reporte y VOBO del usuario.

## Paso 3 — VOBO recibido

- Autenticación y autorización cerradas por el usuario.
- 75 pruebas y smoke real aprobados.
- Endpoint de tokens del navegador deshabilitado.
- Commit de implementación: ae2b80f.

## Paso 4 — Frontend de eventos

- Inicio de identidad visual, navegación y pantallas funcionales.
- Plan detallado en docs/steps/paso-04.md.
