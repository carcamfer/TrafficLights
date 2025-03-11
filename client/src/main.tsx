
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import './index.css';
import { Toaster } from './components/ui/toaster';

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="traffic-monitor-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <App />
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
