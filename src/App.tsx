import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import StablesPage from './pages/StablesPage';
import CampaignsPage from './pages/CampaignsPage';
import HealthPage from './pages/HealthPage';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Rutas Públicas/Autenticación */}
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Rutas Protegidas */}
      <Route 
        path="/dashboard" 
        element={token ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/animals" 
        element={token ? <AnimalsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/stables" 
        element={token ? <StablesPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/campaigns" 
        element={token ? <CampaignsPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/health" 
        element={token ? <HealthPage /> : <Navigate to="/login" replace />} 
      />
      {/* Añadir más rutas protegidas aquí (Production, Reports) */}

      {/* Redirección por defecto */}
      <Route
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />
      
      {/* Catch-all para rutas no definidas */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
    </Routes>
  );
};

export default App;