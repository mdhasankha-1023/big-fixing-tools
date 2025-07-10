import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MessageFixer from './MessageFixer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MessageFixer/>
  </StrictMode>,
)
