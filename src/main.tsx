import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-800.css'
import App from './App'
import { initializeAnalytics } from './analytics'
import './styles.css'

const stopAnalytics = initializeAnalytics(import.meta.env.VITE_PERLAS_GA_MEASUREMENT_ID, import.meta.env.BASE_URL)
import.meta.hot?.dispose(stopAnalytics)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
