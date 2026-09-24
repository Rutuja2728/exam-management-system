import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import ExamForm, { validateExamForm } from '../../components/ExamForm';
import Toast from '../../components/Toast';
import { useForm } from '../../hooks/useForm';
import { createExam } from '../../services/examService';
import { getErrorMessage } from '../../utils/format';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/exams/create', label: 'Create Exam' }
];

export default function CreateExamPage() {
  const navigate = useNavigate();
  const { values, errors, setErrors, handleChange } = useForm({
    subject: '',
    academicYear: '',
    section: '',
    examDate: '',
    startTime: '',
    endTime: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateExamForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await createExam(values);
      setToast('Exam created successfully');
      setTimeout(() => navigate('/admin/exams'), 600);
    } catch (err) {
      setErrors({ time: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout title="Create Exam" links={links}>
      <Toast message={toast} onClose={() => setToast('')} />
      <ExamForm
        values={values}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Saving...' : 'Create exam'}
        disabled={submitting}
      />
    </DashboardLayout>
  );
}
