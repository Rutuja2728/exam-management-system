export const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
export const SECTIONS = ['A', 'B', 'C'];

export function isEndAfterStart(startTime, endTime) {
  if (!startTime || !endTime) return false;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em > sh * 60 + sm;
}

export function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatTime(value) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function examDisplayStatus(exam) {
  if (exam.status === 'CANCELLED') return 'Cancelled';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDay = new Date(exam.examDate);
  examDay.setHours(0, 0, 0, 0);
  return examDay >= today ? 'Upcoming' : 'Completed';
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.message || fallback;
}
