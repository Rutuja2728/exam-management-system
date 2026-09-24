import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import ExamForm, { validateExamForm } from '../../components/ExamForm';
import Toast from '../../components/Toast';
import { useForm } from '../../hooks/useForm';
import { getAdminExam, updateExam } from '../../services/examService';
import { getErrorMessage } from '../../utils/format';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/exams/create', label: 'Create Exam' }
];

function toDateInput(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function EditExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { values, setValues, errors, setErrors, handleChange } = useForm({
    subject: '',
    academicYear: '',
    section: '',
    examDate: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    getAdminExam(id)
      .then((res) => {
        const exam = res.data.data;
        setValues({
          subject: exam.subject,
          academicYear: exam.academicYear,
          section: exam.section,
          examDate: toDateInput(exam.examDate),
          startTime: exam.startTime,
          endTime: exam.endTime
        });
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, setValues]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateExamForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await updateExam(id, values);
      setToast('Exam updated successfully');
      setTimeout(() => navigate('/admin/exams'), 600);
    } catch (err) {
      setErrors({ time: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Edit Exam" links={links}>
      <Toast message={toast} onClose={() => setToast('')} />
      {loading && <p>Loading exam...</p>}
      {loadError && <p className="field-error">{loadError}</p>}
      {!loading && !loadError && (
        <ExamForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={submitting ? 'Saving...' : 'Save changes'}
          disabled={submitting}
        />
      )}
    </DashboardLayout>
  );
}
