import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Container, Paper, IconButton, Avatar, Chip,
  CssBaseline, Tooltip, List, ListItemButton, ListItemIcon, Divider, Grid, Card, CardContent,
  TextField, Button, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, Fade, Slide
} from '@mui/material';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { keyframes } from '@emotion/react';

// --- ICONOS ---
import {
  Logout as LogoutIcon, GridView as GridViewIcon, Pets as PetsIcon,
  HouseSiding as HouseSidingIcon, LocalHospital as LocalHospitalIcon,
  WaterDrop as WaterDropIcon, Flag as FlagIcon, BarChart as BarChartIcon,
  Send as SendIcon, TrendingUp as TrendingUpIcon, WarningAmber as WarningIcon,
  CheckCircle as CheckIcon, Info as InfoIcon, AutoAwesome as SparkleIcon,
  TipsAndUpdates as IdeaIcon, Close as CloseIcon, Security as SecurityIcon,
  PlayArrow as PlayIcon, NavigateNext as NextIcon, NavigateBefore as BackIcon
} from '@mui/icons-material';

// Imports de Lógica
import { getAllAnimalsAction } from '../application/animal';
import { getAllStablesAction } from '../application/stable';
import { sendChatMessageAction } from '../application/assistant';

// Assets
import vacaSanaImg from '../assets/vaca_sana.png';
import bienvenidaVideo from '../assets/bienveenidamorita.mp4';

// --- ANIMACIONES ---
const backgroundMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.2); }
  50% { box-shadow: 0 0 50px rgba(255, 152, 0, 0.6); }
  100% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.2); }
`;

// --- TEMA UNIFICADO ---
const theme = createTheme({
  palette: {
    primary: { main: '#43a047', dark: '#2e7d32' },
    secondary: { main: '#0288d1' },
    error: { main: '#e53935' },
    warning: { main: '#ed6c02' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#37474f', secondary: '#78909c' },
  },
  typography: { fontFamily: '"Poppins", "Roboto", sans-serif' },
  shape: { borderRadius: 20 },
  components: {
    MuiCard: {
        styleOverrides: {
            root: { borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }
        }
    },
    MuiButton: {
        styleOverrides: {
            root: { borderRadius: 12, textTransform: 'none', fontWeight: 700 }
        }
    }
  }
});

// --- MENÚ ---
const MENU_ITEMS = [
  { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
  { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
  { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' },
  { text: 'Salud', icon: <LocalHospitalIcon />, path: '/health' },
  { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
  { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
  { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

// --- PASOS DEL ONBOARDING ---
const onboardingSteps = [
  {
    title: '',
    description: '',
    isVideo: true
  },
  {
    title: 'Gestión de Ganado',
    description: 'Sistema integral para el registro y monitoreo de cada animal. Control detallado de razas, edades, pesos y estados de salud en tiempo real.',
    icon: <PetsIcon sx={{ fontSize: 70, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)'
  },
  {
    title: 'Administración de Establos',
    description: 'Gestiona la capacidad y ocupación de tus instalaciones. Optimización inteligente del espacio para mejorar las condiciones de tu ganado.',
    icon: <HouseSidingIcon sx={{ fontSize: 70, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)'
  },
  {
    title: 'Control Sanitario',
    description: 'Registro completo de vacunas, tratamientos y revisiones médicas. Sistema de alertas y recordatorios para mantener la salud óptima del hato.',
    icon: <LocalHospitalIcon sx={{ fontSize: 70, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)'
  },
  {
    title: 'Analítica Avanzada',
    description: 'Reportes detallados y visualización de estadísticas en tiempo real. Toma decisiones estratégicas basadas en datos precisos.',
    icon: <BarChartIcon sx={{ fontSize: 70, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)'
  }
];

const DashboardPage: React.FC = () => {
  const { token, logout, showWelcomeNotification, clearWelcomeNotification, isNewUser, clearNewUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [username, setUsername] = useState<string>('Usuario');
  const [showSecurityNotification, setShowSecurityNotification] = useState(false);
  
  // Onboarding states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  
  // Data States
  const [animals, setAnimals] = useState<any[]>([]);
  const [stables, setStables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat AI State
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Mostrar notificación de bienvenida con info de seguridad (solo login)
  useEffect(() => {
    if (showWelcomeNotification) {
      setShowSecurityNotification(true);
      clearWelcomeNotification();
    }
  }, [showWelcomeNotification, clearWelcomeNotification]);

  // Mostrar onboarding para nuevos usuarios (solo registro)
  useEffect(() => {
    if (isNewUser) {
      setShowOnboarding(true);
      setOnboardingStep(0);
      setVideoEnded(false);
    }
  }, [isNewUser]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setOnboardingStep(0);
    setVideoEnded(false);
    clearNewUser();
  };

  const handleNextStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      handleCloseOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(prev => prev - 1);
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // Avanzar automáticamente al siguiente paso cuando termina el video
    setTimeout(() => {
      if (onboardingStep < onboardingSteps.length - 1) {
        setOnboardingStep(prev => prev + 1);
      }
    }, 500); // Pequeña pausa para transición suave
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.sub || payload.username || 'Ganadero');
    } catch (error) { logout('expired'); }

    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [animalsData, stablesData] = await Promise.all([
        getAllAnimalsAction(),
        getAllStablesAction()
      ]);
      setAnimals(animalsData);
      setStables(stablesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatQuestion.trim()) return;

    setChatLoading(true);
    setChatResponse(''); 
    
    try {
      const response = await sendChatMessageAction({ question: chatQuestion });
      setChatResponse(response.answer || 'Lo siento, no pude procesar esa información. Intenta de nuevo.');
    } catch (error: any) {
      setChatResponse('Error de conexión con el servidor de Morita.');
    } finally {
      setChatLoading(false);
    }
  };

  // --- CÁLCULO DE MÉTRICAS ---
  const totalAnimals = animals.length;
  const totalStables = stables.length;
  const healthyAnimals = animals.filter(a => a.status === 'HEALTHY').length;
  const sickAnimals = animals.filter(a => a.status === 'SICK').length;
  const observationAnimals = animals.filter(a => a.status === 'OBSERVATION').length;

  const statusData = [
    { name: 'Sanos', value: healthyAnimals, color: '#43a047' },
    { name: 'Enfermos', value: sickAnimals, color: '#e53935' },
    { name: 'Observación', value: observationAnimals, color: '#fb8c00' }
  ];

  const stablesChartData = stables.map(s => ({
    name: s.name.length > 8 ? s.name.substring(0, 8) + '..' : s.name,
    capacidad: s.capacity,
    ocupacion: animals.filter(a => a.stableId === s.id).length
  }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box sx={{
          minHeight: '100vh', width: '100%', display: 'flex',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)',
          backgroundSize: '200% 200%', animation: `${backgroundMove} 15s ease infinite`,
          overflow: 'hidden'
      }}>
        
        {/* --- SIDEBAR --- */}
        <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, zIndex: 10 }}>
          <Paper elevation={0} sx={{ width: '60px', height: '90%', borderRadius: '30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <List sx={{ width: '100%', px: 1, mt: 2 }}>
              {MENU_ITEMS.map((item) => (
                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                  <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: 'center', borderRadius: '50%', mb: 1, color: window.location.pathname === item.path ? 'primary.main' : 'text.secondary', bgcolor: window.location.pathname === item.path ? 'rgba(67, 160, 71, 0.15)' : 'transparent', '&:hover': { bgcolor: 'rgba(67, 160, 71, 0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </Paper>
        </Box>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, px: 3 }}>
            <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GridViewIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary">Panel General</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip avatar={<Avatar>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.5)', border: 'none' }} />
                <IconButton onClick={() => { logout(); navigate('/login'); }} color="error"><LogoutIcon /></IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>
            ) : (
              <Grid container spacing={3} sx={{ animation: `${fadeInUp} 0.5s ease` }}>
                
                {/* 1. MORITA: SECCIÓN DE IA ENCABEZANDO EL DASHBOARD */}
                <Grid item xs={12}>
                  <Box sx={{ 
                      position: 'relative',
                      background: 'linear-gradient(120deg, #fff3e0 0%, #ffffff 100%)',
                      borderRadius: 6,
                      p: { xs: 3, md: 4 },
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(255, 224, 178, 0.5)'
                  }}>
                      
                      {/* AVATAR MORITA */}
                      <Box sx={{ position: 'relative', flexShrink: 0, textAlign: 'center' }}>
                          <Box sx={{ animation: `${float} 4s ease-in-out infinite`, position: 'relative', zIndex: 2 }}>
                              <img src={vacaSanaImg} alt="Morita" style={{ width: 140, height: 'auto', filter: 'drop-shadow(0 10px 15px rgba(255, 167, 38, 0.4))' }} />
                          </Box>
                          {/* Sombra/Brillo detrás */}
                          <Box sx={{ position: 'absolute', top: '20%', left: '10%', width: '80%', height: '60%', bgcolor: 'rgba(255, 167, 38, 0.4)', filter: 'blur(30px)', animation: `${glow} 3s infinite`, zIndex: 1 }} />
                          
                          <Typography variant="h6" fontWeight="900" sx={{ color: '#e65100', mt: 1, letterSpacing: 1 }}>MORITA</Typography>
                      </Box>

                      {/* CHAT AREA */}
                      <Box sx={{ flexGrow: 1, width: '100%' }}>
                          
                          {/* GLOBO DE TEXTO (Respuesta o Bienvenida) */}
                          <Paper elevation={0} sx={{ 
                              p: 3, mb: 3, borderRadius: '24px 24px 24px 0px', 
                              bgcolor: chatResponse ? '#fff8e1' : 'rgba(255,255,255,0.8)', 
                              border: '1px solid', borderColor: chatResponse ? '#ffcc80' : 'transparent',
                              boxShadow: chatResponse ? '0 4px 12px rgba(255, 167, 38, 0.1)' : 'none'
                          }}>
                              {!chatResponse ? (
                                  <Box>
                                      <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                                          ¡Hola {username.split(' ')[0]}! 
                                      </Typography>
                                      <Typography variant="body1" color="text.secondary">
                                          Soy tu asistente inteligente. Pregúntame sobre la salud, producción o estado de tu ganado.
                                      </Typography>
                                  </Box>
                              ) : (
                                  <Box>
                                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#f57c00', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <SparkleIcon fontSize="small" /> Análisis:
                                      </Typography>
                                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#455a64' }}>
                                          {chatResponse}
                                      </Typography>
                                  </Box>
                              )}
                          </Paper>

                          {/* INPUT MINIMALISTA */}
                          <Paper 
                            component="form"
                            elevation={0} 
                            sx={{ 
                                display: 'flex', alignItems: 'center', p: '2px 8px', 
                                borderRadius: 4, bgcolor: 'white', border: '1px solid #e0e0e0',
                                '&:focus-within': { borderColor: '#ff9800', boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.1)' }
                            }}
                          >
                            <TextField
                              fullWidth
                              placeholder="Escribe tu consulta aquí..."
                              variant="standard"
                              value={chatQuestion}
                              onChange={(e) => setChatQuestion(e.target.value)}
                              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleChatSubmit(); } }}
                              InputProps={{ disableUnderline: true, sx: { px: 2, py: 1.5 } }}
                              disabled={chatLoading}
                            />
                            <IconButton 
                                onClick={() => handleChatSubmit()} 
                                disabled={chatLoading || !chatQuestion.trim()} 
                                sx={{ bgcolor: '#ff9800', color: 'white', '&:hover': { bgcolor: '#f57c00' }, width: 44, height: 44, transition: '0.2s' }}
                            >
                                {chatLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            </IconButton>
                          </Paper>

                      </Box>
                  </Box>
                </Grid>

                {/* 2. TARJETAS DE MÉTRICAS (KPIs) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)', color: 'white' }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Ganado</Typography>
                        <Typography variant="h3" fontWeight="bold">{totalAnimals}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}><PetsIcon fontSize="large" /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', color: 'white' }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Establos</Typography>
                        <Typography variant="h3" fontWeight="bold">{totalStables}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}><HouseSidingIcon fontSize="large" /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #fb8c00 0%, #ffa726 100%)', color: 'white' }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>En Observación</Typography>
                        <Typography variant="h3" fontWeight="bold">{observationAnimals}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}><InfoIcon fontSize="large" /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #e53935 0%, #ef5350 100%)', color: 'white' }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Enfermos</Typography>
                        <Typography variant="h3" fontWeight="bold">{sickAnimals}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}><WarningIcon fontSize="large" /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 3. GRÁFICAS */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>Ocupación de Establos</Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stablesChartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} />
                          <Legend />
                          <Bar dataKey="ocupacion" fill="#0288d1" name="Ocupado" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="capacidad" fill="#e0e0e0" name="Capacidad" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>Salud del Hato</Typography>
                      <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>
            )}
          </Container>
        </Box>
      </Box>

      {/* Modal de bienvenida con info de seguridad */}
      <Dialog
        open={showSecurityNotification}
        onClose={() => setShowSecurityNotification(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)', 
          py: 2, 
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Información de Seguridad
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowSecurityNotification(false)}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ py: 4, px: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#e8f5e9', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              <SecurityIcon sx={{ fontSize: 40, color: '#43a047' }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.dark">
              ¡Bienvenido a MuuSmart! 🐮
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ textAlign: 'center' }}>
            Por razones de <strong>seguridad y protección de tus datos</strong>, tu sesión tiene una duración máxima de <strong>1 hora</strong>.
          </Typography>
          
          <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 2, border: '1px solid #ffcc02', mt: 2 }}>
            <Typography variant="body2" color="text.primary">
              <strong>💡 Recomendaciones:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, mt: 1 }}>
              <li>Guarda tu trabajo frecuentemente</li>
              <li>Verifica el temporizador en la barra superior</li>
              <li>Si la sesión expira, vuelve a iniciar sesión</li>
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button
            onClick={() => setShowSecurityNotification(false)}
            variant="contained"
            fullWidth
            size="large"
            sx={{ 
              borderRadius: 2, 
              py: 1.5,
              fontWeight: 700,
              bgcolor: '#43a047',
              '&:hover': { bgcolor: '#2e7d32' }
            }}
          >
            Entendido, ¡Comenzar!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Onboarding para nuevos usuarios */}
      <Dialog
        open={showOnboarding}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            overflow: 'hidden',
            minHeight: '60vh',
            bgcolor: '#dedee2'
          }
        }}
      >
        {/* Header con botón de cerrar */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 10 
        }}>
          <IconButton 
            onClick={handleCloseOnboarding}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.8)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Contenido del paso */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: onboardingSteps[onboardingStep].isVideo ? 'row' : 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            minHeight: '50vh'
          }}>
            <Fade in={true} timeout={500} key={onboardingStep}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: onboardingSteps[onboardingStep].isVideo ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}>
                {onboardingSteps[onboardingStep].isVideo ? (
                  // Layout horizontal: Video a la izquierda, texto a la derecha
                  <>
                    <Box sx={{ 
                      flex: '0 0 50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: '#dedee2',
                      height: '100%',
                      minHeight: '50vh'
                    }}>
                      <video
                        ref={videoRef}
                        src={bienvenidaVideo}
                        autoPlay
                        playsInline
                        controls
                        onEnded={handleVideoEnd}
                        style={{ 
                          width: '100%',
                          maxWidth: 500,
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                    </Box>
                    <Box sx={{ 
                      flex: '0 0 50%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      p: 5,
                      bgcolor: '#dedee2'
                    }}>
                      <Typography 
                        variant="h2" 
                        fontWeight="800" 
                        sx={{ 
                          color: '#2e7d32',
                          mb: 3,
                          lineHeight: 1.1,
                          letterSpacing: '-0.02em',
                          animation: `${fadeInUp} 0.5s ease`
                        }}
                      >
                        Bienvenido a<br/>MuuSmart
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: '#444',
                          lineHeight: 1.6,
                          fontWeight: 500,
                          animation: `${fadeInUp} 0.5s ease 0.1s both`
                        }}
                      >
                        Tu asistente inteligente para la gestión ganadera.
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#666',
                          mt: 2,
                          lineHeight: 1.7,
                          fontSize: '1.1rem',
                          animation: `${fadeInUp} 0.5s ease 0.2s both`
                        }}
                      >
                        Soy Morita, y estoy aquí para ayudarte a administrar tu ganado de manera eficiente.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  // Layout futurista para otros pasos
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 6,
                    width: '100%',
                    maxWidth: 700,
                    mx: 'auto'
                  }}>
                    {/* Icono con gradiente */}
                    <Box sx={{ 
                      width: 140, 
                      height: 140, 
                      borderRadius: 4,
                      background: (onboardingSteps[onboardingStep] as any).gradient || 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      animation: `${float} 3s ease-in-out infinite`,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -3,
                        borderRadius: 5,
                        background: 'inherit',
                        opacity: 0.3,
                        filter: 'blur(15px)',
                        zIndex: -1
                      }
                    }}>
                      {onboardingSteps[onboardingStep].icon}
                    </Box>
                    
                    {/* Título */}
                    <Typography 
                      variant="h3" 
                      fontWeight="800" 
                      sx={{ 
                        color: '#1a1a1a',
                        mb: 2,
                        letterSpacing: '-0.02em',
                        animation: `${fadeInUp} 0.5s ease`
                      }}
                    >
                      {onboardingSteps[onboardingStep].title}
                    </Typography>
                    
                    {/* Línea decorativa */}
                    <Box sx={{
                      width: 60,
                      height: 4,
                      borderRadius: 2,
                      background: (onboardingSteps[onboardingStep] as any).gradient || 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                      mx: 'auto',
                      mb: 3
                    }} />
                    
                    {/* Descripción */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#555',
                        maxWidth: 550, 
                        mx: 'auto', 
                        lineHeight: 1.7,
                        fontWeight: 400,
                        animation: `${fadeInUp} 0.5s ease 0.1s both`
                      }}
                    >
                      {onboardingSteps[onboardingStep].description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Fade>
          </Box>

          {/* Stepper en la parte inferior */}
          <Box sx={{ width: '100%', py: 2, px: 4 }}>
            <Stepper activeStep={onboardingStep} alternativeLabel>
              {onboardingSteps.map((step, index) => (
                <Step key={index}>
                  <StepLabel 
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: '#43a047' },
                        '&.Mui-completed': { color: '#43a047' }
                      }
                    }}
                  />
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogContent>

        {/* Footer con navegación */}
        <DialogActions sx={{ 
          px: 4, 
          pb: 3, 
          pt: 1,
          justifyContent: 'space-between',
          bgcolor: 'rgba(0,0,0,0.03)'
        }}>
          <Button
            onClick={handlePrevStep}
            disabled={onboardingStep === 0}
            startIcon={<BackIcon />}
            sx={{ 
              visibility: onboardingStep === 0 ? 'hidden' : 'visible',
              color: 'text.secondary'
            }}
          >
            Anterior
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onboardingSteps.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: index === onboardingStep ? '#43a047' : 'rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>

          <Button
            onClick={handleNextStep}
            variant="contained"
            endIcon={onboardingStep === onboardingSteps.length - 1 ? <CheckIcon /> : <NextIcon />}
            sx={{ 
              bgcolor: '#43a047',
              '&:hover': { bgcolor: '#2e7d32' },
              px: 3
            }}
          >
            {onboardingStep === onboardingSteps.length - 1 ? 'Comenzar' : (onboardingSteps[onboardingStep].isVideo ? 'Saltar video' : 'Siguiente')}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DashboardPage;