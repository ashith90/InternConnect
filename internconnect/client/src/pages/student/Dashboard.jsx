import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import api from '../../utils/api';
import {
  FileText, ClipboardList, Award, TrendingUp, Search, ArrowRight,
  Flame, Target, CheckCircle2, Circle, Zap, GitBranch, Star,
  ChevronRight, Activity, BookOpen,
} from 'lucide-react';

// Radial readiness ring
const ReadinessRing = ({ score }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#7c3aed';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}%</span>
        <span className="text-xs text-gray-400 mt-0.5">Readiness</span>
      </div>
    </div>
  );
};

// Score breakdown bar
const ScoreBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-semibold">{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${value}%` }} />
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    api.get('/students/progress')
      .then(r => { setStats(r.data.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const readiness = stats?.careerReadiness || 0;
  const readinessColor = readiness >= 80 ? 'text-emerald-400' : readiness >= 60 ? 'text-amber-400' : 'text-primary-400';

  return (
    <DashboardLayout>
      {/* ── Hero greeting + readiness ── */}
      <div className="mb-8 rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.08) 50%, rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="p-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Greeting */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👋</span>
                <p className="text-gray-400 text-sm">{greeting}</p>
              </div>
              <h1 className="text-3xl font-black text-white mb-1">{firstName}</h1>
              <p className="text-gray-400 text-sm mb-6">Here's your career journey at a glance.</p>

              {/* Streak */}
              <div className="flex items-center gap-2 mb-6">
                {(stats?.streak || 0) > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <Flame size={14} className="text-amber-400 animate-pulse" />
                    <span className="text-amber-300 text-xs font-semibold">{stats.streak} Day Streak</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Activity size={14} className="text-gray-500" />
                    <span className="text-gray-500 text-xs">Start your streak today</span>
                  </div>
                )}
              </div>

              {/* Today's Missions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={15} className="text-primary-400" />
                  <span className="text-sm font-semibold text-white">Today's Missions</span>
                </div>
                <div className="space-y-2">
                  {(stats?.missions || []).map((m, i) => (
                    <Link key={i} to={m.link}
                      className="flex items-center gap-3 p-2.5 rounded-xl group transition-all hover:bg-white/5"
                      style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      {m.done
                        ? <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                        : <Circle size={15} className="text-gray-600 flex-shrink-0 group-hover:text-primary-400 transition-colors" />}
                      <span className="text-xs text-gray-300 flex-1">{m.task}</span>
                      <ChevronRight size={12} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Readiness Ring */}
            <div className="flex flex-col items-center gap-4">
              <ReadinessRing score={readiness} />
              <p className="text-xs text-gray-500 text-center max-w-[120px] leading-relaxed">
                Career Readiness Score
              </p>

              {/* Score breakdown */}
              <div className="w-40 space-y-2">
                <ScoreBar label="Profile" value={stats?.profileCompletion || 0} color="bg-gradient-to-r from-amber-500 to-orange-400" />
                <ScoreBar label="Skills" value={stats?.skillScore || 0} color="bg-gradient-to-r from-primary-600 to-violet-500" />
                <ScoreBar label="Assignments" value={stats?.assignmentScore || 0} color="bg-gradient-to-r from-blue-500 to-cyan-400" />
                <ScoreBar label="Applications" value={stats?.applicationScore || 0} color="bg-gradient-to-r from-pink-500 to-rose-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FileText} label="Applications" value={stats?.totalApplications || 0} color="blue" sub={`${stats?.selectedApplications || 0} selected`} />
        <StatCard icon={ClipboardList} label="Assignments" value={`${stats?.submittedAssignments || 0}/${stats?.totalAssignments || 0}`} color="primary" sub={`${stats?.assignmentCompletion || 0}% done`} />
        <StatCard icon={Award} label="Certificates" value={stats?.certificates || 0} color="green" sub="Earned" />
        <StatCard icon={TrendingUp} label="Profile" value={`${stats?.profileCompletion || 0}%`} color="amber" sub="Completion" />
      </div>

      {/* ── Skills + Quick Actions ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Skills */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary-400" />
              <h3 className="text-base font-semibold text-white">Your Skills</h3>
            </div>
            <Link to="/student/profile" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Edit →
            </Link>
          </div>
          {stats?.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.2)' }}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Star size={24} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No skills added yet.</p>
              <Link to="/student/profile" className="text-xs text-primary-400 mt-1 inline-block hover:underline">
                Add skills to boost your readiness →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-primary-400" />
            <h3 className="text-base font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { to: '/student/internships', icon: Search, label: 'Find Internships', desc: 'Browse opportunities with fit scores', color: 'text-blue-400' },
              { to: '/student/applications', icon: FileText, label: 'My Applications', desc: 'Track pipeline & status', color: 'text-primary-400' },
              { to: '/student/assignments', icon: ClipboardList, label: 'Assignments', desc: 'Submit pending tasks', color: 'text-amber-400' },
              { to: '/student/certificates', icon: Award, label: 'Certificates', desc: 'View & download', color: 'text-emerald-400' },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Icon size={16} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Applications ── */}
      {stats?.recentApplications?.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-primary-400" />
              <h3 className="text-base font-semibold text-white">Recent Applications</h3>
            </div>
            <Link to="/student/applications" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentApplications.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-400"
                    style={{ background: 'rgba(124,58,237,0.15)' }}>
                    {app.internshipId?.title?.[0] || 'I'}
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{app.internshipId?.title || 'Internship'}</div>
                    <div className="text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
