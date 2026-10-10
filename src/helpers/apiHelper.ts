const TOKEN_KEY = "accessToken";

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
}

export interface ApiOptions {
  method: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T = any>(path: string, options: ApiOptions): Promise<ApiResponse<T>> {
  const { method, query, body } = options;
  const url = new URL(`${DELCOM_BASEURL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined = body as BodyInit | undefined;
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), { method, headers, body: payload });

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    json = { status: "fail", message: "Respons server tidak valid" };
  }

  if (json.status !== "success") {
    const error: Error & { data?: unknown } = new Error(json.message);
    error.data = json.data;
    throw error;
  }

  return json;
}

export const apiGet = <T = any>(path: string, query?: ApiOptions["query"]) =>
  apiFetch<T>(path, { method: "GET", query });
export const apiPost = <T = any>(path: string, body?: unknown) => apiFetch<T>(path, { method: "POST", body });
export const apiPut = <T = any>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body });
export const apiDelete = <T = any>(path: string) => apiFetch<T>(path, { method: "DELETE" });
