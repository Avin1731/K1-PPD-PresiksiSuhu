import type { ApiErrorResponse } from '../types/prediction';

export class HttpApiError extends Error {
  status: number;
  code: string;
  details?: ApiErrorResponse['error']['details'];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ApiErrorResponse['error']['details']
  ) {
    super(message);
    this.name = 'HttpApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const url = `${normalizedBase}${path}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await response.json() : null;

    if (!response.ok) {
      const apiErr = (body as ApiErrorResponse | null)?.error;
      throw new HttpApiError(
        response.status,
        apiErr?.code ?? `HTTP_${response.status}`,
        apiErr?.message ?? `Permintaan ke ${path} gagal dengan status ${response.status}.`,
        apiErr?.details
      );
    }

    return body as T;
  } catch (err) {
    if (err instanceof HttpApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new HttpApiError(
        408,
        'REQUEST_TIMEOUT',
        'Koneksi ke server backend melebihi batas waktu.'
      );
    }
    throw new HttpApiError(
      0,
      'NETWORK_ERROR',
      'Tidak dapat terhubung ke server backend. Pastikan server Flask berjalan atau gunakan Mode Simulasi FE.'
    );
  } finally {
    window.clearTimeout(timer);
  }
}
