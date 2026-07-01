import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { getReports } from '../reportsState';
import type { Report } from '../reportsState';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeaderProfile from '../components/AdminHeaderProfile';

export default function ReportsManagementPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Reported' | 'In Progress' | 'Resolved'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Pothole' | 'Crack' | 'Manhole'>('All');

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/login');
      return;
    }
    setReports(getReports());
  }, [navigate]);

  // Handle Search and Filtering
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.reporterName && report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesType = typeFilter === 'All' || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Type,Location,Status,Date,Reporter"].join(",") + "\n"
      + filteredReports.map(r => `"${r.id}","${r.type}","${r.location}","${r.status}","${r.date}","${r.reporterName}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BROS_reports_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-grow pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant px-margin-desktop flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-on-surface">Reports Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-full px-10 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none w-64 text-on-surface"
                placeholder="Search reports..."
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary select-none">
                search
              </span>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-secondary relative select-none">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <AdminHeaderProfile />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-margin-desktop space-y-10 max-w-max-width mx-auto w-full flex-grow">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            {/* Filter and Control Bar */}
            <div className="p-6 border-b border-outline-variant space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative flex-1 w-full md:max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-10 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none text-on-surface"
                    placeholder="Search by ID, location, or reporter name..."
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary select-none">
                    search
                  </span>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">Status: All</option>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">Type: All</option>
                    <option value="Pothole">Pothole</option>
                    <option value="Crack">Crack</option>
                    <option value="Manhole">Manhole</option>
                  </select>

                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-opacity-95 transition-all shadow-sm"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Active Tags */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {statusFilter !== 'All' && (
                  <span className="px-3 py-1 bg-primary-container/10 text-primary rounded-full border border-primary/20 flex items-center gap-1">
                    Status: {statusFilter}{' '}
                    <span onClick={() => setStatusFilter('All')} className="material-symbols-outlined text-xs cursor-pointer select-none">
                      close
                    </span>
                  </span>
                )}
                {typeFilter !== 'All' && (
                  <span className="px-3 py-1 bg-surface-container-high text-secondary rounded-full border border-outline-variant flex items-center gap-1">
                    Type: {typeFilter}{' '}
                    <span onClick={() => setTypeFilter('All')} className="material-symbols-outlined text-xs cursor-pointer select-none">
                      close
                    </span>
                  </span>
                )}
                {searchQuery !== '' && (
                  <span className="px-3 py-1 bg-surface-container-high text-secondary rounded-full border border-outline-variant flex items-center gap-1">
                    Search: "{searchQuery}"{' '}
                    <span onClick={() => setSearchQuery('')} className="material-symbols-outlined text-xs cursor-pointer select-none">
                      close
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-on-surface">{report.id}</td>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded bg-surface-container-high border border-outline-variant overflow-hidden">
                            <img
                              className="w-full h-full object-cover"
                              src={report.imageUrl}
                              alt={report.type}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high border border-outline text-xs font-semibold">
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate" title={report.location}>
                          {report.location}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-extrabold rounded uppercase tracking-wide border ${
                              report.status === 'Reported'
                                ? 'bg-surface-dim text-on-surface border-outline'
                                : report.status === 'In Progress'
                                ? 'bg-primary-container/20 text-primary border-primary/30'
                                : 'bg-green-100 text-green-700 border-green-200'
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary text-xs font-medium">
                          {report.date.split(' • ')[0]}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            to={`/admin/reports/${report.id.replace('#', '')}`}
                            className="text-primary hover:underline font-bold text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-secondary italic">
                        No reports matching filters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Panel */}
            <div className="p-4 border-t border-outline-variant flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary">
                Showing 1-{filteredReports.length} of {filteredReports.length} reports
              </span>
              <div className="flex gap-2">
                <button
                  className="p-2 rounded border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                  disabled
                >
                  <span className="material-symbols-outlined text-lg leading-none select-none">chevron_left</span>
                </button>
                <button className="px-3 py-1 rounded border border-primary bg-primary-container/10 text-primary text-xs font-bold select-none">
                  1
                </button>
                <button
                  className="p-2 rounded border border-outline-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
                  disabled
                >
                  <span className="material-symbols-outlined text-lg leading-none select-none">chevron_right</span>
                </button>
              </div>
            </div>
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
