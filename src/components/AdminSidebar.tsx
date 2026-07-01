import { Link, useLocation } from 'react-router';

export default function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col fixed h-full z-30">
      <div className="h-16 flex items-center px-6 gap-3 border-b border-outline-variant">
        <span className="material-symbols-outlined text-primary text-3xl select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
          construction
        </span>
        <div className="flex flex-col">
          <span className="font-headline-md text-xl font-extrabold text-primary tracking-tight">BROS</span>
          <span className="text-[9px] text-secondary font-bold uppercase tracking-widest -mt-1">Admin Portal</span>
        </div>
      </div>
      <nav className="flex-grow px-4 py-6 space-y-2">
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
            isActive('/admin/dashboard')
              ? 'bg-primary-container/10 text-primary border-r-4 border-primary'
              : 'text-secondary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: isActive('/admin/dashboard') ? "'FILL' 1" : undefined }}>
            dashboard
          </span>
          Overview
        </Link>
        <Link
          to="/admin/reports"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
            isActive('/admin/reports') || location.pathname.startsWith('/admin/reports/')
              ? 'bg-primary-container/10 text-primary border-r-4 border-primary'
              : 'text-secondary hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: isActive('/admin/reports') ? "'FILL' 1" : undefined }}>
            report
          </span>
          Reports
        </Link>
        <div className="pt-6 border-t border-outline-variant mt-6">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-secondary hover:bg-surface-container-low transition-all duration-200"
          >
            <span className="material-symbols-outlined select-none">
              public
            </span>
            Public View
          </Link>
        </div>
      </nav>
    </aside>
  );
}
