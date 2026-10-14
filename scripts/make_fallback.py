#!/usr/bin/env python3
"""Genera assets/img/miniaturas/fallback.webp (1280x720) sin recursos de terceros.

Arte propio y determinista: degradado azul de la marca, halo dorado y una cruz
sencilla, sin texto. Requiere Pillow solo para regenerarlo; el sitio no lo usa.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

W, H = 1280, 720
OUT = Path(__file__).resolve().parents[1] / "assets/img/miniaturas/fallback.webp"

def main():
    base = Image.new("RGB", (W, H))
    px = base.load()
    top, bottom = (23, 37, 84), (30, 64, 175)  # --azul-oscuro -> --azul
    for y in range(H):
        t = y / (H - 1)
        row = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(W):
            px[x, y] = row
    halo = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(halo).ellipse((W / 2 - 230, H / 2 - 230, W / 2 + 230, H / 2 + 230), fill=(245, 158, 11))
    halo = halo.filter(ImageFilter.GaussianBlur(120))
    img = Image.blend(base, Image.composite(halo, base, halo.convert("L")), 0.45)
    d = ImageDraw.Draw(img)
    gold, cx, cy = (254, 243, 199), W // 2, H // 2
    d.rounded_rectangle((cx - 14, cy - 150, cx + 14, cy + 170), radius=6, fill=gold)
    d.rounded_rectangle((cx - 85, cy - 70, cx + 85, cy - 42), radius=6, fill=gold)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "WEBP", quality=80, method=6)
    print(f"{OUT} {OUT.stat().st_size} bytes")

if __name__ == "__main__":
    main()
