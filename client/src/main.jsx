import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import UserManger from './Context/UserManger.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserManger>
    <App />
    </UserManger>
  </React.StrictMode>,
)
