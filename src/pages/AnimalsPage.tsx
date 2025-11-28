import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
  CircularProgress, MenuItem, FormControl, InputLabel, Select,
  List, ListItemButton, ListItemIcon, Tooltip, Avatar, AppBar,
  Toolbar, CssBaseline, Slide, Divider, Snackbar, Alert, InputAdornment, LinearProgress,
  Autocomplete, Stack
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

// --- ICONOS ---
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Pets as PetsIcon,
  Search as SearchIcon, GridView as GridViewIcon,
  HouseSiding as HouseSidingIcon, LocalHospital as LocalHospitalIcon,
  WaterDrop as WaterDropIcon, Flag as FlagIcon, BarChart as BarChartIcon,
  Logout as LogoutIcon, MonitorWeight as WeightIcon, Cake as CakeIcon,
  Warning as WarningIcon, Remove as RemoveIcon, InfoOutlined as InfoIcon,
  AutoAwesome as AutoIcon,
  QrCode as TagIcon, Person as OwnerIcon, Restaurant as FeedIcon,
  AccessTime as TimeIcon, LocationOn as LocationIcon, 
  Timeline as TimelineIcon
} from '@mui/icons-material';

import { getAllAnimalsAction, createAnimalAction, updateAnimalAction, deleteAnimalAction } from '../application/animal';
import { getAllStablesAction } from '../application/stable';
import { Animal, AnimalRequest } from '../domain/animal';
import { StableResponse } from '../domain/stable';
import { useAuth } from '../contexts/AuthContext';

// --- IMAGENES ---
import HealthyCow from '../assets/vaca_sana.png';
import ObservationCow from '../assets/vaca_observacion.png';
import SickCow from '../assets/vaca_enferma.png';

// --- ANIMACIONES & ESTILOS ---
const backgroundMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
    secondary: { main: '#ff6f00' }, 
    error: { main: '#e53935' },
    warning: { main: '#ed6c02' },
    background: { default: '#f4f6f8' },
    text: { primary: '#37474f', secondary: '#78909c' },
  },
  typography: { fontFamily: '"Poppins", "Roboto", sans-serif' },
  shape: { borderRadius: 20 },
  components: {
    MuiCard: {
        styleOverrides: {
            root: { borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
        }
    },
    MuiAutocomplete: {
        styleOverrides: {
            paper: { borderRadius: 16, marginTop: 8 }
        }
    }
  }
});

// --- HELPER: SCROLL NUMBER PICKER ---
const ScrollNumberPicker: React.FC<{
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string; icon?: React.ReactNode; disabled?: boolean;
}> = ({ label, value, onChange, min, max, step, unit, icon, disabled = false }) => {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>{icon} {label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 3, bgcolor: disabled ? '#f0f0f0' : '#f8f9fa', border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s', opacity: disabled ? 0.7 : 1 }}>
        <IconButton onClick={() => onChange(Math.max(min, value - step))} size="small" disabled={value <= min || disabled} sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2 }}><RemoveIcon fontSize="small" /></IconButton>
        <Box sx={{ flexGrow: 1, textAlign: 'center', bgcolor: 'white', borderRadius: 2, p: 1, minWidth: 100 }}>
          <Typography variant="h5" fontWeight="700" color="primary.main" sx={{ fontFamily: 'monospace' }}>{value}<Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>{unit}</Typography></Typography>
        </Box>
        <IconButton onClick={() => onChange(Math.min(max, value + step))} size="small" disabled={value >= max || disabled} sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', borderRadius: 2 }}><AddIcon fontSize="small" /></IconButton>
      </Box>
    </Box>
  );
};

// --- DATA CONSTANTS ---
const MENU_ITEMS = [
  { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
  { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
  { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' },
  { text: 'Salud', icon: <LocalHospitalIcon />, path: '/health' },
  { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
  { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
  { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

const CATTLE_BREEDS = ['Holstein', 'Jersey', 'Angus', 'Hereford', 'Brahman', 'Simmental', 'Gyr', 'Otra'];
const HEALTH_STATUSES = [
  { value: 'HEALTHY', label: 'Saludable', color: 'success', desc: 'Óptimo', image: HealthyCow },
  { value: 'OBSERVATION', label: 'Observación', color: 'warning', desc: 'Revisar', image: ObservationCow },
  { value: 'SICK', label: 'Enfermo', color: 'error', desc: 'Tratar', image: SickCow },
];

// --- LÓGICA DE ALIMENTACIÓN REALISTA ---
const HOURS_PER_LEVEL = 3; // 1 Nivel dura aprox 3 horas

const getFeedInfo = (lvl: number) => {
    const hoursLeft = lvl * HOURS_PER_LEVEL;
    
    if (lvl <= 2) return { 
        label: 'Crítico', 
        color: 'error', 
        bg: '#ffebee', 
        text: `Urgente: Se agota en ${hoursLeft} horas.`,
        alertSeverity: 'error'
    };
    if (lvl <= 5) return { 
        label: 'Bajo', 
        color: 'warning', 
        bg: '#fff3e0', 
        text: `Atención: Provisión para ${hoursLeft} horas.`,
        alertSeverity: 'warning'
    };
    return { 
        label: 'Óptimo', 
        color: 'success', 
        bg: '#e8f5e9', 
        text: `Suficiente para aproximandamente ${hoursLeft} horas (${(hoursLeft/24).toFixed(1)} días).`,
        alertSeverity: 'success'
    };
};

const AnimalsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [stables, setStables] = useState<StableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<number | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [username, setUsername] = useState<string>('Usuario');
  const [stableOccupancy, setStableOccupancy] = useState<Record<number, number>>({});
  
  const [searchValue, setSearchValue] = useState<Animal | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState<AnimalRequest>({ tag: '', breed: 'Holstein', weight: 450, age: 2, status: 'HEALTHY', feedLevel: 7, stableId: 0 });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try { const p = JSON.parse(atob(token.split('.')[1])); setUsername(p.sub || p.username || 'Ganadero'); } catch(e){}
    loadData();
  }, [token]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => setSnackbar({ open: true, message, severity });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [aData, sData] = await Promise.all([getAllAnimalsAction(), getAllStablesAction()]);
      setAnimals(aData.map(a => ({ ...a, feedLevel: a.feedLevel || 7 }))); 
      setStables(sData);
      const occupancy: Record<number, number> = {};
      sData.forEach(s => occupancy[s.id] = aData.filter(a => a.stableId === s.id).length);
      setStableOccupancy(occupancy);
    } catch (err) { showSnackbar('Error cargando datos', 'error'); } 
    finally { setLoading(false); }
  }, []);

  // --- SIMULACIÓN DE METABOLISMO ---
  // Baja 1 nivel cada 5 minutos (300,000 ms) para ser más realista y menos caótico que 1 minuto.
  useEffect(() => {
    const intervalId = setInterval(async () => {
      setAnimals(prevAnimals => {
        return prevAnimals.map(animal => {
          // Solo baja si es mayor a 0
          const currentLevel = animal.feedLevel || 0;
          const newFeedLevel = currentLevel > 0 ? currentLevel - 1 : 0;
          return { ...animal, feedLevel: newFeedLevel };
        });
      });
    }, 300000); // 5 minutos = 300000ms
    return () => clearInterval(intervalId);
  }, []);

  const generateTag = () => {
    const maxId = animals.length > 0 ? Math.max(...animals.map(a => parseInt(a.tag.split('-')[1] || '0'))) : 0;
    return `BOV-${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleOpenDialog = (animal?: Animal) => {
    if (animal) {
      setEditingAnimal(animal);
      setFormData({ 
          tag: animal.tag, 
          breed: animal.breed, 
          weight: animal.weight, 
          age: animal.age, 
          status: animal.status, 
          feedLevel: animal.feedLevel || 7, // Permitimos editar el nivel actual
          stableId: animal.stableId 
      });
    } else {
      setEditingAnimal(null);
      setFormData({ tag: generateTag(), breed: 'Holstein', weight: 450, age: 2, status: 'HEALTHY', feedLevel: 7, stableId: stables[0]?.id || 0 });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingAnimal) await updateAnimalAction(editingAnimal.id, formData);
      else await createAnimalAction(formData);
      setOpenDialog(false);
      showSnackbar('Operación exitosa', 'success');
      loadData(); 
    } catch (err) { showSnackbar('Error al guardar', 'error'); }
  };

  const confirmDelete = (id: number) => { setAnimalToDelete(id); setOpenDeleteDialog(true); };
  const handleDelete = async () => {
    if (animalToDelete !== null) {
      try { await deleteAnimalAction(animalToDelete); showSnackbar('Eliminado', 'success'); loadData(); } 
      catch (error) { showSnackbar('Error eliminando', 'error'); } 
      finally { setOpenDeleteDialog(false); setAnimalToDelete(null); }
    }
  };

  const filteredAnimals = searchValue ? animals.filter(a => a.id === searchValue.id) : animals;

  // Lógica de Pronóstico Global
  const getFeedingForecast = () => {
      const criticalCount = animals.filter(a => (a.feedLevel || 0) <= 2).length;
      const lowCount = animals.filter(a => (a.feedLevel || 0) > 2 && (a.feedLevel || 0) <= 5).length;
      
      if (criticalCount > 0) return { message: `ALERTA: ${criticalCount} animales necesitan alimento en las próximas 6 horas.`, color: '#ffebee', icon: <WarningIcon color="error" /> };
      if (lowCount > 0) return { message: `Planificación: ${lowCount} animales necesitarán recarga mañana.`, color: '#fff3e0', icon: <TimeIcon color="warning" /> };
      return { message: `Estado Óptimo: Suministros cubiertos para +24 horas.`, color: '#e8f5e9', icon: <TimelineIcon color="success" /> };
  };

  const forecast = getFeedingForecast();
  
  // Info de alimentación para el formulario actual
  const currentFeedMeta = getFeedInfo(formData.feedLevel || 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)', backgroundSize: '200% 200%', animation: `${backgroundMove} 15s ease infinite`, overflow: 'hidden' }}>
        
        {/* SIDEBAR */}
        <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, zIndex: 10 }}>
          <Paper elevation={0} sx={{ width: '60px', height: '90%', borderRadius: '30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
             <List sx={{ width: '100%', px: 1, mt: 2 }}>
              {MENU_ITEMS.map((item) => (
                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                  <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: 'center', borderRadius: '50%', mb: 1, color: location.pathname === item.path ? 'primary.main' : 'text.secondary', bgcolor: location.pathname === item.path ? 'rgba(67, 160, 71, 0.15)' : 'transparent', '&:hover': { bgcolor: 'rgba(67, 160, 71, 0.05)' } }}>
                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
          </Paper>
        </Box>

        {/* CONTENIDO */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, px: 3 }}>
            <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PetsIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary">Gestión de Animales</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip avatar={<Avatar>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.5)', border: 'none' }} />
                <IconButton onClick={logout} color="error"><LogoutIcon /></IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
            
            {/* 1. SECCIÓN DE PRONÓSTICO */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', bgcolor: forecast.color, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'white' }}>{forecast.icon}</Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">ANÁLISIS DE PROVISIÓN</Typography>
                        <Typography variant="body2" color="text.secondary">{forecast.message}</Typography>
                    </Box>
                </Box>
                <Chip label="Cálculo Metabólico" size="small" variant="outlined" sx={{ borderColor: 'rgba(0,0,0,0.2)', color: 'text.secondary' }} />
            </Paper>

            {/* 2. BARRA DE HERRAMIENTAS */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
               <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', flexGrow: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Autocomplete
                        fullWidth
                        options={animals}
                        getOptionLabel={(option) => `${option.tag} - ${option.breed}`}
                        value={searchValue}
                        onChange={(event, newValue) => setSearchValue(newValue)}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                placeholder="Buscar por TAG o Raza..." 
                                variant="standard"
                                InputProps={{ ...params.InputProps, disableUnderline: true, startAdornment: <InputAdornment position="start"><SearchIcon color="action" sx={{ ml: 1 }} /></InputAdornment> }} 
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id}>
                                <PetsIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 18 }} />
                                {option.tag} <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>({option.breed})</Typography>
                            </Box>
                        )}
                    />
                </Paper>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ borderRadius: '12px', fontWeight: 700, px: 4, boxShadow: '0 8px 16px rgba(67, 160, 71, 0.25)' }}>Nuevo</Button>
            </Box>

            {/* 3. GRID DE TARJETAS */}
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box> :
            filteredAnimals.length === 0 ? <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.6)' }}><Typography>No se encontraron animales.</Typography></Paper> : 
            
            <Grid container spacing={3}>
              {filteredAnimals.map((animal, index) => {
                const sInfo = HEALTH_STATUSES.find(s => s.value === animal.status) || HEALTH_STATUSES[0];
                const stable = stables.find(s => s.id === animal.stableId);
                const fInfo = getFeedInfo(animal.feedLevel || 0);

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={animal.id}>
                    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', animation: `${fadeInUp} 0.5s ease backwards`, animationDelay: `${index * 0.05}s`, transition: 'all 0.3s', position: 'relative', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' } }}>
                      
                      <Box sx={{ position: 'absolute', top: 24, right: 0, width: 4, height: 32, bgcolor: `${sInfo.color}.main`, borderRadius: '4px 0 0 4px' }} />
                      
                      <Box sx={{ height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'visible', mt: 2 }}>
                         <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: `${float} 6s ease-in-out infinite` }}>
                            <img src={sInfo.image} alt={sInfo.label} style={{ width: '85%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' }} />
                         </Box>
                      </Box>
                      
                      <CardContent sx={{ pt: 1, pb: 1, px: 3, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                           <Typography variant="h5" fontWeight="800" color="text.primary">{animal.tag}</Typography>
                           <Chip label={sInfo.label} color={sInfo.color as any} size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ mb: 2 }}>{animal.breed}</Typography>
                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                        
                        <Grid container spacing={1}>
                            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><OwnerIcon fontSize="small" sx={{ color: '#90a4ae', fontSize: 16 }} /><Typography variant="caption" color="text.secondary" fontWeight="500">Dueño: {animal.ownerUsername}</Typography></Box></Grid>
                            <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><WeightIcon fontSize="small" sx={{ color: '#90a4ae', fontSize: 16 }} /><Typography variant="caption" color="text.secondary" fontWeight="500">{animal.weight}kg</Typography></Box></Grid>
                            
                            <Grid item xs={6}>
                                <Chip icon={<LocationIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />} label={stable?.name || 'N/A'} size="small" sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold', fontSize: '0.7rem', height: 22 }} />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">Alimento:</Typography>
                                    <Typography variant="caption" fontWeight="bold" color={`${fInfo.color}.main`}>{animal.feedLevel}/10</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={(animal.feedLevel || 0) * 10} color={fInfo.color as any} sx={{ borderRadius: 4, height: 6, bgcolor: alpha('#000', 0.05) }} />
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', fontSize: '0.65rem' }}>{fInfo.text}</Typography>
                            </Grid>
                        </Grid>
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'center', pb: 2, pt: 0 }}>
                        <IconButton size="small" onClick={() => handleOpenDialog(animal)} sx={{ bgcolor: '#e3f2fd', color: '#1976d2', mx: 1 }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => confirmDelete(animal.id)} sx={{ bgcolor: '#ffebee', color: '#d32f2f', mx: 1 }}><DeleteIcon fontSize="small" /></IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>}
          </Container>
        </Box>

        {/* --- DIÁLOGO FORMULARIO --- */}
        <Dialog open={openDialog} TransitionComponent={Transition} keepMounted onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { p: 2 } }}>
          <DialogTitle sx={{ px: 2, pt: 2, pb: 1 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Box>
                    <Typography variant="h6" fontWeight="700" color="primary.dark">{editingAnimal ? 'Editar Expediente' : 'Nuevo Registro'}</Typography>
                    <Typography variant="caption" color="text.secondary">Ajuste de datos y alimentación</Typography>
                 </Box>
                 <Avatar sx={{ bgcolor: 'rgba(67, 160, 71, 0.1)', color: 'primary.main' }}><PetsIcon /></Avatar>
             </Box>
          </DialogTitle>
          <DialogContent sx={{ px: 2, py: 2 }}>
            <Grid container spacing={2.5}>
                {/* ... Campos de Identificación y Métricas (Igual) ... */}
                <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, fontWeight: 700, display: 'block' }}>Identificación</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Tag ID" value={formData.tag} fullWidth disabled variant="outlined" InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon color="action" /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined"><InputLabel>Raza</InputLabel><Select label="Raza" value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} startAdornment={<InputAdornment position="start"><PetsIcon fontSize="small" /></InputAdornment>}>{CATTLE_BREEDS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}</Select></FormControl>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}><Divider /></Grid>
                <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, fontWeight: 700, display: 'block' }}>Métricas & Salud</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><ScrollNumberPicker label="Peso" value={formData.weight} onChange={(val) => setFormData({...formData, weight: val})} min={50} max={1200} step={10} unit="kg" icon={<WeightIcon fontSize="small" />} /></Grid>
                        <Grid item xs={6}><ScrollNumberPicker label="Edad" value={formData.age} onChange={(val) => setFormData({...formData, age: val})} min={0} max={25} step={1} unit="años" icon={<CakeIcon fontSize="small" />} /></Grid>
                        
                        {/* ALIMENTACIÓN EDITABLE Y CON AVISO */}
                        <Grid item xs={12}>
                            <ScrollNumberPicker 
                                label="Nivel de Alimentación (Editable)" 
                                value={formData.feedLevel || 7} 
                                onChange={(val) => setFormData({...formData, feedLevel: val})} 
                                min={0} 
                                max={10} 
                                step={1} 
                                unit={`/10`} 
                                icon={<FeedIcon fontSize="small" />} 
                                // YA NO ESTÁ DISABLED
                                disabled={false}
                            />
                            
                            {/* AVISO DE ESTIMACIÓN EN TIEMPO REAL */}
                            <Alert 
                                severity={currentFeedMeta.alertSeverity as any} 
                                sx={{ mt: 1, borderRadius: 2 }}
                                icon={currentFeedMeta.alertSeverity === 'success' ? <TimeIcon /> : <WarningIcon />}
                            >
                                {currentFeedMeta.text}
                            </Alert>
                        </Grid>
                    </Grid>
                </Grid>
                
                {/* ... Ubicación y Estado ... */}
                <Grid item xs={12}><Divider /></Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Establo</InputLabel><Select label="Establo" value={formData.stableId} onChange={(e) => setFormData({...formData, stableId: Number(e.target.value)})} disabled={!!editingAnimal}>{stables.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Estado Salud</InputLabel><Select label="Estado Salud" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>{HEALTH_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}</Select></FormControl></Grid>
                    </Grid>
                </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit">Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ px: 4, borderRadius: 3 }}>{editingAnimal ? 'Guardar Cambios' : 'Registrar'}</Button>
          </DialogActions>
        </Dialog>

        {/* --- DIÁLOGO ELIMINAR --- */}
        <Dialog open={openDeleteDialog} TransitionComponent={Transition} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: '24px', p: 2, minWidth: 320 } }}>
            <DialogTitle sx={{ textAlign: 'center', color: 'error.main' }}><WarningIcon sx={{ fontSize: 60, mb: 1, display: 'block', mx: 'auto' }} />¿Eliminar registro?</DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}><Typography variant="body1" color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
                <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                <Button variant="contained" color="error" onClick={handleDelete}>Confirmar</Button>
            </DialogActions>
        </Dialog>
        
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3 }}>{snackbar.message}</Alert></Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default AnimalsPage;