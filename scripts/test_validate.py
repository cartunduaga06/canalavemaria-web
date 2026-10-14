"""Pruebas de las referencias seguras (sin iframe literal ni scripts externos)."""
import contextlib
import io
import tempfile
import unittest
from pathlib import Path

from scripts import validate


class ValidateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for folder in ("_posts", "_layouts", "_includes", "privacidad", "terminos"):
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

    def test_valid_site_passes(self):
        self.assertEqual(self.run_validator()[0], 0)

    def test_forbidden_embed_and_external_script(self):
        (self.root / "_layouts/post.html").write_text("<iframe>", encoding="utf-8")
        (self.root / "index.html").write_text('<script src="https://example.com/a.js"></script>', encoding="utf-8")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("<iframe literal", output)
        self.assertIn("script externo", output)


if __name__ == "__main__":
    unittest.main()
