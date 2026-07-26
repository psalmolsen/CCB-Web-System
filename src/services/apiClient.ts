export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export async function fetchApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });

  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.message || `API request failed: ${response.status}`);
  }
  return json.data as T;
}
