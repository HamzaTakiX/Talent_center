from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src/features/admin/dashboard/dashboard_cards"
for p in root.rglob("*SearchFilterBar.tsx"):
    text = p.read_text(encoding="utf-8")
    text = text.replace("from '../../../ui'", "from '../../../../ui'")
    p.write_text(text, encoding="utf-8")
    print("fixed", p.name)
