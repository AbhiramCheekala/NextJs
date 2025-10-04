export const apiRequest = async (
  url: string,
  method: string,
  body?: unknown
) => {
  // Retrieve the token from localStorage on the client-side
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });


  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: "API request failed with no JSON response" }));
    throw new Error(JSON.stringify(errorBody));
  }
  return res.json();
};
