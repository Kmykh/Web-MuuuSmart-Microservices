import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import StablesPage from './pages/StablesPage';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
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
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;