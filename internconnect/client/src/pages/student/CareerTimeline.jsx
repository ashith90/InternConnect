import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  User, Zap, FileText, Award, ClipboardList, Star,
  CheckCircle2, Calendar, Loader2, GitCommit,
} from 'lucide-react';

const EVENT_TYPES = {
  joined: { icon: User, color: '#7c3aed', bg: 'rgba(124,58,237,0.2)', label: 'Joined InternConnect' },
  skill: { icon: Zap, color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', label: 'Skills Added' },
  applied: { icon: FileText, color: '#3b82f6', bg: 'rgba(59,130,246,0.2)', label: 'Applied' },
  selected: { icon: Star, color: '#10b981', bg: 'rgba(16,185,129,0.2)', label: 'Selected 🎉' },
  assignment: { icon: ClipboardList, color: '#8b5cf6', bg: 'rgba(139,92,246,0.2)', label: 'Assignment Submitted' },
  completed: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.2)', label: 'Internship Completed' },
  certificate: { icon: Award, color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', label: 'Certificate Earned 🏆' },
};

const TimelineEvent = ({ event, isLast }) => {
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.applied;
  const Icon = cfg.icon;

  return (
    <div className="flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: cfg.bg, border: `2px solid ${cfg.color}40`, boxShadow: `0 0 12px ${cfg.color}30` }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        {!isLast && <div className="flex-1 w-0.5 my-2" style={{ background: 'rgba(255,255,255,0.06)', minHeight: 32 }} />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="glass-card p-4 hover:border-white/15 transition-all">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <span className="text-sm font-semibold text-white">{event.title}</span>
              {event.subtitle && <p className="text-xs text-gray-400 mt-0.5">{event.subtitle}</p>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
              <Calendar size={11} />
              {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          {event.note && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed border-t border-white/5 pt-2">
              {event.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CareerTimeline = () => {
  const { user } = useSelector(s => s.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, appsRes] = await Promise.all([
          api.get('/students/progress'),
          api.get('/applications/my'),
        ]);

        const stats = progressRes.data.stats;
        const apps = appsRes.data.applications || [];

        const timeline = [];

        // Account created
        if (user?.createdAt) {
          timeline.push({
            type: 'joined',
            title: 'Joined InternConnect',
            subtitle: `Registered as a student`,
            date: user.createdAt,
            note: `Started the career journey on InternConnect.`,
          });
        }

        // Skills added
        if ((user?.skills?.length || 0) > 0) {
          timeline.push({
            type: 'skill',
            title: `Added ${user.skills.length} Skills`,
            subtitle: user.skills.slice(0, 5).join(', ') + (user.skills.length > 5 ? ' +more' : ''),
            date: user.updatedAt || user.createdAt,
          });
        }

        // Applications
        apps.forEach(app => {
          timeline.push({
            type: 'applied',
            title: `Applied: ${app.internshipId?.title || 'Internship'}`,
            subtitle: app.internshipId?.companyId?.companyName || '',
            date: app.appliedAt || app.createdAt,
          });

          if (app.status === 'Selected' || app.status === 'Interview' || app.status === 'Shortlisted') {
            timeline.push({
              type: 'selected',
              title: `${app.status}: ${app.internshipId?.title || 'Internship'}`,
              subtitle: app.internshipId?.companyId?.companyName || '',
              date: app.updatedAt || app.createdAt,
              note: app.companyFeedback || undefined,
            });
          }

          if (app.status === 'Completed') {
            timeline.push({
              type: 'completed',
              title: `Completed: ${app.internshipId?.title || 'Internship'}`,
              subtitle: app.internshipId?.companyId?.companyName || '',
              date: app.updatedAt || app.createdAt,
              note: app.companyFeedback || 'Successfully completed the internship program.',
            });
          }

          // Timeline events from backend
          (app.timelineEvents || []).forEach(ev => {
            if (!['Applied', 'Completed'].includes(ev.stage)) {
              timeline.push({
                type: ev.stage === 'Selected' ? 'selected' : 'applied',
                title: `${ev.stage}: ${app.internshipId?.title || 'Internship'}`,
                subtitle: ev.note || '',
                date: ev.timestamp,
              });
            }
          });
        });

        // Certificates
        if (stats.certificates > 0) {
          timeline.push({
            type: 'certificate',
            title: `Earned ${stats.certificates} Certificate${stats.certificates > 1 ? 's' : ''}`,
            subtitle: 'Verified completion certificate',
            date: new Date().toISOString(),
          });
        }

        // Sort by date descending (newest first)
        timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

        setEvents(timeline);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Group by year
  const grouped = events.reduce((acc, ev) => {
    const year = new Date(ev.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(ev);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <DashboardLayout title="My Career Journey" subtitle="A visual timeline of your growth and milestones">
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="text-primary-600 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <GitCommit size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Your journey starts here</h3>
          <p className="text-gray-500 text-sm">
            Apply to internships, submit assignments, and earn certificates to populate your career timeline.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Milestones', value: events.length, color: 'text-primary-400' },
              { label: 'Applications', value: events.filter(e => e.type === 'applied').length, color: 'text-blue-400' },
              { label: 'Certificates', value: events.filter(e => e.type === 'certificate').length, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          {years.map(year => (
            <div key={year} className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-sm font-bold text-gray-400 px-3">{year}</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>
              {grouped[year].map((ev, i) => (
                <TimelineEvent
                  key={`${ev.type}-${i}`}
                  event={ev}
                  isLast={i === grouped[year].length - 1 && year === years[years.length - 1]}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CareerTimeline;
