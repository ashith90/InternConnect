import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Users, Mail, Phone, GraduationCap, FileText, ExternalLink,
  CheckCircle2, AlertCircle, Target, TrendingUp, ChevronDown,
  BarChart2, Star, ArrowUpDown, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

// Fit score computation (mirror of student side)
const computeFit = (studentSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 100;
  const norm = s => s.toLowerCase().replace(/[.\s-]/g, '');
  const matched = requiredSkills.filter(req =>
    studentSkills.some(sk => norm(sk).includes(norm(req)) || norm(req).includes(norm(sk)))
  );
  return Math.round((matched.length / requiredSkills.length) * 100);
};

const fitBadge = (score) => {
  if (score >= 80) return { style: { background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }, label: 'High' };
  if (score >= 60) return { style: { background: 'rgba(245,158,11,0.12)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.25)' }, label: 'Medium' };
  return { style: { background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }, label: 'Low' };
};

const PIPELINE_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Completed'];

// Skill distribution chart
const SkillDistribution = ({ apps }) => {
  const skillCounts = useMemo(() => {
    const counts = {};
    apps.forEach(app => {
      (app.studentId?.skills || []).forEach(sk => {
        counts[sk] = (counts[sk] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([skill, count]) => ({ skill, count, pct: Math.round((count / apps.length) * 100) }));
  }, [apps]);

  if (skillCounts.length === 0) return null;

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={16} className="text-primary-400" />
        <h3 className="text-sm font-semibold text-white">Applicant Skill Distribution</h3>
        <span className="ml-auto text-xs text-gray-500">{apps.length} total applicants</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {skillCounts.map(({ skill, count, pct }) => (
          <div key={skill} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-300 font-medium truncate">{skill}</span>
              <span className="text-xs text-primary-400 font-bold ml-1">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-violet-500 transition-all duration-700"
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-gray-600 mt-1 block">{count} candidate{count !== 1 ? 's' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pipeline funnel
const PipelineFunnel = ({ apps }) => {
  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];
  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-primary-400" />
        <h3 className="text-sm font-semibold text-white">Application Pipeline</h3>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {stages.map((s, i) => {
          const count = apps.filter(a => a.status === s).length;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-lg font-black text-white">{count}</div>
                <div className="text-xs text-gray-500">{s}</div>
              </div>
              {i < stages.length - 1 && <span className="text-gray-700 text-lg">→</span>}
            </div>
          );
        })}
        <div className="ml-auto">
          <div className="text-center">
            <div className="text-lg font-black text-red-400">{apps.filter(a => a.status === 'Rejected').length}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Applicants = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fit'); // 'fit' | 'date' | 'name'
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/applications/company')
      .then(r => { setApps(r.data.applications); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/applications/${id}/status`, { status });
      setApps(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Moved to: ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
    setUpdatingId(null);
  };

  // Enrich with fit score
  const enriched = useMemo(() => apps.map(app => ({
    ...app,
    fitScore: computeFit(
      app.studentId?.skills || [],
      app.internshipId?.skillsRequired || [],
    ),
  })), [apps]);

  const filtered = filter === 'all' ? enriched : enriched.filter(a => a.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'fit') return b.fitScore - a.fitScore;
    if (sortBy === 'name') return (a.studentId?.name || '').localeCompare(b.studentId?.name || '');
    return new Date(b.appliedAt) - new Date(a.appliedAt);
  });

  const counts = Object.fromEntries(
    ['all', ...PIPELINE_STATUSES].map(s => [s, s === 'all' ? apps.length : apps.filter(a => a.status === s).length])
  );

  return (
    <DashboardLayout title="Applicants" subtitle="Review and manage your internship applicants">
      {/* Distribution + Funnel */}
      {apps.length > 0 && (
        <>
          <PipelineFunnel apps={apps} />
          <SkillDistribution apps={apps} />
        </>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2 flex-1">
          {['all', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === s ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              style={filter !== s ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
              {s === 'all' ? 'All' : s} ({counts[s] || 0})
            </button>
          ))}
        </div>
        <select
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="input-field w-auto py-2 px-3 text-xs min-w-[140px]">
          <option value="fit">Sort: Best Match</option>
          <option value="date">Sort: Newest</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg text-white font-semibold mb-2">No applicants {filter !== 'all' ? `in "${filter}"` : 'yet'}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((app, rank) => {
            const { style: fitStyle } = fitBadge(app.fitScore);
            const isExpanded = expandedId === app._id;
            const isUpdating = updatingId === app._id;

            return (
              <div key={app._id} className="glass-card overflow-hidden transition-all">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Rank badge */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                        style={{ background: rank < 3 ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'rgba(255,255,255,0.08)', color: rank < 3 ? 'white' : '#6b7280' }}>
                        {rank < 3 ? ['🥇', '🥈', '🥉'][rank] : `#${rank + 1}`}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="text-sm font-bold text-white">{app.studentId?.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Applied for: <span className="text-gray-300">{app.internshipId?.title}</span></p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Fit Score */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={fitStyle}>
                            <Target size={12} />
                            <span className="text-xs font-bold">{app.fitScore}% Match</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={11} />{app.studentId?.email}</span>
                        {app.studentId?.phone && <span className="flex items-center gap-1"><Phone size={11} />{app.studentId.phone}</span>}
                        {app.studentId?.college && <span className="flex items-center gap-1"><GraduationCap size={11} />{app.studentId.college}</span>}
                      </div>

                      {/* Skills */}
                      {app.studentId?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {app.studentId.skills.slice(0, 8).map(s => {
                            const isMatch = (app.internshipId?.skillsRequired || []).some(
                              req => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase())
                            );
                            return (
                              <span key={s} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                style={isMatch
                                  ? { background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }
                                  : { background: 'rgba(124,58,237,0.1)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
                                {isMatch ? <CheckCircle2 size={9} /> : null}{s}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Status buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {['Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Completed'].map(s => {
                          const isActive = app.status === s;
                          const colors = {
                            Selected: 'bg-emerald-600/80 hover:bg-emerald-500 text-white',
                            Rejected: 'bg-red-600/80 hover:bg-red-500 text-white',
                            Completed: 'bg-violet-600/80 hover:bg-violet-500 text-white',
                            Shortlisted: 'bg-amber-600/80 hover:bg-amber-500 text-white',
                            Interview: 'bg-blue-600/80 hover:bg-blue-500 text-white',
                          };
                          return (
                            <button key={s} onClick={() => updateStatus(app._id, s)}
                              disabled={isActive || isUpdating}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                                isActive ? 'text-gray-600 cursor-not-allowed' :
                                colors[s] || 'hover:bg-white/10 text-gray-300'
                              }`}
                              style={isActive ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' } : undefined}>
                              {isUpdating && isActive ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                              {s}
                            </button>
                          );
                        })}

                        {app.studentId?.resume && (
                          <a href={`${BASE_URL}${app.studentId.resume}`} target="_blank" rel="noreferrer"
                            className="ml-auto flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            <FileText size={12} /> Resume <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable: cover letter */}
                {isExpanded && app.coverLetter && (
                  <div className="px-5 pb-4 animate-fade-in border-t border-white/5 pt-4">
                    <p className="text-xs text-gray-500 mb-1.5 font-semibold">Cover Letter</p>
                    <p className="text-xs text-gray-300 italic leading-relaxed">"{app.coverLetter}"</p>
                  </div>
                )}

                {app.coverLetter && (
                  <button onClick={() => setExpandedId(isExpanded ? null : app._id)}
                    className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors border-t border-white/5 flex items-center justify-center gap-1">
                    {isExpanded ? 'Hide' : 'Read cover letter'}
                    <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Applicants;
