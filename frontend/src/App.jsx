import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ReportIncidentPage from './pages/ReportIncidentPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col font-sans">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Feature 1: Public Registration */}
              <Route path="/register" element={<RegisterPage />} />

              {/* Feature 2: Public Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Feature 4: Protected User Profile & Session */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Feature 5 & 6: Protected Incident Reporting & Map Location */}
              <Route
                path="/report-incident"
                element={
                  <ProtectedRoute>
                    <ReportIncidentPage />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect to /report-incident */}
              <Route path="*" element={<Navigate to="/report-incident" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
