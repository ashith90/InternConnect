import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/shared/StatCard';
import api from '../../utils/api';
import {
  Building2, Users, ClipboardList, Award, TrendingUp,
  Target, Star, ArrowRight, ChevronRight, Activity,
} from 'lucide-react';

const computeFit = (studentSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 100;
  const norm = s => s.toLowerCase().replace(/[.\s-]/g, '');
  const matched = requiredSkills.filter(req =>
    studentSkills.some(sk => norm(sk).includes(norm(req)) || norm(req).includes(norm(sk)))
  );
  return Math.round((matched.length / requiredSkills.length) * 100);
};

const CompanyDashboard = () => {
  const [stats, setStats] = useState({});
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [intRes, appRes, asgRes] = await Promise.all([
          api.get('/internships/company/mine'),
          api.get('/applications/company'),
          api.get('/assignments/company'),
        ]);
        const internships = intRes.data.internships;
        const apps = appRes.data.applications;

        // Compute fit scores and rank candidates
        const enriched = apps.map(app => ({
          ...app,
          fitScore: computeFit(
            app.studentId?.skills || [],
            app.internshipId?.skillsRequired || [],
          ),
        })).sort((a, b) => b.fitScore - a.fitScore);

        setTopCandidates(enriched.slice(0, 5));

        setStats({
          totalInternships: internships.length,
          activeInternships: internships.filter(i => i.status === 'active').length,
          totalApplicants: apps.length,
          selectedApplicants: apps.filter(a => a.status === 'Selected').length,
          completedInterns: apps.filter(a => a.status === 'Completed').length,
          totalAssignments: asgRes.data.assignments.length,
          // Pipeline counts
          pipeline: {
            applied: apps.filter(a => a.status === 'Applied').length,
            reviewing: apps.filter(a => a.status === 'Under Review').length,
            shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
            interview: apps.filter(a => a.status === 'Interview').length,
            selected: apps.filter(a => a.status === 'Selected').length,
            rejected: apps.filter(a => a.status === 'Rejected').length,
          },
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const funnelSteps = [
    { label: 'Applied', value: stats.pipeline?.applied || 0, color: 'text-blue-400' },
    { label: 'Reviewing', value: stats.pipeline?.reviewing || 0, color: 'text-yellow-400' },
    { label: 'Shortlisted', value: stats.pipeline?.shortlisted || 0, color: 'text-amber-400' },
    { label: 'Interview', value: stats.pipeline?.interview || 0, color: 'text-cyan-400' },
    { label: 'Selected', value: stats.pipeline?.selected || 0, color: 'text-emerald-400' },
  ];

  return (
    <DashboardLayout title="Company Dashboard" subtitle="Manage your internship listings and discover top talent">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Building2} label="Listings" value={stats.totalInternships} color="primary" sub={`${stats.activeInternships} active`} />
        <StatCard icon={Users} label="Applicants" value={stats.totalApplicants} color="blue" sub={`${stats.selectedApplicants} selected`} />
        <StatCard icon={ClipboardList} label="Assignments" value={stats.totalAssignments} color="amber" />
        <StatCard icon={Award} label="Completed" value={stats.completedInterns} color="green" sub="Interns" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Application Pipeline Funnel */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-primary-400" />
            <h3 className="text-base font-semibold text-white">Application Pipeline</h3>
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const maxVal = funnelSteps[0]?.value || 1;
              const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">{step.label}</span>
                  <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className={`h-full rounded-lg flex items-center px-3 transition-all duration-700`}
                      style={{ width: `${Math.max(pct, 8)}%`, background: `linear-gradient(90deg, rgba(124,58,237,0.7), rgba(99,102,241,0.5))` }}>
                      <span className="text-xs font-bold text-white">{step.value}</span>
                    </div>
                  </div>
                  {i < funnelSteps.length - 1 && step.value > 0 && (
                    <span className="text-xs text-gray-600 w-12 text-right flex-shrink-0">
                      →{funnelSteps[i + 1].value}
                    </span>
                  )}
                </div>
              );
            })}
            {stats.pipeline?.rejected > 0 && (
              <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">Rejected</span>
                <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <div className="h-full rounded-lg flex items-center px-3"
                    style={{ width: `${Math.min(100, Math.round((stats.pipeline.rejected / (stats.totalApplicants || 1)) * 100))}%`, background: 'rgba(239,68,68,0.3)' }}>
                    <span className="text-xs font-bold text-red-300">{stats.pipeline.rejected}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link to="/company/applicants" className="mt-4 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
            Manage all applicants <ArrowRight size={11} />
          </Link>
        </div>

        {/* Top Candidates */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-400" />
              <h3 className="text-base font-semibold text-white">Top Candidates</h3>
            </div>
            <span className="text-xs text-gray-500">By match score</span>
          </div>
          {topCandidates.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No applicants yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topCandidates.map((app, i) => (
                <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: i < 3 ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'rgba(255,255,255,0.08)', color: i < 3 ? 'white' : '#6b7280' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{app.studentId?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{app.internshipId?.title}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Target size={11} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{app.fitScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/company/applicants" className="mt-4 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
            View all candidates <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: '/company/internships', icon: Building2, label: 'Post Internship', desc: 'Add a new listing', color: 'text-primary-400' },
            { to: '/company/applicants', icon: Users, label: 'Review Applicants', desc: `${stats.pipeline?.applied || 0} awaiting review`, color: 'text-blue-400' },
            { to: '/company/assignments', icon: ClipboardList, label: 'Manage Assignments', desc: 'Create & grade tasks', color: 'text-amber-400' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}
              className="flex items-center gap-4 p-4 rounded-xl transition-all group hover:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Icon size={18} className={color} />
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
    </DashboardLayout>
  );
};

export default CompanyDashboard;
