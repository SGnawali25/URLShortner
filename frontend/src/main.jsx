import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const id = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;
console.log("Google Client ID:", id);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={id}>
        <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
