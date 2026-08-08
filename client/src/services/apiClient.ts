const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
  };
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(path: string, token?: string) {
  return apiRequest<T>(path, { method: 'GET', token });
}

export async function apiPost<T>(path: string, body?: unknown, token?: string) {
  return apiRequest<T>(path, { method: 'POST', body, token });
}

async function apiRequest<T>(path: string, options: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  window.dispatchEvent(new CustomEvent('careerquest:api-loading', { detail: { delta: 1 } }));

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('Không kết nối được backend. Đang dùng dữ liệu local tạm thời.', 0, 'NETWORK_ERROR');
  } finally {
    window.dispatchEvent(new CustomEvent('careerquest:api-loading', { detail: { delta: -1 } }));
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json();
  } catch {
    throw new ApiError('Backend trả về dữ liệu không hợp lệ.', response.status, 'INVALID_JSON');
  }

  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      envelope.message || 'Backend không xử lý được yêu cầu.',
      response.status,
      envelope.error?.code || 'API_ERROR',
    );
  }

  return envelope.data as T;
}
