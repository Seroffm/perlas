import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-800.css'
import { initializeAnalytics } from './analytics'
import { loadRouteContent } from 'virtual:perlas-route-content'
import { getPagePath } from './route-path'
import './QuickContactForm.css'
import './site-footer.css'
import './service-guides.css'
import './inquiry-options.css'
import './local-landings.css'
import './frankfurt-landing.css'
import './commercial-landings.css'
import './focused-services.css'
import './focused-offer-links.css'
import './styles.css'

const stopAnalytics = initializeAnalytics(import.meta.env.VITE_PERLAS_GA_MEASUREMENT_ID, import.meta.env.BASE_URL)
import.meta.hot?.dispose(stopAnalytics)

async function startPage() {
  const element = document.getElementById('root')
  if (!element) return
  const path = getPagePath(window.location.pathname, import.meta.env.BASE_URL)
  // Keep useful static HTML in place while code, route data and its view load.
  const [app, content] = await Promise.all([import('./App'), loadRouteContent(path)])
  await app.prepareRouteComponents(content)
  const App = app.default
  ReactDOM.createRoot(element).render(
    <React.StrictMode>
      <App content={content} />
    </React.StrictMode>,
  )
}

void startPage().catch(() => {
  // Production HTML remains readable if an optional interactive download fails.
  const element = document.getElementById('root')
  if (element && !element.hasChildNodes()) {
    element.innerHTML = '<main class="container section"><h1>Perla’s Objektbetreuung</h1><p>Die interaktiven Funktionen konnten nicht geladen werden. Sie erreichen uns unter <a href="tel:+491776867145">0177 68 67 145</a> oder <a href="mailto:mail@perlas.de">mail@perlas.de</a>.</p></main>'
  }
  console.error('Die interaktiven Funktionen konnten nicht geladen werden; vorhandene Seiteninhalte bleiben verfügbar.')
})
