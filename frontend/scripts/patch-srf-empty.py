"""Patch SRF *DetailTable.tsx with search empty states."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin/SRF/srf_cards"
MSG = "No students match your search."
IMPORT_OLD = "import { AdminSelectField } from '../../../../ui';"
IMPORT_NEW = (
    "import { AdminSelectField, AdminSearchEmptyState, AdminTableEmptyState } "
    "from '../../../../ui';"
)

MOBILE_OLD = '        <div className="space-y-3 lg:hidden">\n          {rows.map('
MOBILE_NEW = (
    f'        <motion.div className="space-y-3 lg:hidden">\n'
    f"          {{rows.length === 0 ? (\n"
    f'            <AdminSearchEmptyState title="{MSG}" />\n'
    f"          ) : (\n"
    f"          rows.map("
)

TBODY_OLD = "            <tbody>\n              {rows.map("
TBODY_NEW = (
    f"            <tbody>\n"
    f"              {{rows.length === 0 ? (\n"
    f'                <AdminTableEmptyState colSpan={{7}} title="{MSG}" />\n'
    f"              ) : (\n"
    f"              rows.map("
)


def fix_mobile_close(text: str) -> str:
    start = text.find('        <div className="space-y-3 lg:hidden">')
    if start == -1:
        return text
    end = text.find('        <div className="hidden w-full', start)
    if end == -1:
        return text
    block = text[start:end]
    if "rows.length === 0" not in block:
        return text
    if "          ))}" in block:
        block = block.replace("          ))}", "          ))\n          )}", 1)
    return text[:start] + block + text[end:]


def fix_tbody_close(text: str) -> str:
    if "AdminTableEmptyState colSpan={7}" not in text:
        return text
    idx = text.find("AdminTableEmptyState colSpan={7}")
    tail = text[idx:]
    if "              )))}" in tail:
        tail = tail.replace("              )))}", "              ))\n              )}", 1)
        return text[:idx] + tail
    return text


for path in sorted(ROOT.rglob("*DetailTable.tsx")):
    text = path.read_text(encoding="utf-8")
    original = text

    if IMPORT_OLD in text:
        text = text.replace(IMPORT_OLD, IMPORT_NEW, 1)

    if MOBILE_OLD in text:
        text = text.replace(MOBILE_OLD, MOBILE_NEW, 1)

    if TBODY_OLD in text:
        text = text.replace(TBODY_OLD, TBODY_NEW, 1)

    text = fix_mobile_close(text)
    text = fix_tbody_close(text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        print("updated", path.name)
    else:
        print("unchanged", path.name)
