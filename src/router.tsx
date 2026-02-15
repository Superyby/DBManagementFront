import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddConnection } from './pages/AddConnection';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'dashboard/:id',
        element: <Dashboard />,
      },
      {
        path: 'connections',
        element: <Dashboard />,
      },
      {
        path: 'add',
        element: <AddConnection />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);
