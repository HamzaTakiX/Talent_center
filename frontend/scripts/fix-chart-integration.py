from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src/features/admin"

for p in root.rglob("*.tsx"):
    t = p.read_text(encoding="utf-8")
    o = t
    t = t.replace("from '../../../../ui''", "from '../../../../ui';")
    t = t.replace("// AdminModulePageShell';\n", "")

    if p.name in {
        "AllDocumentsListPage.tsx",
        "PendingDocumentsListPage.tsx",
        "ValidatedDocumentsListPage.tsx",
        "RejectedDocumentsListPage.tsx",
    }:
        if "import { AdminStatChartSection }" not in t:
            t = t.replace(
                "import { FunctionComponent } from 'react';\n",
                "import { FunctionComponent } from 'react';\nimport { AdminStatChartSection } from '../../../../../ui';\n",
            )
        if "return (\n    <AdminStatChartSection" in t and "<>" not in t:
            t = t.replace(
                "return (\n    <AdminStatChartSection",
                "return (\n    <>\n      <AdminStatChartSection",
            )
            t = t.replace("\n    />\n  );", "\n    />\n    </>\n  );", 1)

    if p.name == "AllAdministratorsListPage.tsx":
        if "import { AdminStatChartSection }" not in t:
            t = t.replace(
                "import { FunctionComponent } from 'react';\n",
                "import { FunctionComponent } from 'react';\nimport { AdminStatChartSection } from '../../ui';\n",
            )
        if "<>" not in t:
            t = t.replace(
                "=> (\n  <AdminStatChartSection",
                "=> (\n  <>\n    <AdminStatChartSection",
            )
            t = t.replace(
                'filter="all" />\n);',
                'filter="all" />\n  </>\n);',
            )

    if t != o:
        p.write_text(t, encoding="utf-8")
        print("fixed", p.relative_to(root))
