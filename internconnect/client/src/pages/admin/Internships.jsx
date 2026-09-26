import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Building2, CheckCircle, XCircle, MapPin, Clock, IndianRupee,
  Calendar, Search, Loader2, AlertTriangle, ChevronDown, ChevronUp,
  Users, Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionId, setActionId] = useState(null);

  const fetchData = () => {
    api.get('/admin/internships')
      .then(r => { setInternships(r.data.internships); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const handleApprove = async (id, approve) => {
    setActionId(id);
    try {
      await api.put(`/admin/internships/${id}/approve`, { isApprovedByAdmin: approve });
      toast.success(approve ? '✓ Internship approved' : 'Internship rejected');
      fetchData();
    } catch {
      toast.error('Action failed');
    }
    setActionId(null);
  };

  const pending = internships.filter(i => !i.isApprovedByAdmin);
  const approved = internships.filter(i => i.isApprovedByAdmin);

  const filtered = (filter === 'pending' ? pending : filter === 'approved' ? approved : internships)
    .filter(i =>
      !search ||
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.companyId?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      i.domain?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <DashboardLayout title="Internship Listings" subtitle="Review and approve company internship postings">
      {/* Summary + search row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input-field pl-9 py-2.5 text-sm"
            placeholder="Search by title, company, domain…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', count: internships.length },
            { key: 'pending', label: 'Pending', count: pending.length, urgent: pending.length > 0 },
            { key: 'approved', label: 'Approved', count: approved.length },
          ].map(({ key, label, count, urgent }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === key
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={filter !== key ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
              {urgent && filter !== key && (
                <AlertTriangle size={11} className="text-amber-400" />
              )}
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Pending alert */}
      {pending.length > 0 && filter !== 'approved' && (
        <div className="p-4 rounded-xl mb-5 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            <strong>{pending.length}</strong> internship{pending.length !== 1 ? 's' : ''} awaiting your review. Students cannot see unapproved listings.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Briefcase size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold mb-2">No internships found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your filter or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(i => {
            const isExpanded = expandedId === i._id;
            const isPending = !i.isApprovedByAdmin;
            const isActioning = actionId === i._id;

            return (
              <div key={i._id} className="glass-card overflow-hidden transition-all"
                style={{ borderColor: isPending ? 'rgba(245,158,11,0.2)' : undefined }}>
                {/* Pending indicator stripe */}
                {isPending && (
                  <div className="h-0.5 w-full"
                    style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.8), rgba(245,158,11,0.2))' }} />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-primary-400 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))' }}>
                        {i.companyId?.companyName?.[0] || 'C'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{i.title}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            isPending
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`} style={{
                            background: isPending ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                            border: `1px solid ${isPending ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
                          }}>
                            {isPending ? '⏳ Pending Review' : '✓ Approved'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                          <Building2 size={11} />
                          <span className="font-medium">{i.companyId?.companyName}</span>
                          <span className="text-gray-600">·</span>
                          <span>Posted {new Date(i.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {i.location && <span className="flex items-center gap-1"><MapPin size={10} />{i.location}</span>}
                          {i.duration && <span className="flex items-center gap-1"><Clock size={10} />{i.duration}</span>}
                          {i.stipend && <span className="flex items-center gap-1"><IndianRupee size={10} />₹{i.stipend.toLocaleString()}/mo</span>}
                          {i.deadline && <span className="flex items-center gap-1"><Calendar size={10} />Deadline: {new Date(i.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                          {i.openings && <span className="flex items-center gap-1"><Users size={10} />{i.openings} opening{i.openings !== 1 ? 's' : ''}</span>}
                        </div>

                        {/* Skills */}
                        {i.skillsRequired?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {i.skillsRequired.slice(0, 6).map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(124,58,237,0.1)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.15)' }}>
                                {s}
                              </span>
                            ))}
                            {i.skillsRequired.length > 6 && (
                              <span className="text-xs text-gray-600">+{i.skillsRequired.length - 6} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApprove(i._id, true)}
                            disabled={isActioning}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
                            {isActioning ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(i._id, false)}
                            disabled={isActioning}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                            {isActioning ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleApprove(i._id, false)}
                          disabled={isActioning}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {isActioning ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                          Revoke Approval
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable description */}
                {isExpanded && (
                  <div className="px-5 pb-5 animate-fade-in border-t border-white/5 pt-4">
                    <p className="text-sm text-gray-400 leading-relaxed">{i.description}</p>
                  </div>
                )}

                <button
                  onClick={() => setExpandedId(isExpanded ? null : i._id)}
                  className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors border-t border-white/5 flex items-center justify-center gap-1.5">
                  {isExpanded ? <><ChevronUp size={12} /> Hide description</> : <><ChevronDown size={12} /> View description</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminInternships;
