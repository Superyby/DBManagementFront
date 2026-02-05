import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 性能监控 - 生产环境启用
// @ts-ignore
if (import.meta.env.PROD) {
  reportWebVitals()
}
