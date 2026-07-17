import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('c0d93be9fffa7e3a42ec4b4ae5f9f01b', { autocapture: false });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
