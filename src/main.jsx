import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'

// Design system — load in cascade order: tokens → reset → type → surfaces
// → controls. Zone + legacy page styles last so they can build on the system.
import './styles/tokens.css'
import './styles/globals.css'
import './styles/typography.css'
import './styles/glass.css'
import './styles/buttons.css'
import './styles/forms.css'
import './styles/pills.css'
import './styles/zones.css'
import './styles/public.css'
import './styles/blueprint.css'
import './styles/pages.css'
import './styles/dashboard.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
