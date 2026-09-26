import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Search, CheckCircle2, XCircle, Eye, FileText, Image as ImageIcon,
  Clock, ShieldCheck, ShieldX, GraduationCap, Building2, RefreshCw,
  ExternalLink, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  approved: { label: 'Approved', icon: ShieldCheck, badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', icon: ShieldX, badge: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
};

const AdminVerifications = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  // Document modal
  const [docModal, setDocModal] = useState(null); // user object

  // Reject modal
  const [rejectModal, setRejectModal] = useState(null); // user object
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = async (status = tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/verifications?status=${status}`);
      setUsers(res.data.users || []);
      setPendingCount(res.data.pendingCount || 0);
    } catch {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerifications(tab); }, [tab]);

  const handleApprove = async (user) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/verifications/${user._id}/review`, { action: 'approve' });
      toast.success(`${user.name} approved successfully`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setPendingCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await api.put(`/admin/verifications/${rejectModal._id}/review`, {
        action: 'reject',
        note: rejectNote || 'Documents were not acceptable. Please resubmit.',
      });
      toast.success(`${rejectModal.name} rejected`);
      setUsers(prev => prev.filter(u => u._id !== rejectModal._id));
      setPendingCount(prev => Math.max(0, prev - 1));
      setRejectModal(null);
      setRejectNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const getDocUrl = (docPath) => {
    const parts = docPath.replace(/\\/g, '/').split('uploads/');
    return `${SERVER_URL}/uploads/${parts[parts.length - 1]}`;
  };

  const isImage = (path) => /\.(jpg|jpeg|png)$/i.test(path);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: pendingCount },
    { id: 'rejected', label: 'Rejected', count: null },
    { id: 'approved', label: 'Approved', count: null },
  ];

  return (
    <DashboardLayout title="Document Verifications" subtitle="Review and approve student & company registration documents">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending Review', count: pendingCount, color: 'amber', icon: Clock },
          { label: 'Total Users', count: null, color: 'primary', icon: ShieldCheck },
          { label: 'Quick Review', count: null, color: 'emerald', icon: CheckCircle2, sub: 'Click docs to preview' },
        ].map(({ label, count, color, icon: Icon, sub }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-${color === 'primary' ? 'primary' : color}-500/15 flex items-center justify-center`}>
              <Icon size={20} className={`text-${color === 'primary' ? 'primary' : color}-400`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              {count !== null
                ? <p className="text-xl font-bold text-white">{count}</p>
                : <p className="text-xs text-gray-400 mt-0.5">{sub || '—'}</p>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {t.count > 9 ? '9+' : t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input-field pl-10 max-w-sm" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-gray-500 bg-white/5">
                  <th className="p-4 font-semibold">Applicant</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Registered</th>
                  <th className="p-4 font-semibold">Documents</th>
                  <th className="p-4 font-semibold">Status</th>
                  {tab !== 'approved' && <th className="p-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const cfg = statusConfig[u.verificationStatus] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-700 to-violet-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                            {u.companyName && <p className="text-xs text-gray-600">{u.companyName}</p>}
                            {u.college && <p className="text-xs text-gray-600">{u.college}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === 'student' ? 'bg-blue-500/15 text-blue-400' : 'bg-violet-500/15 text-violet-400'
                        }`}>
                          {u.role === 'student' ? <GraduationCap size={12} /> : <Building2 size={12} />}
                          {u.role}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {u.verificationResubmission && (
                          <div className="flex items-center gap-1 text-xs text-primary-400 mt-1">
                            <RefreshCw size={10} /> Resubmitted
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {u.verificationDocuments?.length > 0 ? (
                          <button onClick={() => setDocModal(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600/15 text-primary-400 text-xs font-medium hover:bg-primary-600/25 transition-colors border border-primary-600/20">
                            <Eye size={13} />
                            {u.verificationDocuments.length} file{u.verificationDocuments.length > 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">No documents</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </div>
                        {u.verificationNote && tab === 'rejected' && (
                          <p className="text-xs text-red-400/70 mt-1 max-w-[180px] truncate" title={u.verificationNote}>
                            {u.verificationNote}
                          </p>
                        )}
                      </td>
                      {tab !== 'approved' && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleApprove(u)} disabled={actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-colors border border-emerald-500/20 disabled:opacity-50">
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button onClick={() => { setRejectModal(u); setRejectNote(''); }} disabled={actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25 transition-colors border border-red-500/20 disabled:opacity-50">
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={tab !== 'approved' ? 6 : 5} className="p-12 text-center">
                      <ShieldCheck size={32} className="mx-auto mb-3 text-gray-700" />
                      <p className="text-gray-500 text-sm">No {tab} verifications found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setDocModal(null)}>
          <div className="w-full max-w-2xl glass-card rounded-2xl overflow-hidden border border-white/15"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Verification Documents</h3>
                <p className="text-xs text-gray-400">{docModal.name} — {docModal.role}</p>
              </div>
              <button onClick={() => setDocModal(null)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {docModal.verificationDocuments.map((doc, i) => {
                const url = getDocUrl(doc);
                const img = isImage(doc);
                return (
                  <div key={i} className="rounded-xl border border-white/10 overflow-hidden bg-white/3">
                    <div className="flex items-center gap-3 p-3 border-b border-white/8">
                      {img ? <ImageIcon size={16} className="text-primary-400" /> : <FileText size={16} className="text-primary-400" />}
                      <span className="text-sm text-gray-300 flex-1 truncate">
                        Document {i + 1} — {img ? 'Image' : 'PDF'}
                      </span>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        <ExternalLink size={12} /> Open
                      </a>
                    </div>
                    {img ? (
                      <img src={url} alt={`Document ${i + 1}`}
                        className="w-full max-h-64 object-contain bg-black/30 p-2" />
                    ) : (
                      <div className="p-8 text-center">
                        <FileText size={40} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-3">PDF Document</p>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600/20 text-primary-400 text-sm hover:bg-primary-600/30 transition-colors">
                          <ExternalLink size={14} /> Open PDF in New Tab
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => { handleApprove(docModal); setDocModal(null); }} disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-medium text-sm hover:bg-emerald-500/25 transition-colors border border-emerald-500/20 disabled:opacity-50">
                <CheckCircle2 size={16} /> Approve
              </button>
              <button onClick={() => { setRejectModal(docModal); setRejectNote(''); setDocModal(null); }} disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 text-red-400 font-medium text-sm hover:bg-red-500/25 transition-colors border border-red-500/20 disabled:opacity-50">
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setRejectModal(null)}>
          <div className="w-full max-w-md glass-card rounded-2xl border border-red-500/20 overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <XCircle size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reject Application</h3>
                  <p className="text-xs text-gray-400">{rejectModal.name}</p>
                </div>
              </div>
              <button onClick={() => setRejectModal(null)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Rejection Reason <span className="text-gray-500 font-normal">(shown to applicant)</span>
              </label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                rows={4}
                placeholder="e.g. The ID card image is blurry and unreadable. Please resubmit a clear, high-resolution scan of your college ID..."
                className="input-field resize-none text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">Leave blank to use default rejection message.</p>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10 pt-0">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/30 transition-colors border border-red-500/20 disabled:opacity-50">
                {actionLoading ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <><XCircle size={14} /> Confirm Rejection</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminVerifications;
