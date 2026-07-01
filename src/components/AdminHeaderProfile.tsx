import { useState } from 'react';
import { FaUser } from 'react-icons/fa6';
import { useNavigate } from 'react-router';

export default function AdminHeaderProfile() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_email');
    sessionStorage.removeItem('admin_token');
    navigate('/');
  };

  const adminEmail = sessionStorage.getItem('admin_email')

  return (
    <div className="relative">
      {/* Clickable Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-surface-container-low transition-all duration-200 outline-none text-left cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold border border-outline select-none">
          <FaUser />
        </div>
        {/* <div className="hidden sm:flex flex-col text-sm select-none">
          <span className="font-bold text-on-surface leading-tight">John Doe</span>
          <span className="text-xs text-on-surface-variant font-medium">Chief Engineer</span>
        </div> */}
        <span className="material-symbols-outlined text-secondary text-lg select-none">
          expand_more
        </span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close the popover */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline rounded-lg shadow-xl z-50 p-4 animate-fade-in text-sm text-on-surface">
            {/* Header info inside popover */}
            <div className="pb-3 border-b border-outline-variant mb-2">
              {/* <p className="font-bold text-on-surface">John Doe</p>
              <p className="text-xs text-secondary font-medium">Chief Engineer</p> */}
              <p className="text text-outline font-semibold tracking-wider mt-1 uppercase">
                {adminEmail}
              </p>
            </div>

            {/* Popover Actions */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-surface-container-low flex items-center gap-2.5 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-lg leading-none">dashboard</span>
                Overview
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/reports');
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-surface-container-low flex items-center gap-2.5 font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-lg leading-none">report</span>
                Manage Reports
              </button>

              <div className="border-t border-outline-variant my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded text-error hover:bg-error-container/20 flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg leading-none text-error">logout</span>
                Keluar / Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
