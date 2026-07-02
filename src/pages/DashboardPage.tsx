import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { getReports } from '../reportsState';
import type { Report } from '../reportsState';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeaderProfile from '../components/AdminHeaderProfile';
import { CgSpinner } from 'react-icons/cg';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  LinearScale,
  Tooltip,
  type TooltipItem
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authenticate
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const totalCount = reports.length;
  // Pending Fixes: pending, verified, in_progress
  const pendingCount = reports.filter(r => r.status === 'pending' || r.status === 'verified' || r.status === 'in_progress').length;
  // Resolved Cases: repaired
  const resolvedCount = reports.filter(r => r.status === 'repaired').length;

  // Filter recent activities (last 5 reports)
  const recentActivities = reports.slice(0, 5);

  const weeklyTrendCounts = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return weekDays.map((_, index) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + index);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      return reports.filter((report) => {
        const createdAt = new Date(report.created_at);
        return createdAt >= dayStart && createdAt < dayEnd && createdAt < endOfWeek;
      }).length;
    });
  }, [reports]);

  const weeklyTrendChartData = {
    labels: weekDays,
    datasets: [
      {
        data: weeklyTrendCounts,
        backgroundColor: weeklyTrendCounts.map((count) => (count === Math.max(...weeklyTrendCounts) && count > 0 ? '#1D4ED8' : 'rgba(29, 78, 216, 0.22)')),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 36
      }
    ]
  };

  const weeklyTrendChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y} laporan`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748B',
          font: {
            weight: 700
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: '#64748B'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.22)'
        }
      }
    }
  };

  const getAiClassNames = (report: Report) => {
    if (report.ai_raw_response && Array.isArray(report.ai_raw_response) && report.ai_raw_response.length > 0) {
      const classes = report.ai_raw_response.map((det) => det.class);
      return Array.from(new Set(classes)).join(', ');
    }
    return 'Road Damage';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-surface-dim text-on-surface border-outline';
      case 'verified':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'repaired':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-surface-dim text-on-surface border-outline';
    }
  };

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-grow pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant px-margin-desktop flex items-center justify-between sticky top-0 z-60">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-on-surface">Administrative Overview</h1>
          </div>
          <AdminHeaderProfile />
        </header>

        {/* Dashboard Content */}
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <CgSpinner className="animate-spin text-primary text-5xl" />
          </div>
        ) : (
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
                  <h2 className="text-lg font-bold text-on-surface mb-6">This Week's Trends</h2>
                </div>
                <div className="h-64 px-2">
                  <Bar data={weeklyTrendChartData} options={weeklyTrendChartOptions} />
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
                            to={`/admin/reports/${report.id}`}
                            className="text-sm font-bold text-on-surface hover:text-primary transition-colors font-mono"
                          >
                            {report.id}
                          </Link>
                          <div className="text-xs text-secondary mt-0.5 capitalize">
                            {getAiClassNames(report)} • {report.location_name.split(',')[0]}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadgeClass(report.status)}`}
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
        )}

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
