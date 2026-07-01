import { BrowserRouter, Routes, Route } from 'react-router';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsManagementPage from './pages/ReportsManagementPage';
import ReportDetailPage from './pages/ReportDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/report" element={<ReportPage />} />
        
        {/* Admin Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Dashboard / Portal */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/reports" element={<ReportsManagementPage />} />
        <Route path="/admin/reports/:id" element={<ReportDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

