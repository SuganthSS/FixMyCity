/// <reference types="vite/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.tsx';
import App from './App.tsx';
import './i18n';
import './index.css';
import 'leaflet/dist/leaflet.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!googleClientId) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not configured in environment variables. Google OAuth will not work until configured.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
