import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UpSoftworksLanding from './UpSoftworksLanding.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UpSoftworksLanding />
  </StrictMode>,
)
