import { useState, useEffect } from 'react';
import { SignIn }       from './pages/SignIn';
import { SignUp }       from './pages/SignUp';
import { Dashboard }   from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { isAuthenticated } from './lib/auth';

type Page = 'home' | 'signin' | 'signup' | 'dashboard';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    if (isAuthenticated()) setCurrentPage('dashboard');
  }, []);

  if (currentPage === 'signin') {
    return (
      <SignIn
        onSuccess={()        => setCurrentPage('dashboard')}
        onSwitchToSignUp={()  => setCurrentPage('signup')}
        onBack={()            => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignUp
        onSuccess={()        => setCurrentPage('dashboard')}
        onSwitchToSignIn={()  => setCurrentPage('signin')}
        onBack={()            => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'dashboard') {
    return <Dashboard onSignOut={() => setCurrentPage('home')} />;
  }

  return <LandingPage onNavigate={setCurrentPage} />;
}
