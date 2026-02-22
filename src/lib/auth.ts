// ─── EcoSync Auth Library ─────────────────────────────────────────────────────
// All auth calls go to the Express backend.
// JWT is stored in localStorage as "ecosync_token".
// User profile is cached in localStorage as "ecosync_user" for fast reads.

const API_BASE = 'http://localhost:3001/api/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  greenPoints: number;
  totalRecycled: number;
  carbonSaved: number;
  level: string;
  avatar?: string;
  joinedDate: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const setSession = (token: string, user: User): void => {
  localStorage.setItem('ecosync_token', token);
  localStorage.setItem('ecosync_user', JSON.stringify(user));
};

const clearSession = (): void => {
  localStorage.removeItem('ecosync_token');
  localStorage.removeItem('ecosync_user');
};

// ─── Register ─────────────────────────────────────────────────────────────────
// Creates account and sends OTP to email.
// On success, requiresVerification=true — redirect to OTP screen.

export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    return data;
  } catch {
    return { success: false, message: 'Cannot connect to server. Is the backend running?' };
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
// Validates the 6-digit code. On success, stores JWT + user and returns token.

export const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (data.success && data.token && data.user) {
      setSession(data.token, data.user);
    }

    return data;
  } catch {
    return { success: false, message: 'Cannot connect to server. Is the backend running?' };
  }
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export const resendOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
};

// ─── Sign In ──────────────────────────────────────────────────────────────────
// Authenticates credentials, stores JWT + user on success.

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.token && data.user) {
      setSession(data.token, data.user);
    }

    return data;
  } catch {
    return { success: false, message: 'Cannot connect to server. Is the backend running?' };
  }
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export const signOut = (): void => {
  clearSession();
};

// ─── Get Current User (from localStorage cache) ───────────────────────────────
// Fast synchronous read — no network call.

export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem('ecosync_token');
    const userStr = localStorage.getItem('ecosync_user');
    if (!token || !userStr) return null;
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

// ─── Is Authenticated ─────────────────────────────────────────────────────────
// Returns true if a JWT exists in localStorage.
// Note: does NOT re-validate the token against the server — use /api/auth/profile for that.

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('ecosync_token');
};

// ─── Get Auth Header ──────────────────────────────────────────────────────────
// Returns the Authorization header object for authenticated fetch calls.

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('ecosync_token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
};

// ─── Fetch Protected Profile ──────────────────────────────────────────────────
// Hits the backend to re-validate token & return fresh user data.

export const fetchProfile = async (): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (data.success && data.user) {
      // Refresh local cache
      const token = localStorage.getItem('ecosync_token');
      if (token) setSession(token, data.user);
    } else if (res.status === 401) {
      clearSession();
    }

    return data;
  } catch {
    return { success: false, message: 'Cannot connect to server.' };
  }
};

// ─── Update User Stats (local cache only) ────────────────────────────────────
// Used by WasteScanner / Dashboard to update points without a full re-fetch.

export const updateUserStats = (stats: Partial<User>): void => {
  const user = getCurrentUser();
  if (user) {
    const updated = { ...user, ...stats };
    localStorage.setItem('ecosync_user', JSON.stringify(updated));
  }
};
