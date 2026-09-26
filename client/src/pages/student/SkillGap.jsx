import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  Target, CheckCircle2, AlertCircle, XCircle, TrendingUp,
  Zap, BookOpen, ArrowRight, Loader2, RefreshCw,
} from 'lucide-react';

const norm = s => s.toLowerCase().replace(/[.\s-]/g, '');

const computeGap = (studentSkills, requiredSkills) => {
  const matched = requiredSkills.filter(req => studentSkills.some(sk => norm(sk).includes(norm(req)) || norm(req).includes(norm(sk))));
  const missing = requiredSkills.filter(req => !studentSkills.some(sk => norm(sk).includes(norm(req)) || norm(req).includes(norm(sk))));
  const score = requiredSkills.length > 0 ? Math.round((matched.length / requiredSkills.length) * 100) : 100;
  return { matched, missing, score };
};

const levelColor = (score) => {
  if (score >= 80) return { ring: '#10b981', bar: 'from-emerald-500 to-green-400', label: 'Excellent', labelColor: 'text-emerald-400' };
  if (score >= 60) return { ring: '#f59e0b', bar: 'from-amber-500 to-yellow-400', label: 'Good', labelColor: 'text-amber-400' };
  if (score >= 40) return { ring: '#7c3aed', bar: 'from-primary-600 to-violet-500', label: 'Developing', labelColor: 'text-primary-400' };
  return { ring: '#ef4444', bar: 'from-red-500 to-pink-500', label: 'Needs Work', labelColor: 'text-red-400' };
};

// Large animated readiness ring
const BigRing = ({ score, color }) => {
  const r = 72;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color.ring} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 10px ${color.ring}70)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-white">{score}<span className="text-2xl">%</span></span>
        <span className={`text-sm font-semibold mt-1 ${color.labelColor}`}>{color.label}</span>
      </div>
    </div>
  );
};

// Skill row with status
const SkillRow = ({ skill, status }) => {
  const configs = {
    matched: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'Strong' },
    missing: { icon: AlertCircle, color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Missing' },
    extra: { icon: Zap, color: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', label: 'Bonus' },
  };
  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl transition-all"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-center gap-2.5">
        <Icon size={15} className={cfg.color} />
        <span className="text-sm text-white font-medium">{skill}</span>
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        {cfg.label}
      </span>
    </div>
  );
};

// Roadmap task card
const RoadmapCard = ({ skill, index }) => {
  const tasks = [
    { text: `Study ${skill} fundamentals (3–5 days)`, icon: '📚' },
    { text: `Build a hands-on project using ${skill}`, icon: '🛠' },
    { text: `Take an online ${skill} assessment`, icon: '✅' },
  ];
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{index + 1}</span>
        <span className="text-sm font-semibold text-white">Learn {skill}</span>
      </div>
      <div className="space-y-1.5">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
            <span>{t.icon}</span>{t.text}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between">
        <span className="text-xs text-gray-500">Estimated: ~1 week</span>
        <span className="text-xs text-primary-400 font-semibold">+{8}% readiness</span>
      </div>
    </div>
  );
};

const SkillGap = () => {
  const { user } = useSelector(s => s.auth);
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gap, setGap] = useState(null);

  const studentSkills = user?.skills || [];

  useEffect(() => {
    api.get('/internships').then(r => {
      setInternships(r.data.internships || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedInternship) {
      setGap(computeGap(studentSkills, selectedInternship.skillsRequired || []));
    } else {
      setGap(null);
    }
  }, [selectedInternship, studentSkills]);

  const extraSkills = selectedInternship
    ? studentSkills.filter(sk => !(selectedInternship.skillsRequired || []).some(req => norm(req).includes(norm(sk)) || norm(sk).includes(norm(req))))
    : [];

  const projectedScore = gap ? Math.min(100, gap.score + gap.missing.length * 8) : 0;
  const color = gap ? levelColor(gap.score) : levelColor(0);

  return (
    <DashboardLayout title="Skill Gap Analysis" subtitle="Find out how ready you are for any internship">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-primary-400" />
              <h3 className="text-sm font-semibold text-white">Select Internship</h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={22} className="text-primary-600 animate-spin" /></div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {internships.map(intern => {
                  const fit = computeGap(studentSkills, intern.skillsRequired || []);
                  const c = levelColor(fit.score);
                  const isSelected = selectedInternship?._id === intern._id;
                  return (
                    <button key={intern._id}
                      onClick={() => setSelectedInternship(intern)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${isSelected ? 'ring-1 ring-primary-500' : 'hover:bg-white/5'}`}
                      style={{ background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelected ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate flex-1">{intern.title}</span>
                        <span className={`text-xs font-bold ml-2 flex-shrink-0 ${c.labelColor}`}>{fit.score}%</span>
                      </div>
                      <span className="text-xs text-gray-500">{intern.companyId?.companyName}</span>
                      <div className="h-1 rounded-full bg-white/8 mt-2 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${c.bar}`} style={{ width: `${fit.score}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Skills Summary */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-primary-400" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Skills ({studentSkills.length})</h3>
            </div>
            {studentSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {studentSkills.map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                No skills in your profile yet.{' '}
                <a href="/student/profile" className="text-primary-400 underline">Add skills →</a>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Analysis */}
        <div className="lg:col-span-2">
          {!selectedInternship ? (
            <div className="glass-card p-16 text-center h-full flex flex-col items-center justify-center">
              <Target size={56} className="text-gray-700 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select an Internship</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Choose an internship from the list to see your personalized readiness score and skill gap analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* Readiness hero */}
              <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex flex-col items-center">
                    <BigRing score={gap.score} color={color} />
                    <p className="text-xs text-gray-500 mt-2 text-center">Current Readiness</p>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1">{selectedInternship.title}</h2>
                    <p className="text-sm text-gray-400 mb-4">{selectedInternship.companyId?.companyName} · {selectedInternship.duration}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">After completing roadmap</span>
                        <span className="text-emerald-400 font-bold">~{projectedScore}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/8 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700`}
                          style={{ width: `${gap.score}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>You match {gap.matched.length} of {(selectedInternship.skillsRequired || []).length} skills</span>
                        <span>{gap.missing.length} skill{gap.missing.length !== 1 ? 's' : ''} to learn</span>
                      </div>
                    </div>

                    {gap.score >= 80 && (
                      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-xs text-emerald-300">You are well qualified! Apply now.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skill breakdown table */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={15} className="text-primary-400" /> Skill Breakdown
                </h3>
                <div className="space-y-2">
                  {gap.matched.map(s => <SkillRow key={s} skill={s} status="matched" />)}
                  {gap.missing.map(s => <SkillRow key={s} skill={s} status="missing" />)}
                  {extraSkills.slice(0, 3).map(s => <SkillRow key={s} skill={s} status="extra" />)}
                </div>
              </div>

              {/* Roadmap */}
              {gap.missing.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={15} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Your Learning Roadmap
                    </h3>
                    <span className="ml-auto text-xs text-gray-500">
                      ~{gap.missing.length} week{gap.missing.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {gap.missing.map((skill, i) => (
                      <RoadmapCard key={skill} skill={skill} index={i} />
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-xl flex items-center justify-between"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <span className="text-xs text-gray-400">After completing all tasks:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {gap.score}% → {projectedScore}% readiness
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SkillGap;
