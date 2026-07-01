import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://backend-apdd.razik.workers.dev/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        sessionStorage.setItem('admin_token', data.token);
        sessionStorage.setItem('admin_logged_in', 'true');
        sessionStorage.setItem('admin_email', username); // save username as email fallback for display
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Kredensial salah. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal menghubungi server. Periksa koneksi internet Anda.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bright text-on-surface">
      {/* Top Navigation Bar */}
      <header className="w-full h-16 flex justify-between items-center px-margin-desktop max-w-max-width mx-auto bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-primary text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            construction
          </span>
          <span className="text-2xl font-extrabold text-primary tracking-tight">BROS</span>
        </div>
        <div className="hidden md:flex gap-4">
          <span className="font-semibold text-sm text-secondary">Engineering Precision</span>
        </div>
      </header>

      {/* Main Content: Centered Login Card */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#904d00 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="w-full max-w-md z-10">
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-xl border border-outline-variant shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold text-on-surface mb-2">Admin Login</h1>
              <p className="text-sm text-secondary">
                Masukkan kredensial Anda untuk mengakses dashboard manajemen infrastruktur.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error/20 text-sm font-semibold rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl select-none">
                    person
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all outline-none text-sm text-on-surface"
                    placeholder="Masukkan username Anda"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="block font-semibold text-on-surface" htmlFor="password">
                    Password
                  </label>
                  <a className="text-xs font-semibold text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl select-none">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-outline focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all outline-none text-sm text-on-surface"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl select-none">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline rounded focus:ring-primary accent-primary"
                />
                <label className="ml-2 text-sm text-secondary select-none cursor-pointer" htmlFor="remember">
                  Tetap masuk di perangkat ini
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-6 bg-primary text-on-primary font-semibold text-sm rounded-lg flex items-center justify-center gap-2 group hover:bg-opacity-95 transition-all shadow-sm"
              >
                <span>Masuk</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                encrypted
              </span>
              <span className="font-semibold text-xs tracking-wider uppercase">Sistem Terenkripsi End-to-End</span>
            </div>
          </div>

          {/* Help Support Link */}
          <p className="mt-6 text-center text-sm text-secondary">
            Butuh bantuan? Hubungi <a className="text-primary font-semibold hover:underline" href="#" onClick={(e) => e.preventDefault()}>Support BROS</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-surface-container-highest border-t border-outline-variant mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-max-width mx-auto gap-4 text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">BROS</span>
            <span className="text-outline-variant">|</span>
            <span>© 2026 BROS Infrastructure Management.</span>
          </div>
          <nav className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Accessibility</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
