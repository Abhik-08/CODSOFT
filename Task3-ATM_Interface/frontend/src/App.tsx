import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
