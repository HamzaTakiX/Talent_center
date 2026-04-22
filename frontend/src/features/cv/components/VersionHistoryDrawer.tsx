import { FunctionComponent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, RotateCcw, Save } from 'lucide-react';

import { cvApi } from '../api';
import { CvVersion } from '../types';

interface VersionHistoryDrawerProps {
  cvId: number;
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
}

const VersionHistoryDrawer: FunctionComponent<VersionHistoryDrawerProps> = ({
  cvId,
  open,
  onClose,
  onRestored,
}) => {
  const [versions, setVersions] = useState<CvVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await cvApi.listVersions(cvId);
      setVersions(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, cvId]);

  const handleSaveVersion = async () => {
    setSaving(true);
    try {
      await cvApi.saveVersion(cvId, note.trim() || 'Manual save');
      setNote('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save version');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: number) => {
    if (!window.confirm('Restore this version? Your current CV will be snapshot first.')) return;
    setBusyId(versionId);
    try {
      await cvApi.restoreVersion(cvId, versionId);
      onRestored();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to restore');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Version History</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Change note (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveVersion}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save current version'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && <p className="p-5 text-sm text-gray-500">Loading versions...</p>}
              {error && <p className="p-5 text-sm text-red-600">{error}</p>}
              {!loading && versions.length === 0 && !error && (
                <p className="p-5 text-sm text-gray-500 italic">
                  No saved versions yet. Use the button above to snapshot the current CV.
                </p>
              )}
              <ul className="divide-y divide-gray-100">
                {versions.map((v) => (
                  <li key={v.id} className="px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        Version {v.version_number}
                      </span>
                      <button
                        onClick={() => handleRestore(v.id)}
                        disabled={busyId === v.id}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-60"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {busyId === v.id ? 'Restoring...' : 'Restore'}
                      </button>
                    </div>
                    {v.change_note && (
                      <p className="text-xs text-gray-600 mb-1">{v.change_note}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default VersionHistoryDrawer;
