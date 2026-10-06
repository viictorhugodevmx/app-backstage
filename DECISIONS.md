# Decisiones técnicas

## Monorepo

Frontend, API, webhooks e infraestructura comparten repositorio.
pnpm administra paquetes JavaScript y Turbo coordina sus tareas.
Un script desde Ubuntu reúne las verificaciones Node y Python.

## Versiones

Node 22.19.0 y pnpm 12.8.1.
Dependencias JavaScript exactas y pnpm-lock.yaml.
Python usa la línea 3.12; requirements.lock fija sus dependencias.
La etiqueta de la imagen Python permite actualizaciones de parche.

## API

NestJS utiliza Fastify como adaptador HTTP.
El proyecto es ESM y conserva extensiones .js en imports internos.

## Pruebas

Frontend: Vitest, React Testing Library y jsdom 26.1.0.
API: Vitest y SWC para conservar metadatos de decoradores.
Integración HTTP: inyección de solicitudes de Fastify.
Flask: pytest y cliente de pruebas de Flask.

## Contenedores

Desarrollo y verificaciones en Docker.
Node utiliza el UID y GID del usuario local.
Flask ejecuta la aplicación con un usuario sin privilegios.
Las imágenes actuales incluyen herramientas de desarrollo.

## Recursos

Verificaciones secuenciales para cuidar la memoria disponible.
Comprobación inicial de servicios uno por uno.

## Fuentes

Se retiró next/font/google para evitar descargas durante el build.
La tipografía del branding se elegirá en la fase de interfaz.

## Configuración

Compose proporciona las variables actuales.
Los ejemplos no implican carga automática de archivos .env.
Los archivos privados quedan fuera de Git.

## Servicios posteriores

Auth0, Jenkins, Kubernetes y GCP se prepararán en sus pasos.
El contenedor Jenkins anterior del equipo se conserva.

## Commits

Primer commit después de verificar la preparación.
Después, commits por paso o funcionalidad con prefijos como
chore, feat, fix, test y docs.

## Acuerdo de ejecución de Backstage

- El asistente valida las evidencias y comunica los pendientes.
- El usuario da el visto bueno para cerrar oficialmente cada paso.
- Al iniciar un paso se presenta el mapa completo de subpasos.
- Las instrucciones se entregan en bloques de tres subpasos.
- Las notas no bloqueantes se registran sin detener el avance.
- Se guardan commits por avances coherentes o funcionalidades.

## PostgreSQL y migraciones

- PostgreSQL 17.11 en un volumen Docker persistente.
- Configuración modular mediante compose.database.yaml.
- Bases y usuarios separados para desarrollo y pruebas.
- Usuarios de aplicación sin privilegios de superusuario.
- Cada usuario posee su base para ejecutar migraciones durante el lab.
- Cliente pg y SQL explícito para estudiar conexiones y restricciones.
- Migraciones con checksum, historial, transacciones y advisory lock.
- Seed repetible que conserva eventos existentes.
- Tests de eventos dentro de transacciones revertidas.
- Suite de base independiente de las pruebas HTTP.
- Pool de la API limitado a cinco conexiones y cerrado al apagar Nest.
- /health/ready comprueba conectividad; no verifica reglas de negocio.

## API de eventos

- Controlador HTTP, servicio de reglas y repositorio SQL separados.
- DTOs y ValidationPipe compartido entre aplicación y pruebas.
- Se rechazan campos desconocidos.
- Fechas con zona horaria y comparación de inicio/final en el servicio.
- Edición parcial que conserva los campos omitidos.
- Los valores null no omiten la validación de edición.
- Estado inicial draft establecido por PostgreSQL.
- El estado no se modifica mediante los DTOs de creación o edición.
- Cancelación repetible y restricción para eventos completados.
- SQL parametrizado y errores de persistencia traducidos a HTTP.
- Paginación con orden por starts_at e id.
- Total y filas se consultan por separado; no constituyen una instantánea
  transaccional si otros procesos modifican eventos simultáneamente.
- Las pruebas HTTP de persistencia usan PostgreSQL real en backstage_test
  y revierten sus cambios al terminar.

## API de eventos

- Controlador HTTP, servicio de reglas y repositorio SQL separados.
- DTOs y ValidationPipe compartido entre aplicación y pruebas.
- Se rechazan campos desconocidos.
- Fechas con zona horaria y comparación de inicio/final en el servicio.
- Edición parcial que conserva los campos omitidos.
- Los valores null no omiten la validación de edición.
- Estado inicial draft establecido por PostgreSQL.
- El estado no se modifica mediante los DTOs de creación o edición.
- Cancelación repetible y restricción para eventos completados.
- SQL parametrizado y errores de persistencia traducidos a HTTP.
- Paginación con orden por starts_at e id.
- Total y filas se consultan por separado; no constituyen una instantánea
  transaccional si otros procesos modifican eventos simultáneamente.
- Las pruebas HTTP de persistencia usan PostgreSQL real en backstage_test
  y revierten sus cambios al terminar.

## Auth0, sesión y autorización

- Usamos una Regular Web Application para Next.js.
- La sesión se administra mediante cookies HttpOnly del SDK.
- Las consultas a NestJS se realizan desde el servidor de Next.js.
- Las consultas autenticadas usan cache: no-store.
- NestJS verifica access tokens con jose y claves públicas JWKS de Auth0.
- Aceptamos únicamente RS256 y exigimos sujeto, expiración e issued-at.
- Verificamos emisor y audiencia de la API.
- Los permisos se comprueban en el backend para cada operación.
- No usamos el nombre del rol como sustituto del permiso.
- Un token sin permisos no obtiene permisos implícitos.
- Los tests funcionales de PostgreSQL aíslan el guard.
- Los tests de seguridad ejecutan el guard real y verifican firmas reales
  con claves locales de prueba.
- El smoke usa tokens reales de administrador y lector.
- La obtención de access tokens desde el navegador se habilita solamente
  de forma temporal en desarrollo para el smoke.
- El diseño visual de las pantallas actuales es provisional; se trabaja
  en el paso 4.
