import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GradeCalculator from './components/GradeCalculator';
import Features from './components/Features';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { apiService } from './utils/apiService';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [user, setUser] = useState(apiService.getCurrentUser());
  const [view, setView] = useState(apiService.isAuthenticated() ? 'main' : 'login'); // Route protection
  const [authAlert, setAuthAlert] = useState('');
  const { toasts, showToast, dismissToast } = useToast();
  const isAuth = apiService.isAuthenticated();
  let activeView = 'login';
  if (isAuth) {
    activeView = view;
  } else if (view === 'register') {
    activeView = 'register';
  }

  useEffect(() => {
    const handleAuthState = () => {
      const loggedIn = apiService.isAuthenticated();
      setUser(apiService.getCurrentUser());
      if (loggedIn) {
        setView('main'); // Redirect automatically after login / register!
      } else {
        setView('login'); // Redirect to login after logout!
      }
    };
    const handleExpired = () => {
      setUser(null);
      setAuthAlert('Your session has expired. Please sign in again.');
      setView('login');
    };
    const handleStorageChange = (e) => {
      if (e.key === 'gradeiq_jwt_token') {
        handleAuthState();
      }
    };

    globalThis.addEventListener('auth-state-change', handleAuthState);
    globalThis.addEventListener('auth-expired', handleExpired);
    globalThis.addEventListener('storage', handleStorageChange);

    return () => {
      globalThis.removeEventListener('auth-state-change', handleAuthState);
      globalThis.removeEventListener('auth-expired', handleExpired);
      globalThis.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Only observe sections if we are in the main view
    if (activeView !== 'main') return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id || 'home');
          }
        });
      },
      { threshold: 0.3 }
    );
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [activeView]);

  const handleOpenAuth = (mode = 'login', prompt = '') => {
    setAuthAlert(prompt);
    setView(mode);
  };

  const handleSignOut = () => {
    const username = user?.username || 'User';
    apiService.logout();
    setUser(null);
    setView('login'); // Redirect to login after logout!
    showToast(`Goodbye, ${username}! You've been signed out.`, 'success', 4000);
  };

  const handleLogoClick = () => {
    if (!apiService.isAuthenticated()) return; // Route protection check
    setView('main');
    setTimeout(() => {
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="app-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      <ParticleBackground />
      <div style={{ background: 'var(--gradient-bg)', position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Global toast notifications */}
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <Navbar 
          activeSection={activeSection} 
          user={user} 
          onOpenAuth={handleOpenAuth} 
          onSignOut={handleSignOut} 
          onLogoClick={handleLogoClick}
        />
        
        <main>
          {activeView === 'main' ? (
            <>
              <section id="home"><Hero /></section>
              <div className="divider" />
              <section id="calculator">
                <GradeCalculator 
                  user={user} 
                  onTriggerAuth={(msg) => handleOpenAuth('login', msg)} 
                />
              </section>
              <div className="divider" />
              <section id="features"><Features /></section>
              <div className="divider" />
              <section id="about"><AboutSection /></section>
            </>
          ) : (
            <AuthPage 
              currentMode={activeView} 
              onNavigate={(newMode) => { setView(newMode); setAuthAlert(''); }} 
              onSuccess={() => setView('main')} 
              initialAlert={authAlert}
              canGoBack={!!user}
            />
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
