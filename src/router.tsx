import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ImmersiveLayout } from './components/layout/ImmersiveLayout';
import { DashboardBold } from './pages/DashboardBold';
import { AddConnection } from './pages/AddConnection';
import { Monitor } from './pages/Monitor';
import { Settings } from './pages/Settings';
import AiQuery from './pages/AiQuery';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ImmersiveLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardBold />,
      },
      {
        path: 'dashboard/:id',
        element: <DashboardBold />,
      },
      {
        path: 'connections',
        element: <DashboardBold />,
      },
      {
        path: 'add',
        element: <AddConnection />,
      },
      {
        path: 'monitor',
        element: <Monitor />,
      },
      {
        path: 'monitor/:id',
        element: <Monitor />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'ai',
        element: <AiQuery />,
      },
    ],
  },
]);
