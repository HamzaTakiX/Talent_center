from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin/SRF/srf_cards"

for path in ROOT.rglob("*DetailTable.tsx"):
    text = path.read_text(encoding="utf-8")
    orig = text

    text = text.replace(
        '<motion.div className="space-y-3 lg:hidden">',
        '<div className="space-y-3 lg:hidden">',
    )

    # mobile: after empty-state ternary, fix `))}` before hidden table
    start = text.find('        <div className="space-y-3 lg:hidden">')
    if start != -1 and "rows.length === 0" in text[start : start + 2000]:
        end = text.find('        <div className="hidden w-full', start)
        if end != -1:
            block = text[start:end]
            if "          ))}" in block:
                block = block.replace("          ))}", "          ))\n          )}", 1)
                text = text[:start] + block + text[end:]

    # tbody: fix closing after row map when empty state present
    if "AdminTableEmptyState colSpan={7}" in text:
        marker = "AdminTableEmptyState colSpan={7}"
        idx = text.find(marker)
        tail = text[idx:]
        if "              ))}" in tail and "              ))\n              )}" not in tail:
            tail = tail.replace("              ))}", "              ))\n              )}", 1)
            text = text[:idx] + tail

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print("fixed", path.name)
