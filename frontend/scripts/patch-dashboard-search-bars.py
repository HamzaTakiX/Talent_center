from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/admin/dashboard/dashboard_cards"

TEMPLATE = '''import {{ FunctionComponent, useState }} from 'react';
import {{ AdminSearchFilterBar }} from '../../../ui';

const {name}: FunctionComponent = () => {{
  const [query, setQuery] = useState('');

  return (
    <AdminSearchFilterBar
      value={{query}}
      onChange={{setQuery}}
      placeholder="{placeholder}"
    />
  );
}};

export default {name};
'''

bars = [
    ("students/components/StudentsSearchFilterBar.tsx", "StudentsSearchFilterBar", "Search students..."),
    ("encadrants/components/EncadrantsSearchFilterBar.tsx", "EncadrantsSearchFilterBar", "Search encadrants..."),
    ("admins/components/AdminsSearchFilterBar.tsx", "AdminsSearchFilterBar", "Search admins..."),
    ("active-internship-offers/components/ActiveOffersSearchFilterBar.tsx", "ActiveOffersSearchFilterBar", "Search offers..."),
    ("ongoing-applications/components/OngoingApplicationsSearchFilterBar.tsx", "OngoingApplicationsSearchFilterBar", "Search applications..."),
    ("documents-pending-validation/components/DocumentsPendingSearchFilterBar.tsx", "DocumentsPendingSearchFilterBar", "Search documents..."),
    ("students-unpaid-srf/components/StudentsUnpaidSrfSearchFilterBar.tsx", "StudentsUnpaidSrfSearchFilterBar", "Search students..."),
    ("students-without-internship/components/StudentsWithoutInternshipSearchFilterBar.tsx", "StudentsWithoutInternshipSearchFilterBar", "Search students..."),
]

for rel, name, placeholder in bars:
    p = ROOT / rel
    p.write_text(TEMPLATE.format(name=name, placeholder=placeholder), encoding="utf-8")
    print("wrote", rel)
