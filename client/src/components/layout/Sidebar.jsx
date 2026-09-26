import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, User, Search, FileText, ClipboardList,
  MessageSquare, Award, Building2, Users,
  ChevronRight, LogOut, ShieldCheck, Target, CalendarDays,
  Sun, Moon,
} from 'lucide-react';

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/profile', icon: User, label: 'My Profile' },
  { to: '/student/internships', icon: Search, label: 'Find Internships' },
  { to: '/student/skill-gap', icon: Target, label: 'Skill Gap' },
  { to: '/student/applications', icon: FileText, label: 'Applications' },
  { to: '/student/assignments', icon: ClipboardList, label: 'Assignments', badgeKey: 'assignments' },
  { to: '/student/timeline', icon: CalendarDays, label: 'My Journey' },
  { to: '/student/discussions', icon: MessageSquare, label: 'Discussions' },
  { to: '/student/certificates', icon: Award, label: 'Certificates' },
];

const companyNav = [
  { to: '/company/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/company/internships', icon: Building2, label: 'My Listings' },
  { to: '/company/applicants', icon: Users, label: 'Applicants' },
  { to: '/company/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/company/certificates', icon: Award, label: 'Certificates' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/verifications', icon: ShieldCheck, label: 'Verifications', badge: true },
  { to: '/admin/internships', icon: Building2, label: 'Internships' },
  { to: '/admin/discussions', icon: MessageSquare, label: 'Forum' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
];

const Sidebar = () => {
  const { user } = useSelector(s => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);
  const [assignmentBadge, setAssignmentBadge] = useState(0);

  const isLight = theme === 'light';

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/admin/verifications?status=pending')
        .then(r => setPendingCount(r.data.pendingCount || 0))
        .catch(() => {});
    }
    if (user?.role === 'student') {
      api.get('/assignments/student')
        .then(r => {
          const pending = (r.data.assignments || []).filter(
            a => !a.submission && new Date(a.deadline) >= new Date()
          ).length;
          setAssignmentBadge(pending);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const navItems = user?.role === 'student' ? studentNav
    : user?.role === 'company' ? companyNav : adminNav;

  const roleLabel = { student: 'Student', company: 'Company', admin: 'Administrator' };
  const roleColor = { student: 'text-primary-400', company: 'text-blue-400', admin: 'text-amber-400' };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const sidebarBg = isLight ? '#ffffff' : '#111118';
  const sidebarBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  const dividerColor = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)';
  const userCardBg = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
  const userCardBorder = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)';
  const userNameColor = isLight ? '#111111' : 'white';
  const userEmailColor = isLight ? '#6b7280' : '#6b7280';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col transition-colors duration-200"
      style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>

      {/* Logo */}
      <div className="p-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">IC</span>
          </div>
          <div>
            <div className="font-bold text-sm leading-none" style={{ color: userNameColor }}>InternConnect</div>
            <div className={`text-xs mt-0.5 ${roleColor[user?.role]}`}>{roleLabel[user?.role]}</div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="p-4 mx-3 my-3 rounded-xl" style={{ background: userCardBg, border: `1px solid ${userCardBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: userNameColor }}>{user?.name}</div>
            <div className="text-xs truncate" style={{ color: userEmailColor }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge, badgeKey }) => {
          const active = location.pathname === to;
          const adminBadgeCount = badge && pendingCount > 0 ? pendingCount : 0;
          const studentBadgeCount = badgeKey === 'assignments' ? assignmentBadge : 0;
          const badgeCount = adminBadgeCount || studentBadgeCount;
          return (
            <Link key={to} to={to}
              className={active ? 'sidebar-item-active' : 'sidebar-item'}>
              <Icon size={18} className={active ? 'text-primary-400' : ''} />
              <span className="text-sm flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className={`ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-white text-[10px] flex items-center justify-center font-bold animate-pulse ${
                  badgeKey === 'assignments' ? 'bg-primary-600' : 'bg-amber-500'
                }`}>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
              {active && !badgeCount && <ChevronRight size={14} className="ml-auto text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme toggle + Logout */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: `1px solid ${dividerColor}` }}>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm"
          style={{
            background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
            color: isLight ? '#374151' : '#9ca3af',
          }}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
          {/* Toggle pill */}
          <div className="ml-auto relative w-9 h-5 rounded-full transition-colors duration-200"
            style={{ background: isLight ? '#7c3aed' : '#374151' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: isLight ? '1.125rem' : '0.125rem' }} />
          </div>
        </button>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
