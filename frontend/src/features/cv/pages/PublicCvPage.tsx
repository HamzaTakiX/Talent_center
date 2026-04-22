import { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';

import { cvApi } from '../api';
import { PublicCv } from '../types';

const PublicCvPage: FunctionComponent = () => {
  const { token } = useParams<{ token: string }>();
  const [cv, setCv] = useState<PublicCv | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    cvApi
      .getPublicCv(token)
      .then((data) => setCv(data))
      .catch((e) => setError(e instanceof Error ? e.message : 'CV not available'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading CV...
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-gray-900">This CV is not available.</h1>
          <p className="text-sm text-gray-500 mt-1">
            The link may have expired or been revoked by the owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-wider text-gray-500">Shared CV</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{cv.title}</h1>
          {cv.owner_name && (
            <p className="text-sm text-gray-600 mt-0.5">by {cv.owner_name}</p>
          )}
        </header>

        <article className="bg-white shadow-xl rounded-lg overflow-hidden p-10 space-y-8">
          {cv.sections.map((section) => (
            <PublicSection key={section.id} section={section} />
          ))}
          {cv.sections.length === 0 && (
            <p className="text-sm text-gray-500 italic">This CV has no visible sections.</p>
          )}
        </article>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by Digital Talent Center
        </p>
      </div>
    </div>
  );
};

interface PublicSectionProps {
  section: PublicCv['sections'][number];
}

const PublicSection: FunctionComponent<PublicSectionProps> = ({ section }) => {
  const content = (section.content_json || {}) as Record<string, any>;

  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-blue-200 pb-1 mb-3">
        {section.label || section.section_type}
      </h2>
      {renderContent(section.section_type, content)}
    </section>
  );
};

function renderContent(type: string, content: Record<string, any>) {
  switch (type) {
    case 'summary':
      return <p className="text-sm text-gray-700 leading-relaxed">{content.text || ''}</p>;

    case 'contact': {
      const fields = [
        content.email,
        content.phone,
        content.linkedin,
        content.website,
        content.location,
      ].filter(Boolean);
      return (
        <p className="text-sm text-gray-700">
          {fields.map((f, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-2 text-gray-400">·</span>}
              {String(f)}
            </span>
          ))}
        </p>
      );
    }

    case 'experience': {
      const items = (content.items || []) as any[];
      return (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.id || i} className="border-l-2 border-blue-500 pl-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <span className="text-xs text-gray-500">
                  {item.start_date}{item.end_date ? ` – ${item.end_date}` : ''}
                </span>
              </div>
              <p className="text-xs text-blue-600 mb-1">
                {[item.company, item.location].filter(Boolean).join(' · ')}
              </p>
              {item.bullets && item.bullets.length > 0 && (
                <ul className="text-sm text-gray-700 list-disc ml-4 space-y-0.5">
                  {item.bullets.map((b: string, bi: number) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    case 'education': {
      const items = (content.items || []) as any[];
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id || i} className="border-l-2 border-blue-500 pl-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{item.degree}</h3>
                <span className="text-xs text-gray-500">
                  {item.start_date}{item.end_date ? ` – ${item.end_date}` : ''}
                </span>
              </div>
              <p className="text-xs text-blue-600 mb-1">
                {[item.school, item.location].filter(Boolean).join(' · ')}
              </p>
              {item.description && <p className="text-sm text-gray-700">{item.description}</p>}
            </div>
          ))}
        </div>
      );
    }

    case 'skills':
    case 'languages': {
      const items = (content.items || []) as any[];
      return (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={item.id || i}
              className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
            >
              {item.name}
              {item.level ? ` — ${item.level}` : ''}
            </span>
          ))}
        </div>
      );
    }

    case 'projects': {
      const items = (content.items || []) as any[];
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.id || i}>
              <h3 className="font-semibold text-gray-900 text-sm">
                {item.title || item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-700">{item.description}</p>
              )}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="text-sm text-gray-700 list-disc ml-4 space-y-0.5">
                  {item.bullets.map((b: string, bi: number) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    default:
      if (content.text) {
        return <p className="text-sm text-gray-700">{String(content.text)}</p>;
      }
      return null;
  }
}

export default PublicCvPage;
