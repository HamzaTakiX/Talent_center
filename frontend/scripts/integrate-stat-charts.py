"""Insert AdminStatChartSection into stat drill-down pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin"

# path relative to ROOT -> chartId, import path depth to ui
PATCHES: list[tuple[str, str, int, str]] = [
    # (file rel path, chartId, ui depth from file dir to features/admin/ui, insert after marker line contains)
]

def ui_import(depth: int) -> str:
    return "from " + "/".join([".."] * depth) + "/ui';\n".replace("/ui';", "/ui';")

def patch_file(rel: str, chart_id: str, depth: int, after_marker: str) -> bool:
    path = ROOT / rel
    if not path.exists():
        print("missing", rel)
        return False
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        print("skip", rel)
        return False
    imp = f"import {{ AdminStatChartSection }} from '{'../' * depth}ui';\n"
    if "AdminStatChartSection" not in text and imp.strip() not in text:
        # insert after last import
        idx = text.rfind("from ")
        if idx == -1:
            return False
        line_end = text.find("\n", idx)
        text = text[: line_end + 1] + imp + text[line_end + 1 :]

    chart_line = f'      <AdminStatChartSection chartId="{chart_id}" />\n'
    if "HistoryCardPageShell" in text and "chart=" not in text:
        text = text.replace(
            "timeline={<",
            f'chart={{<AdminStatChartSection chartId="{chart_id}" />}}\n      timeline={{<',
            1,
        )
        path.write_text(text, encoding="utf-8")
        print("history", rel)
        return True

    marker_idx = text.find(after_marker)
    if marker_idx == -1:
        print("no marker", rel, after_marker[:40])
        return False
    line_end = text.find("\n", marker_idx)
    text = text[: line_end + 1] + chart_line + text[line_end + 1 :]
    path.write_text(text, encoding="utf-8")
    print("ok", rel)
    return True

# Student cards (depth 4 from pages/ to admin/)
student = [
    ("student/student_cards/total_students/pages/TotalStudentsListPage.tsx", "students-total-enrollment", 4, "<TotalStudentsStatGrid />"),
    ("student/student_cards/active_students/pages/ActiveStudentsListPage.tsx", "students-active-split", 4, "<ActiveStudentsStatGrid />"),
    ("student/student_cards/without_internship/pages/WithoutInternshipListPage.tsx", "students-without-internship", 4, "<WithoutInternshipStatGrid />"),
    ("student/student_cards/with_internship/pages/WithInternshipListPage.tsx", "students-with-internship", 4, "<WithInternshipStatGrid />"),
]
for item in student:
    patch_file(*item)

# SRF (depth 4)
srf = [
    ("SRF/srf_cards/paid-students/pages/PaidStudentsDetailPage.tsx", "srf-paid-overview", 4, "<PaidStudentsKpiCards />"),
    ("SRF/srf_cards/unpaid-students/pages/UnpaidStudentsDetailPage.tsx", "srf-unpaid-amounts", 4, "<UnpaidStudentsKpiCards />"),
    ("SRF/srf_cards/partially-paid/pages/PartiallyPaidDetailPage.tsx", "srf-partially-paid", 4, "<PartiallyPaidKpiCards />"),
    ("SRF/srf_cards/pending-validation/pages/PendingValidationDetailPage.tsx", "srf-pending-queue", 4, "<PendingValidationKpiCards />"),
    ("SRF/srf_cards/late-payments/pages/LatePaymentsDetailPage.tsx", "srf-late-timeline", 4, "<LatePaymentsKpiCards />"),
    ("SRF/srf_cards/blocked-students/pages/BlockedStudentsDetailPage.tsx", "srf-blocked-trend", 4, "<BlockedStudentsKpiCards />"),
    ("SRF/srf_cards/exempted-students/pages/ExemptedStudentsDetailPage.tsx", "srf-exempted-reasons", 4, "<ExemptedStudentsKpiCards />"),
]
for item in srf:
    patch_file(*item)

# Offers - insert inside AdminStatDetailPanel before table (depth 4)
offers = [
    ("offres-stage/offrestage_cards/all-offers/pages/AllOffersPage.tsx", "offers-all-status", 4, "<AllOffersTableContent"),
    ("offres-stage/offrestage_cards/active-offers/pages/ActiveOffersListPage.tsx", "offers-active-companies", 4, "<ActiveOffersListTableContent"),
    ("offres-stage/offrestage_cards/expired-offers/pages/ExpiredOffersListPage.tsx", "offers-expired-timeline", 4, "<ExpiredOffersListTableContent"),
    ("offres-stage/offrestage_cards/draft-offers/pages/DraftOffersListPage.tsx", "offers-draft-monthly", 4, "<DraftOffersListTableContent"),
    ("offres-stage/offrestage_cards/closed-offers/pages/ClosedOffersListPage.tsx", "offers-closed-reasons", 4, "<ClosedOffersListTableContent"),
    ("offres-stage/offrestage_cards/with-applications/pages/OffersWithApplicationsListPage.tsx", "offers-applications-volume", 4, "<OffersWithApplicationsListTableContent"),
]
for rel, cid, depth, marker in offers:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        print("skip", rel)
        continue
    imp = f"import {{ AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection }} from '{'../' * depth}ui';\n"
    text = text.replace(
        f"import {{ AdminListPageShell, AdminStatDetailPanel }} from '{'../' * depth}ui';",
        imp.strip()[:-1] + "';",
    )
    chart_block = f'        <AdminStatChartSection chartId="{cid}" />\n        '
    text = text.replace(f"        {marker}", f"{chart_block}{marker}", 1)
    path.write_text(text, encoding="utf-8")
    print("offer", rel)

# Dashboard cards (depth 4 to ui from pages)
dash = [
    ("dashboard/dashboard_cards/students/pages/AllStudentsPage.tsx", "dashboard-students-fields", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/encadrants/pages/AllEncadrantsPage.tsx", "dashboard-encadrants-dept", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/admins/pages/AllAdminsPage.tsx", "dashboard-admins-roles", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/students-without-internship/pages/StudentsWithoutInternshipPage.tsx", "dashboard-without-internship", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/active-internship-offers/pages/ActiveInternshipOffersPage.tsx", "dashboard-active-offers-apps", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/ongoing-applications/pages/OngoingApplicationsPage.tsx", "dashboard-ongoing-funnel", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/documents-pending-validation/pages/DocumentsPendingValidationPage.tsx", "dashboard-documents-pending", 4, "<DashboardCardDetailPanel"),
    ("dashboard/dashboard_cards/students-unpaid-srf/pages/StudentsUnpaidSrfPage.tsx", "dashboard-srf-unpaid", 4, "<DashboardCardDetailPanel"),
]
for rel, cid, depth, marker in dash:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        print("skip", rel)
        continue
    if "from '../../../../ui" in text:
        text = text.replace(
            "from '../../../../ui/",
            "from '../../../../ui/AdminModulePageShell';\nimport { AdminStatChartSection } from '../../../../ui';\n// ",
            1,
        )
    # simpler: add import after AdminModulePageShell import
    if "AdminStatChartSection" not in text:
        text = text.replace(
            "import AdminModulePageShell from '../../../../ui/AdminModulePageShell';",
            "import AdminModulePageShell from '../../../../ui/AdminModulePageShell';\nimport { AdminStatChartSection } from '../../../../ui';",
        )
    chart_block = f'      <AdminStatChartSection chartId="{cid}" />\n      '
    text = text.replace(f"      {marker}", f"{chart_block}{marker}", 1)
    path.write_text(text, encoding="utf-8")
    print("dash", rel)

# Encadrant cards
enc = [
    ("encadrant/encadrant_cards/all-encadrants/pages/AllEncadrantsListPage.tsx", "encadrants-department-load", 4, "<EncadrantListTableContent"),
    ("encadrant/encadrant_cards/assigned-students/pages/EncadrantsByAssignedStudentsListPage.tsx", "encadrants-top-assigned", 4, "<EncadrantListTableContent"),
    ("encadrant/encadrant_cards/reports-in-progress/pages/ReportsInProgressListPage.tsx", "encadrants-reports-split", 4, "<EncadrantListTableContent"),
    ("encadrant/encadrant_cards/upcoming-meetings/pages/UpcomingMeetingsListPage.tsx", "encadrants-meetings-weekly", 4, "<EncadrantListTableContent"),
]
for rel, cid, depth, marker in enc:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        print("skip", rel)
        continue
    text = text.replace(
        f"import {{ AdminListPageShell, AdminStatDetailPanel }} from '{'../' * depth}ui';",
        f"import {{ AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection }} from '{'../' * depth}ui';",
    )
    chart_block = f'        <AdminStatChartSection chartId="{cid}" />\n        '
    text = text.replace(f"        {marker}", f"{chart_block}{marker}", 1)
    path.write_text(text, encoding="utf-8")
    print("enc", rel)

# Announcements
ann = [
    ("announcements-stage/annoucements_cards/all-announcements/pages/AllAnnouncementsListPage.tsx", "announcements-type-mix", 4, "<AllAnnouncementsTableContent"),
    ("announcements-stage/annoucements_cards/active-announcements/pages/ActiveAnnouncementsListPage.tsx", "announcements-active-split", 4, "<ActiveAnnouncementsTableContent"),
]
for rel, cid, depth, marker in ann:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        continue
    text = text.replace(
        f"import {{ AdminListPageShell, AdminStatDetailPanel }} from '{'../' * depth}ui';",
        f"import {{ AdminListPageShell, AdminStatDetailPanel, AdminStatChartSection }} from '{'../' * depth}ui';",
    )
    text = text.replace(f"        {marker}", f'        <AdminStatChartSection chartId="{cid}" />\n        {marker}', 1)
    path.write_text(text, encoding="utf-8")
    print("ann", rel)

# Documents - DocumentsFilteredListPage pattern
docs = [
    ("Documents_admin/Documents_cards/all-documents/pages/AllDocumentsListPage.tsx", "documents-status-mix", 5, "DocumentsFilteredListPage"),
    ("Documents_admin/Documents_cards/pending-documents/pages/PendingDocumentsListPage.tsx", "documents-pending-age", 5, "DocumentsFilteredListPage"),
    ("Documents_admin/Documents_cards/validated-documents/pages/ValidatedDocumentsListPage.tsx", "documents-validated-trend", 5, "DocumentsFilteredListPage"),
    ("Documents_admin/Documents_cards/rejected-documents/pages/RejectedDocumentsListPage.tsx", "documents-rejected-reasons", 5, "DocumentsFilteredListPage"),
]
for rel, cid, depth, comp in docs:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        continue
    text = text.replace(
        f"import {{ AdminListPageShell }} from '{'../' * depth}ui';",
        f"import {{ AdminListPageShell, AdminStatChartSection }} from '{'../' * depth}ui';",
    )
    text = text.replace(
        f"<{comp}",
        f'<AdminStatChartSection chartId="{cid}" />\n      <{comp}',
        1,
    )
    path.write_text(text, encoding="utf-8")
    print("doc", rel)

# History pages
history = [
    ("main_history/History_card/TotalActions_card/pages/TotalActionsHistoryCardPage.tsx", "history-total-actions"),
    ("main_history/History_card/Students_card/pages/StudentsHistoryCardPage.tsx", "history-students"),
    ("main_history/History_card/Applications_card/pages/ApplicationsHistoryCardPage.tsx", "history-applications"),
    ("main_history/History_card/Srf_card/pages/SrfHistoryCardPage.tsx", "history-srf"),
    ("main_history/History_card/Documents_card/pages/DocumentsHistoryCardPage.tsx", "history-documents"),
    ("main_history/History_card/Chat_card/pages/ChatHistoryCardPage.tsx", "history-chat"),
]
for rel, cid in history:
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    if "AdminStatChartSection" in text:
        continue
    text = text.replace(
        "import HistoryCardPageShell from '../../../components/HistoryCardPageShell';",
        "import HistoryCardPageShell from '../../../components/HistoryCardPageShell';\nimport { AdminStatChartSection } from '../../../../ui';",
    )
    text = text.replace(
        "timeline={<",
        f'chart={{<AdminStatChartSection chartId="{cid}" />}}\n      timeline={{<',
        1,
    )
    path.write_text(text, encoding="utf-8")
    print("hist", rel)

# Engagement level + sous-admin
path = ROOT / "student/student_cards/engagement_level/pages/EngagementLevelListPage.tsx"
text = path.read_text(encoding="utf-8")
if "students-engagement-distribution" not in text:
    text = text.replace(
        "import { AdminListPageShell } from '../../../../ui';",
        "import { AdminListPageShell, AdminStatChartSection } from '../../../../ui';",
    )
    text = text.replace(
        "<EngagementMetricsSection />",
        '<AdminStatChartSection chartId="students-engagement-distribution" />\n      <EngagementMetricsSection />',
    )
    path.write_text(text, encoding="utf-8")
    print("engagement")

path = ROOT / "sous_Admin/pages/AllAdministratorsListPage.tsx"
text = path.read_text(encoding="utf-8")
if "admins-role-distribution" not in text:
    text = text.replace(
        "import { AdminListPageShell } from '../../ui';",
        "import { AdminListPageShell, AdminStatChartSection } from '../../ui';",
    )
    # read file structure first - might use AdministratorFilteredListLayout
    if "AdministratorFilteredListLayout" in text:
        text = text.replace(
            "<AdministratorFilteredListLayout",
            '<AdminStatChartSection chartId="admins-role-distribution" />\n      <AdministratorFilteredListLayout',
            1,
        )
    path.write_text(text, encoding="utf-8")
    print("admins")
