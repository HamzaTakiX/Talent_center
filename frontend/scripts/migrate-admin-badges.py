"""Replace legacy Tailwind badge class strings with admin-badge tokens in admin TSX/TS files."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"

# Order matters — longer / specific patterns first
REPLACEMENTS = [
    ("inline-flex items-center justify-center rounded-num-8 bg-lavender-200 px-2 py-num-2 text-num-12 font-medium leading-num-16 text-slateblue",
     "admin-badge admin-badge--event inline-flex items-center justify-center rounded-num-8 px-2 py-num-2 text-num-12 font-medium leading-num-16"),
    ("inline-flex items-center justify-center rounded-num-8 bg-lavender-100 px-2 py-num-2 text-num-12 font-medium leading-num-16 text-darkorchid",
     "admin-badge admin-badge--interview inline-flex items-center justify-center rounded-num-8 px-2 py-num-2 text-num-12 font-medium leading-num-16"),
    ("inline-flex items-center justify-center rounded-num-8 bg-honeydew px-2 py-num-2 text-num-12 font-medium leading-num-16 text-seagreen",
     "admin-badge admin-badge--success inline-flex items-center justify-center rounded-num-8 px-2 py-num-2 text-num-12 font-medium leading-num-16"),
    ("inline-flex items-center justify-center rounded-num-8 bg-mistyrose px-2 py-num-2 text-num-12 font-medium leading-num-16 text-firebrick",
     "admin-badge admin-badge--danger inline-flex items-center justify-center rounded-num-8 px-2 py-num-2 text-num-12 font-medium leading-num-16"),
    ("inline-flex items-center justify-center rounded-lg bg-honeydew px-2 py-0.5 text-xs font-medium leading-4 text-seagreen",
     "admin-badge admin-badge--success inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-medium leading-4"),
    ("inline-flex rounded-lg bg-honeydew px-2 py-0.5 text-xs font-medium leading-4 text-seagreen",
     "admin-badge admin-badge--success inline-flex rounded-lg px-2 py-0.5 text-xs font-medium leading-4"),
    ("inline-flex rounded-lg bg-honeydew px-2 py-0.5 font-inter text-xs font-medium leading-4 text-seagreen",
     "admin-badge admin-badge--success inline-flex rounded-lg px-2 py-0.5 font-inter text-xs font-medium leading-4"),
    ("inline-flex rounded-full bg-mistyrose px-2.5 py-1 font-inter text-xs font-medium leading-4 text-firebrick",
     "admin-badge admin-badge--danger inline-flex rounded-full px-2.5 py-1 font-inter text-xs font-medium leading-4"),
    ('"bg-lavender-200 text-slateblue"', '"admin-badge admin-badge--event"'),
    ('"bg-lavender-100 text-darkorchid"', '"admin-badge admin-badge--interview"'),
    ('"bg-honeydew text-seagreen"', '"admin-badge admin-badge--success"'),
    ('"bg-mistyrose text-firebrick"', '"admin-badge admin-badge--danger"'),
    ("'bg-lavender-200 text-slateblue'", "'admin-badge admin-badge--event'"),
    ("'bg-lavender-100 text-darkorchid'", "'admin-badge admin-badge--interview'"),
    ("'bg-honeydew text-seagreen'", "'admin-badge admin-badge--success'"),
    ("'bg-mistyrose text-firebrick'", "'admin-badge admin-badge--danger'"),
    ("'bg-[#fef9c2] text-[#894b00]'", "'admin-badge admin-badge--warning'"),
    ("'bg-[#ffe2e2] text-[#9f0712]'", "'admin-badge admin-badge--danger'"),
    ("'bg-gainsboro text-dimgray'", "'admin-badge admin-badge--neutral'"),
    ("return 'bg-honeydew text-seagreen'", "return 'admin-badge admin-badge--success'"),
    ("return 'bg-lavender-200 text-slateblue'", "return 'admin-badge admin-badge--event'"),
    ("return 'bg-lavender-100 text-darkorchid'", "return 'admin-badge admin-badge--interview'"),
    ("return 'bg-mistyrose text-firebrick'", "return 'admin-badge admin-badge--danger'"),
    # Timeline dot backgrounds only
    ("return 'bg-lavender-200'", "return 'admin-badge--event'"),
    ("return 'bg-lavender-100'", "return 'admin-badge--interview'"),
    ("return 'bg-honeydew'", "return 'admin-badge--success'"),
    ("return 'bg-mistyrose'", "return 'admin-badge--danger'"),
]

# Remaining inline spans with bg-* text-* pairs
INLINE_PATTERNS = [
    (r"inline-flex rounded-lg bg-honeydew px-2 py-0\.5 font-inter text-xs font-medium leading-4 text-seagreen",
     "admin-badge admin-badge--success inline-flex rounded-lg px-2 py-0.5 font-inter text-xs font-medium leading-4"),
    (r"inline-flex rounded-full bg-mistyrose px-2\.5 py-1 font-inter text-xs font-medium leading-4 text-firebrick",
     "admin-badge admin-badge--danger inline-flex rounded-full px-2.5 py-1 font-inter text-xs font-medium leading-4"),
]

count = 0
for path in list(ROOT.rglob("*.tsx")) + list(ROOT.rglob("*.ts")):
    if "node_modules" in str(path):
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    for pattern, repl in INLINE_PATTERNS:
        text = re.sub(pattern, repl, text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        count += 1
        print("updated", path.relative_to(ROOT.parent.parent))

print("files updated:", count)
