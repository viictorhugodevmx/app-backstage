# Paso 3 — Auth0, sesión y permisos

## Objetivo

Autenticar usuarios con Auth0 desde Next.js y autorizar las
operaciones de eventos en NestJS mediante access tokens y permisos.

## Arquitectura

- Auth0 administra la identidad y emite tokens.
- Next.js administra login, callback, sesión y logout.
- La sesión utiliza cookies HttpOnly administradas por el SDK.
- Next.js llama a NestJS desde el servidor utilizando un access token.
- NestJS verifica firma, emisor, audiencia, expiración y permisos.
- Los tokens y secretos no se guardan en localStorage.
- Los endpoints de salud permanecen públicos.
- Los endpoints de eventos requieren autenticación y permisos.
- La autorización se comprueba en el backend.

## Permisos iniciales

| Permiso       | Operaciones                |
| ------------- | -------------------------- |
| read:events   | Listar y consultar eventos |
| create:events | Crear eventos              |
| update:events | Editar eventos             |
| cancel:events | Cancelar eventos           |

## Roles iniciales

| Rol                | Permisos                                  |
| ------------------ | ----------------------------------------- |
| backstage-viewer   | read:events                               |
| backstage-producer | read:events, create:events, update:events |
| backstage-admin    | Los cuatro permisos                       |

## Puntos

- [ ] 3.1 Documentar alcance y permisos.
- [ ] 3.2 Registrar la API en Auth0.
- [ ] 3.3 Registrar la aplicación Next.
- [ ] 3.4 Configurar roles y usuarios de prueba.
- [ ] 3.5 Preparar variables y dependencias.
- [ ] 3.6 Implementar login, sesión y logout.
- [ ] 3.7 Validar JWT en NestJS.
- [ ] 3.8 Proteger eventos con permisos.
- [ ] 3.9 Conectar Next con la API autenticada.
- [ ] 3.10 Probar autenticación y autorización.
- [ ] 3.11 Comprobar el flujo real y generar reporte.
- [ ] 3.12 Documentar, crear commit, subir y solicitar VOBO.

## Criterios de validación

- Login y logout reales desde el navegador.
- Usuario sin sesión no puede acceder a operaciones protegidas.
- Token ausente, inválido o expirado produce HTTP 401.
- Token válido sin permiso suficiente produce HTTP 403.
- Token válido con permiso permite la operación.
- Las pruebas existentes se mantienen y se agregan pruebas de seguridad.
- Reporte final con formato, lint, tipos, pruebas y builds.
- Secretos fuera de Git.
- Commit y push completos.

## Estado

En preparación. El cierre requiere el VOBO del usuario.

## Evidencias de implementación

- API y aplicación registradas en Auth0.
- User-Delegated Access autorizado para Backstage Web Local.
- Roles y permisos configurados.
- Login y logout comprobados en el navegador.
- Administrador y lector consultan eventos.
- Peticiones sin token o con token inválido reciben 401.
- Verificador JWT probado con firmas locales reales.
- Guard HTTP probado con permisos de lectura, creación, edición y cancelación.
- Smoke real verifica el rechazo 403 de las modificaciones del lector.
- Reporte general generado en .cache/verification.
- Endpoint de tokens del navegador deshabilitado después del smoke.

## Estado de cierre técnico

Puntos 3.1–3.12 ejecutados y comprobados.
El cierre oficial del paso requiere el VOBO del usuario.
