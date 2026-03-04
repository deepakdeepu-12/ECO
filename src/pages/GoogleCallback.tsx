import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google authentication error:', error);
      navigate('/signin?error=Google authentication failed. Please try again.');
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Fetch user profile to update context
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect to dashboard
            navigate('/dashboard');
          } else {
            throw new Error('Failed to fetch user profile');
          }
        })
        .catch((err) => {
          console.error('Profile fetch error:', err);
          navigate('/signin?error=Authentication failed. Please try again.');
        });
    } else {
      // No token or error, redirect to signin
      navigate('/signin?error=Authentication failed. Please try again.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
