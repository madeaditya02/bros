import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { getReports } from '../reportsState';
import type { Report } from '../reportsState';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeaderProfile from '../components/AdminHeaderProfile';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Authenticate
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/login');
      return;
    }
    // Load reports
    setReports(getReports());
  }, [navigate]);

  const totalCount = reports.length;
  const pendingCount = reports.filter(r => r.status === 'Reported' || r.status === 'In Progress').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  // Filter recent activities (last 5 reports)
  const recentActivities = reports.slice(0, 5);

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-grow pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant px-margin-desktop flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-on-surface">Administrative Overview</h1>
          </div>
          <AdminHeaderProfile />
        </header>

        {/* Dashboard Content */}
        <div className="p-margin-desktop space-y-10 max-w-max-width mx-auto w-full flex-grow">
          {/* Summary Bento Grid */}
          <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
              <span className="text-sm font-semibold text-secondary block mb-1">Total Reports</span>
              <span className="text-4xl font-extrabold text-on-surface">{totalCount}</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
              <span className="text-sm font-semibold text-secondary block mb-1">Pending Fixes</span>
              <span className="text-4xl font-extrabold text-primary">{pendingCount}</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
              <span className="text-sm font-semibold text-secondary block mb-1">Resolved Cases</span>
              <span className="text-4xl font-extrabold text-green-600">{resolvedCount}</span>
            </div>
          </section>

          {/* Table & Feed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Weekly trends chart */}
            <section className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-on-surface mb-6">Weekly Trends</h2>
              </div>
              <div className="h-64 flex items-end gap-4 px-2">
                <div className="flex-1 bg-primary-container/20 rounded-t h-[40%] hover:bg-primary/20 transition-all cursor-pointer" title="Monday: 12 reports"></div>
                <div className="flex-1 bg-primary-container/20 rounded-t h-[60%] hover:bg-primary/20 transition-all cursor-pointer" title="Tuesday: 18 reports"></div>
                <div className="flex-1 bg-primary-container/20 rounded-t h-[45%] hover:bg-primary/20 transition-all cursor-pointer" title="Wednesday: 14 reports"></div>
                <div className="flex-1 bg-primary-container/20 rounded-t h-[80%] hover:bg-primary/20 transition-all cursor-pointer" title="Thursday: 24 reports"></div>
                <div className="flex-1 bg-primary-container/20 rounded-t h-[55%] hover:bg-primary/20 transition-all cursor-pointer" title="Friday: 17 reports"></div>
                <div className="flex-1 bg-primary-container/20 rounded-t h-[70%] hover:bg-primary/20 transition-all cursor-pointer" title="Saturday: 21 reports"></div>
                <div className="flex-1 bg-primary rounded-t h-[90%] hover:opacity-95 transition-all cursor-pointer" title="Sunday: 27 reports (Highest)"></div>
              </div>
              <div className="flex justify-between mt-4 text-xs font-semibold text-secondary">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </section>

            {/* Recent Activity panel */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-on-surface mb-4">Recent Activity</h2>
              <div className="space-y-4 flex-grow overflow-y-auto max-h-[280px] pr-1">
                {recentActivities.length > 0 ? (
                  recentActivities.map((report, index) => (
                    <div
                      key={report.id}
                      className={`pb-4 border-outline-variant flex items-center justify-between ${
                        index !== recentActivities.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div>
                        <Link
                          to={`/admin/reports/${report.id.replace('#', '')}`}
                          className="text-sm font-bold text-on-surface hover:text-primary transition-colors"
                        >
                          {report.id}
                        </Link>
                        <div className="text-xs text-secondary mt-0.5">
                          {report.type} • {report.location.split(',')[0]}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          report.status === 'Reported'
                            ? 'bg-surface-dim text-on-surface border-outline'
                            : report.status === 'In Progress'
                            ? 'bg-primary-container/25 text-primary border-primary/20'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-secondary italic">No recent reports found.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto bg-surface-container-highest border-t border-outline-variant">
          <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-max-width mx-auto py-8 gap-4 text-sm text-on-surface-variant">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-primary">BROS</span>
              <p>© 2026 BROS. Engineering Precision for Public Safety.</p>
            </div>
            <div className="flex gap-6">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
              <a className="hover:text-primary transition-colors" href="#">Accessibility</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
