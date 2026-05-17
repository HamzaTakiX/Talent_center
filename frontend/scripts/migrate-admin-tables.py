from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"

TABLE_FILES = [
    "offres-stage/offrestage_cards/active-offers/components/ActiveOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/draft-offers/components/DraftOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/expired-offers/components/ExpiredOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/closed-offers/components/ClosedOffersListTableContent.tsx",
    "offres-stage/offrestage_cards/with-applications/components/OffersWithApplicationsListTableContent.tsx",
    "encadrant/encadrant_cards/shared/components/EncadrantListTableContent.tsx",
]

IMPORT_LINE = "import { AdminTableScroll } from '../../../../ui';\n"
IMPORT_LINE_ENC = "import { AdminTableScroll } from '../../../../ui';\n"

for rel in TABLE_FILES:
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    if "AdminTableScroll" in text:
        print("skip", rel)
        continue
    # add import after last import from lucide or react
    if "from '../../../../ui'" not in text and "AdminTableScroll" not in text:
        anchor = "import AdminMobileRowCard"
        if anchor in text:
            text = text.replace(
                anchor,
                "import { AdminTableScroll } from '../../../../ui';\nimport AdminMobileRowCard",
                1,
            )
    old = '      <div className="hidden overflow-x-auto lg:block">\n        <table className="w-full min-w-[800px] border-collapse">'
    new = '      <motion.div className="admin-module-table-wrap hidden lg:block">\n        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">'
    if old not in text:
        old = '      <div className="hidden overflow-x-auto lg:block">\n        <table className="w-full min-w-[800px] border-collapse">'
    if old not in text:
        print("no table block", rel)
        continue
    text = text.replace(old, new, 1)
    text = text.replace(
        "        </table>\n      </div>\n    </div>\n  );\n};",
        "        </AdminTableScroll>\n      </div>\n    </div>\n  );\n};",
        1,
    )
    text = text.replace("motion.div", "div")  # fix accidental
    p.write_text(text, encoding="utf-8")
    print("patched", rel)

# EncadrantsTablePanel desktop table
p = ROOT / "encadrant/components/EncadrantsTablePanel.tsx"
text = p.read_text(encoding="utf-8")
if 'admin-table-scroll--panel' not in text:
    text = text.replace(
        '      <div className="hidden overflow-x-auto px-4 pb-6 pt-0 min-w-0 sm:px-6 lg:block">\n        <div className="box-border w-full text-left font-inter text-num-14 leading-5 text-[var(--admin-text)]">\n          <div className="relative min-h-[284px] w-full min-w-[1195px] overflow-hidden">\n            <table className="w-full min-w-[1195px] border-collapse font-inter">',
        '      <div className="admin-module-table-wrap hidden px-4 pb-6 pt-0 min-w-0 sm:px-6 lg:block">\n        <AdminTableScroll minWidth="1195px" className="admin-table-scroll--panel">',
        1,
    )
    text = text.replace(
        "            </table>\n          </div>\n        </motion.div>\n      </div>",
        "        </AdminTableScroll>\n      </div>",
        1,
    )
    text = text.replace("        </motion.div>\n      </div>", "      </div>", 1)
    text = text.replace(
        "            </table>\n          </div>\n        </div>\n      </motion.div>",
        "        </AdminTableScroll>\n      </motion.div>",
        1,
    )
    p.write_text(text, encoding="utf-8")
    print("patched encadrants panel")
