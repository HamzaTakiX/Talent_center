"""Remove orphan string lines left after const removal."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"

IMPORT_MAP = {
    "adminTableBtn": "adminTableBtn",
    "adminTableBtnMobile": "adminTableBtnMobile",
    "adminTableBtnPrimary": "adminTableBtnPrimary",
    "adminTableBtnSuccess": "adminTableBtnSuccess",
    "adminTableBtnDanger": "adminTableBtnDanger",
    "adminTableBtnMobilePrimary": "adminTableBtnMobilePrimary",
    "adminTableBtnMobileSuccess": "adminTableBtnMobileSuccess",
}

for path in ROOT.rglob("*.tsx"):
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    new_lines = []
    for line in lines:
        s = line.strip()
        if (s.startswith("'") and s.endswith("';")) or (s.startswith('"') and s.endswith('";')):
            if "inline-flex" in s or "admin-table-btn" in s or "admin-btn" in s:
                continue
        new_lines.append(line)
    text = "".join(new_lines)
    # fix DocumentsPending approve/reject
    text = text.replace("className={actionButtonClass}", "className={adminTableBtnSuccess}")
    text = text.replace(
        "import { adminTableBtn, adminTableBtnMobile }",
        "import { adminTableBtnMobile, adminTableBtnMobileSuccess, adminTableBtnMobileDanger, adminTableBtnSuccess, adminTableBtnDanger }",
    )
    # ensure imports
    needed = {sym for sym in IMPORT_MAP if sym in text}
    if needed:
        depth = len(path.relative_to(ROOT).parts) - 1
        imp_path = "../" * depth + "ui/adminTableButtons"
        m = re.search(rf"import \{{([^}}]+)\}} from '{re.escape(imp_path)}'", text)
        if m:
            existing = {x.strip() for x in m.group(1).split(",")}
            merged = sorted(existing | needed)
            text = re.sub(
                rf"import \{{[^}}]+\}} from '{re.escape(imp_path)}'",
                f"import {{ {', '.join(merged)} }} from '{imp_path}'",
                text,
                count=1,
            )
        elif "adminTableBtn" in text or "adminTableBtnMobile" in text:
            sym_list = ", ".join(sorted(needed))
            insert = f"import {{ {sym_list} }} from '{imp_path}';\n"
            last_imp = text.rfind("import ")
            if last_imp >= 0:
                end = text.find("\n", text.find(";", last_imp))
                text = text[: end + 1] + "\n" + insert + text[end + 1 :]
    orig = path.read_text(encoding="utf-8")
    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(path.relative_to(ROOT))
