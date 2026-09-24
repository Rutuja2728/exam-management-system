import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getStudentExams, getStudentProfile } from '../../services/examService';
import { examDisplayStatus, formatDate, formatTime, getErrorMessage } from '../../utils/format';

const links = [{ to: '/student/dashboard', label: 'My Timetable' }];

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudentProfile(), getStudentExams()])
      .then(([profileRes, examRes]) => {
        setProfile(profileRes.data.data);
        setExams(examRes.data.data);
        setMessage(examRes.data.message || '');
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Student Dashboard" links={links}>
      {loading && <p>Loading your timetable...</p>}
      {error && <p className="field-error">{error}</p>}
      {profile && (
        <section className="welcome-card">
          <h2>Welcome, {profile.name}</h2>
          <p>
            Academic Year: <strong>{profile.academicYear}</strong>
          </p>
          <p>
            Section: <strong>{profile.section}</strong>
          </p>
          <p className="muted">This timetable shows only exams for your academic year and section.</p>
        </section>
      )}
      <h3 className="section-title">My Exam Timetable</h3>
      {!loading && exams.length === 0 && (
        <div className="empty">{message || 'No exams scheduled for your section.'}</div>
      )}
      <div className="exam-grid">
        {exams.map((exam) => {
          const status = examDisplayStatus(exam);
          return (
            <article key={exam._id} className="exam-card">
              <span className={`badge ${status === 'Cancelled' ? 'badge-warn' : status === 'Completed' ? 'badge-muted' : 'badge-ok'}`}>
                {status}
              </span>
              <h3>{exam.subject}</h3>
              <p className="exam-date">{formatDate(exam.examDate)}</p>
              <p className="exam-time">
                {formatTime(exam.startTime)} — {formatTime(exam.endTime)}
              </p>
              <p className="exam-meta">
                {exam.academicYear} • Section {exam.section}
              </p>
            </article>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
