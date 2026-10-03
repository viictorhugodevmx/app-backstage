# Backstage — Blueprint de trabajo

## Ruta principal

| Paso | Alcance                                                     |
| ---- | ----------------------------------------------------------- |
| 0    | Preparación, pruebas iniciales, Docker, documentación y Git |
| 1    | PostgreSQL, migraciones y datos iniciales                   |
| 2    | API de eventos                                              |
| 3    | Autenticación y autorización con Auth0                      |
| 4    | Interfaz de eventos y branding                              |
| 5    | Tareas y responsables                                       |
| 6    | Incidencias y reglas de preparación                         |
| 7    | Comentarios, auditoría y dashboard                          |
| 8    | Webhooks Flask firmados e idempotentes                      |
| 9    | Perfiles con Auth0 Management API                           |
| 10   | Pruebas E2E                                                 |
| 11   | Imágenes de producción                                      |
| 12   | CI/CD con Jenkins                                           |
| 13   | Kubernetes local con kind                                   |
| 14   | Operación de Kubernetes                                     |
| 15   | Preparación de GCP y decisión de base de datos              |
| 16   | Despliegue en Cloud Run                                     |
| 17   | Firestore, outbox y observabilidad                          |
| 18   | Terraform y automatización de entrega                       |
| 19   | Auditoría final, demo y preparación de entrevista           |
| 20   | Extensión opcional: GraphQL                                 |
| 21   | Extensión opcional: Pub/Sub                                 |
| 22   | Extensión opcional: GKE temporal                            |

## Criterios de cierre del Paso 0

- Dependencias fijadas y aplicaciones preparadas.
- Tests iniciales del frontend, API y Flask.
- Builds y verificaciones correctos.
- Servicios locales comprobados por HTTP.
- Variables de ejemplo y exclusión de archivos privados.
- Documentación actualizada.
- Auditoría general aprobada.
- Primer commit y push comprobados.

## Ejecución

Cada paso se detalla al comenzar con comandos completos, conceptos,
resultado esperado y verificación.
Los cambios de orden se documentan cuando una dependencia los requiere.
El avance confirmado se registra en STATUS.md.
