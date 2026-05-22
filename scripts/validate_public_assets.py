from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "__pycache__", ".pytest_cache", ".venv", "venv", "dist", "build"}
TEXT_EXTENSIONS = {".md", ".py", ".jsx", ".html", ".json", ".txt", ".yml", ".yaml"}
FORBIDDEN_NAMES = {"." + "codex", "." + "claude", "AGENTS" + ".md", "CLAUDE" + ".md"}
FORBIDDEN_EXTENSIONS = {".psd", ".psb", ".tif", ".tiff", ".ai"}
SCANNER_FILES = {Path("scripts/validate_public_assets.py")}

EXPECTED_FILES = [
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "jsx/create_layered_poster.jsx",
    "jsx/export_flat_preview.jsx",
    "templates/poster-layout.json",
    "preview/poster-preview.html",
    "assets/poster-preview.png",
    "docs/photoshop-jsx-notes.md",
]

PATTERNS = {
    "local path": re.compile(r"([A-Z]:\\+(?:Users|OneDrive|Dropbox|Desktop|Documents|Projects|Research)\\+|/Users/|/home/)", re.IGNORECASE),
    "personal email": re.compile(r"\b[\w.+-]+@(?:gmail|outlook|hotmail|qq|163|126)\.com\b", re.IGNORECASE),
    "phone number": re.compile(r"(?<![\d.-])1[3-9]\d{9}(?![\d.-])"),
    "credential": re.compile(
        r"(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"
        r"AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|xox[baprs]-[0-9A-Za-z-]+|"
        r"OPENAI_API_KEY\s*=|api[_-]?key\s*[:=]|access[_-]?token\s*[:=]|"
        r"auth[_-]?token\s*[:=]|secret\s*[:=]|password\s*[:=])",
        re.IGNORECASE,
    ),
    "identity keyword": re.compile(
        r"(" + "户" + "口" + r"|" + "籍" + "贯" + r"|" + "护" + "照" + r"|pass" + r"port)",
        re.IGNORECASE,
    ),
}


def iter_public_files():
    for path in ROOT.rglob("*"):
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if path.is_file():
            yield path


def read_text(path: Path) -> str | None:
    if path.suffix.lower() in TEXT_EXTENSIONS or path.name in {".gitignore", ".gitattributes", "LICENSE"}:
        return path.read_text(encoding="utf-8", errors="ignore")
    return None


def validate_template() -> list[str]:
    errors: list[str] = []
    data = json.loads((ROOT / "templates" / "poster-layout.json").read_text(encoding="utf-8"))
    if not data.get("document", {}).get("name"):
        errors.append("Template document name is missing.")
    sections = data.get("content", {}).get("sections", [])
    if len(sections) < 4:
        errors.append("Template should include at least four sections.")
    return errors


def main() -> int:
    errors: list[str] = []

    for expected in EXPECTED_FILES:
        path = ROOT / expected
        if not path.exists() or path.stat().st_size == 0:
            errors.append(f"Missing or empty expected file: {expected}")

    errors.extend(validate_template())

    for path in iter_public_files():
        rel = path.relative_to(ROOT).as_posix()
        if path.suffix.lower() in FORBIDDEN_EXTENSIONS:
            errors.append(f"Forbidden design binary in repo: {rel}")
        if any(part in FORBIDDEN_NAMES for part in path.relative_to(ROOT).parts):
            errors.append(f"Forbidden public path: {rel}")

        text = read_text(path)
        if text is None:
            continue

        for name in FORBIDDEN_NAMES:
            if name in text and rel != ".gitignore":
                errors.append(f"Forbidden workspace marker {name!r} in {rel}")

        if path.relative_to(ROOT) not in SCANNER_FILES:
            for label, pattern in PATTERNS.items():
                if pattern.search(text):
                    errors.append(f"Potential {label} in {rel}")

        emails = re.findall(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", text)
        unexpected = [email for email in emails if not email.lower().endswith(("@example.com", "@example.org", "@example.net"))]
        if unexpected:
            errors.append(f"Unexpected email-like text in {rel}: {unexpected[:3]}")

    if errors:
        print("Public asset validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Public asset validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
