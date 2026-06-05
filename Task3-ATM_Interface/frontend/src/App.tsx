import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="noise-overlay" />
        <div className="grid-overlay" />
        {/* Animated ambient light blobs */}
        <div className="ambient-blob animate-blob-1 bg-[#5e6ad2]/10 dark:bg-[#5e6ad2]/15 w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] top-[-10%] left-[20%] blur-[120px]" />
        <div className="ambient-blob animate-blob-2 bg-purple-500/5 dark:bg-purple-500/10 w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bottom-[-10%] right-[10%] blur-[100px]" />
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            // Premium styled notifications matching dark/light modes
            className: 'glass-panel text-[13px] font-medium border border-dark-border/20 light:border-light-border/45 text-dark-text light:text-light-text rounded-2xl px-5 py-3.5',
            style: {
              background: 'rgba(15, 15, 18, 0.9)',
              color: '#f4f4f6',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#030303',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#030303',
              },
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
