import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Reunião CliqFast: Onest no texto e Sora nos títulos, servidas pelo próprio Meet.
import '@fontsource-variable/onest'
import '@fontsource-variable/sora'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
