// Simulated Backend Authentication Service
// In production, this would connect to a real backend server

interface User {
  id: string;
  email: string;
  name: string;
  greenPoints: number;
  totalRecycled: number;
  carbonSaved: number;
  joinedDate: string;
  avatar?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Simulated user database
const usersDB: Map<string, { user: User; password: string }> = new Map();

// Initialize with a demo user
usersDB.set('demo@ecosync.com', {
  user: {
    id: 'user_001',
    email: 'demo@ecosync.com',
    name: 'Demo User',
    greenPoints: 2450,
    totalRecycled: 156,
    carbonSaved: 89.5,
    joinedDate: '2024-01-15',
  },
  password: 'demo123'
});

// Generate unique ID
const generateId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

// Generate JWT-like token (simulated)
const generateToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ 
    userId, 
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }));
  const signature = btoa(userId + Date.now().toString());
  return `${header}.${payload}.${signature}`;
};

// Validate token
export const validateToken = (token: string): { valid: boolean; userId?: string } => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return { valid: false };
    
    return { valid: true, userId: payload.userId };
  } catch {
    return { valid: false };
  }
};

// Sign In
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const userRecord = usersDB.get(email.toLowerCase());
  
  if (!userRecord) {
    return {
      success: false,
      message: 'No account found with this email address'
    };
  }
  
  if (userRecord.password !== password) {
    return {
      success: false,
      message: 'Incorrect password. Please try again.'
    };
  }
  
  const token = generateToken(userRecord.user.id);
  
  // Store token in localStorage
  localStorage.setItem('ecosync_token', token);
  localStorage.setItem('ecosync_user', JSON.stringify(userRecord.user));
  
  return {
    success: true,
    message: 'Sign in successful!',
    user: userRecord.user,
    token
  };
};

// Sign Up
export const signUp = async (
  name: string, 
  email: string, 
  password: string
): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (usersDB.has(email.toLowerCase())) {
    return {
      success: false,
      message: 'An account with this email already exists'
    };
  }
  
  if (password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  const newUser: User = {
    id: generateId(),
    email: email.toLowerCase(),
    name,
    greenPoints: 100, // Welcome bonus
    totalRecycled: 0,
    carbonSaved: 0,
    joinedDate: new Date().toISOString().split('T')[0],
  };
  
  usersDB.set(email.toLowerCase(), {
    user: newUser,
    password
  });
  
  const token = generateToken(newUser.id);
  
  localStorage.setItem('ecosync_token', token);
  localStorage.setItem('ecosync_user', JSON.stringify(newUser));
  
  return {
    success: true,
    message: 'Account created successfully! Welcome to EcoSync!',
    user: newUser,
    token
  };
};

// Sign Out
export const signOut = (): void => {
  localStorage.removeItem('ecosync_token');
  localStorage.removeItem('ecosync_user');
};

// Get Current User
export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem('ecosync_token');
  const userStr = localStorage.getItem('ecosync_user');
  
  if (!token || !userStr) return null;
  
  const { valid } = validateToken(token);
  if (!valid) {
    signOut();
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ecosync_token');
  if (!token) return false;
  
  const { valid } = validateToken(token);
  return valid;
};

// Update user stats (for demo purposes)
export const updateUserStats = (stats: Partial<User>): void => {
  const user = getCurrentUser();
  if (user) {
    const updatedUser = { ...user, ...stats };
    localStorage.setItem('ecosync_user', JSON.stringify(updatedUser));
  }
};

export type { User, AuthResponse };
