# Clonación de canalavemaria.com

## Diferencias frente al original

- La versión original es una SPA de Hostinger Horizons; esta versión usa HTML generado por Jekyll.
- La navegación y el contenido dinámico se expresan como páginas y colecciones estáticas.
- La portada, la navegación y la jerarquía visual se han migrado a Jekyll a partir del proyecto fuente descargado de Horizons.
- La imagen principal todavía usa la URL de imagen indicada por el proyecto fuente porque el ZIP no contiene los archivos gráficos locales.
- Las animaciones de Framer Motion se sustituyen por transiciones CSS sencillas, sin JavaScript externo.

## Elementos no copiables

No se copian formularios conectados, mapas, servicios privados de Horizons ni JavaScript de terceros. El iframe de `youtube-nocookie.com` se crea solo tras un clic; sin JavaScript se ofrece un enlace a YouTube.

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

## Verificación de AI-95

La web conserva las miniaturas de YouTube; no hay contrato ni fallback de
miniaturas locales. La imagen de ytimg se solicita al cargar el post; el
iframe de youtube-nocookie se crea solo tras pulsar reproducir. Sin JS,
el enlace abre YouTube. Los Shorts conservan sus miniaturas de YouTube.

Ejecutar con las dependencias del Gemfile instaladas:

- `python3 -m unittest scripts/test_validate.py`
- `python3 scripts/validate.py` (incluye Jekyll con `--strict_front_matter`;
  falla si falta Bundler o si falla el build).
- Repetir el validador después del build para comprobar que ignora
  `_site`, cachés y dependencias generadas.

El workflow de PR `Validate Jekyll` ejecuta esos controles y
`node scripts/test_player.cjs` sobre `_site`, con playwright-core 1.63.0
instalado en un directorio temporal. La prueba recorre todos los posts
generados a 390 y 1440 px, con y sin JS, y comprueba activación con Enter,
miniatura remota, iframe diferido y foco. Intercepta las solicitudes
externas; no comprueba la reproducción real de YouTube.

El workflow solo valida PRs hacia `feat/integrar-rosario`, sin desplegar.
Pages publica esa rama: hacer merge publica, por lo que requiere
autorización expresa. Rollback del cambio web: revertir los commits de
AI-95 mediante otro PR revisado; nunca escribir directamente en Pages.
