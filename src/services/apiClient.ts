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

  const rawText = await response.text();
  let json: Partial<ApiResponse<T>> | null = null;

  if (rawText) {
    try {
      json = JSON.parse(rawText) as Partial<ApiResponse<T>>;
    } catch {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
  }

  if (!response.ok) {
    throw new Error(json?.message || rawText || `API request failed: ${response.status}`);
  }

  if (!json?.success) {
    throw new Error(json?.message || `API request failed: ${response.status}`);
  }

  return json.data as T;
}
