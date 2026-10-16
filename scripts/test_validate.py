"""Pruebas de las referencias seguras (sin iframe literal ni scripts externos)."""
import contextlib
import io
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

from scripts import validate


class ValidateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for folder in ("_posts", "_layouts", "_includes", "privacidad", "terminos", "santos"):
            (self.root / folder).mkdir(parents=True, exist_ok=True)
        for item in validate.REQUIRED:
            path = self.root / item
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("", encoding="utf-8")
        (self.root / "_layouts/home.html").write_text("include ultimos-videos.html {% include santo-hoy.html %}", encoding="utf-8")
        (self.root / "santos/index.html").write_text("site.santos", encoding="utf-8")
        (self.root / "videos").mkdir(exist_ok=True)
        (self.root / "videos/index.html").write_text("include ultimos-videos.html", encoding="utf-8")
        (self.root / "_layouts/post.html").write_text("{{ content }}", encoding="utf-8")
        (self.root / "_includes/ultimos-videos.html").write_text("", encoding="utf-8")
        (self.root / "_includes/pie.html").write_text("/privacidad/ /terminos/", encoding="utf-8")
        (self.root / "_config.yml").write_text("exclude:\n  - AGENTS.md\n  - docs\n  - rosario-app\n  - vendor\n", encoding="utf-8")
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

    def write_santo(self, extra=""):
        (self.root / "_santos").mkdir(exist_ok=True)
        (self.root / "_santos/san-demo.md").write_text("---\ntitle: Demo\nsanto: San Demo\ndate: 2026-01-01\nyoutube_id: abcdefghijk\ndescription: Demo\n" + extra + "---\nBiografía\n", encoding="utf-8")

    def test_valid_santo_passes(self):
        self.write_santo()
        code, output = self.run_validator()
        self.assertEqual(code, 0)
        self.assertIn("1 santo(s)", output)

    def test_santo_requires_fields_and_no_todo(self):
        self.write_santo()
        (self.root / "_santos/san-demo.md").write_text("---\ntitle: Demo\nyoutube_id: dQw4w9WgXcQ\n---\nTODO\n", encoding="utf-8")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("falta cabecera santo", output)
        self.assertIn("contiene TODO", output)
        self.assertIn("youtube_id inválido", output)

    def test_home_must_include_santo_hoy(self):
        (self.root / "_layouts/home.html").write_text("include ultimos-videos.html", encoding="utf-8")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("falta include santo-hoy.html", output)

    def test_forbidden_embed_and_external_script(self):
        (self.root / "_layouts/post.html").write_text("<iframe>", encoding="utf-8")
        (self.root / "index.html").write_text('<script src="https://example.com/a.js"></script>', encoding="utf-8")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("<iframe literal", output)
        self.assertIn("script externo", output)

    def test_generated_site_is_not_validated_as_source(self):
        generated = self.root / "_site"
        generated.mkdir()
        (generated / "index.html").write_text(
            '<a href="/missing/">Link</a><iframe></iframe>'
            '<script src="//example.com/a.js"></script>', encoding="utf-8")
        self.assertEqual(self.run_validator()[0], 0)

    def test_published_posts_cannot_bypass_reference_checks(self):
        for fragment in ('<iframe src="https://example.com"></iframe>',
                         '<SCRIPT SRC=//example.com/a.js></SCRIPT>',
                         '<script src=https://example.com/a.js></script>'):
            with self.subTest(fragment=fragment):
                self.write_post()
                with self.post.open("a") as handle:
                    handle.write(fragment)
                self.assertEqual(self.run_validator()[0], 1)

    def test_nested_include_is_checked(self):
        nested = self.root / "_includes/nested"
        nested.mkdir()
        (nested / "embed.html").write_text("<iframe></iframe>", encoding="utf-8")
        self.assertEqual(self.run_validator()[0], 1)

    def test_missing_bundle_fails_validation(self):
        with patch.object(validate, "ROOT", self.root), patch.object(
                validate.subprocess, "run", side_effect=FileNotFoundError):
            code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("build real de Jekyll es obligatorio", output)

    def test_failed_build_fails_validation(self):
        with patch.object(validate, "ROOT", self.root), patch.object(
                validate.subprocess, "run",
                side_effect=validate.subprocess.CalledProcessError(1, "bundle")):
            self.assertEqual(self.run_validator()[0], 1)

    def test_gem_dependencies_must_be_excluded_from_jekyll(self):
        config = self.root / "_config.yml"
        config.write_text(config.read_text().replace("  - vendor\n", ""), encoding="utf-8")
        code, output = self.run_validator()
        self.assertEqual(code, 1)
        self.assertIn("_config.yml no excluye vendor", output)


if __name__ == "__main__":
    unittest.main()
