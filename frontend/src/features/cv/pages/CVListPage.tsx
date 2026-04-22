import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Star } from 'lucide-react';
import { cvApi } from '../api';
import { StudentCvListItem } from '../types';

const CVListPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<StudentCvListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await cvApi.listMyCvs();
        setCvs(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load CVs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const fresh = await cvApi.createCv({});
      navigate(`/cv/${fresh.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create CV');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My CVs</h1>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and analyze your CVs.</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creating...' : 'New CV'}
          </button>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && cvs.length === 0 && !error && (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">You have not created any CV yet.</p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              Create your first CV
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cvs.map((cv) => (
            <button
              key={cv.id}
              onClick={() => navigate(`/cv/${cv.id}/edit`)}
              className="text-left p-5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{cv.title}</h3>
                </div>
                {cv.is_primary && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <Star className="w-3 h-3" />
                    Primary
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {cv.template_name} &middot; {cv.status}
              </p>
              {cv.current_score != null && (
                <p className="text-sm text-gray-700">Score: <span className="font-semibold">{cv.current_score}</span>/100</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CVListPage;
