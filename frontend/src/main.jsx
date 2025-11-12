import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const id = "672585097063-5g5e32qsvdgdt8prqh7av6rd3lp98v47.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={id}>
        <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
