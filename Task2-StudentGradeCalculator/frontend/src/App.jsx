import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import GradeCalculator from './components/GradeCalculator';
import Features from './components/Features';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const { toasts, dismissToast } = useToast();

  useEffect(() => {
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
  }, []);

  const handleLogoClick = () => {
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
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
          onLogoClick={handleLogoClick}
        />
        
        <main>
          <section id="home"><Hero /></section>
          <div className="divider" />
          <section id="calculator">
            <GradeCalculator />
          </section>
          <div className="divider" />
          <section id="features"><Features /></section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
