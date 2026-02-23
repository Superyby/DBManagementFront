import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'oppo-sans-4'
import './styles/globals.css'
import { router } from './router'
import { NotificationProvider } from './components/effects/Notification'
import reportWebVitals from './reportWebVitals'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  </React.StrictMode>,
)

// 性能监控 - 生产环境启用
// @ts-ignore
if (import.meta.env.PROD) {
  reportWebVitals()
}
