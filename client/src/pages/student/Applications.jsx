import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  FileText, Building2, Calendar, Eye, CheckCircle2, Circle,
  Clock, ChevronRight, Loader2,
} from 'lucide-react';

// Pipeline stages in order
const STAGES = [
  { key: 'Applied', label: 'Applied', icon: '📤' },
  { key: 'Under Review', label: 'Reviewing', icon: '🔍' },
  { key: 'Shortlisted', label: 'Shortlisted', icon: '⭐' },
  { key: 'Assessment', label: 'Assessment', icon: '📝' },
  { key: 'Interview', label: 'Interview', icon: '🎤' },
  { key: 'Selected', label: 'Selected', icon: '🎉' },
];

const STAGE_ORDER = STAGES.map(s => s.key);

const getStageIndex = (status) => {
  if (status === 'Rejected') return -1;
  if (status === 'Completed') return STAGES.length;
  return STAGE_ORDER.indexOf(status);
};

const statusColor = (status) => {
  if (status === 'Selected' || status === 'Completed') return 'text-emerald-400';
  if (status === 'Rejected') return 'text-red-400';
  if (status === 'Interview') return 'text-blue-400';
  if (status === 'Shortlisted') return 'text-amber-400';
  return 'text-primary-400';
};

const statusBg = (status) => {
  if (status === 'Selected' || status === 'Completed') return { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' };
  if (status === 'Rejected') return { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' };
  if (status === 'Interview') return { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' };
  if (status === 'Shortlisted') return { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fde68a' };
  return { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#c4b5fd' };
};

// Application Pipeline Timeline (horizontal)
const PipelineTimeline = ({ status }) => {
  const idx = getStageIndex(status);
  const isRejected = status === 'Rejected';
  const isCompleted = status === 'Completed';

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 py-3 px-1">
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(239,68,68,0.3)' }} />
        <span className="text-xs text-red-400 px-3 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          Application Not Progressed
        </span>
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(239,68,68,0.3)' }} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 py-3 overflow-x-auto">
      {STAGES.map((stage, i) => {
        const done = isCompleted || i < idx;
        const current = i === idx;
        const upcoming = i > idx;

        return (
          <div key={stage.key} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                done ? 'bg-emerald-500/90' : current ? 'bg-primary-600 ring-2 ring-primary-400/40 animate-pulse' : 'bg-white/8'
              }`}>
                {done ? <CheckCircle2 size={13} className="text-white" />
                  : current ? <Circle size={13} className="text-white fill-white" />
                  : <span className="text-gray-600 text-[10px]">{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-medium whitespace-nowrap ${
                done ? 'text-emerald-400' : current ? 'text-primary-300' : 'text-gray-600'
              }`}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-0.5 w-8 rounded-full transition-all ${
                done ? 'bg-emerald-500/60' : 'bg-white/8'
              }`} />
            )}
          </div>
        );
      })}
      {isCompleted && (
        <>
          <div className="h-0.5 w-8 rounded-full bg-emerald-500/60" />
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
              <span className="text-xs">🏆</span>
            </div>
            <span className="text-[9px] font-medium text-violet-400">Completed</span>
          </div>
        </>
      )}
    </div>
  );
};

const Applications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/applications/my')
      .then(r => { setApps(r.data.applications); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const counts = {
    all: apps.length,
    Applied: apps.filter(a => a.status === 'Applied').length,
    'Under Review': apps.filter(a => a.status === 'Under Review').length,
    Shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
    Selected: apps.filter(a => a.status === 'Selected').length,
    Rejected: apps.filter(a => a.status === 'Rejected').length,
    Completed: apps.filter(a => a.status === 'Completed').length,
  };

  const filterTabs = ['all', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Completed'];

  return (
    <DashboardLayout title="My Applications" subtitle="Track your internship application pipeline">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === s
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/8'
            }`}
            style={filter !== s ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
            {s === 'all' ? 'All' : s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
          <p className="text-gray-500 text-sm mb-4">
            {filter === 'all' ? "You haven't applied to any internships yet." : 'Try another filter.'}
          </p>
          {filter === 'all' && (
            <Link to="/student/internships" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
              Browse Internships <ChevronRight size={14} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const isExpanded = expandedId === app._id;
            const sStyle = statusBg(app.status);

            return (
              <div key={app._id} className="glass-card overflow-hidden transition-all duration-300">
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-primary-400 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))' }}>
                      {app.internshipId?.companyId?.companyName?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="text-sm font-bold text-white">{app.internshipId?.title || 'Internship'}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 size={11} />{app.internshipId?.companyId?.companyName || 'Company'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {app.resumeViewCount > 0 && (
                              <span className="flex items-center gap-1 text-blue-400">
                                <Eye size={11} />
                                Viewed {app.resumeViewCount} time{app.resumeViewCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0" style={sStyle}>
                          {app.status}
                        </span>
                      </div>

                      {/* Pipeline Timeline */}
                      {app.status !== 'Rejected' && (
                        <div className="mt-3">
                          <PipelineTimeline status={app.status} />
                        </div>
                      )}
                      {app.status === 'Rejected' && (
                        <PipelineTimeline status={app.status} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="px-5 pb-5 animate-fade-in border-t border-white/5 pt-4 space-y-4">
                    {/* Company Feedback */}
                    {app.companyFeedback && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs text-gray-500 mb-1">Company Feedback</p>
                        <p className="text-sm text-gray-300 italic">"{app.companyFeedback}"</p>
                      </div>
                    )}

                    {/* Timeline Events */}
                    {app.timelineEvents?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Activity History</p>
                        <div className="space-y-2">
                          {[...app.timelineEvents].reverse().map((ev, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-white">{ev.stage}</span>
                                {ev.note && <span className="text-xs text-gray-500 ml-2">— {ev.note}</span>}
                                <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                                  <Clock size={9} />
                                  {new Date(ev.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs text-gray-500 mb-1">Your Cover Letter</p>
                        <p className="text-xs text-gray-400 leading-relaxed">"{app.coverLetter}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app._id)}
                  className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors border-t border-white/5 flex items-center justify-center gap-1.5">
                  {isExpanded ? 'Hide details' : 'Show timeline & details'}
                  <ChevronRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Applications;
