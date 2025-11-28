import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
  CircularProgress, MenuItem, Slider, FormControl, InputLabel, Select,
  List, ListItemButton, ListItemIcon, Tooltip, Avatar, AppBar,
  Toolbar, CssBaseline, Slide, Divider, Snackbar, Alert, Stack, InputAdornment
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
  QrCode as TagIcon
} from '@mui/icons-material';

import { getAllAnimalsAction, createAnimalAction, updateAnimalAction, deleteAnimalAction } from '../application/animal';
import { getAllStablesAction } from '../application/stable';
import { Animal, AnimalRequest } from '../domain/animal';
import { StableResponse } from '../domain/stable';
import { useAuth } from '../contexts/AuthContext';

// --- ANIMACIONES & ESTILOS ---
const backgroundMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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
    error: { main: '#e53935' },
    background: { default: '#f0f4f1' },
    text: { primary: '#37474f', secondary: '#78909c' },
  },
  typography: { fontFamily: '"Poppins", "Roboto", sans-serif' },
  shape: { borderRadius: 16 },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#f8f9fa',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#43a047' },
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#f8f9fa',
          '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
        }
      }
    }
  }
});

// Formularios minimalistas sin islas

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

// --- DATA ---
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
  { value: 'HEALTHY', label: 'Saludable', color: 'success', desc: 'Óptimo' },
  { value: 'OBSERVATION', label: 'Observación', color: 'warning', desc: 'Revisar' },
  { value: 'SICK', label: 'Enfermo', color: 'error', desc: 'Tratar' },
];

const AnimalsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [stables, setStables] = useState<StableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<number | null>(null);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [username, setUsername] = useState<string>('Usuario');
  const [stableOccupancy, setStableOccupancy] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState<AnimalRequest>({ tag: '', breed: 'Holstein', weight: 450, age: 2, status: 'HEALTHY', feedLevel: 7, stableId: 0 });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try { const p = JSON.parse(atob(token.split('.')[1])); setUsername(p.sub || p.username || 'Ganadero'); } catch(e){}
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aData, sData] = await Promise.all([getAllAnimalsAction(), getAllStablesAction()]);
      setAnimals(aData);
      setStables(sData);
      const occupancy: Record<number, number> = {};
      sData.forEach(s => occupancy[s.id] = aData.filter(a => a.stableId === s.id).length);
      setStableOccupancy(occupancy);
    } catch (err) { showSnackbar('Error cargando datos', 'error'); } 
    finally { setLoading(false); }
  };

  const generateTag = () => {
    const maxId = animals.length > 0 ? Math.max(...animals.map(a => parseInt(a.tag.split('-')[1] || '0'))) : 0;
    return `BOV-${String(maxId + 1).padStart(3, '0')}`;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

  const handleOpenDialog = (animal?: Animal) => {
    if (animal) {
      setEditingAnimal(animal);
      setFormData({ tag: animal.tag, breed: animal.breed, weight: animal.weight, age: animal.age, status: animal.status, feedLevel: animal.feedLevel || 7, stableId: animal.stableId });
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

  const filteredAnimals = animals.filter(a => a.tag.toLowerCase().includes(searchTerm.toLowerCase()) || a.breed.toLowerCase().includes(searchTerm.toLowerCase()));

  const getFeedInfo = (lvl: number) => {
    if (lvl < 4) return { label: 'Bajo', color: '#e53935', bg: '#ffebee', text: 'Atención necesaria' };
    if (lvl > 8) return { label: 'Alto', color: '#fb8c00', bg: '#fff3e0', text: 'Posible sobrepeso' };
    return { label: 'Óptimo', color: '#43a047', bg: '#e8f5e9', text: 'Estado ideal' };
  };
  const feedMeta = getFeedInfo(formData.feedLevel || 0);

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
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
               <Paper sx={{ p: '2px 14px', display: 'flex', alignItems: 'center', flexGrow: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)' }}>
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <TextField variant="standard" placeholder="Buscar por tag o raza..." InputProps={{ disableUnderline: true }} fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </Paper>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}>Nuevo</Button>
            </Box>

            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box> :
            filteredAnimals.length === 0 ? <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.6)' }}><Typography>No hay animales</Typography></Paper> : 
            
            <Grid container spacing={3}>
              {filteredAnimals.map((animal, index) => {
                const sInfo = HEALTH_STATUSES.find(s => s.value === animal.status) || HEALTH_STATUSES[0];
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={animal.id}>
                    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', animation: `${fadeInUp} 0.5s ease backwards`, animationDelay: `${index * 0.05}s`, transition: 'all 0.3s', position: 'relative', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(46, 125, 50, 0.15)' } }}>
                      <Box sx={{ position: 'absolute', top: 20, right: 0, width: 6, height: 40, bgcolor: `${sInfo.color}.main`, borderRadius: '4px 0 0 4px' }} />
                      <Box sx={{ bgcolor: 'rgba(67, 160, 71, 0.05)', p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <Box sx={{ animation: `${pulse} 3s infinite ease-in-out` }}>
                            <svg width="80" height="80" viewBox="0 0 200 200">
                              {/* Fondo circular */}
                              <circle cx="100" cy="100" r="90" fill="#E8F5E9" />
                              {/* Cuerpo de la vaca */}
                              <ellipse cx="100" cy="110" rx="55" ry="45" fill="#FFFFFF" />
                              {/* Manchas */}
                              <ellipse cx="75" cy="100" rx="15" ry="20" fill="#8D6E63" />
                              <ellipse cx="120" cy="105" rx="18" ry="22" fill="#8D6E63" />
                              <ellipse cx="95" cy="125" rx="12" ry="15" fill="#8D6E63" />
                              {/* Cabeza */}
                              <ellipse cx="100" cy="70" rx="28" ry="32" fill="#FFFFFF" />
                              {/* Orejas */}
                              <ellipse cx="75" cy="60" rx="8" ry="15" fill="#FFB6C1" transform="rotate(-25 75 60)" />
                              <ellipse cx="125" cy="60" rx="8" ry="15" fill="#FFB6C1" transform="rotate(25 125 60)" />
                              {/* Cuernos */}
                              <path d="M80 50 L75 35 L78 50 Z" fill="#D2691E" />
                              <path d="M120 50 L125 35 L122 50 Z" fill="#D2691E" />
                              {/* Ojos */}
                              <circle cx="90" cy="70" r="4" fill="#2c3e50" />
                              <circle cx="110" cy="70" r="4" fill="#2c3e50" />
                              {/* Hocico */}
                              <ellipse cx="100" cy="85" rx="18" ry="12" fill="#FFB6C1" />
                              <ellipse cx="95" cy="87" rx="3" ry="4" fill="#2c3e50" />
                              <ellipse cx="105" cy="87" rx="3" ry="4" fill="#2c3e50" />
                              {/* Patas */}
                              <rect x="70" y="140" width="10" height="25" rx="5" fill="#FFFFFF" />
                              <rect x="90" y="140" width="10" height="25" rx="5" fill="#FFFFFF" />
                              <rect x="110" y="140" width="10" height="25" rx="5" fill="#FFFFFF" />
                              <rect x="130" y="140" width="10" height="25" rx="5" fill="#FFFFFF" />
                              {/* Pezuñas */}
                              <rect x="70" y="160" width="10" height="8" rx="2" fill="#2c3e50" />
                              <rect x="90" y="160" width="10" height="8" rx="2" fill="#2c3e50" />
                              <rect x="110" y="160" width="10" height="8" rx="2" fill="#2c3e50" />
                              <rect x="130" y="160" width="10" height="8" rx="2" fill="#2c3e50" />
                            </svg>
                         </Box>
                      </Box>
                      <CardContent sx={{ pt: 2, pb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                           <Typography variant="h6" fontWeight="bold">{animal.tag}</Typography>
                           <Chip label={sInfo.label} color={sInfo.color as any} size="small" variant="outlined" sx={{ fontWeight: 600, border: 'none', bgcolor: 'rgba(0,0,0,0.05)' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{animal.breed}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 1 }}>
                            <Box sx={{ textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Peso</Typography><Typography variant="body2" fontWeight="bold">{animal.weight}kg</Typography></Box>
                            <Box sx={{ textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Edad</Typography><Typography variant="body2" fontWeight="bold">{animal.age} a</Typography></Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <IconButton size="small" onClick={() => handleOpenDialog(animal)} sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#1976d2', mx: 1 }}><EditIcon /></IconButton>
                        <IconButton size="small" onClick={() => confirmDelete(animal.id)} sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#d32f2f', mx: 1 }}><DeleteIcon /></IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>}
          </Container>
        </Box>

        {/* --- DIÁLOGO FORMULARIO (Diseño Limpio) --- */}
        <Dialog 
            open={openDialog} 
            TransitionComponent={Transition} 
            keepMounted 
            onClose={() => setOpenDialog(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { p: 2 } }}
        >
          <DialogTitle sx={{ px: 2, pt: 2, pb: 1 }}>
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Box>
                    <Typography variant="h6" fontWeight="700" color="primary.dark">
                        {editingAnimal ? 'Editar Expediente' : 'Nuevo Registro'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Información clínica y ubicación del animal
                    </Typography>
                 </Box>
                 <Avatar sx={{ bgcolor: 'rgba(67, 160, 71, 0.1)', color: 'primary.main', width: 42, height: 42 }}>
                     <PetsIcon />
                 </Avatar>
             </Box>
          </DialogTitle>

          <DialogContent sx={{ px: 2, py: 2 }}>
            <Grid container spacing={2.5}>
                
                {/* SECCIÓN 1: IDENTIDAD */}
                <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, fontWeight: 700, display: 'block' }}>
                        Identificación
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Tag ID" 
                                value={formData.tag} 
                                fullWidth disabled 
                                variant="outlined"
                                InputProps={{ 
                                    startAdornment: <InputAdornment position="start"><TagIcon color="action" /></InputAdornment>
                                }}
                                helperText={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                        <AutoIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                        <Typography variant="caption" color="primary.main" fontWeight="600">
                                            Generado automáticamente para evitar duplicados
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Raza</InputLabel>
                                <Select 
                                    label="Raza"
                                    value={formData.breed} 
                                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                                    startAdornment={<InputAdornment position="start"><PetsIcon fontSize="small" /></InputAdornment>}
                                >
                                    {CATTLE_BREEDS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* SECCIÓN 2: MÉTRICAS CORPORALES */}
                <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, fontWeight: 700, display: 'block' }}>
                        Métricas Corporales
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <ScrollNumberPicker 
                                label="Peso Corporal" 
                                value={formData.weight} 
                                onChange={(val) => setFormData({...formData, weight: val})} 
                                min={50} 
                                max={1200} 
                                step={10} 
                                unit="kg"
                                icon={<WeightIcon fontSize="small" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <ScrollNumberPicker 
                                label="Edad del Animal" 
                                value={formData.age} 
                                onChange={(val) => setFormData({...formData, age: val})} 
                                min={0} 
                                max={25} 
                                step={1} 
                                unit="años"
                                icon={<CakeIcon fontSize="small" />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ScrollNumberPicker 
                                label="Nivel de Alimentación" 
                                value={formData.feedLevel || 7} 
                                onChange={(val) => setFormData({...formData, feedLevel: val})} 
                                min={0} 
                                max={10} 
                                step={1} 
                                unit={`/10 - ${feedMeta.label}`}
                                icon={<WaterDropIcon fontSize="small" />}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
                                {feedMeta.text}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* SECCIÓN 3: ESTADO Y UBICACIÓN */}
                <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, fontWeight: 700, display: 'block' }}>
                        Ubicación y Estado
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Establo Asignado</InputLabel>
                                <Select 
                                    label="Establo Asignado"
                                    value={formData.stableId} 
                                    onChange={(e) => setFormData({...formData, stableId: Number(e.target.value)})}
                                    startAdornment={<InputAdornment position="start"><HouseSidingIcon fontSize="small" /></InputAdornment>}
                                >
                                    {stables.map(s => {
                                        const occupied = stableOccupancy[s.id] || 0;
                                        const isFull = (s.capacity - occupied) <= 0;
                                        const isDisabled = isFull && (!editingAnimal || editingAnimal.stableId !== s.id);
                                        return (
                                            <MenuItem key={s.id} value={s.id} disabled={isDisabled}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <Typography variant="body2">{s.name}</Typography>
                                                    <Chip label={`${occupied}/${s.capacity}`} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: isFull ? '#ffebee' : '#e8f5e9', color: isFull ? 'error.main' : 'success.main' }} />
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Estado de Salud</InputLabel>
                                <Select 
                                    label="Estado de Salud"
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    startAdornment={<InputAdornment position="start"><LocalHospitalIcon fontSize="small" /></InputAdornment>}
                                >
                                    {HEALTH_STATUSES.map(s => (
                                        <MenuItem key={s.value} value={s.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${s.color}.main` }} />
                                                {s.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
            <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ borderRadius: 3, textTransform: 'none', color: 'text.secondary', px: 3 }}>
                Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 3, px: 5, py: 1, fontWeight: 'bold', boxShadow: '0 8px 16px rgba(67, 160, 71, 0.25)', textTransform: 'none' }}>
                {editingAnimal ? 'Guardar Cambios' : 'Registrar Animal'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* --- DIÁLOGO ELIMINAR --- */}
        <Dialog open={openDeleteDialog} TransitionComponent={Transition} keepMounted onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: '24px', p: 2, minWidth: 320 } }}>
            <DialogTitle sx={{ textAlign: 'center', color: 'error.main' }}><WarningIcon sx={{ fontSize: 60, mb: 1, display: 'block', mx: 'auto' }} />¿Eliminar registro?</DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}><Typography variant="body1" color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
                <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)} sx={{ borderRadius: 3 }}>Cancelar</Button>
                <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 3 }}>Confirmar</Button>
            </DialogActions>
        </Dialog>
        
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3 }}>{snackbar.message}</Alert></Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default AnimalsPage;