import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; 

// Helper function to get access token from localStorage (for cross-origin support)
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn('No access token found in localStorage');
  }
  return token;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Add Authorization header if token exists (for cross-origin support)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Sending request with Authorization header to:', endpoint);
  } else {
    console.warn('⚠️ No token available for request to:', endpoint);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Important for cookies
    headers,
  });

  // Handle 401 - Show error but don't redirect automatically
  if (response.status === 401 && endpoint !== '/auth/login') {
    const error = await response.json().catch(() => ({ message: 'دسترسی غیرمجاز. لطفاً وارد شوید.' }));
    const errorMessage = error.message || 'دسترسی غیرمجاز. لطفاً وارد شوید.';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'خطا در ارتباط با سرور' }));
    const errorMessage = error.message || 'خطا در ارتباط با سرور';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function login(username: string, password: string) {
  return apiRequest<{ success: boolean; user: { id: string; username: string }; token?: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiRequest<{ success: boolean; message: string }>('/auth/logout', {
    method: 'POST',
  });
}

// Removed refreshToken - no longer needed
// Removed getCurrentUser - we use login response instead
// Authentication is checked via cookies automatically

