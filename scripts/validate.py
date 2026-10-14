#!/usr/bin/env python3
"""Validación sin dependencias externas para el sitio Jekyll."""
from pathlib import Path
import re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ["_config.yml", "CNAME", "index.html", "_layouts/default.html", "_layouts/home.html", "_layouts/post.html", "_layouts/pagina.html", "_layouts/wide.html", "_includes/cabecera.html", "_includes/pie.html", "_includes/ultimos-videos.html", "assets/css/estilos.css"]
FIELDS = ["title", "date", "kind", "youtube_id", "passage", "description", "tags"]
LEGAL_PHRASES = {
    "privacidad/index.html": ["carlosandresproyectos@gmail.com", "uso limitado", "myaccount.google.com/permissions"],
    "terminos/index.html": ["carlosandresproyectos@gmail.com", "tal cual", "myaccount.google.com/permissions"],
}
YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
THUMBNAIL = re.compile(r"^/assets/img/miniaturas/([A-Za-z0-9_-]+)\.webp$")
FALLBACK = "assets/img/miniaturas/fallback.webp"
MAX_THUMBNAIL_BYTES = 300 * 1024


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"): return {}
    end = text.find("\n---", 4)
    return {m.group(1): m.group(2).strip().strip("\"'") for m in re.finditer(r"^([A-Za-z_]+):\s*(.*)$", text[4:end], re.M)}


def webp_dimensions(data):
    """Return dimensions from a VP8, VP8L or VP8X chunk."""
    if len(data) < 12 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    offset = 12
    while offset + 8 <= len(data):
        kind = data[offset:offset + 4]
        size = int.from_bytes(data[offset + 4:offset + 8], "little")
        chunk = data[offset + 8:offset + 8 + size]
        if len(chunk) != size:
            return None
        if kind == b"VP8X" and size >= 10:
            return (1 + int.from_bytes(chunk[4:7], "little"), 1 + int.from_bytes(chunk[7:10], "little"))
        if kind == b"VP8 " and size >= 10 and chunk[3:6] == b"\x9d\x01\x2a":
            return (int.from_bytes(chunk[6:8], "little") & 0x3fff, int.from_bytes(chunk[8:10], "little") & 0x3fff)
        if kind == b"VP8L" and size >= 5 and chunk[0] == 0x2f:
            bits = int.from_bytes(chunk[1:5], "little")
            return ((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
        offset += 8 + size + (size & 1)
    return None


def check_thumbnail(path, label, errors):
    if not path.is_file():
        errors.append(f"{label}: fichero de miniatura inexistente")
        return
    data = path.read_bytes()
    if len(data) < 12 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        errors.append(f"{label}: firma RIFF....WEBP inválida")
        return
    if len(data) > MAX_THUMBNAIL_BYTES:
        errors.append(f"{label}: supera 300 KB")
    dimensions = webp_dimensions(data)
    if dimensions != (1280, 720):
        errors.append(f"{label}: dimensiones WebP inválidas ({dimensions or 'cabecera VP8/VP8L/VP8X inválida'}; se requieren 1280x720)")


def main(root=None):
    root = Path(root).resolve() if root is not None else ROOT
    errors = []
    warnings = []
    for item in REQUIRED:
        if not (root / item).exists(): errors.append(f"falta {item}")
    for item in ("_layouts/home.html", "videos/index.html"):
        path = root / item
        if path.exists() and "include ultimos-videos.html" not in path.read_text(encoding="utf-8"):
            errors.append(f"{item}: falta include ultimos-videos.html")
    post_layout = root / "_layouts/post.html"
    if post_layout.exists() and "{{ content }}" not in post_layout.read_text(encoding="utf-8"):
        errors.append("_layouts/post.html: falta {{ content }}")
    for item in ("_includes/ultimos-videos.html", "_layouts/home.html", "videos/index.html", "_layouts/post.html"):
        path = root / item
        if not path.exists(): continue
        text = path.read_text(encoding="utf-8")
        for opening, closing in (("if", "endif"), ("for", "endfor"), ("raw", "endraw")):
            opens = len(re.findall(r"{%[-]?\s*" + opening + r"\b", text))
            closes = len(re.findall(r"{%[-]?\s*" + closing + r"\b", text))
            if opens != closes: errors.append(f"{item}: etiquetas Liquid {opening}/{closing} desequilibradas ({opens}/{closes})")
    posts = list((root / "_posts").glob("*.md"))
    for post in posts:
        text = post.read_text(encoding="utf-8")
        data = frontmatter(post)
        for field in FIELDS:
            if field not in data: errors.append(f"{post}: falta cabecera {field}")
        if data.get("kind") not in {"short", "video"}: errors.append(f"{post}: kind inválido")
        if "TODO" in text: errors.append(f"{post}: contiene TODO")
        if "youtube_id" in data and (not YOUTUBE_ID.fullmatch(data["youtube_id"]) or data["youtube_id"] == "dQw4w9WgXcQ"):
            errors.append(f"{post}: youtube_id inválido o de ejemplo")
        thumbnail = data.get("thumbnail")
        if thumbnail is not None:
            if not THUMBNAIL.fullmatch(thumbnail) or ".." in thumbnail:
                errors.append(f"{post}: thumbnail inválida; se requiere /assets/img/miniaturas/<nombre>.webp")
            else:
                check_thumbnail(root / thumbnail.lstrip("/"), f"{post}: thumbnail", errors)
        if re.match(r"^https?://", data.get("image", ""), re.I):
            warnings.append(f"{post.relative_to(root)}: image: remota es legado")
    check_thumbnail(root / FALLBACK, FALLBACK, errors)
    config = (root / "_config.yml").read_text(encoding="utf-8") if (root / "_config.yml").exists() else ""
    exclude_match = re.search(r"(?ms)^exclude:\s*\n((?:\s+-.*\n?)*)", config)
    excluded = set(re.findall(r"^\s+-\s+([^\s#]+)", exclude_match.group(1), re.M)) if exclude_match else set()
    for required_exclude in ("AGENTS.md", "docs", "rosario-app"):
        if required_exclude not in excluded: errors.append(f"_config.yml no excluye {required_exclude}")
    for page, phrases in LEGAL_PHRASES.items():
        path = root / page
        text = path.read_text(encoding="utf-8") if path.exists() else ""
        if "TODO" in text: errors.append(f"{page}: contiene TODO")
        if not re.match(r"---\n(?:.*\n)*?layout:\s*\S+\n(?:.*\n)*?---\n", text): errors.append(f"{page}: cabecera Jekyll ausente, sin layout o sin cerrar")
        if re.search(r"</?(?:body|html|head)\b", text): errors.append(f"{page}: contiene etiquetas <html>/<body>/<head> sueltas")
        for phrase in phrases:
            if phrase not in text: errors.append(f"{page}: falta frase requerida {phrase}")
    footer = (root / "_includes/pie.html").read_text(encoding="utf-8") if (root / "_includes/pie.html").exists() else ""
    for target in ("/privacidad/", "/terminos/"):
        if target not in footer: errors.append(f"el pie no enlaza {target}")
    for html in root.rglob("*.html"):
        if any(part in {".git", "reference", "node_modules", "rosario-app"} for part in html.parts): continue
        text = html.read_text(encoding="utf-8")
        for href in re.findall(r'href=["\'](/[A-Za-z0-9_./-]+/?)', text):
            if href in {"/", "/assets/css/estilos.css"}: continue
            if not any((root / href.strip("/")).exists() or (root / href.strip("/") / "index.html").exists() for _ in [0]):
                if not href.startswith("/videos/"): errors.append(f"{html}: enlace interno no encontrado {href}")
    for path in root.rglob("*"):
        if not path.is_file() or any(part in {".git", "reference", "node_modules", "rosario-app", "_drafts"} for part in path.parts): continue
        if path.name == "AGENTS.md" or "docs" in path.parts: continue
        if path.suffix.lower() not in {".html", ".md", ".xml", ".txt"}: continue
        try: text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError: continue
        if "TODO" in text and path not in [root / p for p in LEGAL_PHRASES] and "_posts" not in path.parts:
            warnings.append(str(path.relative_to(root)))
    for path in root.rglob("*"):
        if not path.is_file() or any(part in {".git", "reference", "node_modules", "rosario-app", "docs", "_drafts", "_posts", "scripts"} for part in path.parts):
            continue
        if path.parent.name not in {"_layouts", "_includes"} and path.suffix.lower() not in {".html", ".md"}:
            continue
        try: text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError: continue
        rel = path.relative_to(root)
        if "i.ytimg.com" in text: errors.append(f"{rel}: contiene i.ytimg.com")
        if re.search(r"<iframe\b", text, re.I): errors.append(f"{rel}: contiene <iframe literal")
        if re.search(r"<script\b[^>]*\bsrc\s*=\s*['\"]https?://", text, re.I): errors.append(f"{rel}: contiene script externo")
    if warnings:
        print("AVISO: " + ", ".join(sorted(warnings)))
    if errors:
        print("VALIDACIÓN FALLIDA")
        print("\n".join(f"- {error}" for error in errors)); return 1
    print(f"VALIDACIÓN OK: {len(posts)} entrada(s) publicada(s)")
    if root != ROOT:
        return 0
    try:
        subprocess.run(["bundle", "exec", "jekyll", "build"], cwd=root, check=True)
        print("Jekyll build OK")
    except FileNotFoundError:
        print("AVISO: Ruby/Jekyll no está instalado; se omitió bundle exec jekyll build")
    except subprocess.CalledProcessError:
        print("Jekyll build falló")
        return 1
    return 0

if __name__ == "__main__": sys.exit(main())
