import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './features/auth/authSlice';


import ProtectedRoute from './components/shared/ProtectedRoute';


import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';


import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentInternships from './pages/student/Internships';
import StudentApplications from './pages/student/Applications';
import StudentAssignments from './pages/student/Assignments';
import StudentDiscussions from './pages/student/Discussions';
import StudentCertificates from './pages/student/Certificates';
import StudentSkillGap from './pages/student/SkillGap';
import StudentTimeline from './pages/student/CareerTimeline';


import CompanyDashboard from './pages/company/Dashboard';
import CompanyInternships from './pages/company/Internships';
import CompanyApplicants from './pages/company/Applicants';
import CompanyAssignments from './pages/company/Assignments';
import CompanyCertificates from './pages/company/Certificates';


import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminInternships from './pages/admin/Internships';
import AdminReports from './pages/admin/Reports';
import AdminVerifications from './pages/admin/Verifications';


import VerifyCertificate from './pages/VerifyCertificate';
import ResubmitDocuments from './pages/ResubmitDocuments';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1040', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
      <Routes>
        {}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {}
        <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/internships" element={<ProtectedRoute roles={['student']}><StudentInternships /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute roles={['student']}><StudentApplications /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignments /></ProtectedRoute>} />
        <Route path="/student/discussions" element={<ProtectedRoute roles={['student']}><StudentDiscussions /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute roles={['student']}><StudentCertificates /></ProtectedRoute>} />
        <Route path="/student/skill-gap" element={<ProtectedRoute roles={['student']}><StudentSkillGap /></ProtectedRoute>} />
        <Route path="/student/timeline" element={<ProtectedRoute roles={['student']}><StudentTimeline /></ProtectedRoute>} />

        {}
        <Route path="/company/dashboard" element={<ProtectedRoute roles={['company']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/company/internships" element={<ProtectedRoute roles={['company']}><CompanyInternships /></ProtectedRoute>} />
        <Route path="/company/applicants" element={<ProtectedRoute roles={['company']}><CompanyApplicants /></ProtectedRoute>} />
        <Route path="/company/assignments" element={<ProtectedRoute roles={['company']}><CompanyAssignments /></ProtectedRoute>} />
        <Route path="/company/certificates" element={<ProtectedRoute roles={['company']}><CompanyCertificates /></ProtectedRoute>} />

        {}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/internships" element={<ProtectedRoute roles={['admin']}><AdminInternships /></ProtectedRoute>} />
        <Route path="/admin/discussions" element={<ProtectedRoute roles={['admin', 'student', 'company']}><StudentDiscussions /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/verifications" element={<ProtectedRoute roles={['admin']}><AdminVerifications /></ProtectedRoute>} />

        {}
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
        <Route path="/resubmit-documents" element={<ResubmitDocuments />} />

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
