export interface AdminNote {
  text: string;
  author: string;
  date: string;
}

export interface Report {
  id: string;
  type: 'Pothole' | 'Manhole' | 'Crack';
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'Reported' | 'In Progress' | 'Resolved';
  date: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  notes?: string;
  imageUrl: string;
  severity: 'Low' | 'Medium' | 'High';
  estimatedSize?: string;
  adminNotes: AdminNote[];
}

const DEFAULT_REPORTS: Report[] = [
  {
    id: '#RF-9821',
    type: 'Pothole',
    location: 'Jl. Gatot Subroto No. 12, Jakarta Selatan',
    coordinates: { lat: -6.2297, lng: 106.8295 },
    status: 'Reported',
    date: 'Oct 24, 2024 • 14:32',
    reporterName: 'Budi Pratama',
    reporterEmail: 'budi.pratama@email.com',
    reporterPhone: '+62 812-3456-7890',
    notes: 'Severe damage on the left lane. Requires immediate fix.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBN_YqLEgRuFpG36PELyLz4C9H52n85wvy6RAiAQF5_SbXUU4E2NCyAKlsRgnux3CoOT6pjH4YraLtM_YIs1dG01FRi4-z1kO-v-OvaDirtHRq-Xu15OUQ5qmpMTHdBykhNcPBGQu0Jsun_WHonWBUE1pZ-hN2gXzte7EFAPhVv4MSnidMoaYVBcG5p-KClEgotCdcgE2lXpXw0TrWmLHV0xUbUElPkfinM3BSIaKNGlVyVAiDmYJ56HdSzyb8wPzeKnMIfHCrV_C00',
    severity: 'High',
    estimatedSize: '~45cm Diameter • 12cm Depth',
    adminNotes: [
      {
        text: 'Segera kirim tim survei lokasi untuk verifikasi kedalaman lubang. Area lalu lintas padat.',
        author: 'Admin Siti',
        date: '1 hour ago'
      }
    ]
  },
  {
    id: '#RF-9819',
    type: 'Manhole',
    location: 'West Wacker Drive',
    coordinates: { lat: -6.2088, lng: 106.8456 },
    status: 'In Progress',
    date: 'Oct 24, 2023 • 09:15',
    reporterName: 'Andi Wijaya',
    reporterEmail: 'andi.wijaya@email.com',
    reporterPhone: '+62 813-9876-5432',
    notes: 'Manhole cover is loose and noisy when cars drive over it.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpXcFaXQaN5RPBYpqPGrPsl6VaHS9iH1GHn5284pIz87lZh1N4g8f5tJnv64Z_0-rETyFr-8nPC4Wffmk2HLKwo6S3Rv21FRbHNTzunuVmD8cM8jV40C6H6DgvKEIqHZa1awoc3iyGQroLS9yRSJD4I7Riq5KF6GYgVY0I4mPSveo0Pcf7fS2Qpp8SrITfvl8e1a3l-AhchqNTqQv5Pqxlfy0xNpiqadsF0qswq6z2ZL3G_7MZXkk5qFRwweLQAgPZSLgZLcSHdVsB',
    severity: 'Medium',
    estimatedSize: '~60cm Diameter',
    adminNotes: []
  },
  {
    id: '#RF-9815',
    type: 'Crack',
    location: 'South LaSalle St',
    coordinates: { lat: -6.2115, lng: 106.8322 },
    status: 'Resolved',
    date: 'Oct 23, 2023 • 16:45',
    reporterName: 'Dewi Lestari',
    reporterEmail: 'dewi.lestari@email.com',
    reporterPhone: '+62 811-2233-4455',
    notes: 'Long cracks developing along the road shoulder.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVn_hz9FU18u8MjimPejeQy3v00Z0r1KbNvxHXpxKaRUpVk-WoSq3ofleodLZAfmuRh2J9rRC8xMHSO5HFii6fmYSX1dXjV5r_4ezl5H3oQnWFrGZbZxKVLJzJ8R32BCOKFWCA2g-VaTT1s80dUYQlS0FQKoCpWsc5kDOn3gtXVAqfLhcP1zkEI-yN6JIHW4vSt2X4cGAqFor_4BdwXg51atfgUzZx1Llk_0Fv1xs73bcwqQbTlA6JyZARQHUVcmkQyyrkAOex2fi',
    severity: 'Low',
    estimatedSize: '~120cm Length • 2cm Width',
    adminNotes: []
  }
];

export function getReports(): Report[] {
  const reportsJson = localStorage.getItem('bros_reports');
  if (!reportsJson) {
    localStorage.setItem('bros_reports', JSON.stringify(DEFAULT_REPORTS));
    return DEFAULT_REPORTS;
  }
  try {
    return JSON.parse(reportsJson);
  } catch (e) {
    console.error('Failed to parse reports from localStorage', e);
    return DEFAULT_REPORTS;
  }
}

export function saveReports(reports: Report[]): void {
  localStorage.setItem('bros_reports', JSON.stringify(reports));
}

export function addReport(newReport: Omit<Report, 'id' | 'date' | 'adminNotes'>): Report {
  const reports = getReports();
  const idNum = Math.floor(1000 + Math.random() * 9000);
  const id = `#RF-${idNum}`;
  
  // Format current date
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} • ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const report: Report = {
    ...newReport,
    id,
    date: dateStr,
    adminNotes: []
  };
  
  reports.unshift(report);
  saveReports(reports);
  return report;
}

export function updateReportStatus(id: string, status: Report['status']): Report | undefined {
  const reports = getReports();
  const reportIndex = reports.findIndex(r => r.id === id);
  if (reportIndex !== -1) {
    reports[reportIndex].status = status;
    saveReports(reports);
    return reports[reportIndex];
  }
  return undefined;
}

export function addAdminNote(id: string, text: string, author: string): Report | undefined {
  const reports = getReports();
  const reportIndex = reports.findIndex(r => r.id === id);
  if (reportIndex !== -1) {
    const note: AdminNote = {
      text,
      author,
      date: 'Just now'
    };
    reports[reportIndex].adminNotes.push(note);
    saveReports(reports);
    return reports[reportIndex];
  }
  return undefined;
}
