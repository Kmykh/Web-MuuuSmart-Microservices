import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  IconButton,
  Avatar,
  Chip,
  CssBaseline,
  Tooltip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

// --- ICONOS ---
import LogoutIcon from '@mui/icons-material/Logout';
import TimerIcon from '@mui/icons-material/Timer';
import GridViewIcon from '@mui/icons-material/GridView'; // Dashboard
import PetsIcon from '@mui/icons-material/Pets'; // Animales
import HouseSidingIcon from '@mui/icons-material/HouseSiding'; // Establos
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'; // Salud
import WaterDropIcon from '@mui/icons-material/WaterDrop'; // Producción
import FlagIcon from '@mui/icons-material/Flag'; // Campañas
import BarChartIcon from '@mui/icons-material/BarChart'; // Reportes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // IA
import ConstructionIcon from '@mui/icons-material/Construction'; // Icono de construcción

// Keyframes
import { keyframes } from '@emotion/react';

const backgroundMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(105, 240, 174, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(105, 240, 174, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(105, 240, 174, 0); }
`;

// --- TEMA ---
const theme = createTheme({
  palette: {
    primary: { main: '#43a047', dark: '#2e7d32' },
    background: { default: '#f0f4f1' },
    text: { primary: '#2c3e50', secondary: '#607d8b' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 16 },
});

// --- LISTA DE MÓDULOS DEL MENÚ ---
const MENU_ITEMS = [
  { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
  { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
  { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' },
  { text: 'Salud', icon: <LocalHospitalIcon />, path: '/health' },
  { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
  { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
  { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

const DashboardPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState<string>('Usuario');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0); // Estado para controlar qué menú está activo

  // Lógica de Token y Timer (Igual que antes)
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const name = payload.sub || payload.username || payload.name || 'Ganadero';
      setUsername(name);
      if (payload.exp) {
        const updateTimer = () => {
          const remaining = (payload.exp * 1000) - Date.now();
          if (remaining <= 0) handleLogout();
          else setTimeLeft(remaining);
        };
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);
      }
    } catch (error) { logout(); }
  }, [token]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* LAYOUT PRINCIPAL */}
      <Box sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)',
          backgroundSize: '200% 200%',
          animation: `${backgroundMove} 15s ease infinite`,
          overflow: 'hidden'
      }}>
        
        {/* --- BARRA LATERAL FLOTANTE (Menú) --- */}
        <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, zIndex: 10 }}>
          <Paper
            elevation={0}
            sx={{
              width: '60px',
              height: '90%',
              borderRadius: '30px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 2,
              gap: 1,
              boxShadow: '0 8px 32px rgba(46, 125, 50, 0.05)',
            }}
          >

            {/* Items del Menú */}
            <List sx={{ width: '100%', px: 1 }}>
              {MENU_ITEMS.map((item, index) => (
                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                  <ListItemButton
                    selected={selectedIndex === index}
                    onClick={() => {
                      setSelectedIndex(index);
                      navigate(item.path);
                    }}
                    sx={{
                      justifyContent: 'center',
                      borderRadius: '50%',
                      height: '46px',
                      width: '46px',
                      minWidth: 0,
                      mb: 1,
                      color: selectedIndex === index ? 'primary.main' : 'text.secondary',
                      bgcolor: selectedIndex === index ? 'rgba(67, 160, 71, 0.1)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(67, 160, 71, 0.05)' },
                      transition: 'all 0.3s'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ))}

              <Divider sx={{ my: 1, width: '80%', mx: 'auto' }} />

              {/* Módulo Especial IA */}
              <Tooltip title="MuuAI (Inteligencia Artificial)" placement="right" arrow>
                <ListItemButton
                  sx={{
                    justifyContent: 'center',
                    borderRadius: '50%',
                    height: '46px',
                    width: '46px',
                    minWidth: 0,
                    mt: 1,
                    color: '#fff',
                    background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                    animation: `${pulse} 2s infinite`,
                    '&:hover': { background: 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}><AutoAwesomeIcon /></ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </List>
          </Paper>
        </Box>

        {/* --- CONTENIDO CENTRAL --- */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          
          {/* Top Bar (Sin Hamburguesa, solo Info) */}
          <AppBar 
            position="static" 
            elevation={0} 
            sx={{ 
              backgroundColor: 'transparent', 
              color: 'text.primary',
              pt: 2,
              px: 3
            }}
          >
            <Toolbar sx={{ 
                justifyContent: 'space-between', 
                backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(10px)', 
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}>
              
              <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                {MENU_ITEMS[selectedIndex].text}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {timeLeft !== null && (
                  <Chip
                    icon={<TimerIcon />}
                    label={formatTime(timeLeft)}
                    variant="outlined"
                    color={timeLeft < 60000 ? "error" : "default"}
                    sx={{ fontWeight: 'bold', borderColor: 'transparent', bgcolor: 'rgba(255,255,255,0.5)' }}
                  />
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.5)', p: 0.5, borderRadius: 8, pr: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.9rem' }}>
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{username}</Typography>
                </Box>

                <Tooltip title="Cerrar Sesión">
                  <IconButton onClick={handleLogout} sx={{ color: '#ef5350', bgcolor: 'rgba(239, 83, 80, 0.1)', '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.2)' } }}>
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Área de Trabajo (Vacia / En Desarrollo) */}
          <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(5px)',
                border: '1px dashed rgba(67, 160, 71, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ textAlign: 'center', opacity: 0.7, maxWidth: '500px', p: 4 }}>
                <Box 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: '#e8f5e9', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <ConstructionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                
                <Typography variant="h4" color="primary.dark" gutterBottom fontWeight="bold">
                  Trabajando en desarrollo
                </Typography>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Actividad Reciente en proceso
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Estamos construyendo el módulo de <strong>{MENU_ITEMS[selectedIndex].text}</strong> para brindarte la mejor experiencia de gestión. Pronto verás aquí toda tu información.
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardPage;