# Integración de Ave María Rosario

La aplicación React de `cartunduaga06/ave-maria` se publica dentro de la web Jekyll en `/rosario/`.

## Arquitectura

- Jekyll conserva la portada, vídeos, navegación y páginas legales.
- El frontend React compilado vive en `rosario/`.
- `HashRouter` permite navegar en GitHub Pages sin configurar un servidor SPA.
- Firebase es opcional en el build público: sin variables `VITE_FIREBASE_*` funcionan las pantallas locales; con ellas se activan autenticación, intenciones, audios remotos y panel administrador.

## Variables para activar Firebase

Configurar en el entorno de compilación, nunca subir `.env`:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_ADMIN_EMAILS
```

También hay que autorizar `canalavemaria.com` en Firebase Authentication y revisar las reglas de `intentions` y `prayer_actions` antes de permitir escritura pública.

## Build

```bash
cd rosario-app
npm ci
npm run build
```

El resultado debe copiarse a `rosario/`. No se suben `node_modules`, `.env` ni credenciales.

