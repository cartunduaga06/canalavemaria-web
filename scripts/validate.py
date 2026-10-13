#!/usr/bin/env python3
"""Validación sin dependencias externas para el sitio Jekyll."""
from pathlib import Path
import re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ["_config.yml", "CNAME", "index.html", "_layouts/default.html", "_layouts/home.html", "_layouts/post.html", "_layouts/pagina.html", "_layouts/wide.html", "_includes/cabecera.html", "_includes/pie.html", "assets/css/estilos.css"]
FIELDS = ["title", "date", "kind", "youtube_id", "passage", "description", "tags"]

def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"): return {}
    end = text.find("\n---", 4)
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"^([A-Za-z_]+):\s*(.*)$", text[4:end], re.M)}

def main():
    errors = []
    for item in REQUIRED:
        if not (ROOT / item).exists(): errors.append(f"falta {item}")
    posts = list((ROOT / "_posts").glob("*.md"))
    for post in posts:
        data = frontmatter(post)
        for field in FIELDS:
            if field not in data: errors.append(f"{post}: falta cabecera {field}")
        if data.get("kind") not in {"short", "video"}: errors.append(f"{post}: kind inválido")
    footer = (ROOT / "_includes/pie.html").read_text(encoding="utf-8") if (ROOT / "_includes/pie.html").exists() else ""
    for target in ("/privacidad/", "/terminos/"):
        if target not in footer: errors.append(f"el pie no enlaza {target}")
    for html in ROOT.rglob("*.html"):
        text = html.read_text(encoding="utf-8")
        for href in re.findall(r'href=["\'](/[A-Za-z0-9_./-]+/?)', text):
            if href in {"/", "/assets/css/estilos.css"}: continue
            if not any((ROOT / href.strip("/")).exists() or (ROOT / href.strip("/") / "index.html").exists() for _ in [0]):
                if not href.startswith("/videos/"): errors.append(f"{html}: enlace interno no encontrado {href}")
    if errors:
        print("VALIDACIÓN FALLIDA")
        print("\n".join(f"- {error}" for error in errors)); return 1
    print(f"VALIDACIÓN OK: {len(posts)} entrada(s) publicada(s)")
    try:
        subprocess.run(["bundle", "exec", "jekyll", "build"], cwd=ROOT, check=True)
        print("Jekyll build OK")
    except FileNotFoundError:
        print("AVISO: Ruby/Jekyll no está instalado; se omitió bundle exec jekyll build")
    except subprocess.CalledProcessError:
        print("Jekyll build falló")
        return 1
    return 0

if __name__ == "__main__": sys.exit(main())

