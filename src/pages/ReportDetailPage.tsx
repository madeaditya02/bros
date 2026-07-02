import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { getAdminReportById, updateReportStatus, deleteReport } from '../reportsState';
import type { Report } from '../reportsState';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeaderProfile from '../components/AdminHeaderProfile';
import { CgSpinner } from 'react-icons/cg';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const loadReport = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReportById(id);
      console.log('Berhasil')
      setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Laporan tidak ditemukan atau Anda tidak memiliki akses admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/login');
      return;
    }
    loadReport();
  }, [id, navigate]);

  // Leaflet Map Initialization for Admin Detail (Read-only display)
  useEffect(() => {
    if (!loading && report && mapContainerRef.current) {
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false
        }).setView([report.latitude, report.longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapRef.current);

        const markerIcon = L.divIcon({
          html: `<div class="relative flex items-center justify-center" style="width: 40px; height: 40px;">
                   <span class="material-symbols-outlined text-primary text-5xl select-none" style="font-variation-settings: 'FILL' 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: translateY(-16px); position: absolute;">location_on</span>
                   <div class="absolute w-4 h-1 bg-black/20 rounded-full blur-[1px]" style="bottom: 0px;"></div>
                 </div>`,
          className: 'custom-map-pin',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        L.marker([report.latitude, report.longitude], {
          icon: markerIcon
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView([report.latitude, report.longitude], 15);
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading, report]);

  const handleStatusChange = async (newStatus: Report['status']) => {
    if (report) {
      try {
        await updateReportStatus(report.id, newStatus);
        setReport({ ...report, status: newStatus });
        setShowStatusMenu(false);
      } catch (err) {
        console.error('Error updating status:', err);
        alert('Gagal memperbarui status laporan.');
      }
    }
  };

  const handleDeleteReport = async () => {
    if (report && window.confirm(`Apakah Anda yakin ingin menghapus laporan ${report.id} secara permanen?`)) {
      setDeleteLoading(true);
      try {
        await deleteReport(report.id);
        alert(`Laporan ${report.id} berhasil dihapus.`);
        navigate('/admin/reports');
      } catch (err) {
        console.error('Delete error:', err);
        alert('Gagal menghapus laporan.');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const getAiClassNames = (report: any) => {
    if (report && report.ai_raw_response && Array.isArray(report.ai_raw_response) && report.ai_raw_response.length > 0) {
      const classes = report.ai_raw_response.map((det: any) => det.class);
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

  if (loading) {
    return (
      <div className="bg-surface text-on-surface flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow pl-64 min-h-screen flex items-center justify-center">
          <CgSpinner className="animate-spin text-primary text-5xl" />
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-surface text-on-surface flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow pl-64 min-h-screen flex flex-col justify-center items-center">
          <div className="text-center p-8 bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md shadow-sm">
            <span className="material-symbols-outlined text-error text-5xl mb-4">warning</span>
            <h2 className="text-xl font-bold mb-2">Laporan Tidak Ditemukan</h2>
            <p className="text-secondary text-sm mb-6">
              {error || `Detail laporan tidak ditemukan.`}
            </p>
            <Link to="/admin/reports" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm">
              Kembali ke Daftar Laporan
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
              <span className="text-on-surface font-bold font-mono">Detail {report.id}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full select-none">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <button
              onClick={() => window.print()}
              className="bg-primary text-on-primary px-6 py-2 font-semibold text-sm rounded shadow-sm hover:bg-opacity-95 transition-opacity cursor-pointer"
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
                <span className={`px-3 py-1 rounded-sm uppercase tracking-wider font-extrabold border ${getStatusBadgeClass(report.status)}`}>
                  {report.status}
                </span>
                <span className="text-secondary font-medium">
                  {new Date(report.created_at).toLocaleString('id-ID')}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-mono">
                Report {report.id}: {getAiClassNames(report)}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Delete Button */}
              <button
                onClick={handleDeleteReport}
                disabled={deleteLoading}
                className="flex items-center gap-2 bg-error text-on-error border border-error px-5 py-3 rounded-lg font-bold text-sm hover:bg-opacity-90 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg leading-none">delete</span>
                Hapus Laporan
              </button>

              {/* Change Status Dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-4 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-lg font-semibold text-sm min-w-[180px] justify-between transition-all hover:bg-opacity-90 active:scale-98 cursor-pointer"
                  id="statusDropdownBtn"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg leading-none">sync</span>
                    Ubah Status
                  </span>
                  <span className="material-symbols-outlined leading-none">expand_more</span>
                </button>

                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)}></div>
                    <div
                      className="absolute right-0 mt-2 w-full bg-surface-container-lowest border border-outline shadow-xl z-25 rounded overflow-hidden animate-fade-in-down capitalize"
                      id="statusMenu"
                    >
                      {(['pending', 'verified', 'in_progress', 'repaired', 'rejected'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className="w-full text-left px-5 py-3 hover:bg-surface-container-low font-semibold text-sm text-on-surface flex items-center gap-3 border-t border-outline-variant first:border-t-0"
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${st === 'pending'
                            ? 'bg-secondary'
                            : st === 'verified'
                              ? 'bg-blue-500'
                              : st === 'in_progress'
                                ? 'bg-amber-500'
                                : st === 'repaired'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                            }`}></span> {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column: Damage Evidence & YOLOv8 Detections */}
            <div className="lg:col-span-8 space-y-gutter">
              {/* Damage Evidence Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-outline bg-surface-container-low">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    Foto Bukti Kerusakan
                  </h3>
                </div>
                <div className="aspect-video w-full bg-surface-dim relative group">
                  <img
                    className="w-full h-full object-cover"
                    src={report.image_url}
                    alt={getAiClassNames(report)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white text-xs font-semibold">
                      Diunggah via Web Portal • ID: {report.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Details / AI Raw Response Accordion */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary flex items-center gap-2 border-b pb-2 mb-4">
                    <span className="material-symbols-outlined text-lg">neurology</span>
                    Analisis AI YOLOv8 Detections
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">Hasil Klasifikasi AI</p>
                        <p className="text-lg font-bold text-on-surface capitalize">{getAiClassNames(report)}</p>
                      </div>
                      <div>
                        <p className="text-secondary text-[11px] font-bold uppercase tracking-wider">Tingkat Keyakinan (Confidence)</p>
                        <p className="text-lg font-bold text-primary">
                          {report.ai_confidence !== null ? `${(report.ai_confidence * 100).toFixed(0)}%` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-secondary text-[11px] font-bold uppercase tracking-wider block mb-1.5">JSON Output AI YOLOv8</p>
                      <pre className="bg-surface-container-low p-4 rounded-lg border border-outline-variant font-mono text-xs overflow-auto max-h-48 leading-normal text-on-surface">
                        {JSON.stringify(report.ai_raw_response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Location Map & Reporter Info */}
            <div className="lg:col-span-4 space-y-gutter">
              {/* Map Lokasi Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary flex items-center gap-2 border-b pb-2">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                  Lokasi Kerusakan
                </h3>
                <div className="h-44 bg-surface-dim rounded-lg overflow-hidden relative border border-outline-variant">
                  <div ref={mapContainerRef} className="w-full h-full z-10" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface leading-tight">{report.location_name}</p>
                  <p className="text-secondary text-xs mt-1 font-mono">
                    Lat: {report.latitude?.toFixed(6)}, Long: {report.longitude?.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Reporter Identity Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline bg-surface-container-low">
                  <h3 className="font-bold text-[14px] uppercase tracking-wider text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Informasi Pelapor
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container font-extrabold text-lg border border-primary/20">
                      {report.reporter_name ? report.reporter_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'GP'}
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Nama Pelapor</p>
                      <p className="text-lg font-bold text-on-surface">{report.reporter_name || 'Guest User'}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">mail</span>
                      <div>
                        <p className="text-[9px] text-secondary font-bold uppercase tracking-wider">Email</p>
                        <p className="text-on-surface-variant font-normal text-xs">{report.reporter_email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">call</span>
                      <div>
                        <p className="text-[9px] text-secondary font-bold uppercase tracking-wider">No. HP</p>
                        <p className="text-on-surface-variant font-normal text-xs">{report.reporter_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`mailto:${report.reporter_email}`)}
                    className="w-full py-3 border border-outline text-secondary font-bold text-sm rounded hover:bg-surface-container-low transition-colors outline-none cursor-pointer"
                  >
                    Hubungi Pelapor
                  </button>
                </div>
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
