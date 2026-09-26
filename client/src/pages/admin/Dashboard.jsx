import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/shared/StatCard';
import api from '../../utils/api';
import { Users, Building2, Briefcase, FileText, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerifications, setPendingVerifications] = useState(0);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data.stats); setLoading(false); }).catch(() => setLoading(false));
    api.get('/admin/verifications?status=pending').then(r => setPendingVerifications(r.data.pendingCount || 0)).catch(() => {});
  }, []);

  if (loading) return <DashboardLayout title="Admin Dashboard"><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  const lineData = {
    labels: stats?.monthlyApps?.map(m => { const d = new Date(); d.setMonth(m._id.month - 1); return d.toLocaleString('en-US', { month: 'short' }); }) || [],
    datasets: [{
      label: 'Applications',
      data: stats?.monthlyApps?.map(m => m.count) || [],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const doughnutData = {
    labels: ['Selected', 'Completed', 'Other'],
    datasets: [{
      data: [
        stats?.selectedApplications || 0,
        stats?.completedApplications || 0,
        (stats?.totalApplications || 0) - (stats?.selectedApplications || 0) - (stats?.completedApplications || 0)
      ],
      backgroundColor: ['#10b981', '#8b5cf6', '#3f3f46'],
      borderWidth: 0
    }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } } };

  return (
    <DashboardLayout title="Platform Analytics" subtitle="Overview of InternConnect activity">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard icon={Users} label="Total Students" value={stats?.totalStudents} color="primary" sub={`${stats?.activeStudents} active`} />
        <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies} color="blue" />
        <StatCard icon={Briefcase} label="Internships" value={stats?.totalInternships} color="amber" sub={`${stats?.activeInternships} active`} />
        <StatCard icon={FileText} label="Applications" value={stats?.totalApplications} color="green" sub={`${stats?.selectionRate}% selection rate`} />
      </div>

      {/* Pending Verifications Alert */}
      {pendingVerifications > 0 && (
        <Link to="/admin/verifications"
          className="flex items-center justify-between gap-4 p-4 mb-6 rounded-xl border border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/12 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                {pendingVerifications} Registration{pendingVerifications > 1 ? 's' : ''} Awaiting Verification
              </p>
              <p className="text-xs text-amber-400/60">
                New user{pendingVerifications > 1 ? 's have' : ' has'} submitted documents for review. Click to review.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium group-hover:bg-amber-500/25 transition-colors flex-shrink-0">
            <ShieldCheck size={14} /> Review Now
          </div>
        </Link>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-6 h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4">Application Trends</h3>
          <div className="h-[300px]"><Line data={lineData} options={chartOptions} /></div>
        </div>
        <div className="glass-card p-6 h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4">Application Status</h3>
          <div className="h-[300px] pb-4"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-primary-400"/> Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 text-xs uppercase text-gray-500"><th className="pb-3 font-semibold">User</th><th className="pb-3 font-semibold">Role</th><th className="pb-3 font-semibold">Joined</th><th className="pb-3 font-semibold">Status</th></tr></thead>
            <tbody>
              {stats?.recentUsers?.map(u => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="text-sm font-medium text-white">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-3"><span className="badge bg-white/10 text-gray-300 capitalize">{u.role}</span></td>
                  <td className="py-3 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3"><span className={`badge ${u.isActive ? 'badge-selected' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
