"""Unify admin table action buttons to adminTableBtn* constants."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"
UI_IMPORT = "adminTableButtons"

# Multiline const patterns to remove
CONST_PATTERNS = [
    r"const actionBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const actionBtnMobile\s*=\s*`?\$\{actionBtn\}[^`]*`?;\s*\n",
    r"const outlineBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const mobileActionBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const viewBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const downloadBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const approveBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const rejectBtn\s*=\s*\n?\s*'[^']*';\s*\n",
    r"const btnMobile\s*=\s*\([^)]*\)\s*=>\s*`[^`]*`;\s*\n",
    r"const approveBtnClass\s*=\s*\n?\s*'[^']*';\s*\n",
]

# Single-line long button strings (greedy-ish within quotes)
INLINE_BTN_RE = re.compile(
    r"'inline-flex h-8[^']{40,}?(?:admin-btn-surface|admin-table-btn)[^']*'",
    re.DOTALL,
)

REPLACEMENTS = [
    ("className={actionBtn}", "className={adminTableBtn}"),
    ("className={actionBtnMobile}", "className={adminTableBtnMobile}"),
    ("className={outlineBtn}", "className={adminTableBtn}"),
    ("className={mobileActionBtn}", "className={adminTableBtnMobile}"),
    ("className={viewBtn}", "className={adminTableBtn}"),
    ("className={downloadBtn}", "className={adminTableBtnPrimary}"),
    ("className={approveBtn}", "className={adminTableBtnSuccess}"),
    ("className={rejectBtn}", "className={adminTableBtnDanger}"),
    ("className={approveBtnClass}", "className={adminTableBtnSuccess}"),
    ("`${actionBtn}", "`${adminTableBtn}"),
    ("${outlineBtn}", "${adminTableBtn}"),
    ("${mobileActionBtn}", "${adminTableBtnMobile}"),
]

def ui_import_path(file_path: Path) -> str:
    rel = file_path.relative_to(ROOT)
    depth = len(rel.parts) - 1
    return "../" * depth + "ui/adminTableButtons"

def ensure_import(text: str, import_path: str, symbols: set[str]) -> str:
    if not symbols:
        return text
    sym_list = ", ".join(sorted(symbols))
    marker = f"from '{import_path}'"
    if marker in text or f'from "{import_path}"' in text:
        return text
    import_line = f"import {{ {sym_list} }} from '{import_path}';\n"
    # After last import
    m = list(re.finditer(r"^import .+;\s*$", text, re.MULTILINE))
    if m:
        pos = m[-1].end()
        return text[:pos] + "\n" + import_line + text[pos:]
    return import_line + text

def collect_symbols(text: str) -> set[str]:
    s = set()
    mapping = {
        "adminTableBtn": ["actionBtn", "outlineBtn", "viewBtn", INLINE_BTN_RE],
        "adminTableBtnMobile": ["actionBtnMobile", "mobileActionBtn", "btnMobile("],
        "adminTableBtnPrimary": ["downloadBtn"],
        "adminTableBtnSuccess": ["approveBtn", "approveBtnClass"],
        "adminTableBtnDanger": ["rejectBtn"],
        "adminTableBtnDelete": ["admin-table-btn--delete"],
    }
    for sym, keys in mapping.items():
        for k in keys:
            if isinstance(k, re.Pattern):
                if k.search(text):
                    s.add(sym)
            elif k in text:
                s.add(sym)
    if "adminTableBtnDelete" in text or "admin-table-btn--delete" in text:
        s.add("adminTableBtnDelete")
    return s

count = 0
for path in ROOT.rglob("*.tsx"):
    text = path.read_text(encoding="utf-8")
    original = text

    for pat in CONST_PATTERNS:
        text = re.sub(pat, "", text, flags=re.MULTILINE)

    text = INLINE_BTN_RE.sub("'admin-table-btn'", text)

    for old, new in REPLACEMENTS:
        text = text.replace(old, new)

    # btnMobile compound — use template
    text = re.sub(
        r"className=\{btnMobile\((viewBtn|downloadBtn|approveBtn|rejectBtn)\)\}",
        lambda m: {
            "viewBtn": "{adminTableBtnMobile}",
            "downloadBtn": "{`${adminTableBtnMobile} ${adminTableBtnPrimary}`.trim()}",
            "approveBtn": "{`${adminTableBtnMobile} ${adminTableBtnSuccess}`.trim()}",
            "rejectBtn": "{`${adminTableBtnMobile} ${adminTableBtnDanger}`.trim()}",
        }.get(m.group(1), "{adminTableBtnMobile}"),
        text,
    )

    symbols = collect_symbols(text)
    # Also add symbols if we reference them after replacement
    for sym in [
        "adminTableBtn",
        "adminTableBtnMobile",
        "adminTableBtnPrimary",
        "adminTableBtnSuccess",
        "adminTableBtnDanger",
        "adminTableBtnDelete",
        "adminTableBtnIcon",
    ]:
        if sym in text:
            symbols.add(sym)

    if text != original:
        import_path = ui_import_path(path)
        text = ensure_import(text, import_path, symbols)
        path.write_text(text, encoding="utf-8")
        count += 1
        print("updated", path.relative_to(ROOT.parent.parent))

print("files updated:", count)
