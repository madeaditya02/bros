import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { addReport } from '../reportsState';

export default function ReportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [imageUrl, setImageUrl] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuAdk8muXetlKpJm7CFnWrI2ydO0-gNjUGVgIWem3EOe4F_GeV0qZgK4J4FIOHT-ET4mrmlcScJOp1jnUmJ42iPhjSzhC1ZtFz8HFuWZ97kMSZIP8c-XL29T2TmcGCKXLNNIcI9ApD06mb6apa7apSgfdbE5-xDcnlM9ekNT7Cgh2rtzhpdvW9TG5e-MQFX9o_4vjYZbJJfk-EfZGUw0gNykr0IQmfuaS1MPuinPWGFC_MGM5BDZzxwkdX9dfF6j7GUMC9ez0R9ay-mr');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationName, setLocationName] = useState('Jl. Sudirman No. 45, Jakarta Selatan');
  const [coordinates, setCoordinates] = useState({ lat: -6.2088, lng: 106.8456 });
  const [notes, setNotes] = useState('');
  const [damageType, setDamageType] = useState<'Pothole' | 'Crack' | 'Manhole'>('Pothole');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('High');

  // AI loading state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiTask, setAiTask] = useState('Detecting potholes...');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem('admin_logged_in') === 'true');
  }, []);

  // Handle image upload selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Advance to step 2 automatically after select
      setStep(2);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setStep(2);
    }
  };

  // Step 2 Proceeding
  const handleProceedToStep3 = () => {
    if (!fullName || !email || !phone) {
      alert('Silakan lengkapi identitas Anda sebelum melanjutkan.');
      return;
    }
    setStep(3);
    setIsAiLoading(true);
    setAiProgress(0);
    setAiTask('Detecting potholes...');

    const interval = setInterval(() => {
      setAiProgress((prev) => {
        const next = prev + 5;
        if (next === 40) setAiTask('Detecting cracks and manholes...');
        if (next === 70) setAiTask('Validating structural integrity...');
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAiLoading(false);
          }, 4000); // give 400ms buffer after reaching 100
          return 100;
        }
        return next;
      });
    }, 100);
  };

  // Final Submit
  const handleSubmitReport = () => {
    const reportData = {
      type: damageType,
      location: locationName,
      coordinates: coordinates,
      status: 'Reported' as const,
      reporterName: fullName,
      reporterEmail: email,
      reporterPhone: phone,
      notes: notes,
      imageUrl: imageUrl,
      severity: severity,
      estimatedSize: damageType === 'Pothole' 
        ? '~45cm Diameter • 12cm Depth' 
        : damageType === 'Crack'
        ? '~120cm Length • 2cm Width'
        : '~60cm Diameter'
    };

    const newReport = addReport(reportData);
    setSubmittedId(newReport.id);
    setIsSubmitted(true);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant w-full h-16 sticky top-0 z-50">
        <div className="flex justify-between items-center px-margin-desktop max-w-max-width mx-auto h-full">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            RoadFix AI
          </Link>
          <nav className="hidden md:flex gap-gutter items-center">
            <Link to="/" className="font-semibold text-secondary hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <Link to="/report" className="font-semibold text-primary border-b-2 border-primary pb-1">
              Report
            </Link>
          </nav>
          <button
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/login')}
            className="bg-primary text-on-primary font-semibold text-[14px] px-6 py-2 rounded transition-colors hover:bg-opacity-90"
          >
            {isAdmin ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-max-width mx-auto w-full px-margin-mobile md:px-margin-desktop py-12">
        <div className="max-w-3xl mx-auto">
          {isSubmitted ? (
            /* Success View */
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm animate-fade-in">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <h2 className="text-3xl font-extrabold mb-2 text-on-surface">Laporan Berhasil Dikirim!</h2>
              <p className="text-secondary max-w-md mb-6">
                Terima kasih atas partisipasi Anda. Laporan Anda telah dicatat dalam sistem dengan ID pelacakan:
              </p>
              <div className="bg-primary-container/10 border border-primary/20 text-primary font-mono text-2xl font-bold px-6 py-3 rounded-lg mb-8 tracking-wider">
                {submittedId}
              </div>
              <p className="text-sm text-secondary mb-8">
                Tim teknis kami akan segera memverifikasi lokasi dan menjadwalkan perbaikan. Anda dapat memantau status ini secara publik.
              </p>
              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={() => {
                    // Reset page states
                    setStep(1);
                    setFullName('');
                    setEmail('');
                    setPhone('');
                    setNotes('');
                    setIsSubmitted(false);
                  }}
                  className="flex-1 py-3 border border-outline text-secondary font-semibold rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  Lapor Lagi
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-primary text-on-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity"
                >
                  Kembali ke Home
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="mb-12">
                <div className="flex justify-between items-center relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant -translate-y-1/2 z-0"></div>
                  {/* Progress Line Fill */}
                  <div
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  ></div>

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step > 1 ? 'bg-primary text-white' : 'bg-primary text-white border-2 border-primary'
                      }`}
                    >
                      {step > 1 ? <span className="material-symbols-outlined text-sm">check</span> : '1'}
                    </div>
                    <span className={`text-[12px] font-semibold ${step >= 1 ? 'text-primary' : 'text-secondary'}`}>
                      Upload
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step > 2
                          ? 'bg-primary text-white'
                          : step === 2
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-high text-secondary border border-outline-variant'
                      }`}
                    >
                      {step > 2 ? <span className="material-symbols-outlined text-sm">check</span> : '2'}
                    </div>
                    <span className={`text-[12px] font-semibold ${step >= 2 ? 'text-primary' : 'text-secondary'}`}>
                      Identity &amp; Location
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        step === 3
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-container-high text-secondary border border-outline-variant'
                      }`}
                    >
                      3
                    </div>
                    <span className={`text-[12px] font-semibold ${step === 3 ? 'text-primary' : 'text-secondary'}`}>
                      Result
                    </span>
                  </div>
                </div>
              </div>

              {/* Stepper Content Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 min-h-[420px] flex flex-col shadow-sm">
                {step === 1 && (
                  /* Step 1: Upload File */
                  <div className="flex-grow flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">Capture the Issue</h2>
                      <p className="text-secondary text-sm">Upload a clear photo of the road damage for AI processing.</p>
                    </div>
                    <label
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="w-full max-w-md aspect-video border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-surface-container-low transition-colors group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span className="material-symbols-outlined text-5xl text-outline mb-4 group-hover:text-primary transition-colors duration-200">
                        add_a_photo
                      </span>
                      <p className="font-semibold text-[14px] text-on-surface-variant">Drag and drop or click to upload</p>
                      <p className="text-[12px] text-secondary mt-1">Supports JPG, PNG (Max 10MB)</p>
                    </label>
                  </div>
                )}

                {step === 2 && (
                  /* Step 2: Location & Identity Details */
                  <div className="flex-grow flex flex-col">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2">Tentukan Lokasi &amp; Identitas</h2>
                      <p className="text-secondary text-sm">Lengkapi detail identitas pelapor dan tentukan lokasi koordinat jalan rusak.</p>
                    </div>

                    <div className="mb-8 space-y-6">
                      <h3 className="font-bold text-[14px] text-secondary uppercase tracking-wider border-b pb-2">
                        Identitas Pengunggah
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[12px] font-semibold text-on-surface-variant">Nama Lengkap</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3 bg-surface-container-low border border-outline focus:border-primary rounded-lg font-body-md transition-colors outline-none"
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[12px] font-semibold text-on-surface-variant">Alamat Email</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-surface-container-low border border-outline focus:border-primary rounded-lg font-body-md transition-colors outline-none"
                            placeholder="contoh@email.com"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-[12px] font-semibold text-on-surface-variant">Nomor Telepon</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-3 bg-surface-container-low border border-outline focus:border-primary rounded-lg font-body-md transition-colors outline-none"
                            placeholder="0812..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-[14px] text-secondary uppercase tracking-wider border-b pb-2">
                        Pemetaan Lokasi
                      </h3>
                      <div className="bg-surface-container-high rounded-lg overflow-hidden relative border border-outline-variant h-[250px]">
                        <div className="absolute inset-0 bg-[#e5e3df]">
                          <div 
                            className="w-full h-full bg-cover bg-center opacity-80"
                            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXfWIdKQttCwfa0dnW5vbicWbXRhwRLGD9qO-tfiGK9mKIsmXCXpGlb7Dejf5tqkO5U_VEblZSGlFqQLbt26UFJobq-o1n6IogJz-nIQl4R8d90kInZr9SEI8nK16rriDtZX4d6t-lBwH0_yCGH-nPYGfr04KwUFAR91OFShFsaTaIR63KeMdhsNwB5xOF6bltvvzqFBFFO4fPEUWhUZw4D87-RgRxHpFRyZw12tXyL7QH-AFisF9ILYIKxFrgVJKlk2eXV79AgLtD')` }}
                          ></div>
                          {/* Map Pin */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                              <span className="material-symbols-outlined text-primary text-5xl drop-shadow-md select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                                location_on
                              </span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-[2px]"></div>
                            </div>
                          </div>
                          {/* Mock Zoom Controls */}
                          <div className="absolute right-4 top-4 flex flex-col gap-1.5">
                            <button 
                              type="button" 
                              onClick={() => setCoordinates(prev => ({ ...prev, lat: prev.lat + 0.0001 }))}
                              className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-secondary hover:text-primary active:scale-95 transition-all select-none"
                            >
                              <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setCoordinates(prev => ({ ...prev, lat: prev.lat - 0.0001 }))}
                              className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-secondary hover:text-primary active:scale-95 transition-all select-none"
                            >
                              <span className="material-symbols-outlined text-lg">remove</span>
                            </button>
                          </div>
                          {/* Current GPS button */}
                          <div className="absolute right-4 bottom-4">
                            <button 
                              type="button"
                              onClick={() => {
                                setCoordinates({ lat: -6.2088, lng: 106.8456 });
                                setLocationName('Jl. Sudirman No. 45, Jakarta Selatan');
                              }}
                              className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-primary hover:bg-primary-container select-none active:scale-95 transition-all"
                            >
                              <span className="material-symbols-outlined text-lg">my_location</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-surface-container-low border border-outline rounded-lg flex items-center gap-4">
                        <div className="p-2.5 bg-primary-fixed rounded-full text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">map</span>
                        </div>
                        <div className="flex-grow">
                          <p className="text-[12px] text-secondary uppercase font-bold">Lokasi Koordinat Terdeteksi</p>
                          <input
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            className="w-full bg-transparent font-semibold border-b border-transparent focus:border-primary focus:outline-none py-0.5 text-on-surface"
                          />
                          <p className="text-[10px] text-secondary mt-0.5">
                            Lat: {coordinates.lat.toFixed(4)}, Long: {coordinates.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 border border-outline text-secondary font-semibold py-4 rounded-lg hover:bg-surface-container-high transition-colors"
                      >
                        Kembali
                      </button>
                      <button
                        type="button"
                        onClick={handleProceedToStep3}
                        className="flex-[2] bg-primary text-on-primary font-semibold py-4 rounded-lg hover:bg-opacity-95 shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                      >
                        Lanjutkan ke Hasil
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && isAiLoading && (
                  /* Step 3 Loading state */
                  <div className="flex-grow flex flex-col items-center justify-center py-12">
                    <div className="w-full max-w-md space-y-8 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-4xl">
                          neurology
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold mb-2 text-on-surface">AI Analysis in Progress</h2>
                        <p className="text-secondary text-sm">Our vision model is categorizing the damage and assessing severity.</p>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${aiProgress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[12px] text-secondary px-1 font-semibold">
                        <span>{aiTask}</span>
                        <span>{aiProgress}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && !isAiLoading && (
                  /* Step 3: Final Review & Submit details */
                  <div className="flex-grow flex flex-col">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-2">Final Review</h2>
                      <p className="text-secondary text-sm">Please confirm the observation details before submission.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                      <div className="rounded-xl overflow-hidden border border-outline-variant h-[220px] md:h-full max-h-[300px] shadow-sm">
                        <img
                          alt="Uploaded road damage"
                          className="w-full h-full object-cover"
                          src={imageUrl}
                        />
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[12px] text-secondary uppercase font-bold tracking-wider">AI Classification</span>
                            <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold select-none">
                              98% CONFIDENCE
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                              warning
                            </span>
                            <p className="text-2xl font-bold text-primary">{damageType}</p>
                          </div>
                          <p className="text-sm text-secondary leading-relaxed">
                            {damageType === 'Pothole'
                              ? 'Classified as high-severity structural damage requiring immediate repair.'
                              : damageType === 'Crack'
                              ? 'Classified as horizontal surface cracking. Monitor regularly to prevent erosion.'
                              : 'Classified as loose or broken utility manhole lid hazard.'}
                          </p>
                        </div>

                        {/* Damage Classification selector (Orange border when active) */}
                        <div className="space-y-2">
                          <label className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                            Verify Damage Type
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Pothole', 'Crack', 'Manhole'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  setDamageType(type);
                                  if (type === 'Pothole') setSeverity('High');
                                  else if (type === 'Crack') setSeverity('Low');
                                  else setSeverity('Medium');
                                }}
                                className={`py-3 px-2 rounded-lg border text-center font-bold text-[12px] transition-all ${
                                  damageType === type
                                    ? 'border-primary border-2 bg-primary/5 text-primary'
                                    : 'border-outline-variant text-secondary hover:bg-surface-container-low'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-[12px] font-semibold text-on-surface-variant block mb-1">Extracted Location</label>
                            <div className="flex items-center gap-2 p-3 bg-white border border-outline rounded-lg">
                              <span className="material-symbols-outlined text-primary text-lg select-none">location_on</span>
                              <span className="text-sm truncate font-semibold text-on-surface">{locationName}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold text-on-surface-variant block mb-1">Additional Notes (Optional)</label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={3}
                              className="w-full bg-white border border-outline rounded-lg p-3 text-sm focus:border-primary outline-none transition-all"
                              placeholder="Tambah deskripsi pelengkap seperti kedalaman lubang, patokan jalan, dsb."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 bg-surface-container-high text-on-surface font-semibold py-4 rounded-lg hover:bg-surface-container-highest transition-colors"
                      >
                        Reset / Kembali
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitReport}
                        className="flex-[2] bg-primary text-on-primary font-bold py-4 rounded-lg hover:bg-opacity-95 shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">send</span>
                        Submit Official Observation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-max-width mx-auto py-8 gap-4">
          <div className="text-sm font-bold text-primary">BROS</div>
          <div className="text-xs text-on-surface-variant text-center md:text-left">
            © 2026 Bad Road Observation System. Built for Urban Integrity.
          </div>
          <div className="flex gap-6 text-xs text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
