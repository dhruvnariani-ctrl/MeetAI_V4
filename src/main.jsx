import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/instrument-serif/400.css'
import './index.css'
import Theme from './Theme'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={Theme}>
      <CssBaseline />
      <BrowserRouter basename='/MeetAI_V4'>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)