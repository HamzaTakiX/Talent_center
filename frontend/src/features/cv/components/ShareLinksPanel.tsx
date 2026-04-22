import { FunctionComponent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Trash2, Check, Plus, Ban, RotateCcw } from 'lucide-react';

import { cvApi } from '../api';
import { CvShareLink } from '../types';

interface ShareLinksPanelProps {
  cvId: number;
  open: boolean;
  onClose: () => void;
}

const ShareLinksPanel: FunctionComponent<ShareLinksPanelProps> = ({ cvId, open, onClose }) => {
  const [links, setLinks] = useState<CvShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setLinks(await cvApi.listShareLinks(cvId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load share links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, cvId]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const payload: { label?: string; expires_at?: string | null } = {};
      if (label.trim()) payload.label = label.trim();
      if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();
      const link = await cvApi.createShareLink(cvId, payload);
      setLinks((prev) => [link, ...prev]);
      setLabel('');
      setExpiresAt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create share link');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (link: CvShareLink) => {
    try {
      await navigator.clipboard.writeText(link.share_url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId((id) => (id === link.id ? null : id)), 1500);
    } catch {
      setError('Clipboard copy failed');
    }
  };

  const handleToggleActive = async (link: CvShareLink) => {
    try {
      const updated = await cvApi.updateShareLink(link.id, { is_active: !link.is_active });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update share link');
    }
  };

  const handleDelete = async (link: CvShareLink) => {
    if (!window.confirm('Delete this share link? The URL will stop working.')) return;
    try {
      await cvApi.deleteShareLink(link.id);
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete share link');
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
            className="fixed top-0 right-0 bottom-0 w-[440px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <h2 className="font-semibold text-gray-900">Share this CV</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 space-y-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (e.g. Recruiter — Acme Corp)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500"
              />
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded text-sm font-medium disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Creating...' : 'Create share link'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && <p className="p-5 text-sm text-gray-500">Loading share links...</p>}
              {error && <p className="p-5 text-sm text-red-600">{error}</p>}
              {!loading && links.length === 0 && !error && (
                <p className="p-5 text-sm text-gray-500 italic">
                  No share links yet. Create one above — anyone with the URL will see a read-only
                  view of your CV.
                </p>
              )}
              <ul className="divide-y divide-gray-100">
                {links.map((link) => {
                  const expired = link.expires_at && new Date(link.expires_at) < new Date();
                  const status = !link.is_active ? 'Revoked' : expired ? 'Expired' : 'Active';
                  const statusColor = !link.is_active || expired ? 'text-red-600' : 'text-emerald-600';
                  return (
                    <li key={link.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {link.label || 'Untitled share link'}
                          </p>
                          <p className={`text-xs font-medium ${statusColor}`}>{status}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(link)}
                            title="Copy URL"
                            className="p-1.5 text-gray-400 hover:text-emerald-600"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleActive(link)}
                            title={link.is_active ? 'Revoke' : 'Re-enable'}
                            className="p-1.5 text-gray-400 hover:text-amber-600"
                          >
                            {link.is_active ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(link)}
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 font-mono break-all">
                        {link.share_url}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{link.view_count} views</span>
                        {link.expires_at && (
                          <span>Expires {new Date(link.expires_at).toLocaleString()}</span>
                        )}
                        {link.last_viewed_at && (
                          <span>Last viewed {new Date(link.last_viewed_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareLinksPanel;
