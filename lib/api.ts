import { ExtractedData, Creditor } from '@/types';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; 

// Helper function to get access token from localStorage (for cross-origin support)
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

// Helper function to make authenticated requests with FormData
async function apiRequestWithFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {};
  
  // Add Authorization header if token exists (for cross-origin support)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Sending request with Authorization header to:', endpoint);
  } else {
    console.warn('⚠️ No token available for request to:', endpoint);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include', // Important for cookies
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: formData,
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

export const extractReceiptData = async (imageFile: File, creditors: Creditor[] = []): Promise<ExtractedData> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (creditors.length > 0) {
    formData.append('creditors', JSON.stringify(creditors));
  }
  return apiRequestWithFormData<ExtractedData>('/extract-receipt', formData);
};

export const extractCreditorInfo = async (imageFile: File): Promise<{ name: string, account: string, sheba: string }> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return apiRequestWithFormData<{ name: string, account: string, sheba: string }>('/extract-creditor', formData);
};

