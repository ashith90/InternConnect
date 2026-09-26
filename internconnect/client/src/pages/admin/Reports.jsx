import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { FileText, Download, Users, Briefcase, Award, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data.stats); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', precision: 0 } }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 16 } } }
  };

  const barData = {
    labels: stats?.monthlyApps?.map(m => {
      const d = new Date(2024, m._id.month - 1);
      return d.toLocaleString('en-US', { month: 'short' }) + ' ' + (m._id.year || '');
    }) || [],
    datasets: [{
      label: 'Applications',
      data: stats?.monthlyApps?.map(m => m.count) || [],
      backgroundColor: 'rgba(124, 58, 237, 0.6)',
      borderColor: '#7c3aed',
      borderRadius: 8,
      borderWidth: 1,
    }]
  };

  const statusDonut = {
    labels: ['Applied', 'Selected', 'Completed', 'Other'],
    datasets: [{
      data: [
        (stats?.totalApplications || 0) - (stats?.selectedApplications || 0) - (stats?.completedApplications || 0),
        stats?.selectedApplications || 0,
        stats?.completedApplications || 0,
        0
      ],
      backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#3f3f46'],
      borderWidth: 0
    }]
  };

  const summaryCards = [
    { label: 'Total Users', value: (stats?.totalStudents || 0) + (stats?.totalCompanies || 0), icon: Users, color: 'primary' },
    { label: 'Internships Posted', value: stats?.totalInternships || 0, icon: Briefcase, color: 'blue' },
    { label: 'Certificates Issued', value: stats?.totalCertificates || 0, icon: Award, color: 'green' },
    { label: 'Applications', value: stats?.totalApplications || 0, icon: FileText, color: 'amber' },
  ];

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Platform-wide statistics and usage data">
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {summaryCards.map(({ label, value, icon: Icon, color }) => {
              const colorMap = {
                primary: 'bg-primary-600/20 text-primary-400',
                blue: 'bg-blue-600/20 text-blue-400',
                green: 'bg-emerald-600/20 text-emerald-400',
                amber: 'bg-amber-600/20 text-amber-400',
              };
              return (
                <div key={label} className="glass-card p-5">
                  <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm text-gray-400">{label}</div>
                </div>
              );
            })}
          </div>

          {}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Selection Rate', value: `${stats?.selectionRate || 0}%`, sub: 'Applications that got selected' },
              { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, sub: 'Selected that completed' },
              { label: 'Pending Approvals', value: stats?.pendingInternships || 0, sub: 'Internships awaiting approval' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="glass-card p-6 text-center">
                <div className="text-4xl font-black gradient-text mb-2">{value}</div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{sub}</div>
              </div>
            ))}
          </div>

          {}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Monthly Application Volume</h3>
              </div>
              <div className="h-64">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Application Breakdown</h3>
              <div className="h-64">
                <Doughnut data={statusDonut} options={donutOptions} />
              </div>
            </div>
          </div>

          {}
          <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-2">Discussion Forum</h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white">{stats?.totalDiscussions || 0}</div>
              <div className="text-gray-400">Total posts in the forum</div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminReports;
