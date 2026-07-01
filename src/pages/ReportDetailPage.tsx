import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { getReports, updateReportStatus, addAdminNote } from '../reportsState';
import type { Report } from '../reportsState';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeaderProfile from '../components/AdminHeaderProfile';

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Admin Siti'); // Default mock author

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/login');
      return;
    }
    loadReport();
  }, [id, navigate]);

  const loadReport = () => {
    const reports = getReports();
    // Match ID by adding '#' back
    const matchedReport = reports.find((r) => r.id.replace('#', '') === id);
    if (matchedReport) {
      setReport(matchedReport);
    } else {
      setReport(null);
    }
  };

  const handleStatusChange = (newStatus: Report['status']) => {
    if (report) {
      const updated = updateReportStatus(report.id, newStatus);
      if (updated) {
        setReport(updated);
      }
      setShowStatusMenu(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !report) return;

    const updated = addAdminNote(report.id, newNote, noteAuthor);
    if (updated) {
      setReport(updated);
      setNewNote('');
    }
  };

  if (!report) {
    return (
      <div className="bg-surface text-on-surface flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow pl-64 min-h-screen flex flex-col justify-center items-center">
          <div className="text-center p-8 bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md shadow-sm">
            <span className="material-symbols-outlined text-error text-5xl mb-4">warning</span>
            <h2 className="text-xl font-bold mb-2">Laporan Tidak Ditemukan</h2>
            <p className="text-secondary text-sm mb-6">
              Detail laporan dengan ID #{id} tidak ada dalam sistem atau telah dihapus.
            </p>
            <Link to="/admin/reports" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm">
              Kembali ke Daftar Laporan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Calculate severity bars (1 to 5)
  const severityBars = report.severity === 'High' ? 5 : report.severity === 'Medium' ? 3 : 1;

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-grow pl-64 min-h-screen flex flex-col min-w-0">
        {/* Header / Top Bar */}
        <header className="h-16 border-b border-outline-variant bg-surface flex items-center justify-between px-margin-desktop sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <nav className="flex items-center text-secondary font-semibold text-sm">
              <Link to="/admin/reports" className="hover:text-primary transition-colors">
                Reports
              </Link>
              <span className="mx-2 text-outline-variant">/</span>
              <span className="text-on-surface font-bold">Report Detail {report.id}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full select-none">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <button 
              onClick={() => window.print()}
              className="bg-primary text-on-primary px-6 py-2 font-semibold text-sm rounded shadow-sm hover:bg-opacity-95 transition-opacity"
            >
              Print / Export PDF
            </button>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <AdminHeaderProfile />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-margin-desktop max-w-max-width mx-auto w-full flex-grow space-y-8">
          {/* Report Title & Status Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 text-xs font-semibold">
                <span
                  className={`px-3 py-1 rounded-sm uppercase tracking-wider font-extrabold border ${
                    report.status === 'Reported'
                      ? 'bg-surface-dim text-on-surface border-outline'
                      : report.status === 'In Progress'
                      ? 'bg-primary-container/20 text-primary border-primary/30'
                      : 'bg-green-100 text-green-700 border-green-200'
                  }`}
                >
                  {report.status}
                </span>
                <span className="text-secondary font-medium">{report.date}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
                Report {report.id}: Severe {report.type}
              </h2>
            </div>
            
            {/* Change Status Dropdown */}
            <div className="relative inline-block">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-4 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded font-semibold text-sm min-w-[200px] justify-between transition-all hover:bg-opacity-90 active:scale-98"
                id="statusDropdownBtn"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg leading-none">sync</span>
                  Change Status
                </span>
                <span className="material-symbols-outlined leading-none">expand_more</span>
              </button>

              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)}></div>
                  <div
                    className="absolute right-0 mt-2 w-full bg-surface-container-lowest border border-outline shadow-xl z-20 rounded overflow-hidden animate-fade-in-down"
                    id="statusMenu"
                  >
                    <button
                      onClick={() => handleStatusChange('Reported')}
                      className="w-full text-left px-6 py-3.5 hover:bg-surface-container-low font-semibold text-sm text-on-surface flex items-center gap-3"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Reported
                    </button>
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      className="w-full text-left px-6 py-3.5 hover:bg-surface-container-low font-semibold text-sm text-on-surface flex items-center gap-3 border-t border-outline-variant"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      className="w-full text-left px-6 py-3.5 hover:bg-surface-container-low font-semibold text-sm text-on-surface flex items-center gap-3 border-t border-outline-variant"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Resolved
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column: Damage Evidence & Technical Specs */}
            <div className="lg:col-span-8 space-y-gutter">
              {/* Damage Evidence Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-outline bg-surface-container-low">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    Damage Evidence
                  </h3>
                </div>
                <div className="aspect-video w-full bg-surface-dim relative group cursor-zoom-in">
                  <img
                    className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-500"
                    src={report.imageUrl}
                    alt={report.type}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white text-xs font-semibold">
                      Captured via RoadFix Mobile • {report.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 flex flex-col justify-between">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary mb-6 flex items-center gap-2 border-b pb-2">
                    <span className="material-symbols-outlined text-lg">engineering</span>
                    Technical Specs
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">Jenis Kerusakan</p>
                      <p className="text-xl font-bold text-on-surface">{report.type}</p>
                    </div>
                    <div>
                      <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">Severity Level</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((index) => (
                            <span
                              key={index}
                              className={`w-6 h-2 rounded-full ${
                                index <= severityBars ? 'bg-primary' : 'bg-outline-variant'
                              }`}
                            ></span>
                          ))}
                        </div>
                        <span className="text-primary font-bold text-sm ml-1">{report.severity}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">Estimated Size</p>
                      <p className="text-sm font-semibold text-on-surface-variant">
                        {report.estimatedSize || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary mb-4 flex items-center gap-2 border-b pb-2">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    Lokasi
                  </h3>
                  <div className="h-32 bg-surface-dim rounded-lg mb-4 overflow-hidden relative border border-outline-variant">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXfWIdKQttCwfa0dnW5vbicWbXRhwRLGD9qO-tfiGK9mKIsmXCXpGlb7Dejf5tqkO5U_VEblZSGlFqQLbt26UFJobq-o1n6IogJz-nIQl4R8d90kInZr9SEI8nK16rriDtZX4d6t-lBwH0_yCGH-nPYGfr04KwUFAR91OFShFsaTaIR63KeMdhsNwB5xOF6bltvvzqFBFFO4fPEUWhUZw4D87-RgRxHpFRyZw12tXyL7QH-AFisF9ILYIKxFrgVJKlk2eXV79AgLtD')`,
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                  </div>
                  <p className="text-sm font-bold text-on-surface leading-tight">{report.location}</p>
                  <p className="text-secondary text-xs mt-1 font-medium">
                    Lat: {report.coordinates.lat.toFixed(4)}, Long: {report.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Reporter Info & Activity */}
            <div className="lg:col-span-4 space-y-gutter">
              {/* Reporter Identity Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline bg-surface-container-low">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Reporter Identity
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container font-extrabold text-lg border border-primary/20">
                      {report.reporterName ? report.reporterName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'GP'}
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Nama Pelapor</p>
                      <p className="text-lg font-bold text-on-surface">{report.reporterName || 'Guest User'}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">mail</span>
                      <div>
                        <p className="text-[9px] text-secondary font-bold uppercase tracking-wider">Email</p>
                        <p className="text-on-surface-variant font-normal text-xs">{report.reporterEmail || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">call</span>
                      <div>
                        <p className="text-[9px] text-secondary font-bold uppercase tracking-wider">No. HP</p>
                        <p className="text-on-surface-variant font-normal text-xs">{report.reporterPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open(`mailto:${report.reporterEmail}`)}
                    className="w-full py-3 border border-outline text-secondary font-bold text-sm rounded hover:bg-surface-container-low transition-colors outline-none"
                  >
                    Hubungi Pelapor
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary mb-4 border-b pb-2">
                  Catatan Admin
                </h3>
                
                {/* Notes Feed */}
                <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-1">
                  {report.adminNotes.length > 0 ? (
                    report.adminNotes.map((note, index) => (
                      <div
                        key={index}
                        className="p-3.5 bg-surface-container-low rounded border-l-4 border-primary text-sm shadow-sm"
                      >
                        <p className="text-on-surface italic leading-relaxed">"{note.text}"</p>
                        <p className="text-[10px] text-secondary mt-2.5 font-bold uppercase tracking-tighter">
                          {note.author} • {note.date}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-secondary italic">Belum ada catatan internal.</p>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-secondary">
                    <span>Penulis Catatan</span>
                    <select
                      value={noteAuthor}
                      onChange={(e) => setNoteAuthor(e.target.value)}
                      className="bg-transparent border-none py-0 focus:ring-0 cursor-pointer font-bold text-primary text-xs"
                    >
                      <option value="Admin Siti">Admin Siti</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Chief Engineer">Chief Engineer</option>
                    </select>
                  </div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-background border border-outline rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Tambahkan catatan internal..."
                    rows={3}
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-inverse-surface text-inverse-on-surface font-semibold text-sm rounded hover:opacity-90 active:scale-98 transition-all"
                  >
                    Simpan Catatan
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-outline-variant bg-surface-container-highest">
          <div className="max-w-max-width mx-auto px-margin-desktop py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-on-surface-variant">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <span className="font-bold text-primary uppercase tracking-widest text-base">RoadFix AI</span>
              <p className="text-center md:text-left">
                © 2026 RoadFix AI. Engineering Precision for Public Safety.
              </p>
            </div>
            <div className="flex gap-6">
              <a className="hover:text-primary transition-colors font-semibold" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors font-semibold" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors font-semibold" href="#">Contact Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
