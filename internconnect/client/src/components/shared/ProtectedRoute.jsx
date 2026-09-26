import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector(s => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const redirects = { student: '/student/dashboard', company: '/company/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={redirects[user.role] || '/login'} replace />;
  }
  return children;
};

export default ProtectedRoute;
