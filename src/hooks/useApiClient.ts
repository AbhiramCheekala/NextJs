
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export class ApiError extends Error {
  constructor(public status: number, public errorJson: unknown) {
    super(`API Error: ${status}`);
  }
}

const useApiClient = () => {
  const router = useRouter();

  const apiClient = useCallback(
    async (url: string, method: string, body?: unknown) => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            router.push('/login');
          }
        }
        const errorBody = await res
          .json()
          .catch(() => ({ error: 'API request failed with no JSON response' }));
        throw new ApiError(res.status, errorBody);
      }
      return res.json();
    },
    [router]
  );

  return apiClient;
};

export default useApiClient;
