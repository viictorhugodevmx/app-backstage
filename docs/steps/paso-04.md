# Paso 4 — Branding y frontend de eventos

## Objetivo

Convertir las pantallas provisionales en una interfaz de producción
de eventos conectada a la API y a la sesión de Auth0.

## Identidad

- Nombre: Backstage.
- Giro: producción de conciertos y eventos musicales.
- Personalidad: directa, operativa y contemporánea.
- Base visual: grafito, blanco cálido y acentos lima.
- Tipografía: fuentes del sistema, sin descarga durante el build.
- Diseño responsive para escritorio y móvil.
- Estados con texto visible; el color no será la única señal.
- Navegación con teclado y foco visible.

## Funcionalidad

- Portada con acceso al espacio de producción.
- Listado de eventos con filtros y paginación.
- Detalle de un evento.
- Creación y edición mediante formularios.
- Cancelación con confirmación.
- Controles acordes a los permisos del usuario.
- Autorización obligatoria en NestJS.
- Mensajes de carga, ausencia de datos y errores.
- Consultas y mutaciones a la API desde el servidor de Next.js.

## Puntos

- [ ] 4.1 Documentar alcance e identidad visual.
- [ ] 4.2 Crear estilos y variables de diseño.
- [ ] 4.3 Construir navegación y estructura visual.
- [ ] 4.4 Reemplazar la portada inicial.
- [ ] 4.5 Diseñar listado, filtros y paginación.
- [ ] 4.6 Mostrar detalle de un evento.
- [ ] 4.7 Implementar creación de eventos.
- [ ] 4.8 Implementar edición.
- [ ] 4.9 Cancelación y controles según permisos.
- [ ] 4.10 Estados de carga, errores y pruebas.
- [ ] 4.11 Comprobación visual y reporte final.
- [ ] 4.12 Documentación, commits, push y VOBO.

## Criterios de validación

- Datos reales de PostgreSQL mostrados mediante la API.
- Formularios con mensajes claros y validación.
- Los usuarios lectores no disponen de controles de modificación.
- NestJS sigue rechazando operaciones sin permiso.
- Filtros y paginación conservados en la URL.
- Diseño usable en escritorio y móvil.
- Pruebas de frontend y regresiones de backend aprobadas.
- Formato, lint, tipos y builds aprobados.
- Reporte final único y comprobación visual.
- Cierre oficial mediante VOBO del usuario.

## Estado

En implementación.
