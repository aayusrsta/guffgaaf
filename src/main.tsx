import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

const saved = (localStorage.getItem('orbit-theme') as 'light' | 'dark') ?? 'light'
document.documentElement.setAttribute('data-theme', saved)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
