import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import StablesPage from './pages/StablesPage';
import CampaignsPage from './pages/CampaignsPage';
import HealthPage from './pages/HealthPage';
import ProductionPage from './pages/ProductionPage';
import ReportsPage from './pages/ReportsPage';
import { useAuth } from './contexts/AuthContext';

// Componente de carga mientras se verifica el token
const LoadingScreen = () => (
  <Box sx={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)',
    gap: 2
  }}>
    <CircularProgress color="success" size={50} />
    <Typography variant="body1" color="text.secondary">
      Verificando sesión...
    </Typography>
  </Box>
);

const App: React.FC = () => {
  const { token, isLoading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica el token
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Rutas Públicas - Siempre accesibles */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
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
      <Route 
        path="/production" 
        element={token ? <ProductionPage /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/reports" 
        element={token ? <ReportsPage /> : <Navigate to="/login" replace />} 
      />
      {/* Añadir más rutas protegidas aquí */}

      {/* Redirección por defecto */}
      <Route
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />
      
      {/* Catch-all para rutas no definidas */}
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} /> 
    </Routes>
  );
};

export default App;