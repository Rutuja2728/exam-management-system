import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminExamsPage from './pages/admin/AdminExamsPage.jsx';
import CreateExamPage from './pages/admin/CreateExamPage.jsx';
import EditExamPage from './pages/admin/EditExamPage.jsx';
import StudentDashboardPage from './pages/student/StudentDashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/exams" element={<AdminExamsPage />} />
        <Route path="/admin/exams/create" element={<CreateExamPage />} />
        <Route path="/admin/exams/:id/edit" element={<EditExamPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
