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
