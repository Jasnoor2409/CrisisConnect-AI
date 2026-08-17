import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Feature 1: Registration */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Default redirect to register until login is implemented */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
