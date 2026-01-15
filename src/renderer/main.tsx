import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { mockApi } from './api/mockApi'

// Initialize API
if (!window.matriarch) {
    console.warn('Electron API not found. Initializing Mock API for browser development.')
    window.matriarch = mockApi
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
