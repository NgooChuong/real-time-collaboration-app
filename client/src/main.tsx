import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import posthog, { PostHogConfig } from 'posthog-js';
import { PostHogProvider } from '@posthog/react';

const queryClient = new QueryClient();
posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  person_profiles: 'identified_only',
  persistence_name: 'posthog_client_id',
  autocapture: false,
  opt_out_capturing_by_default: false,
  cookie_expiration: 365,
  capture_pageview: false,
  persistence: 'localStorage',
  disable_session_recording: false,
  enable_recording_console_log: true,
  session_recording: {
    maskAllInputs: true,
    maskTextSelector: '*',
  },
  debug: false,
  loaded: (ph) => {
    if (process.env.NODE_ENV === 'development') ph.debug();
  },
});
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <PostHogProvider client={posthog}>
      <AuthProvider>
        <HashRouter>
          <SocketProvider>
            <ThemeProvider>
              <App />
              <Toaster />
            </ThemeProvider>
          </SocketProvider>
        </HashRouter>
      </AuthProvider>
    </PostHogProvider>

    <ReactQueryDevtools />
  </QueryClientProvider>,
  // </React.StrictMode>
);
