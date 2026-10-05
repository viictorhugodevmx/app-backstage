# Paso 2 — API de eventos

## Endpoints previstos

| Método | Ruta               | Resultado                                     |
| ------ | ------------------ | --------------------------------------------- |
| GET    | /events            | Listado paginado y filtro opcional por estado |
| GET    | /events/:id        | Detalle por UUID                              |
| POST   | /events            | Crear un evento en estado draft               |
| PATCH  | /events/:id        | Editar los datos del evento                   |
| POST   | /events/:id/cancel | Cancelar un evento                            |

## Reglas

- page: entero entre 1 y 10000; predeterminado 1.
- limit: entero entre 1 y 100; predeterminado 20.
- Listado ordenado por fecha de inicio e identificador.
- Slug único, máximo 80 caracteres, minúsculas y guiones.
- Fechas ISO 8601 con zona horaria explícita.
- Fecha final posterior a la inicial.
- Capacidad entera positiva.
- Los eventos nuevos comienzan como draft.
- El cliente no establece el estado mediante creación o edición.
- La cancelación repetida devuelve el evento ya cancelado.
- Un evento completed no puede cancelarse.
- Campos desconocidos y datos inválidos: HTTP 400.
- Evento inexistente: HTTP 404.
- Slug duplicado o conflicto de operación: HTTP 409.

## Puntos

2.1 Contrato y reglas.
2.2 DTOs, validación y tests.
2.3 Consultas de listado y detalle.
2.4 Servicio y controlador de lectura.
2.5 Creación, edición y cancelación.
2.6 Pruebas HTTP y PostgreSQL.
2.7 Comprobación HTTP manual.
2.8 Auditoría general.
2.9 Documentación, commit/push y visto bueno.

## Alcance

La autenticación y autorización se incorporan en el Paso 3.
Las reglas completas de preparación y transición de estados llegan
en sus pasos funcionales correspondientes.

## Verificación técnica

- DTOs y seis pruebas de validación agregados.
- Listado, detalle, creación, edición y cancelación implementados.
- Dieciocho pruebas HTTP con PostgreSQL real aprobadas.
- Comprobación HTTP desde Ubuntu ejecutada correctamente.
- Auditoría general con cuarenta y tres tests aprobados.
- Documentación preparada y cambios listos para Git.

El cierre oficial queda pendiente del visto bueno del usuario.

## Verificación técnica

- DTOs y seis pruebas de validación agregados.
- Listado, detalle, creación, edición y cancelación implementados.
- Dieciocho pruebas HTTP con PostgreSQL real aprobadas.
- Comprobación HTTP desde Ubuntu ejecutada correctamente.
- Auditoría general con cuarenta y tres tests aprobados.
- Documentación preparada y cambios listos para Git.

El cierre oficial queda pendiente del visto bueno del usuario.
