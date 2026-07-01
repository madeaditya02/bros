import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(sessionStorage.getItem('admin_logged_in') === 'true');
    };
    checkAdmin();

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className={`w-full h-16 border-b border-outline-variant z-50 sticky top-0 transition-all duration-300 ${isScrolled ? 'shadow-md bg-white/95 backdrop-blur-md' : 'bg-surface'
        }`}>
        <nav className="flex justify-between items-center px-margin-desktop max-w-max-width mx-auto h-full">
          <div className="text-2xl font-bold text-primary tracking-tight">BROS</div>
          <div className="hidden md:flex gap-8 items-center h-full">
            <Link to="/" className="font-semibold text-[14px] text-primary border-b-2 border-primary pb-1">
              Home
            </Link>
            <Link to="/report" className="font-semibold text-[14px] text-secondary hover:text-primary transition-colors">
              Report
            </Link>
          </div>
          <button
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/login')}
            className="bg-primary text-on-primary font-semibold text-[14px] px-6 py-2 rounded transition-colors hover:bg-on-primary-fixed-variant"
          >
            {isAdmin ? 'Dashboard' : 'Sign In'}
          </button>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Section 1: Hero Section */}
        <section className="relative overflow-hidden bg-surface-bright py-10 md:py-16">
          <div className="max-w-max-width mx-auto px-margin-desktop grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block bg-primary-container text-on-primary-container font-semibold text-[12px] px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                Membangun Kota yang Aman
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 leading-tight">
                Pastikan Jalanan Tetap Aman dengan <span className="text-primary">BROS</span>
              </h1>
              <p className="text-lg text-secondary mb-8 max-w-lg leading-relaxed">
                Bad Road Observation System (BROS), Sistem pelaporan kerusakan jalan terintegrasi teknologi AI. Laporkan lubang, retakan, atau penutup manhole yang rusak dalam hitungan detik.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/report')}
                  className="bg-primary text-on-primary font-bold text-[16px] px-8 py-4 rounded shadow-md hover:bg-opacity-95 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add_location_alt</span>
                  Lapor Sekarang
                </button>
              </div>
            </div>
            <div className="relative h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-xl border border-outline-variant">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSa3PWPau8N-t8jlyYWr2VXAtdqfPXukTy0ZcEhs-2PWHJDPO1F3F12knAIT9yWreJNm5C2P98jdjBRBSm3SQ3XjNZ4AOv3WDqkVgj8HP91-WbS-3VpvxeX-zFVwxp18NXOWZABu_C3a-gVF-ppk1mwFdZqqX9W8SrSBimZGn99xlfaqg__EeO6P31KwH4mJYS7ozXbYetx6B5rsuVg78sXfS1W9FznYfXX-eW9jzX8R9HtJ6Do5VBJRfhKEp6eimEnPv9KBeVflzx')`
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
          {/* Decorative Element */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </section>

        {/* Section 2: Cara Kerja Section */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-max-width mx-auto px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-on-surface mb-4">Cara Kerja BROS</h2>
              <p className="text-base text-secondary max-w-2xl mx-auto">
                Tiga langkah mudah untuk membantu pemerintah memperbaiki infrastruktur kota Anda.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-surface p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all text-center group">
                <div className="w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">photo_camera</span>
                </div>
                <h3 className="text-xl font-bold mb-3">1. Ambil Foto</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Unggah foto kerusakan jalan. AI kami akan menganalisis jenis dan tingkat keparahan secara otomatis.
                </p>
              </div>
              {/* Step 2 */}
              <div className="bg-surface p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all text-center group">
                <div className="w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">location_on</span>
                </div>
                <h3 className="text-xl font-bold mb-3">2. Verifikasi Lokasi</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Sistem memetakan koordinat GPS secara presisi untuk memudahkan tim teknis menemukan lokasi kerusakan.
                </p>
              </div>
              {/* Step 3 */}
              <div className="bg-surface p-8 rounded-xl border border-outline-variant hover:shadow-lg transition-all text-center group">
                <div className="w-16 h-16 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl">task_alt</span>
                </div>
                <h3 className="text-xl font-bold mb-3">3. Hasil &amp; Pantau</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Dapatkan pembaruan status perbaikan secara real-time langsung melalui dashboard pelaporan Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Final CTA Section */}
        <section className="py-24 bg-primary relative overflow-hidden text-center text-on-primary">
          <div className="max-w-max-width mx-auto px-margin-desktop relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
              Siap Menjadikan Jalanan Lebih Baik?
            </h2>
            <p className="text-lg text-on-primary/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan warga yang telah berkontribusi menjaga integritas infrastruktur kota kita bersama.
            </p>
            <button
              onClick={() => navigate('/report')}
              className="bg-white text-primary font-bold text-lg px-10 py-5 rounded-lg shadow-xl hover:bg-surface-bright hover:scale-[1.02] transition-all inline-flex items-center gap-3"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Mulai Laporan Pertama
            </button>
          </div>
          {/* Decorative bg circle */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest w-full py-8 border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-max-width mx-auto gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-lg font-bold text-primary mb-2">BROS</div>
            <div className="text-sm text-on-surface-variant">
              © 2026 BROS (Bad Road Observation System). Engineering Precision for Public Safety.
            </div>
          </div>
          <div className="flex gap-6 flex-wrap justify-center text-sm">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
