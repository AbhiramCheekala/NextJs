export const apiRequest = async (
  url: string,
  method: string,
  body?: any,
  token?: string
) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error("API error");
  return res.json();
};
