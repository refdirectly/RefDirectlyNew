const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
    throw new Error('Session expired. Please login again.');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const jobsApi = {
  getAll: async (filters?: { search?: string; type?: string; location?: string; skills?: string }) => {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${API_URL}/jobs?${params}`);
    return handleResponse(response);
  },
  getLive: async (keywords: string = 'software engineer', location: string = 'United States') => {
    const params = new URLSearchParams({ keywords, location });
    const response = await fetch(`${API_URL}/jobs/live?${params}`);
    return handleResponse(response);
  },
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/jobs/${id}`);
    return handleResponse(response);
  },
  create: async (job: any) => {
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(job)
    });
    return handleResponse(response);
  },
  scrapeAndSave: async (keywords: string, location: string) => {
    const response = await fetch(`${API_URL}/jobs/scrape`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ keywords, location })
    });
    return handleResponse(response);
  }
};

export const referralsApi = {
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/referrals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  getBySeeker: async () => {
    const response = await fetch(`${API_URL}/referrals/seeker`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getByReferrer: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_URL}/referrals/referrer${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/referrals/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};

export const aiJobsApi = {
  search: async (query: string) => {
    const response = await fetch(`${API_URL}/ai-jobs/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return handleResponse(response);
  },
  getRecommendations: async (profile: any) => {
    const response = await fetch(`${API_URL}/ai-jobs/recommendations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    return handleResponse(response);
  }
};

export const dashboardApi = {
  getSeeker: async () => {
    const response = await fetch(`${API_URL}/dashboard/seeker`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  getReferrer: async () => {
    const response = await fetch(`${API_URL}/dashboard/referrer`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export const applicationsApi = {
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  getBySeeker: async () => {
    const response = await fetch(`${API_URL}/applications/seeker`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
