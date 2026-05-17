from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"

files = [
    "offres-stage/offrestage_cards/draft-offers/components/DraftOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/expired-offers/components/ExpiredOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/closed-offers/components/ClosedOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/with-applications/components/OffersWithApplicationsListTableContent.tsx",
    "offres-stage/offrestage_cards/all-offers/components/AllOffersTableContent.tsx",
    "encadrant/encadrant_cards/shared/components/EncadrantListTableContent.tsx",
]

for rel in files:
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    if "AdminTableScroll" in text:
        print("skip", rel)
        continue
    if "import { AdminTableScroll }" not in text:
        text = text.replace(
            "import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';",
            "import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';\nimport { AdminTableScroll } from '../../../../ui';",
            1,
        )
    text = text.replace(
        '      <div className="hidden overflow-x-auto lg:block">\n        <table className="w-full min-w-[800px] border-collapse">',
        '      <div className="admin-module-table-wrap hidden lg:block">\n        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">',
        1,
    )
    text = text.replace(
        "          </tbody>\n        </table>\n      </div>",
        "          </tbody>\n        </AdminTableScroll>\n      </div>",
        1,
    )
    p.write_text(text, encoding="utf-8")
    print("patched", rel)
