import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAdminDashboard } from '../../services/examService';
import { getErrorMessage } from '../../utils/format';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/exams/create', label: 'Create Exam' }
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" links={links}>
      {loading && <p>Loading dashboard...</p>}
      {error && <p className="field-error">{error}</p>}
      {stats && (
        <div className="stat-grid">
          <article className="stat-card">
            <span>Total Exams</span>
            <strong>{stats.total}</strong>
          </article>
          <article className="stat-card">
            <span>Scheduled Exams</span>
            <strong>{stats.scheduled}</strong>
          </article>
          <article className="stat-card">
            <span>Cancelled Exams</span>
            <strong>{stats.cancelled}</strong>
          </article>
          <article className="stat-card">
            <span>Upcoming Exams</span>
            <strong>{stats.upcoming}</strong>
          </article>
        </div>
      )}
    </DashboardLayout>
  );
}
