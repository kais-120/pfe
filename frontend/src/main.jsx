import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from './components/ui/provider.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProfileProvider } from './Context/useProfile.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
