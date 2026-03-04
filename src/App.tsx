import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn }       from './pages/SignIn';
import { SignUp }       from './pages/SignUp';
import { Dashboard }   from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { GoogleCallback } from './pages/GoogleCallback';
import { isAuthenticated } from './lib/auth';

type Page = 'home' | 'signin' | 'signup' | 'dashboard';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>(() => 
    isAuthenticated() ? 'dashboard' : 'home'
  );

  // No useEffect needed - auth check is synchronous

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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}
