"""Pruebas del contrato de miniaturas y referencias seguras."""
import contextlib
import io
import tempfile
import unittest
from pathlib import Path

from scripts import validate


def webp_vp8x(width=1280, height=720, padding=0):
    # VP8X stores width/height minus one in three little-endian bytes.
    payload = b"\x00\x00\x00\x00" + (width - 1).to_bytes(3, "little") + (height - 1).to_bytes(3, "little")
    payload += b"\x00" * padding
    chunk = b"VP8X" + len(payload).to_bytes(4, "little") + payload
    if len(payload) & 1:
        chunk += b"\x00"
    body = b"WEBP" + chunk
    return b"RIFF" + len(body).to_bytes(4, "little") + body


class ValidateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for folder in ("_posts", "_layouts", "_includes", "assets/img/miniaturas", "privacidad", "terminos"):
            (self.root / folder).mkdir(parents=True, exist_ok=True)
        for item in validate.REQUIRED:
            path = self.root / item
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("", encoding="utf-8")
        (self.root / "_layouts/home.html").write_text("include ultimos-videos.html", encoding="utf-8")
        (self.root / "videos").mkdir(exist_ok=True)
        (self.root / "videos/index.html").write_text("include ultimos-videos.html", encoding="utf-8")
        (self.root / "_layouts/post.html").write_text("{{ content }}", encoding="utf-8")
        (self.root / "_includes/ultimos-videos.html").write_text("", encoding="utf-8")
        (self.root / "_includes/pie.html").write_text("/privacidad/ /terminos/", encoding="utf-8")
        (self.root / "_config.yml").write_text("exclude:\n  - AGENTS.md\n  - docs\n  - rosario-app\n", encoding="utf-8")
        for page, phrases in validate.LEGAL_PHRASES.items():
            text = "---\nlayout: page\n---\n" + " ".join(phrases)
            (self.root / page).write_text(text, encoding="utf-8")
        (self.root / validate.FALLBACK).write_bytes(webp_vp8x())
        self.post = self.root / "_posts/2026-01-01-demo.md"
        self.write_post()

    def tearDown(self):
        self.temp.cleanup()

    def write_post(self, extra=""):
        self.post.write_text("---\ntitle: Demo\ndate: 2026-01-01\nkind: video\nyoutube_id: abcdefghijk\npassage: Demo\ndescription: Demo\ntags: demo\n" + extra + "---\nContenido\n", encoding="utf-8")

    def run_validator(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = validate.main(self.root)
        return code, output.getvalue()

    def test_optional_thumbnail_and_valid_local_thumbnail(self):
        self.assertEqual(self.run_validator()[0], 0)
        thumb = self.root / "assets/img/miniaturas/abcdefghijk.webp"
        thumb.write_bytes(webp_vp8x())
        self.write_post("thumbnail: /assets/img/miniaturas/abcdefghijk.webp\n")
        self.assertEqual(self.run_validator()[0], 0)

    def test_rejects_invalid_thumbnail_path_and_missing_file(self):
        self.write_post("thumbnail: https://example.com/x.webp\n")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("thumbnail inválida", output)
        self.write_post("thumbnail: /assets/img/miniaturas/missing.webp\n")
        self.assertIn("inexistente", self.run_validator()[1])

    def test_rejects_wrong_signature_dimensions_and_size(self):
        thumb = self.root / "assets/img/miniaturas/test.webp"
        self.write_post("thumbnail: /assets/img/miniaturas/test.webp\n")
        thumb.write_bytes(b"not a webp")
        self.assertIn("firma", self.run_validator()[1])
        thumb.write_bytes(webp_vp8x(640, 360))
        self.assertIn("dimensiones", self.run_validator()[1])
        thumb.write_bytes(webp_vp8x(padding=300 * 1024))
        self.assertIn("supera 300 KB", self.run_validator()[1])

    def test_fallback_is_required_and_validated(self):
        fallback = self.root / validate.FALLBACK
        fallback.unlink()
        self.assertIn("fichero de miniatura inexistente", self.run_validator()[1])
        fallback.write_bytes(webp_vp8x(1280, 720))
        self.assertEqual(self.run_validator()[0], 0)

    def test_forbidden_embed_and_external_script(self):
        (self.root / "_includes/ultimos-videos.html").write_text("i.ytimg.com", encoding="utf-8")
        (self.root / "_layouts/post.html").write_text("<iframe>", encoding="utf-8")
        (self.root / "index.html").write_text('<script src="https://example.com/a.js"></script>', encoding="utf-8")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("i.ytimg.com", output)
        self.assertIn("<iframe literal", output)
        self.assertIn("script externo", output)

    def test_remote_legacy_image_warns_only(self):
        self.write_post("image: https://example.com/old.jpg\n")
        code, output = self.run_validator()
        self.assertEqual(code, 0)
        self.assertIn("image: remota es legado", output)


if __name__ == "__main__":
    unittest.main()
