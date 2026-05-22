from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "templates" / "poster-layout.json"


class PosterTemplateTests(unittest.TestCase):
    def test_template_shape(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))
        self.assertEqual(data["document"]["width_px"], 2400)
        self.assertEqual(data["document"]["height_px"], 1600)
        self.assertGreaterEqual(len(data["content"]["sections"]), 4)

    def test_jsx_scripts_exist(self) -> None:
        create_script = (ROOT / "jsx" / "create_layered_poster.jsx").read_text(encoding="utf-8")
        export_script = (ROOT / "jsx" / "export_flat_preview.jsx").read_text(encoding="utf-8")
        self.assertIn("poster-layout.json", create_script)
        self.assertIn("JSON.parse", create_script)
        self.assertIn("PNGSaveOptions", export_script)

    def test_preview_is_public_safe(self) -> None:
        data = json.loads(TEMPLATE.read_text(encoding="utf-8"))
        preview = (ROOT / "preview" / "poster-preview.html").read_text(encoding="utf-8")
        self.assertIn(data["content"]["affiliation"], preview)
        for section in data["content"]["sections"]:
            self.assertIn(section["heading"], preview)
        self.assertNotIn("http://", preview)

    def test_preview_has_mobile_layout(self) -> None:
        preview = (ROOT / "preview" / "poster-preview.html").read_text(encoding="utf-8")
        self.assertIn("@media (max-width: 760px)", preview)
        self.assertIn("grid-template-columns: 1fr", preview)


if __name__ == "__main__":
    unittest.main()
