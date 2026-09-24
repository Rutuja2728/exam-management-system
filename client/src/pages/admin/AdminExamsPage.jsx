import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';
import { cancelExam, deleteExam, getAdminExams } from '../../services/examService';
import { ACADEMIC_YEARS, SECTIONS, formatDate, formatTime, getErrorMessage } from '../../utils/format';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/exams/create', label: 'Create Exam' }
];

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [filters, setFilters] = useState({ academicYear: '', section: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [pending, setPending] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.section) params.section = filters.section;
      if (filters.status) params.status = filters.status;
      const res = await getAdminExams(params);
      setExams(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.academicYear, filters.section, filters.status]);

  async function confirmAction() {
    try {
      if (pending?.type === 'cancel') {
        await cancelExam(pending.exam._id);
        setToast('Exam cancelled');
      }
      if (pending?.type === 'delete') {
        await deleteExam(pending.exam._id);
        setToast('Exam deleted');
      }
      setPending(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
      setPending(null);
    }
  }

  return (
    <DashboardLayout title="Exams" links={links}>
      <Toast message={toast} onClose={() => setToast('')} />
      <div className="toolbar">
        <select
          value={filters.academicYear}
          onChange={(e) => setFilters((prev) => ({ ...prev, academicYear: e.target.value }))}
        >
          <option value="">All years</option>
          {ACADEMIC_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select value={filters.section} onChange={(e) => setFilters((prev) => ({ ...prev, section: e.target.value }))}>
          <option value="">All sections</option>
          {SECTIONS.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Link to="/admin/exams/create" className="btn btn-primary">
          Create Exam
        </Link>
      </div>
      {error && <p className="field-error">{error}</p>}
      {loading ? (
        <p>Loading exams...</p>
      ) : exams.length === 0 ? (
        <div className="empty">No exams match the selected filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Academic Year</th>
                <th>Section</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td>{exam.subject}</td>
                  <td>{exam.academicYear}</td>
                  <td>{exam.section}</td>
                  <td>{formatDate(exam.examDate)}</td>
                  <td>{formatTime(exam.startTime)}</td>
                  <td>{formatTime(exam.endTime)}</td>
                  <td>
                    <span className={`badge ${exam.status === 'CANCELLED' ? 'badge-warn' : 'badge-ok'}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="actions">
                    <Link to={`/admin/exams/${exam._id}/edit`}>Edit</Link>
                    {exam.status !== 'CANCELLED' && (
                      <button type="button" onClick={() => setPending({ type: 'cancel', exam })}>
                        Cancel
                      </button>
                    )}
                    <button type="button" className="danger-link" onClick={() => setPending({ type: 'delete', exam })}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.type === 'delete' ? 'Delete exam?' : 'Cancel exam?'}
        message={
          pending?.type === 'delete'
            ? 'This permanently removes the exam record.'
            : 'The exam will be marked as CANCELLED and kept in the timetable.'
        }
        confirmLabel={pending?.type === 'delete' ? 'Delete' : 'Cancel exam'}
        onCancel={() => setPending(null)}
        onConfirm={confirmAction}
      />
    </DashboardLayout>
  );
}
