export interface Report {
  id: string; // RF-0001
  internal_id: string; // UUID
  location_name: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'verified' | 'in_progress' | 'repaired' | 'rejected';
  image_url: string;
  ai_confidence: number | null;
  ai_raw_response?: any[] | null;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = 'https://backend-apdd.razik.workers.dev/api';

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fetch all reports for admin with status filtering
export async function getReports(statusFilter?: string): Promise<Report[]> {
  let url = `${API_BASE}/admin/reports?limit=1000`;
  if (statusFilter && statusFilter !== 'All') {
    // Map UI statuses to API status values
    url += `&status=${statusFilter.toLowerCase()}`;
  }
  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    throw new Error('Failed to fetch reports');
  }
  const json = await res.json();
  return json.data;
}

// Fetch details for admin
export async function getAdminReportById(id: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    throw new Error('Report not found');
  }
  const json = await res.json();
  return json.data;
}

// Fetch details for public view
export async function getPublicReportById(id: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) {
    throw new Error('Report not found');
  }
  const json = await res.json();
  return json.data;
}

// Update report status (admin only)
export async function updateReportStatus(id: string, status: Report['status']): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    throw new Error('Failed to update report status');
  }
}

// Delete report (admin only)
export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    throw new Error('Failed to delete report');
  }
}
