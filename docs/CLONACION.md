# Clonación de canalavemaria.com

## Diferencias frente al original

- La versión original es una SPA de Hostinger Horizons; esta versión usa HTML generado por Jekyll.
- La navegación y el contenido dinámico se expresan como páginas y colecciones estáticas.
- Los iconos decorativos del original se sustituyen por marcas CSS accesibles mientras no se entregue el paquete gráfico definitivo.

## Elementos no copiables

No se copian formularios conectados, mapas, servicios privados de Horizons ni JavaScript de terceros. Los vídeos usan el reproductor `youtube-nocookie.com` solicitado para la colección.

## TODO

- Sustituir el contenido legal de `privacidad/` y `terminos/` por el texto exacto del titular.
- Confirmar pasajes, identificadores reales y descripciones de los vídeos.
- Añadir las imágenes y tipografías locales definitivas si el titular autoriza su redistribución.
- Comparar capturas de Playwright en 390, 820 y 1440 px cuando esté disponible un navegador.

## Contrato de cabeceras

Cada entrada en `_posts/` debe incluir `title`, `date`, `kind` (`short` o `video`), `youtube_id`, `passage`, `description` y `tags`. Los borradores viven en `_drafts/` y no se publican.

