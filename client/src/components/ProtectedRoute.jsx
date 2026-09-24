import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const home = user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
