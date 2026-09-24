import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/format';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      navigate(loggedIn.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">College Exam Desk</p>
        <h1>Sign in to the timetable</h1>
        <p className="muted">Admins manage exams. Students view their section timetable only.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="demo-box">
          <strong>Demo credentials</strong>
          <p>Admin: admin@example.com / Admin@123</p>
          <p>Student A: student.a@example.com / Student@123</p>
          <p>Student B: student.b@example.com / Student@123</p>
        </div>
      </div>
    </div>
  );
}
