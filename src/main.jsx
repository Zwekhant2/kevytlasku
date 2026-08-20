import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { InvoiceProvider } from './context/InvoiceContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <InvoiceProvider>
        <SettingsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SettingsProvider>
      </InvoiceProvider>
    </BrowserRouter>
  </StrictMode>,
)
