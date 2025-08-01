import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'virtual:uno.css'
import './index.css'
import '@unocss/reset/normalize.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)