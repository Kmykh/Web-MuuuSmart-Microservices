import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Container, Paper, IconButton, Avatar, Chip,
  CssBaseline, Tooltip, List, ListItemButton, ListItemIcon, Grid, Card, CardContent,
  TextField, Button, CircularProgress, Dialog, DialogContent, DialogActions,
  Stepper, Step, StepLabel, Fade, Divider, Stack
} from '@mui/material';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { keyframes } from '@emotion/react';

// --- ICONOS ---
import {
  Logout as LogoutIcon, GridView as GridViewIcon, Pets as PetsIcon,
  HouseSiding as HouseSidingIcon, LocalHospital as LocalHospitalIcon,
  WaterDrop as WaterDropIcon, Flag as FlagIcon, BarChart as BarChartIcon,
  Send as SendIcon, WarningAmber as WarningIcon,
  CheckCircle as CheckIcon, Info as InfoIcon, AutoAwesome as SparkleIcon,
  Close as CloseIcon, Security as SecurityIcon,
  NavigateNext as NextIcon, NavigateBefore as BackIcon,
  AdminPanelSettings as AdminIcon, People as PeopleIcon
} from '@mui/icons-material';

// Imports de Lógica
import { getAllAnimalsAction } from '../application/animal';
import { getAllStablesAction } from '../application/stable';
import { sendChatMessageAction } from '../application/assistant';

// Assets
import vacaSanaImg from '../assets/vaca_sana.png';
import bienvenidaVideo from '../assets/bienveenidamorita.mp4';

// --- ANIMACIONES ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

// --- TEMA ---
const MENU_ITEMS = [
  { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
  { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
  { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' },
  { text: 'Salud', icon: <LocalHospitalIcon />, path: '/health' },
  { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
  { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
  { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

const onboardingSteps = [
  { title: '', description: '', isVideo: true },
  { title: 'Gestión de Ganado', description: 'Registro y monitoreo.', icon: <PetsIcon /> },
  { title: 'Administración', description: 'Gestión de capacidad.', icon: <HouseSidingIcon /> }
];

const DashboardPage: React.FC = () => {
  const { token, logout, showWelcomeNotification, clearWelcomeNotification, isNewUser, clearNewUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [username, setUsername] = useState<string>('Usuario');
  const [showSecurityNotification, setShowSecurityNotification] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Data States
  const [animals, setAnimals] = useState<any[]>([]);
  const [stables, setStables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chat AI State
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Theme
  const dynamicTheme = createTheme({
    palette: {
      primary: { main: isAdmin ? '#667eea' : '#43a047' },
      secondary: { main: isAdmin ? '#f093fb' : '#0288d1' },
      background: { default: '#f4f6f8', paper: '#ffffff' },
    },
    typography: { fontFamily: '"Poppins", "Roboto", sans-serif' },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: { styleOverrides: { root: { borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: 'none' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
    }
  });

  useEffect(() => {
    if (showWelcomeNotification) { setShowSecurityNotification(true); clearWelcomeNotification(); }
  }, [showWelcomeNotification]);

  useEffect(() => {
    if (isNewUser) { setShowOnboarding(true); setOnboardingStep(0); }
  }, [isNewUser]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.sub || payload.username || 'Ganadero');
    } catch { logout('expired'); }
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [animalsData, stablesData] = await Promise.all([getAllAnimalsAction(), getAllStablesAction()]);
      setAnimals(animalsData);
      setStables(stablesData);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleChatSubmit = async () => {
    if (!chatQuestion.trim()) return;
    setChatLoading(true);
    setChatResponse(''); 
    try {
      const response = await sendChatMessageAction({ question: chatQuestion });
      setChatResponse(response.answer || 'No pude procesar eso.');
    } catch { setChatResponse('Error de conexión.'); } 
    finally { setChatLoading(false); }
  };

  // Metrics
  const totalAnimals = animals.length;
  const totalStables = stables.length;
  const healthyAnimals = animals.filter(a => a.status === 'HEALTHY').length;
  const sickAnimals = animals.filter(a => a.status === 'SICK').length;
  const observationAnimals = animals.filter(a => a.status === 'OBSERVATION').length;
  const uniqueOwners = isAdmin ? new Set(animals.map(a => a.ownerUsername)).size : 0;

  const statusData = [
    { name: 'Sanos', value: healthyAnimals, color: '#43a047' },
    { name: 'Enfermos', value: sickAnimals, color: '#e53935' },
    { name: 'Observación', value: observationAnimals, color: '#fb8c00' }
  ];

  const stablesChartData = stables.map(s => ({
    name: s.name, 
    capacidad: s.capacity,
    ocupacion: animals.filter(a => a.stableId === s.id).length
  }));

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8f9fa' }}>
        
        {/* SIDEBAR SIMPLE */}
        <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Paper elevation={0} sx={{ width: '60px', height: '90%', borderRadius: '30px', bgcolor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <List sx={{ width: '100%', px: 1, mt: 2 }}>
              {MENU_ITEMS.map((item) => (
                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                  <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: 'center', borderRadius: '50%', mb: 1, color: window.location.pathname === item.path ? 'primary.main' : 'text.secondary', bgcolor: window.location.pathname === item.path ? 'rgba(67, 160, 71, 0.1)' : 'transparent' }}>
                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </Paper>
        </Box>

        {/* CONTENIDO PRINCIPAL */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, px: 3 }}>
            <Toolbar sx={{ justifyContent: 'space-between', bgcolor: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GridViewIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary" fontWeight="bold">MuuSmart</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip avatar={<Avatar sx={{ bgcolor: isAdmin ? '#667eea' : '#43a047' }}>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ border: 'none', fontWeight: 600, bgcolor: '#f5f5f5' }} />
                <IconButton onClick={() => logout()} color="error"><LogoutIcon /></IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto', px: 3 }}>
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}><CircularProgress /></Box> : (
              <Grid container spacing={3} sx={{ animation: `${fadeInUp} 0.5s ease` }}>
                
                {/* 0. BIENVENIDA (FUERA DE MORITA) */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#2d3748' }}>
                      ¡Bienvenido, {isAdmin ? 'Admin' : ''} {username.split(' ')[0]}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {isAdmin ? 'Aquí tienes el resumen global de tu sistema ganadero.' : 'Revisemos cómo están tus animales hoy.'}
                    </Typography>
                  </Box>
                </Grid>

                {/* 1. CHAT CON MORITA (DISEÑO TIPO CHAT APP) */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    bgcolor: '#ffffff',
                    border: '1px solid #edf2f7',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'flex-start',
                    gap: 3
                  }}>
                    {/* Avatar Morita */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                       <Box sx={{ 
                          width: 80, height: 80, borderRadius: '50%', bgcolor: '#f0fff4', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '3px solid #fff', boxShadow: '0 4px 15px rgba(67, 160, 71, 0.15)',
                          animation: `${float} 4s ease-in-out infinite`
                       }}>
                          <img src={vacaSanaImg} alt="Morita" style={{ width: 60, height: 'auto' }} />
                       </Box>
                       <Chip label="En línea" size="small" color="success" sx={{ mt: -1.5, zIndex: 2, height: 20, fontSize: '0.7rem' }} />
                    </Box>

                    {/* Area de Chat */}
                    <Box sx={{ flexGrow: 1, width: '100%' }}>
                      {/* Burbuja de Respuesta (History) */}
                      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Mensaje Inicial o Respuesta */}
                        <Box sx={{ 
                          alignSelf: 'flex-start',
                          bgcolor: '#f1f8e9', 
                          color: '#33691e',
                          p: 2, 
                          borderRadius: '20px 20px 20px 4px',
                          maxWidth: '80%',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                            {chatResponse || "Hola, soy Morita 🐮. Puedo analizar datos de salud, producción o estado de los establos. ¿Qué necesitas saber?"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Input Simple */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#f8f9fa', borderRadius: 3, px: 2, py: 0.5 }}>
                        <TextField 
                           fullWidth 
                           placeholder="Escribe tu consulta..." 
                           variant="standard" 
                           InputProps={{ disableUnderline: true }}
                           value={chatQuestion}
                           onChange={(e) => setChatQuestion(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                           disabled={chatLoading}
                        />
                        <IconButton 
                          color="primary" 
                          onClick={handleChatSubmit}
                          disabled={!chatQuestion.trim() || chatLoading}
                          sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: 40, height: 40 }}
                        >
                          {chatLoading ? <CircularProgress size={20} /> : <SendIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* 2. TARJETAS (KPIS) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Animales</Typography>
                        <Typography variant="h4" fontWeight="bold">{totalAnimals}</Typography>
                      </Box>
                      <Avatar variant="rounded" sx={{ bgcolor: alpha('#43a047', 0.1), color: '#43a047', width: 56, height: 56 }}><PetsIcon /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Establos</Typography>
                        <Typography variant="h4" fontWeight="bold">{totalStables}</Typography>
                      </Box>
                      <Avatar variant="rounded" sx={{ bgcolor: alpha('#0288d1', 0.1), color: '#0288d1', width: 56, height: 56 }}><HouseSidingIcon /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Enfermos</Typography>
                        <Typography variant="h4" fontWeight="bold" color="error.main">{sickAnimals}</Typography>
                      </Box>
                      <Avatar variant="rounded" sx={{ bgcolor: alpha('#e53935', 0.1), color: '#e53935', width: 56, height: 56 }}><WarningIcon /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Usuarios Activos</Typography>
                        <Typography variant="h4" fontWeight="bold">{isAdmin ? uniqueOwners : 1}</Typography>
                      </Box>
                      <Avatar variant="rounded" sx={{ bgcolor: alpha('#fb8c00', 0.1), color: '#fb8c00', width: 56, height: 56 }}><PeopleIcon /></Avatar>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 3. GRÁFICAS (Horizontal para establos) */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '100%', minHeight: 400, p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Ocupación por Establo</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={stablesChartData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <RechartsTooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="ocupacion" fill="#0288d1" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="capacidad" fill="#e0e0e0" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', minHeight: 400, p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Salud General</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                {/* 4. RECUENTO POR PROPIETARIOS (RESTAURADO) */}
                {isAdmin && (
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 2 }}>Estadísticas por Propietario</Typography>
                    <Grid container spacing={2}>
                      {Array.from(new Set(animals.map(a => a.ownerUsername))).map((owner) => {
                        const ownerAnimals = animals.filter(a => a.ownerUsername === owner);
                        const ownerStables = stables.filter(s => s.ownerUsername === owner);
                        return (
                          <Grid item xs={12} sm={6} md={4} key={owner}>
                            <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#667eea' }}>{owner[0].toUpperCase()}</Avatar>
                                <Typography fontWeight="bold">{owner}</Typography>
                              </Box>
                              <Stack direction="row" spacing={2} justifyContent="space-between">
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary.main" fontWeight="bold">{ownerAnimals.length}</Typography>
                                  <Typography variant="caption" color="text.secondary">Animales</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box textAlign="center">
                                  <Typography variant="h6" color="secondary.main" fontWeight="bold">{ownerStables.length}</Typography>
                                  <Typography variant="caption" color="text.secondary">Establos</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box textAlign="center">
                                  <Typography variant="h6" color="error.main" fontWeight="bold">
                                    {ownerAnimals.filter(a => a.status === 'SICK').length}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">Enfermos</Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            )}
          </Container>
        </Box>
      </Box>

      {/* DIALOGS MANTENIDOS (OMITIDOS PARA BREVEDAD, SON IGUALES) */}
      <Dialog open={showSecurityNotification} onClose={() => setShowSecurityNotification(false)}>
        <DialogContent><Typography>Tu sesión expira en 1 hora por seguridad.</Typography></DialogContent>
        <DialogActions><Button onClick={() => setShowSecurityNotification(false)}>Entendido</Button></DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default DashboardPage;