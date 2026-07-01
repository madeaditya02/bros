import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import exifr from 'exifr';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CgSpinner } from 'react-icons/cg';

export default function ReportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form and image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuAdk8muXetlKpJm7CFnWrI2ydO0-gNjUGVgIWem3EOe4F_GeV0qZgK4J4FIOHT-ET4mrmlcScJOp1jnUmJ42iPhjSzhC1ZtFz8HFuWZ97kMSZIP8c-XL29T2TmcGCKXLNNIcI9ApD06mb6apa7apSgfdbE5-xDcnlM9ekNT7Cgh2rtzhpdvW9TG5e-MQFX9o_4vjYZbJJfk-EfZGUw0gNykr0IQmfuaS1MPuinPWGFC_MGM5BDZzxwkdX9dfF6j7GUMC9ez0R9ay-mr');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationName, setLocationName] = useState('Jl. Sudirman No. 45, Jakarta Selatan');
  const [coordinates, setCoordinates] = useState({ lat: -6.2088, lng: 106.8456 });

  // API submission results and loading states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiTask, setAiTask] = useState('Menganalisis foto jalan rusak...');
  const [submittedReport, setSubmittedReport] = useState<any>(null);
  const [locationAlert, setLocationAlert] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Refs for maps
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const step3MapContainerRef = useRef<HTMLDivElement>(null);
  const step3MapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem('admin_logged_in') === 'true');
  }, []);

  // Reverse Geocoding via Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setLocationName('Mencari alamat...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
      } else {
        setLocationName(`Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName(`Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // EXIF Metadata extraction
  const extractMetadata = async (file: File) => {
    setLocationAlert(null);
    try {
      const gps = await exifr.gps(file);
      if (gps && gps.latitude && gps.longitude) {
        const { latitude, longitude } = gps;
        setCoordinates({ lat: latitude, lng: longitude });
        setLocationAlert({
          type: 'success',
          message: 'Metadata lokasi berhasil diekstrak dari foto!'
        });
        await reverseGeocode(latitude, longitude);
      } else {
        setLocationAlert({
          type: 'info',
          message: 'Foto tidak memiliki metadata lokasi. Silakan tentukan lokasi Anda pada peta.'
        });
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setCoordinates({ lat: latitude, lng: longitude });
              await reverseGeocode(latitude, longitude);
            },
            async () => {
              await reverseGeocode(coordinates.lat, coordinates.lng);
            }
          );
        } else {
          await reverseGeocode(coordinates.lat, coordinates.lng);
        }
      }
    } catch (error) {
      console.error('Error extracting EXIF metadata:', error);
      setLocationAlert({
        type: 'info',
        message: 'Foto tidak memiliki metadata lokasi. Silakan tentukan lokasi Anda pada peta.'
      });
      await reverseGeocode(coordinates.lat, coordinates.lng);
    }
  };

  // Handle image upload selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      await extractMetadata(file);
      setStep(2);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      await extractMetadata(file);
      setStep(2);
    }
  };

  // Leaflet Map Initialization for Step 2
  useEffect(() => {
    if (step === 2 && mapContainerRef.current) {
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([coordinates.lat, coordinates.lng], 15);

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

        markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
          icon: markerIcon,
          draggable: true
        }).addTo(mapRef.current);

        // Marker drag handler
        markerRef.current.on('dragend', async (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setCoordinates({ lat: position.lat, lng: position.lng });
          await reverseGeocode(position.lat, position.lng);
        });

        // Map click handler
        mapRef.current.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          setCoordinates({ lat, lng });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          await reverseGeocode(lat, lng);
        });
      } else {
        mapRef.current.setView([coordinates.lat, coordinates.lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        }
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      }
    }

    return () => {
      if (step !== 2 && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [step]);

  // Leaflet Map Initialization for Step 3 (Read-only display)
  useEffect(() => {
    if (step === 3 && !isAiLoading && submittedReport && step3MapContainerRef.current) {
      if (!step3MapRef.current) {
        step3MapRef.current = L.map(step3MapContainerRef.current, {
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false
        }).setView([submittedReport.latitude || coordinates.lat, submittedReport.longitude || coordinates.lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(step3MapRef.current);

        const markerIcon = L.divIcon({
          html: `<div class="relative flex items-center justify-center" style="width: 40px; height: 40px;">
                   <span class="material-symbols-outlined text-primary text-5xl select-none" style="font-variation-settings: 'FILL' 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: translateY(-16px); position: absolute;">location_on</span>
                   <div class="absolute w-4 h-1 bg-black/20 rounded-full blur-[1px]" style="bottom: 0px;"></div>
                 </div>`,
          className: 'custom-map-pin',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        L.marker([submittedReport.latitude || coordinates.lat, submittedReport.longitude || coordinates.lng], {
          icon: markerIcon
        }).addTo(step3MapRef.current);
      } else {
        step3MapRef.current.setView([submittedReport.latitude || coordinates.lat, submittedReport.longitude || coordinates.lng], 15);
        setTimeout(() => {
          step3MapRef.current?.invalidateSize();
        }, 100);
      }
    }

    return () => {
      if (step !== 3 && step3MapRef.current) {
        step3MapRef.current.remove();
        step3MapRef.current = null;
      }
    };
  }, [step, isAiLoading, submittedReport]);

  // Submit trigger to backend `/api/reports`
  const handleSubmitReport = async () => {
    if (!fullName || !email || !phone) {
      alert('Silakan lengkapi identitas Anda sebelum mengirim laporan.');
      return;
    }
    if (!imageFile) {
      alert('Silakan pilih atau unggah foto terlebih dahulu.');
      setStep(1);
      return;
    }

    setStep(3);
    setIsAiLoading(true);
    setAiProgress(0);
    setAiTask('Mengirim data laporan ke server...');
    setSubmitError(null);

    // AI loader progress interval simulation
    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev < 90) return prev + 10;
        return prev;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('location_name', locationName);
      formData.append('latitude', String(coordinates.lat));
      formData.append('longitude', String(coordinates.lng));
      formData.append('reporter_name', fullName);
      formData.append('reporter_email', email);
      formData.append('reporter_phone', phone);

      const response = await fetch('https://backend-apdd.razik.workers.dev/api/reports', {
        method: 'POST',
        body: formData
      });

      const resJson = await response.json();
      clearInterval(interval);
      setAiProgress(100);

      if (response.status === 201 && resJson.status === 'success') {
        setSubmittedReport(resJson.data);
        setIsAiLoading(false);
      } else if (response.status === 409) {
        setSubmitError(resJson.message || 'Laporan konflik. Area lokasi jalan rusak ini sudah dilaporkan oleh orang lain dalam radius 50 meter.');
        setIsAiLoading(false);
      } else if (response.status === 422) {
        setSubmitError(resJson.message || 'Model AI YOLOv8 tidak mendeteksi adanya kerusakan jalan pada foto tersebut. Harap unggah foto lain.');
        setIsAiLoading(false);
      } else {
        setSubmitError(resJson.message || 'Terjadi kesalahan sistem saat mengirim laporan.');
        setIsAiLoading(false);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      clearInterval(interval);
      setSubmitError('Gagal mengirim data. Silakan periksa koneksi internet Anda dan coba lagi.');
      setIsAiLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setImageFile(null);
    setImageUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuAdk8muXetlKpJm7CFnWrI2ydO0-gNjUGVgIWem3EOe4F_GeV0qZgK4J4FIOHT-ET4mrmlcScJOp1jnUmJ42iPhjSzhC1ZtFz8HFuWZ97kMSZIP8c-XL29T2TmcGCKXLNNIcI9ApD06mb6apa7apSgfdbE5-xDcnlM9ekNT7Cgh2rtzhpdvW9TG5e-MQFX9o_4vjYZbJJfk-EfZGUw0gNykr0IQmfuaS1MPuinPWGFC_MGM5BDZzxwkdX9dfF6j7GUMC9ez0R9ay-mr');
    setFullName('');
    setEmail('');
    setPhone('');
    setLocationName('Jl. Sudirman No. 45, Jakarta Selatan');
    setCoordinates({ lat: -6.2088, lng: 106.8456 });
    setSubmittedReport(null);
    setLocationAlert(null);
    setSubmitError(null);
  };

  const updateMapLocation = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    await reverseGeocode(lat, lng);
  };

  // Helper to extract AI detections class names from YOLOv8 raw response
  const getAiClassNames = (report: any) => {
    if (report && report.ai_raw_response && Array.isArray(report.ai_raw_response) && report.ai_raw_response.length > 0) {
      const classes = report.ai_raw_response.map((det: any) => det.class);
      // Remove duplicates
      return Array.from(new Set(classes)).join(', ');
    }
    return 'Road Damage (General)';
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant w-full h-16 sticky top-0 z-50">
        <div className="flex justify-between items-center px-margin-desktop max-w-max-width mx-auto h-full">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            BROS
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
            className="bg-primary text-on-primary font-semibold text-[14px] px-6 py-2 rounded transition-colors hover:bg-opacity-90 cursor-pointer"
          >
            {isAdmin ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-max-width mx-auto w-full px-margin-mobile md:px-margin-desktop py-12">
        <div className="max-w-3xl mx-auto">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step > 1 ? 'bg-primary text-white' : 'bg-primary text-white border-2 border-primary'
                    }`}
                >
                  {step > 1 ? <span className="material-symbols-outlined text-sm font-bold">check</span> : '1'}
                </div>
                <span className={`text-[12px] font-semibold ${step >= 1 ? 'text-primary' : 'text-secondary'}`}>
                  Upload Foto
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step > 2
                      ? 'bg-primary text-white'
                      : step === 2
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-high text-secondary border border-outline-variant'
                    }`}
                >
                  {step > 2 ? <span className="material-symbols-outlined text-sm font-bold">check</span> : '2'}
                </div>
                <span className={`text-[12px] font-semibold ${step >= 2 ? 'text-primary' : 'text-secondary'}`}>
                  Identitas &amp; Lokasi
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 3
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-high text-secondary border border-outline-variant'
                    }`}
                >
                  3
                </div>
                <span className={`text-[12px] font-semibold ${step === 3 ? 'text-primary' : 'text-secondary'}`}>
                  Hasil Laporan
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
                  <h2 className="text-2xl font-bold mb-2">Unggah Foto Kerusakan</h2>
                  <p className="text-secondary text-sm">Upload foto kerusakan jalan yang jelas untuk dianalisis oleh AI.</p>
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
                  <span className="material-symbols-outlined text-5xl text-outline mb-4 group-hover:text-primary transition-colors duration-200 select-none">
                    add_a_photo
                  </span>
                  <p className="font-semibold text-[14px] text-on-surface-variant">Seret dan letakkan atau klik untuk upload</p>
                  <p className="text-[12px] text-secondary mt-1">Mendukung JPG, PNG (Maks 5MB)</p>
                </label>
              </div>
            )}

            {step === 2 && (
              /* Step 2: Location & Identity Details + Submit */
              <div className="flex-grow flex flex-col">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Tentukan Lokasi &amp; Identitas</h2>
                    <p className="text-secondary text-sm">Lengkapi detail identitas pelapor dan tentukan lokasi koordinat jalan rusak pada peta.</p>
                  </div>
                  <div className="w-20 h-16 rounded border border-outline-variant overflow-hidden flex-shrink-0 shadow-sm self-start sm:self-center">
                    <img className="w-full h-full object-cover" src={imageUrl} alt="Local Preview" />
                  </div>
                </div>

                <div className="space-y-6 flex-grow">
                  {/* Location Alert */}
                  {locationAlert && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 border text-sm font-semibold ${locationAlert.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-primary-container/10 text-primary border-primary/20'
                      }`}>
                      <span className="material-symbols-outlined select-none">
                        {locationAlert.type === 'success' ? 'check_circle' : 'info'}
                      </span>
                      <span>{locationAlert.message}</span>
                    </div>
                  )}

                  {/* 1. Identitas Pengunggah */}
                  <div className="space-y-4">
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
                          className="w-full p-3 bg-surface-container-low border border-outline focus:border-primary rounded-lg font-body-md transition-colors outline-none text-sm text-on-surface"
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
                          className="w-full p-3 bg-surface-container-low border border-outline focus:border-primary rounded-lg font-body-md transition-colors outline-none text-sm text-on-surface"
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
                          className="w-full p-3 bg-surface-container-low border border-outline focus:border-primary rounded-lg font-body-md transition-colors outline-none text-sm text-on-surface"
                          placeholder="0812..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Pemetaan Lokasi (OSM) */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-[14px] text-secondary uppercase tracking-wider border-b pb-2">
                      Pemetaan Lokasi
                    </h3>
                    <p className="text-[12px] text-secondary">Geser marker atau klik pada peta untuk menentukan koordinat lokasi yang tepat.</p>
                    <div className="bg-surface-container-high rounded-lg overflow-hidden relative border border-outline-variant h-[300px]">
                      <div ref={mapContainerRef} className="w-full h-full z-10" />

                      {/* Control overlay */}
                      <div className="absolute right-3 bottom-3 z-20">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (pos) => updateMapLocation(pos.coords.latitude, pos.coords.longitude)
                              );
                            }
                          }}
                          className="w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-primary hover:bg-primary-container active:scale-95 transition-all select-none border border-outline-variant cursor-pointer"
                          title="Gunakan lokasi saya saat ini"
                        >
                          <span className="material-symbols-outlined text-lg">my_location</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-surface-container-low border border-outline rounded-lg flex items-center gap-4">
                      <div className="p-2.5 bg-primary-fixed rounded-full text-primary flex items-center justify-center select-none">
                        <span className="material-symbols-outlined text-xl">map</span>
                      </div>
                      <div className="flex-grow">
                        <p className="text-[12px] text-secondary uppercase font-bold">Nama / Alamat Lokasi Laporan</p>
                        <input
                          type="text"
                          value={locationName}
                          onChange={(e) => setLocationName(e.target.value)}
                          className="w-full bg-transparent font-semibold border-b border-outline-variant focus:border-primary focus:outline-none py-0.5 text-on-surface text-sm"
                        />
                        <p className="text-[10px] text-secondary mt-1">
                          Latitude: {coordinates.lat.toFixed(6)}, Longitude: {coordinates.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4 border-t border-outline-variant pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-outline text-secondary font-semibold py-4 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer text-center text-sm"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    className="flex-[2] bg-primary text-on-primary font-bold py-4 rounded-lg hover:bg-opacity-95 shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-center text-sm"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">send</span>
                    Kirim Laporan
                  </button>
                </div>
              </div>
            )}

            {step === 3 && isAiLoading && (
              /* Step 3: Loading state with react-icons spinner */
              <div className="flex-grow flex flex-col items-center justify-center py-12 animate-fade-in">
                <div className="w-full max-w-md space-y-8 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <CgSpinner className="animate-spin text-primary text-6xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-on-surface">Analisis AI &amp; Pengiriman Laporan</h2>
                    <p className="text-secondary text-sm">Sistem sedang mendeteksi visual kerusakan menggunakan YOLOv8 dan mendaftarkan laporan koordinat...</p>
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

            {step === 3 && !isAiLoading && submitError && (
              /* Step 3: Submission Failed (YOLOv8 check failed or Duplicate location 409) */
              <div className="flex-grow flex flex-col items-center justify-center py-12 animate-fade-in text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl select-none">error</span>
                </div>
                <h2 className="text-2xl font-extrabold text-red-800 mb-2">Pengiriman Laporan Gagal</h2>
                <p className="text-secondary text-sm max-w-md mb-8 font-medium">
                  {submitError}
                </p>
                <div className="flex gap-4 w-full max-w-sm">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-outline text-secondary font-semibold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer text-sm"
                  >
                    Koreksi Data / Foto
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-primary text-on-primary font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm"
                  >
                    Upload Foto Baru
                  </button>
                </div>
              </div>
            )}

            {step === 3 && !isAiLoading && !submitError && submittedReport && (
              /* Step 3: Final Display-only Submission Results */
              <div className="flex-grow flex flex-col space-y-8 animate-fade-in">
                {/* Success Banner */}
                <div className="text-center p-6 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center justify-center shadow-sm">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl select-none">check_circle</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-green-800 mb-1">Laporan Berhasil Dikirim!</h2>
                  <p className="text-green-700 text-sm max-w-md mb-4 font-medium">
                    Terima kasih atas laporan Anda. Laporan kerusakan telah tercatat di database BROS dengan ID pelacakan:
                  </p>
                  <div className="bg-white border border-green-300 text-green-800 font-mono text-xl font-bold px-6 py-2 rounded-lg tracking-wider shadow-sm select-all">
                    {submittedReport.id}
                  </div>
                </div>

                {/* Report Summary (Display Only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Image & AI Classification */}
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-2">Foto Yang Diunggah</span>
                      <div className="rounded-xl overflow-hidden border border-outline-variant h-[220px] shadow-sm">
                        <img
                          alt="Uploaded road damage"
                          className="w-full h-full object-cover"
                          src={submittedReport.image_url}
                        />
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-5 rounded-xl border border-outline space-y-4">
                      <div>
                        <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-1">Klasifikasi Kerusakan (AI YOLOv8)</span>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary font-bold select-none">warning</span>
                          <span className="text-lg font-bold text-on-surface capitalize">
                            {getAiClassNames(submittedReport)}
                          </span>
                          {submittedReport.ai_confidence !== null && (
                            <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto select-none border border-primary/20">
                              {(submittedReport.ai_confidence * 100).toFixed(0)}% CONFIDENCE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/60">
                        <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-1">Status Laporan</span>
                        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider bg-surface-dim text-on-surface border-outline">
                          {submittedReport.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Location Map & Coordinates */}
                  <div className="space-y-6 flex flex-col">
                    <div className="flex-grow flex flex-col">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-2">Titik Lokasi Jalan</span>
                      <div className="flex-grow bg-surface-container-high rounded-xl overflow-hidden relative border border-outline-variant min-h-[220px] md:min-h-[260px]">
                        <div ref={step3MapContainerRef} className="w-full h-full z-10" />
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-5 rounded-xl border border-outline space-y-3">
                      <div>
                        <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-0.5">Alamat Terdeteksi</span>
                        <p className="text-sm font-semibold text-on-surface leading-tight">
                          {submittedReport.location_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-0.5">Koordinat GPS</span>
                        <p className="text-xs font-mono text-secondary">
                          Lat: {submittedReport.latitude?.toFixed(6)}, Long: {submittedReport.longitude?.toFixed(6)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-outline-variant/60">
                        <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block mb-0.5">Identitas Pengirim</span>
                        <p className="text-xs text-on-surface font-semibold">
                          {submittedReport.reporter_name} ({submittedReport.reporter_email} • {submittedReport.reporter_phone})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-4 border-t border-outline-variant">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3.5 border border-outline text-secondary font-semibold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer text-center font-bold text-sm"
                  >
                    Buat Laporan Baru
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-primary text-on-primary font-semibold py-3.5 rounded-lg hover:bg-opacity-90 transition-opacity shadow-md cursor-pointer text-center font-bold text-sm"
                  >
                    Kembali ke Home
                  </button>
                </div>
              </div>
            )}
          </div>
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
