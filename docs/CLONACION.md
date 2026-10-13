# Clonación de canalavemaria.com

## Diferencias frente al original

- La versión original es una SPA de Hostinger Horizons; esta versión usa HTML generado por Jekyll.
- La navegación y el contenido dinámico se expresan como páginas y colecciones estáticas.
- La portada, la navegación y la jerarquía visual se han migrado a Jekyll a partir del proyecto fuente descargado de Horizons.
- La imagen principal todavía usa la URL de imagen indicada por el proyecto fuente porque el ZIP no contiene los archivos gráficos locales.
- Las animaciones de Framer Motion se sustituyen por transiciones CSS sencillas, sin JavaScript externo.

## Elementos no copiables

No se copian formularios conectados, mapas, servicios privados de Horizons ni JavaScript de terceros. Los vídeos usan el reproductor `youtube-nocookie.com` solicitado para la colección.

El proyecto descargado incluye formularios que guardan nombres, correos y mensajes en `localStorage`; no se trasladan al sitio público. También incluye datos de contacto de ejemplo (`contacto@avemariatv.com` y un teléfono ficticio), que no se publican como datos reales.

## TODO

- Sustituir el contenido legal de `privacidad/` y `terminos/` por el texto exacto del titular.
- Confirmar pasajes, identificadores reales y descripciones de los vídeos.
- Añadir las imágenes y tipografías locales definitivas si el titular autoriza su redistribución.
- Confirmar si la imagen de portada y las imágenes de santos pueden redistribuirse localmente; el ZIP de Horizons solo contiene sus URLs.
- Completar Santos y Blog con el contenido definitivo; por ahora sus páginas incluyen `TODO:`.
- Confirmar las URL de compra del devocionario y el pack de imágenes, y la URL de donación. Los controles de Recursos se muestran solo como referencia visual y no procesan pagos ni redirigen.
- Confirmar correo, teléfono, WhatsApp y horario de atención. El formulario de Contacto no guarda ni envía datos hasta disponer de un medio de recepción autorizado.
- Sustituir las tarjetas de Vídeos por los IDs reales del canal. El proyecto de Horizons incluía únicamente el ID de demostración `dQw4w9WgXcQ`, por lo que no se reproduce ni se incrusta.
- Comparar capturas de Playwright en 390, 820 y 1440 px cuando esté disponible un navegador.

## Contrato de cabeceras

Cada entrada en `_posts/` debe incluir `title`, `date`, `kind` (`short` o `video`), `youtube_id`, `passage`, `description` y `tags`. Los borradores viven en `_drafts/` y no se publican.

