#!/usr/bin/env python3
"""Validación sin dependencias externas para el sitio Jekyll."""
from pathlib import Path
from html.parser import HTMLParser
import re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ["_config.yml", "CNAME", "index.html", "_layouts/default.html", "_layouts/home.html", "_layouts/post.html", "_layouts/pagina.html", "_layouts/wide.html", "_layouts/santo.html", "_includes/cabecera.html", "_includes/pie.html", "_includes/ultimos-videos.html", "_includes/santo-hoy.html", "santos/index.html", "assets/css/estilos.css"]
FIELDS = ["title", "date", "kind", "youtube_id", "passage", "description", "tags"]
SANTO_FIELDS = ["title", "santo", "date", "youtube_id", "description"]
LEGAL_PHRASES = {
    "privacidad/index.html": ["carlosandresproyectos@gmail.com", "uso limitado", "myaccount.google.com/permissions"],
    "terminos/index.html": ["carlosandresproyectos@gmail.com", "tal cual", "myaccount.google.com/permissions"],
}
GENERATED = {"_site", ".jekyll-cache", ".bundle", "vendor"}


class References(HTMLParser):
    """Inspect HTML tags, including unquoted and protocol-relative sources."""
    def __init__(self):
        super().__init__()
        self.iframe = False
        self.external_script = False

    def handle_starttag(self, tag, attrs):
        if tag == "iframe":
            self.iframe = True
        if tag == "script":
            src = dict(attrs).get("src", "") or ""
            if src.strip().lower().startswith(("https://", "http://", "//")):
                self.external_script = True

    handle_startendtag = handle_starttag


YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"): return {}
    end = text.find("\n---", 4)
    return {m.group(1): m.group(2).strip().strip("\"'") for m in re.finditer(r"^([A-Za-z_]+):\s*(.*)$", text[4:end], re.M)}


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
    for item, needle in (("_layouts/home.html", "include santo-hoy.html"), ("santos/index.html", "site.santos")):
        path = root / item
        if path.exists() and needle not in path.read_text(encoding="utf-8"):
            errors.append(f"{item}: falta {needle}")
    post_layout = root / "_layouts/post.html"
    if post_layout.exists() and "{{ content }}" not in post_layout.read_text(encoding="utf-8"):
        errors.append("_layouts/post.html: falta {{ content }}")
    for item in ("_includes/ultimos-videos.html", "_includes/santo-hoy.html", "_layouts/santo.html", "santos/index.html", "_layouts/home.html", "videos/index.html", "_layouts/post.html"):
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
    santos = list((root / "_santos").glob("*.md")) if (root / "_santos").exists() else []
    for santo in santos:
        text = santo.read_text(encoding="utf-8")
        data = frontmatter(santo)
        for field in SANTO_FIELDS:
            if not data.get(field): errors.append(f"{santo.relative_to(root)}: falta cabecera {field}")
        if "TODO" in text: errors.append(f"{santo.relative_to(root)}: contiene TODO")
        if data.get("youtube_id") and (not YOUTUBE_ID.fullmatch(data["youtube_id"]) or data["youtube_id"] == "dQw4w9WgXcQ"):
            errors.append(f"{santo.relative_to(root)}: youtube_id inválido o de ejemplo")
    config = (root / "_config.yml").read_text(encoding="utf-8") if (root / "_config.yml").exists() else ""
    exclude_match = re.search(r"(?ms)^exclude:\s*\n((?:\s+-.*\n?)*)", config)
    excluded = set(re.findall(r"^\s+-\s+([^\s#]+)", exclude_match.group(1), re.M)) if exclude_match else set()
    if not re.search(r"(?ms)type:\s*santos\s*\n\s*values:\s*\n\s*layout:\s*santo\b", config):
        errors.append("_config.yml no fija layout: santo por defecto para la colección santos")
    for required_exclude in ("AGENTS.md", "docs", "rosario-app", "vendor"):
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
        if any(part in GENERATED | {".git", "reference", "node_modules", "rosario-app"} for part in html.relative_to(root).parts): continue
        text = html.read_text(encoding="utf-8")
        for href in re.findall(r'href=["\'](/[A-Za-z0-9_./-]+/?)', text):
            if href in {"/", "/assets/css/estilos.css"}: continue
            if not any((root / href.strip("/")).exists() or (root / href.strip("/") / "index.html").exists() for _ in [0]):
                if not href.startswith("/videos/"): errors.append(f"{html}: enlace interno no encontrado {href}")
    for path in root.rglob("*"):
        if not path.is_file() or any(part in GENERATED | {".git", "reference", "node_modules", "rosario-app", "_drafts"} for part in path.relative_to(root).parts): continue
        if path.name == "AGENTS.md" or "docs" in path.parts: continue
        if path.suffix.lower() not in {".html", ".md", ".xml", ".txt"}: continue
        try: text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError: continue
        if "TODO" in text and path not in [root / p for p in LEGAL_PHRASES] and "_posts" not in path.parts:
            warnings.append(str(path.relative_to(root)))
    for path in root.rglob("*"):
        if not path.is_file() or any(part in GENERATED | {".git", "reference", "node_modules", "rosario-app", "docs", "_drafts", "scripts"} for part in path.relative_to(root).parts):
            continue
        if path.parent.name not in {"_layouts", "_includes"} and path.suffix.lower() not in {".html", ".md"}:
            continue
        try: text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError: continue
        rel = path.relative_to(root)
        refs = References()
        refs.feed(text)
        if refs.iframe: errors.append(f"{rel}: contiene <iframe literal")
        if refs.external_script: errors.append(f"{rel}: contiene script externo")
    if warnings:
        print("AVISO: archivos publicados con TODO: " + ", ".join(sorted(warnings)))
    if errors:
        print("VALIDACIÓN FALLIDA")
        print("\n".join(f"- {error}" for error in errors)); return 1
    print(f"VALIDACIÓN OK: {len(posts)} entrada(s) publicada(s), {len(santos)} santo(s)")
    if root != ROOT:
        return 0
    try:
        subprocess.run(["bundle", "exec", "jekyll", "build", "--strict_front_matter"], cwd=root, check=True)
        print("Jekyll build OK")
    except FileNotFoundError:
        print("ERROR: falta bundle; el build real de Jekyll es obligatorio")
        return 1
    except subprocess.CalledProcessError:
        print("Jekyll build falló")
        return 1
    return 0

if __name__ == "__main__": sys.exit(main())
