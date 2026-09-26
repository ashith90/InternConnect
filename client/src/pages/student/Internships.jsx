import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Search, MapPin, Clock, IndianRupee, Calendar, Send, X, Loader2,
  CheckCircle2, AlertCircle, TrendingUp, Target, ArrowRight, BookOpen,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Compute fit score client-side
const computeFit = (studentSkills, requiredSkills) => {
  if (!requiredSkills?.length) return { score: 100, matched: [], missing: [] };
  const norm = s => s.toLowerCase().replace(/[.\s-]/g, '');
  const matched = requiredSkills.filter(req =>
    studentSkills.some(sk => norm(sk).includes(norm(req)) || norm(req).includes(norm(sk)))
  );
  const missing = requiredSkills.filter(req =>
    !studentSkills.some(sk => norm(sk).includes(norm(req)) || norm(req).includes(norm(sk)))
  );
  return { score: Math.round((matched.length / requiredSkills.length) * 100), matched, missing };
};

// Fit score badge color
const fitColor = (score) => {
  if (score >= 80) return { bar: 'from-emerald-500 to-green-400', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.3)' };
  if (score >= 60) return { bar: 'from-amber-500 to-yellow-400', text: 'text-amber-400', glow: 'rgba(245,158,11,0.3)' };
  return { bar: 'from-primary-600 to-violet-500', text: 'text-primary-400', glow: 'rgba(124,58,237,0.3)' };
};

// Roadmap modal
const RoadmapModal = ({ internship, fit, onClose }) => {
  const roadmap = fit.missing.map((skill, i) => ({
    skill,
    tasks: [
      `Study ${skill} fundamentals (3–5 days)`,
      `Build a mini project using ${skill}`,
      `Take a ${skill} practice quiz`,
    ],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-xl p-6 border border-white/10 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Skill Roadmap</h3>
            <p className="text-xs text-gray-400 mt-0.5">for {internship.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-4 rounded-xl mb-5"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Current Readiness</span>
            <span className="text-primary-400 font-bold">{fit.score}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <div className={`h-full rounded-full bg-gradient-to-r ${fitColor(fit.score).bar}`}
              style={{ width: `${fit.score}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>After completion</span>
            <span className="text-emerald-400 font-bold">~{Math.min(100, fit.score + fit.missing.length * 8)}%</span>
          </div>
        </div>

        {roadmap.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold">You already meet all requirements!</p>
            <p className="text-gray-400 text-sm mt-1">Go ahead and apply now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Complete these tasks to reach ~{Math.min(100, fit.score + fit.missing.length * 8)}% readiness:</p>
            {roadmap.map(({ skill, tasks }, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={14} className="text-amber-400" />
                  <span className="text-sm font-semibold text-white">{skill}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-amber-400"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    Missing
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {tasks.map((t, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="text-primary-400 mt-0.5 flex-shrink-0">{j + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

const Internships = () => {
  const { user } = useSelector(s => s.auth);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ domain: '', duration: '' });
  const [applyModal, setApplyModal] = useState(null);
  const [roadmapModal, setRoadmapModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [sortBy, setSortBy] = useState('fit'); // 'fit' | 'date' | 'stipend'

  const studentSkills = user?.skills || [];

  const fetchInternships = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filters.domain) params.set('domain', filters.domain);
    if (filters.duration) params.set('duration', filters.duration);
    api.get(`/internships?${params}`)
      .then(r => { setInternships(r.data.internships); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchInternships(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchInternships(); };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/internships/${applyModal._id}/apply`, { coverLetter });
      toast.success('Applied successfully!');
      setApplyModal(null);
      setCoverLetter('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
    setApplying(false);
  };

  // Enrich internships with fit score and sort
  const enriched = internships.map(intern => ({
    ...intern,
    fit: computeFit(studentSkills, intern.skillsRequired || []),
  }));

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === 'fit') return b.fit.score - a.fit.score;
    if (sortBy === 'stipend') return (b.stipend || 0) - (a.stipend || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <DashboardLayout title="Find Internships" subtitle="Browse opportunities with your personalized fit score">
      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="glass-card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input-field pl-10 py-2.5 text-sm" placeholder="Search by title, skill, or keyword..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto min-w-[140px] py-2.5 text-sm" value={filters.domain}
            onChange={e => setFilters({ ...filters, domain: e.target.value })}>
            <option value="">All Domains</option>
            {['Web Development', 'Artificial Intelligence', 'Data Science', 'Design', 'Mobile Development', 'DevOps'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[130px] py-2.5 text-sm" value={filters.duration}
            onChange={e => setFilters({ ...filters, duration: e.target.value })}>
            <option value="">Any Duration</option>
            {['1 Month', '2 Months', '3 Months', '4 Months', '6 Months'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select className="input-field w-auto min-w-[130px] py-2.5 text-sm" value={sortBy}
            onChange={e => setSortBy(e.target.value)}>
            <option value="fit">Sort: Best Fit</option>
            <option value="stipend">Sort: Stipend</option>
            <option value="date">Sort: Newest</option>
          </select>
          <button type="submit" className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm">
            <Search size={14} /> Search
          </button>
        </div>
      </form>

      {/* Skills nudge */}
      {studentSkills.length === 0 && (
        <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            Add your skills in <a href="/student/profile" className="underline font-semibold">your profile</a> to see personalized fit scores for each internship.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Search size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No internships found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {sorted.map(intern => {
            const { fit } = intern;
            const colors = fitColor(fit.score);
            const isExpanded = expandedCard === intern._id;

            return (
              <div key={intern._id} className="glass-card p-6 transition-all duration-300 hover:-translate-y-0.5"
                style={{ borderColor: isExpanded ? 'rgba(124,58,237,0.3)' : undefined }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))' }}>
                      {intern.companyId?.companyName?.[0] || 'C'}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white leading-tight">{intern.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{intern.companyId?.companyName}</p>
                    </div>
                  </div>
                </div>

                {/* Fit Score Banner */}
                <div className="p-3 rounded-xl mb-4"
                  style={{ background: `rgba(0,0,0,0.2)`, border: `1px solid rgba(255,255,255,0.06)` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Target size={13} className={colors.text} />
                      <span className="text-xs font-semibold text-gray-300">Your Fit Score</span>
                    </div>
                    <span className={`text-lg font-black ${colors.text}`}>{fit.score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden mb-3">
                    <div className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700`}
                      style={{ width: `${fit.score}%`, boxShadow: `0 0 6px ${colors.glow}` }} />
                  </div>

                  {/* Matched + Missing skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {fit.matched.slice(0, 3).map(s => (
                      <span key={s} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <CheckCircle2 size={10} /> {s}
                      </span>
                    ))}
                    {fit.missing.slice(0, 3).map(s => (
                      <span key={s} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.08)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <AlertCircle size={10} /> {s}
                      </span>
                    ))}
                    {(fit.matched.length + fit.missing.length > 6) && (
                      <span className="text-xs text-gray-600">+{intern.skillsRequired.length - 6} more</span>
                    )}
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} />{intern.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{intern.duration}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={11} />{intern.stipend ? `₹${intern.stipend.toLocaleString()}/mo` : 'Unpaid'}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />Deadline: {new Date(intern.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>

                {/* Expandable description */}
                {isExpanded && (
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed animate-fade-in">
                    {intern.description}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button onClick={() => setApplyModal(intern)}
                    className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2">
                    <Send size={13} /> Apply Now
                  </button>
                  {fit.missing.length > 0 && (
                    <button onClick={() => setRoadmapModal({ intern, fit })}
                      className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                      title="Improve My Match">
                      <TrendingUp size={13} className="text-amber-400" />
                      Improve
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : intern._id)}
                    className="p-2 rounded-xl transition-all text-gray-500 hover:text-white hover:bg-white/5"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-6 border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Apply for {applyModal.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">at {applyModal.companyId?.companyName}</p>
              </div>
              <button onClick={() => setApplyModal(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Fit score recap */}
            <div className="p-3 rounded-xl mb-4 flex items-center gap-3"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-xs text-gray-300">
                Your fit score for this role: <span className={`font-bold ${fitColor(applyModal.fit.score).text}`}>{applyModal.fit.score}%</span>
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">Your resume from your profile will be attached automatically.</p>
            <label className="text-sm text-gray-300 block mb-1.5">Cover Letter (Optional)</label>
            <textarea className="input-field h-32 resize-none mb-4" value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Why are you interested in this internship? What makes you a great fit?" />
            <div className="flex gap-3">
              <button onClick={() => setApplyModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {applying ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Modal */}
      {roadmapModal && (
        <RoadmapModal
          internship={roadmapModal.intern}
          fit={roadmapModal.fit}
          onClose={() => setRoadmapModal(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Internships;
