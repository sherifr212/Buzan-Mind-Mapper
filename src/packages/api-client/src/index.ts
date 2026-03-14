// API client for BMM backend
// VITE_API_URL is injected by Vite at build time; falls back to localhost for dev/test.
declare const __BMM_API_BASE__: string | undefined;

function getApiBase(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (import.meta as any)?.env;
    if (viteEnv?.VITE_API_URL) return viteEnv.VITE_API_URL as string;
  } catch {
    // not in a Vite context
  }
  try {
    if (typeof __BMM_API_BASE__ !== 'undefined') return __BMM_API_BASE__;
  } catch {
    // not defined
  }
  return 'http://localhost:5000';
}

const API_BASE = getApiBase();

export interface MapRecord {
  id: string;
  title: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiry: string;
}

class BmmApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }
  getToken() {
    return this.token;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async register(email: string, password: string): Promise<AuthTokens> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, password, confirmPassword: password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json() as Promise<AuthTokens>;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json() as Promise<AuthTokens>;
  }

  async getMaps(): Promise<MapRecord[]> {
    const res = await fetch(`${API_BASE}/maps`, { headers: this.headers() });
    if (!res.ok) return [];
    return res.json() as Promise<MapRecord[]>;
  }

  async createMap(title: string, data: string): Promise<MapRecord | null> {
    const res = await fetch(`${API_BASE}/maps`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ title, data }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<MapRecord>;
  }

  async updateMap(id: string, title: string, data: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/maps/${id}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify({ title, data }),
    });
    return res.ok;
  }

  async deleteMap(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/maps/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.ok;
  }
}

export const apiClient = new BmmApiClient();
