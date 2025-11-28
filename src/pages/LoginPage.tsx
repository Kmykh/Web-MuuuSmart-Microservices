import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  InputAdornment,
  Link,
  IconButton,
  CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { keyframes } from '@emotion/react';

// --- ANIMACIONES COMPARTIDAS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const backgroundMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- TEMA UNIFICADO ---
const theme = createTheme({
  palette: {
    primary: { main: '#43a047', dark: '#2e7d32' },
    background: { default: '#f0f4f1' },
    text: { primary: '#2c3e50', secondary: '#607d8b' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Fondo idéntico al Register para transición seamless
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)',
          backgroundSize: '200% 200%',
          animation: `${backgroundMove} 15s ease infinite`,
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glassmorphism
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(46, 125, 50, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              animation: `${fadeIn} 0.5s ease-out`,
            }}
          >
            {/* LOGO */}
            <Box sx={{ mb: 2, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
              <svg width="70" height="70" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" fill="#E8F5E9"/>
                <path d="M60 90C60 70 140 70 140 90V130C140 155 120 160 100 160C80 160 60 155 60 130V90Z" fill="#8D6E63"/>
                <path d="M70 160V170M130 160V170" stroke="#5D4037" strokeWidth="8" strokeLinecap="round"/>
                <path d="M55 70L40 55C35 60 45 80 55 75Z" fill="#5D4037"/>
                <path d="M145 70L160 55C165 60 155 80 145 75Z" fill="#5D4037"/>
                <ellipse cx="100" cy="135" rx="25" ry="15" fill="#FFCCBC"/>
                <circle cx="90" cy="135" r="3" fill="#3E2723"/>
                <circle cx="110" cy="135" r="3" fill="#3E2723"/>
                <circle cx="85" cy="105" r="5" fill="#3E2723"/>
                <circle cx="115" cy="105" r="5" fill="#3E2723"/>
                <path d="M85 95C85 90 95 90 95 95M105 95C105 90 115 90 115 95" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Box>

            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.5 }}>
              Bienvenido
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Ingresa a MuuSmart
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><PersonOutlineIcon color="action" /></InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#e0e0e0' },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  }
                }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: '#e0e0e0' },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  }
                }}
              />

              {error && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(67, 160, 71, 0.5)', transform: 'translateY(-1px)' },
                  transition: 'all 0.2s',
                }}
              >
                Iniciar Sesión
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  ¿No tienes cuenta? Regístrate
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;