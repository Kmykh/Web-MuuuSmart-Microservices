import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
  Alert, CircularProgress, List, ListItemButton, ListItemIcon, Tooltip, Avatar,
  AppBar, Toolbar, CssBaseline, LinearProgress, Slide, InputAdornment, Divider, Stack
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

// --- ICONOS ---
import {
  Add as AddIcon, HouseSiding as HouseSidingIcon, LocationOn as LocationIcon,
  People as PeopleIcon, Visibility as VisibilityIcon, Search as SearchIcon,
  GridView as GridViewIcon, Pets as PetsIcon, LocalHospital as LocalHospitalIcon,
  WaterDrop as WaterDropIcon, Flag as FlagIcon, BarChart as BarChartIcon,
  Logout as LogoutIcon, Business as BusinessIcon, MeetingRoom as RoomIcon,
  Close as CloseIcon, InfoOutlined as InfoIcon, Lock as LockIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

import { getAllStablesAction, createStableAction, getStableByIdAction } from '../application/stable';
import { getAllAnimalsAction } from '../application/animal';
import { StableResponse, CreateStableRequest } from '../domain/stable';
import { Animal } from '../domain/animal';
import { useAuth } from '../contexts/AuthContext';

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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const theme = createTheme({
  palette: {
    primary: { main: '#43a047', dark: '#2e7d32' },
    background: { default: '#f0f4f1' },
    text: { primary: '#2c3e50', secondary: '#607d8b' },
  },
  typography: { fontFamily: '"Poppins", "Roboto", sans-serif' },
  shape: { borderRadius: 16 },
});

const MENU_ITEMS = [
  { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
  { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
  { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' }, // Activo
  { text: 'Salud', icon: <LocalHospitalIcon />, path: '/health' },
  { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
  { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
  { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

// --- COMPONENTE: Scroll Number Picker ---
const ScrollNumberPicker: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, min, max, step, unit, icon }) => {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon} {label}
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        p: 1.5,
        borderRadius: 3,
        bgcolor: '#f8f9fa',
        border: '1px solid rgba(0,0,0,0.08)',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(67, 160, 71, 0.02)' }
      }}>
        <IconButton 
          onClick={() => onChange(Math.max(min, value - step))}
          size="small"
          disabled={value <= min}
          sx={{ 
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': { 
              bgcolor: 'primary.main', 
              color: 'white',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 8px rgba(67, 160, 71, 0.3)'
            },
            '&:disabled': { opacity: 0.3 }
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        
        <Box sx={{ 
          flexGrow: 1, 
          textAlign: 'center',
          bgcolor: 'white',
          borderRadius: 2,
          p: 1,
          minWidth: 100
        }}>
          <Typography variant="h5" fontWeight="700" color="primary.main" sx={{ 
            fontFamily: 'monospace',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.05)' }
          }}>
            {value}
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {unit}
            </Typography>
          </Typography>
        </Box>

        <IconButton 
          onClick={() => onChange(Math.min(max, value + step))}
          size="small"
          disabled={value >= max}
          sx={{ 
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': { 
              bgcolor: 'primary.main', 
              color: 'white',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 8px rgba(67, 160, 71, 0.3)'
            },
            '&:disabled': { opacity: 0.3 }
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

const StablesPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stables, setStables] = useState<StableResponse[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedStable, setSelectedStable] = useState<StableResponse | null>(null);
  const [selectedStableAnimals, setSelectedStableAnimals] = useState<Animal[]>([]);
  const [username, setUsername] = useState<string>('Usuario');
  const [formData, setFormData] = useState<CreateStableRequest>({ name: '', description: '', location: '', capacity: 0 });
  const [stableOccupancy, setStableOccupancy] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const p = JSON.parse(atob(token.split('.')[1]));
      setUsername(p.sub || p.username || 'Ganadero');
    } catch (e) {}
    loadStables();
  }, [token]);

  const loadStables = async () => {
    setLoading(true);
    try {
      const [sData, aData] = await Promise.all([getAllStablesAction(), getAllAnimalsAction()]);
      setStables(sData);
      setAnimals(aData);

      // Calcular ocupación de cada establo
      const occupancy: Record<number, number> = {};
      sData.forEach((stable) => {
        occupancy[stable.id] = aData.filter((animal) => animal.stableId === stable.id).length;
      });
      setStableOccupancy(occupancy);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await createStableAction(formData);
      setOpenDialog(false);
      loadStables();
    } catch (err) {
      alert('Error al crear');
    }
  };

  const handleViewDetails = async (id: number) => {
    const s = await getStableByIdAction(id);
    const stableAnimals = animals.filter((a) => a.stableId === id);
    setSelectedStable(s);
    setSelectedStableAnimals(stableAnimals);
    setOpenDetailsDialog(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)',
          backgroundSize: '200% 200%',
          animation: `${backgroundMove} 15s ease infinite`,
          overflow: 'hidden',
        }}
      >
        {/* SIDEBAR */}
        <Box
          sx={{
            width: '80px',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            zIndex: 10,
          }}
        >
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
            }}
          >
            <List sx={{ width: '100%', px: 1, mt: 2 }}>
              {MENU_ITEMS.map((item) => (
                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      justifyContent: 'center',
                      borderRadius: '50%',
                      mb: 1,
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      bgcolor:
                        location.pathname === item.path
                          ? 'rgba(67, 160, 71, 0.15)'
                          : 'transparent',
                      '&:hover': { bgcolor: 'rgba(67, 160, 71, 0.05)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </Paper>
        </Box>

        {/* CONTENIDO */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, px: 3 }}>
            <Toolbar
              sx={{
                justifyContent: 'space-between',
                bgcolor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HouseSidingIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary">
                  Gestión de Establos
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  avatar={<Avatar>{username[0]}</Avatar>}
                  label={username}
                  variant="outlined"
                  sx={{ bgcolor: 'rgba(255,255,255,0.5)', border: 'none' }}
                />
                <IconButton onClick={logout} color="error">
                  <LogoutIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Paper
                sx={{
                  p: '2px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.8)',
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  variant="standard"
                  placeholder="Buscar establo..."
                  InputProps={{ disableUnderline: true }}
                  fullWidth
                />
              </Paper>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData({ name: '', description: '', location: '', capacity: 0 });
                  setOpenDialog(true);
                }}
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                Nuevo Establo
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
              </Box>
            ) : stables.length === 0 ? (
              <Paper
                sx={{
                  p: 5,
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.6)',
                }}
              >
                <Typography>No hay establos</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {stables.map((stable, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={stable.id}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.8)',
                        animation: `${fadeInUp} 0.5s ease backwards`,
                        animationDelay: `${index * 0.1}s`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 30px rgba(46, 125, 50, 0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Avatar sx={{ bgcolor: 'transparent', width: 48, height: 48 }}>
                            <svg width="48" height="48" viewBox="0 0 100 100">
                              {/* Techo del establo */}
                              <path d="M10 40 L50 15 L90 40" fill="#d32f2f" stroke="#b71c1c" strokeWidth="2" />
                              {/* Pared principal */}
                              <rect x="15" y="40" width="70" height="45" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
                              {/* Puerta grande */}
                              <rect x="35" y="55" width="30" height="30" fill="#5D4037" stroke="#3E2723" strokeWidth="1.5" />
                              <rect x="37" y="57" width="26" height="26" fill="none" stroke="#8D6E63" strokeWidth="1" />
                              {/* Ventana */}
                              <rect x="22" y="48" width="8" height="8" fill="#FFEB3B" stroke="#F57C00" strokeWidth="1" />
                              <line x1="26" y1="48" x2="26" y2="56" stroke="#F57C00" strokeWidth="0.5" />
                              <line x1="22" y1="52" x2="30" y2="52" stroke="#F57C00" strokeWidth="0.5" />
                              {/* Ventana derecha */}
                              <rect x="70" y="48" width="8" height="8" fill="#FFEB3B" stroke="#F57C00" strokeWidth="1" />
                              <line x1="74" y1="48" x2="74" y2="56" stroke="#F57C00" strokeWidth="0.5" />
                              <line x1="70" y1="52" x2="78" y2="52" stroke="#F57C00" strokeWidth="0.5" />
                              {/* Base */}
                              <rect x="10" y="85" width="80" height="3" fill="#4CAF50" />
                            </svg>
                          </Avatar>
                          <Chip label={`#${stable.id}`} size="small" />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {stable.name}
                        </Typography>
                        {stable.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontStyle: 'italic' }}>
                            "{stable.description}"
                          </Typography>
                        )}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'text.secondary',
                            mb: 2,
                          }}
                        >
                          <LocationIcon fontSize="small" />
                          <Typography variant="body2">{stable.location}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PetsIcon fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight="bold">
                                {stableOccupancy[stable.id] || 0} Bovinos
                              </Typography>
                            </Box>
                            <Chip
                              label={
                                stableOccupancy[stable.id] >= stable.capacity
                                  ? 'LLENO'
                                  : `${stable.capacity - (stableOccupancy[stable.id] || 0)} libres`
                              }
                              size="small"
                              color={
                                stableOccupancy[stable.id] >= stable.capacity
                                  ? 'error'
                                  : stable.capacity - (stableOccupancy[stable.id] || 0) <= 2
                                  ? 'warning'
                                  : 'success'
                              }
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" fontWeight="bold">
                              Capacidad
                            </Typography>
                            <Typography variant="caption">
                              {stableOccupancy[stable.id] || 0}/{stable.capacity}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={((stableOccupancy[stable.id] || 0) / stable.capacity) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor:
                                  (stableOccupancy[stable.id] || 0) >= stable.capacity
                                    ? 'error.main'
                                    : (stableOccupancy[stable.id] || 0) >= stable.capacity * 0.8
                                    ? 'warning.main'
                                    : 'primary.main',
                              },
                            }}
                          />
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(stable.id)}
                          sx={{ borderRadius: 4 }}
                        >
                          Detalles
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Box>

        {/* DIÁLOGO CREAR */}
        <Dialog
          open={openDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ 
            style: { 
              borderRadius: 24, 
              padding: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            } 
          }}
        >
          <DialogTitle sx={{ p: 0, mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 42, height: 42 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="700" color="primary.dark">
                Construir Nuevo Establo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Complete los datos de infraestructura
              </Typography>
              
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Grid container spacing={2.5}>
              {/* Fila 1 - Nombre y Ubicación */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre del Establo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  variant="outlined"
                  placeholder="Ej: Establo Norte"
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><BusinessIcon fontSize="small" /></InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ubicación"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  fullWidth
                  variant="outlined"
                  placeholder="Ej: Zona A, Sector Norte"
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><LocationIcon fontSize="small" /></InputAdornment>
                  }}
                />
              </Grid>

              {/* Fila 2 - Descripción completa */}
              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Ej: Establo principal para ganado Holstein..."
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><InfoIcon fontSize="small" /></InputAdornment>
                  }}
                />
              </Grid>

              {/* Fila 3 - Capacidad */}
              <Grid item xs={12}>
                <ScrollNumberPicker 
                  label="CAPACIDAD MÁXIMA" 
                  value={formData.capacity} 
                  onChange={(val) => setFormData({ ...formData, capacity: val })} 
                  min={1} 
                  max={500} 
                  step={5} 
                  unit="bovinos"
                  icon={<PeopleIcon fontSize="small" />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ pt: 2.5, px: 0 }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ borderRadius: 3, px: 3 }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name || !formData.location || formData.capacity <= 0}
              sx={{ borderRadius: 3, px: 4, py: 0.75, fontWeight: 'bold', boxShadow: '0 8px 20px rgba(67, 160, 71, 0.3)' }}
            >
              Crear Establo
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIÁLOGO DE DETALLES */}
        <Dialog
          open={openDetailsDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ style: { borderRadius: 24, padding: 10 } }}
        >
          {selectedStable && (
            <>
              <DialogTitle
                sx={{
                  fontWeight: 700,
                  color: 'primary.dark',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedStable.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Establo #{selectedStable.id}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setOpenDetailsDialog(false)}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  {/* Información General */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{ p: 3, bgcolor: 'rgba(67, 160, 71, 0.05)', borderRadius: 3 }}
                    >
                      <Grid container spacing={2}>
                        {selectedStable.description && (
                          <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, border: '1px dashed rgba(67, 160, 71, 0.3)' }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                                "{selectedStable.description}"
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationIcon color="primary" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="bold"
                            >
                              UBICACIÓN
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="600">
                            {selectedStable.location}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PeopleIcon color="primary" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="bold"
                            >
                              CAPACIDAD TOTAL
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="600">
                            {selectedStable.capacity} lugares
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PetsIcon color="primary" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="bold"
                            >
                              OCUPACIÓN ACTUAL
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              {selectedStableAnimals.length} / {selectedStable.capacity}
                            </Typography>
                            <Chip
                              label={
                                selectedStableAnimals.length >= selectedStable.capacity
                                  ? 'LLENO'
                                  : `${
                                      selectedStable.capacity - selectedStableAnimals.length
                                    } disponibles`
                              }
                              color={
                                selectedStableAnimals.length >= selectedStable.capacity
                                  ? 'error'
                                  : selectedStable.capacity - selectedStableAnimals.length <= 2
                                  ? 'warning'
                                  : 'success'
                              }
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={
                              (selectedStableAnimals.length / selectedStable.capacity) * 100
                            }
                            sx={{
                              mt: 2,
                              height: 10,
                              borderRadius: 5,
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor:
                                  selectedStableAnimals.length >= selectedStable.capacity
                                    ? 'error.main'
                                    : selectedStableAnimals.length >=
                                      selectedStable.capacity * 0.8
                                    ? 'warning.main'
                                    : 'success.main',
                                borderRadius: 5,
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Lista de Bovinos */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Bovinos Alojados
                      </Typography>
                      <Chip
                        label={`${selectedStableAnimals.length} ${
                          selectedStableAnimals.length === 1 ? 'animal' : 'animales'
                        }`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    {selectedStableAnimals.length === 0 ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          bgcolor: 'rgba(0,0,0,0.02)',
                          borderRadius: 3,
                        }}
                      >
                        <PetsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">
                          No hay animales alojados en este establo
                        </Typography>
                      </Paper>
                    ) : (
                      <Grid container spacing={2}>
                        {selectedStableAnimals.map((animal) => (
                          <Grid item xs={12} sm={6} key={animal.id}>
                            <Card
                              elevation={0}
                              sx={{
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                transition: 'all 0.3s',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(67, 160, 71, 0.15)',
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{ animation: `${pulse} 2s infinite ease-in-out` }}>
                                    {/* SVG DE VACA PEQUEÑO */}
                                    <svg width="40" height="40" viewBox="0 0 200 200">
                                      <circle cx="100" cy="100" r="90" fill="#E8F5E9" />
                                      <path
                                        d="M60 90C60 70 140 70 140 90V130C140 155 120 160 100 160C80 160 60 155 60 130V90Z"
                                        fill="#8D6E63"
                                      />
                                      <path
                                        d="M55 70L40 55C35 60 45 80 55 75Z"
                                        fill="#5D4037"
                                      />
                                      <path
                                        d="M145 70L160 55C165 60 155 80 145 75Z"
                                        fill="#5D4037"
                                      />
                                      <ellipse
                                        cx="100"
                                        cy="135"
                                        rx="25"
                                        ry="15"
                                        fill="#FFCCBC"
                                      />
                                    </svg>
                                  </Box>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {animal.tag}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {animal.breed}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                      <Chip
                                        label={`${animal.weight}kg`}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={`${animal.age} años`}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={
                                          animal.status === 'HEALTHY'
                                            ? 'Sano'
                                            : animal.status === 'OBSERVATION'
                                            ? 'Observación'
                                            : 'Enfermo'
                                        }
                                        size="small"
                                        color={
                                          animal.status === 'HEALTHY'
                                            ? 'success'
                                            : animal.status === 'OBSERVATION'
                                            ? 'warning'
                                            : 'error'
                                        }
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Grid>

                  {/* AVISO DE RESTRICCIÓN */}
                  <Grid item xs={12}>
                    <Alert 
                      severity="warning" 
                      icon={<LockIcon />}
                      sx={{ borderRadius: 3, border: '1px solid rgba(237, 108, 2, 0.3)' }}
                    >
                      <Typography variant="body2" fontWeight="600" gutterBottom>
                        Restricción de Seguridad
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        La edición y eliminación de establos está restringida únicamente al administrador del sistema. 
                        Esta medida protege la integridad de la infraestructura ganadera y evita modificaciones no autorizadas 
                        que puedan afectar la asignación de bovinos.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setOpenDetailsDialog(false)}
                  variant="contained"
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default StablesPage;
