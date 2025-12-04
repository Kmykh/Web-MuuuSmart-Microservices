import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
  CircularProgress, MenuItem, FormControl, InputLabel, Select,
  List, ListItemButton, ListItemIcon, Tooltip, Avatar, AppBar,
  Toolbar, CssBaseline, Slide, Divider, Snackbar, Alert, LinearProgress,
  Stack, ListItem, ListItemText
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { format } from 'date-fns';

// --- ICONOS ---
import {
  Add as AddIcon, Delete as DeleteIcon, Pets as PetsIcon,
  Search as SearchIcon, GridView as GridViewIcon, HouseSiding as HouseSidingIcon,
  LocalHospital as LocalHospitalIcon, WaterDrop as WaterDropIcon, Flag as FlagIcon,
  BarChart as BarChartIcon, Logout as LogoutIcon, Event as EventIcon,
  CheckCircle as CheckCircleIcon, PlayCircle as PlayCircleIcon, PauseCircle as PauseCircleIcon,
  Warning as WarningIcon, TrackChanges as TrackChangesIcon, Sms as SmsIcon,
  Visibility as VisibilityIcon, SwapVert as SwapVertIcon,
  ArrowForward as ArrowIcon, Close as CloseIcon
} from '@mui/icons-material';

import {
    getAllCampaignsAction, createCampaignAction, deleteCampaignAction,
    addGoalToCampaignAction, addChannelToCampaignAction, updateCampaignStatusAction,
    getGoalsByCampaignAction, getChannelsByCampaignAction
} from '../application/campaign';
import { getAllStablesAction } from '../application/stable';
import { Campaign, CampaignStatus, CreateCampaignRequest, AddGoalRequest, AddChannelRequest, Metric, ChannelType } from '../domain/campaign';
import { StableResponse } from '../domain/stable';
import { useAuth } from '../contexts/AuthContext';

// --- ANIMACIONES ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// --- TEMA MINIMALISTA ---
const theme = createTheme({
    palette: {
        primary: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
        error: { main: '#d32f2f' },
        background: { default: '#f8f9fa', paper: '#ffffff' },
        text: { primary: '#2d3436', secondary: '#636e72' },
        info: { main: '#0288d1' },
        success: { main: '#2e7d32' },
        warning: { main: '#ed6c02' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        h6: { fontWeight: 700, letterSpacing: '-0.5px' },
        body2: { lineHeight: 1.6 },
        caption: { fontWeight: 500 }
    },
    shape: { borderRadius: 16 },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 24 // Bordes redondeados como en la imagen
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 12, textTransform: 'none', fontWeight: 600 }
            }
        }
    }
});

const MENU_ITEMS = [
    { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
    { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
    { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' },
    { text: 'Salud', icon: <LocalHospitalIcon />, path: '/health' },
    { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
    { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
    { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

const STATUS_INFO: Record<CampaignStatus, { label: string; color: 'info' | 'success' | 'warning'; icon: React.ReactElement; description: string }> = {
    PLANNED: { label: 'Planeada', color: 'info', icon: <PauseCircleIcon />, description: 'La campaña aún no ha comenzado.' },
    ACTIVE: { label: 'Activa', color: 'success', icon: <PlayCircleIcon />, description: 'La campaña está en curso actualmente.' },
    COMPLETED: { label: 'Completada', color: 'warning', icon: <CheckCircleIcon />, description: 'La campaña ha finalizado.' },
};

const METRIC_LABELS: Record<Metric, string> = { CONVERSIONS: 'Conversiones', CLICKS: 'Clics', VIEWS: 'Vistas' };
const METRICS: Metric[] = ['CONVERSIONS', 'CLICKS', 'VIEWS'];
const CHANNEL_TYPES: ChannelType[] = ['SMS', 'WHATSAPP', 'EMAIL', 'SOCIAL_MEDIA'];

const getProgress = (current: number, target: number) => (!target || target === 0) ? 0 : Math.min((current / target) * 100, 100);

const CampaignsPage: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stables, setStables] = useState<StableResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Usuario');
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

    // Dialogs
    const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
    const [openGoalDialog, setOpenGoalDialog] = useState(false);
    const [openChannelDialog, setOpenChannelDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    
    // NUEVO: Diálogo de Estado
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);

    // Forms
    const [campaignForm, setCampaignForm] = useState<CreateCampaignRequest>({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNED', stableId: 0 });
    const [goalForm, setGoalForm] = useState({ description: '', metric: 'CONVERSIONS' as Metric, targetValue: 100, currentValue: 0 as number | string });
    const [channelForm, setChannelForm] = useState<AddChannelRequest>({ type: 'SMS', details: '' });

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        try { const p = JSON.parse(atob(token.split('.')[1])); setUsername(p.sub || p.username || 'Ganadero'); } catch (e) {}
        loadData();
    }, [token]);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => setSnackbar({ open: true, message, severity });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [campaignData, stableData] = await Promise.all([getAllCampaignsAction(), getAllStablesAction()]);
            setCampaigns(campaignData.map((c) => ({...c, goals: c.goals || [], channels: c.channels || [], status: (c.status as CampaignStatus) || 'PLANNED'})));
            setStables(stableData);
        } catch (err) { showSnackbar('Error cargando los datos', 'error'); } finally { setLoading(false); }
    }, []);

    // Handlers
    const handleOpenCampaignDialog = () => { setCampaignForm({ name: '', description: '', startDate: '', endDate: '', status: 'PLANNED', stableId: stables[0]?.id || 0 }); setOpenCampaignDialog(true); };
    const handleOpenGoalDialog = (campaign: Campaign) => { setSelectedCampaign(campaign); setGoalForm({ description: '', metric: 'CONVERSIONS', targetValue: 100, currentValue: '' }); setOpenGoalDialog(true); };
    const handleOpenChannelDialog = (campaign: Campaign) => { setSelectedCampaign(campaign); setChannelForm({ type: 'SMS', details: '' }); setOpenChannelDialog(true); };
    const handleConfirmDelete = (id: number) => { setCampaignToDelete(id); setOpenDeleteDialog(true); };
    
    // NUEVO: Abrir diálogo de estado
    const handleOpenStatusDialog = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setOpenStatusDialog(true);
    };

    const handleOpenDetailsDialog = async (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setOpenDetailsDialog(true);
        try {
            const [goals, channels] = await Promise.all([getGoalsByCampaignAction(campaign.id), getChannelsByCampaignAction(campaign.id)]);
            setSelectedCampaign(prev => prev && prev.id === campaign.id ? { ...prev, goals, channels } : { ...campaign, goals, channels });
        } catch (error) { showSnackbar('Error al cargar detalles', 'error'); }
    };

    // CRUD Logic
    const handleStatusChange = async (newStatus: CampaignStatus) => {
        if (!selectedCampaign) return;
        try { 
            await updateCampaignStatusAction(selectedCampaign.id, { status: newStatus }); 
            showSnackbar(`Estado cambiado a ${STATUS_INFO[newStatus].label}`, 'success'); 
            loadData(); 
            setOpenStatusDialog(false); // Cerrar diálogo
        } catch (err) { showSnackbar('Error al actualizar', 'error'); }
    };

    const handleCreateCampaign = async () => { /* ... lógica de creación igual ... */ 
        try {
            const payload = { ...campaignForm, startDate: campaignForm.startDate.includes('T') ? campaignForm.startDate : `${campaignForm.startDate}T00:00:00`, endDate: campaignForm.endDate.includes('T') ? campaignForm.endDate : `${campaignForm.endDate}T23:59:59` };
            await createCampaignAction(payload); showSnackbar('Campaña creada', 'success'); setOpenCampaignDialog(false); loadData();
        } catch (err) { showSnackbar('Error al crear', 'error'); }
    };

    const handleAddGoal = async () => { /* ... lógica de agregar meta igual ... */
        if (!selectedCampaign) return;
        const finalCurrentVal = (goalForm.currentValue === '' || goalForm.currentValue === null) ? 0 : Number(goalForm.currentValue);
        try { await addGoalToCampaignAction(selectedCampaign.id, { description: goalForm.description, metric: goalForm.metric, targetValue: Number(goalForm.targetValue), currentValue: finalCurrentVal }); showSnackbar('Meta agregada', 'success'); setOpenGoalDialog(false); loadData(); } catch (err) { showSnackbar('Error al agregar meta', 'error'); }
    };

    const handleAddChannel = async () => { /* ... lógica de agregar canal igual ... */
        if (!selectedCampaign) return;
        try { await addChannelToCampaignAction(selectedCampaign.id, channelForm); showSnackbar('Canal agregado', 'success'); setOpenChannelDialog(false); loadData(); } catch (err) { showSnackbar('Error al agregar canal', 'error'); }
    };

    const handleDeleteCampaign = async () => { /* ... lógica de eliminar igual ... */
        if (campaignToDelete === null) return;
        try { await deleteCampaignAction(campaignToDelete); showSnackbar('Eliminada', 'success'); setOpenDeleteDialog(false); setCampaignToDelete(null); loadData(); } catch (err) { showSnackbar('Error al eliminar', 'error'); }
    };

    const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', bgcolor: '#f8f9fa', overflow: 'hidden' }}>
                
                {/* MENU LATERAL */}
                <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, zIndex: 10 }}>
                    <Paper elevation={0} sx={{ width: '60px', height: '90%', borderRadius: '30px', bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, border: '1px solid #edf2f7' }}>
                        <List sx={{ width: '100%', px: 1, mt: 2 }}>
                            {MENU_ITEMS.map((item) => (
                                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                                <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: 'center', borderRadius: '50%', mb: 1, color: location.pathname === item.path ? 'primary.main' : 'text.secondary', bgcolor: location.pathname === item.path ? 'rgba(46, 125, 50, 0.1)' : 'transparent', '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.05)' } }}>
                                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                                </ListItemButton>
                                </Tooltip>
                            ))}
                        </List>
                    </Paper>
                </Box>

                {/* CONTENIDO PRINCIPAL */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                    {/* APPBAR SIMPLIFICADA */}
                    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, px: 3 }}>
                        <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'white', borderRadius: '16px', border: '1px solid #edf2f7' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FlagIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" color="text.primary">Campañas</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip avatar={<Avatar sx={{ width: 24, height: 24 }}>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ border: 'none', bgcolor: '#f5f5f5' }} />
                                <IconButton onClick={() => logout()} size="small"><LogoutIcon /></IconButton>
                            </Box>
                        </Toolbar>
                    </AppBar>

                    <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Paper sx={{ p: '4px 16px', display: 'flex', alignItems: 'center', flexGrow: 1, borderRadius: '12px', bgcolor: 'white', border: '1px solid #edf2f7', boxShadow: 'none' }}>
                                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                <TextField variant="standard" placeholder="Buscar campaña..." InputProps={{ disableUnderline: true }} fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </Paper>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCampaignDialog} sx={{ borderRadius: '12px', px: 4, boxShadow: 'none' }}>Crear</Button>
                        </Box>

                        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box> :
                        filteredCampaigns.length === 0 ? <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'white' }}><Typography>No hay campañas registradas.</Typography></Paper> :
                        
                        <Grid container spacing={3}>
                            {filteredCampaigns.map((campaign, index) => {
                                const status = STATUS_INFO[campaign.status as CampaignStatus] || STATUS_INFO.PLANNED;
                                const stable = stables.find(s => s.id === campaign.stableId);
                                
                                return (
                                    <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                                        <Card sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            animation: `${fadeInUp} 0.5s ease backwards`, 
                                            animationDelay: `${index * 0.05}s`,
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)' }
                                        }}>
                                            
                                            <CardContent sx={{ flexGrow: 1, p: 3, pb: 1 }}>
                                                {/* Header: Titulo + Delete */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                    <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1.2 }}>{campaign.name}</Typography>
                                                    <IconButton size="small" onClick={(e) => {e.stopPropagation(); handleConfirmDelete(campaign.id);}} sx={{ mt: -1, mr: -1, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                                
                                                {/* Establo */}
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                                                    {stable?.name || 'Establo General'}
                                                </Typography>

                                                {/* Descripción */}
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '40px', color: '#546e7a' }}>
                                                    {campaign.description || 'Sin descripción disponible para esta campaña.'}
                                                </Typography>

                                                {/* Separador Sutil */}
                                                <Divider sx={{ mb: 2, borderStyle: 'dashed', borderColor: '#e0e0e0' }} />

                                                {/* Fechas: Limpio, sin islas */}
                                                <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block">Inicio</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <EventIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                            <Typography variant="body2" fontWeight={600}>{format(new Date(campaign.startDate), 'dd MMM yyyy')}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block">Fin</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <EventIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                                            <Typography variant="body2" fontWeight={600}>{format(new Date(campaign.endDate), 'dd MMM yyyy')}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Stack>

                                                {/* Métricas / Contadores Minimalistas */}
                                                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                                    <Chip 
                                                        icon={<TrackChangesIcon sx={{ fontSize: '16px !important' }} />} 
                                                        label={campaign.goals.length} 
                                                        size="small" 
                                                        variant="outlined" 
                                                        sx={{ borderColor: '#e0e0e0', color: 'text.secondary', height: 24 }} 
                                                    />
                                                    <Chip 
                                                        icon={<SmsIcon sx={{ fontSize: '16px !important' }} />} 
                                                        label={campaign.channels.length} 
                                                        size="small" 
                                                        variant="outlined" 
                                                        sx={{ borderColor: '#e0e0e0', color: 'text.secondary', height: 24 }} 
                                                    />
                                                </Stack>

                                                {/* Acciones Principales */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                                                    <Button 
                                                        startIcon={<VisibilityIcon />} 
                                                        onClick={() => handleOpenDetailsDialog(campaign)}
                                                        sx={{ color: 'primary.main', pl: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                                                    >
                                                        VER DETALLES
                                                    </Button>
                                                    <Box>
                                                        <IconButton size="small" onClick={() => handleOpenGoalDialog(campaign)} sx={{ color: 'text.secondary' }}><TrackChangesIcon /></IconButton>
                                                        <IconButton size="small" onClick={() => handleOpenChannelDialog(campaign)} sx={{ color: 'text.secondary' }}><SmsIcon /></IconButton>
                                                    </Box>
                                                </Box>

                                            </CardContent>

                                            {/* BARRA DE ESTADO (Footer) */}
                                            <Box 
                                                onClick={() => handleOpenStatusDialog(campaign)}
                                                sx={{ 
                                                    bgcolor: alpha(theme.palette[status.color].main, 0.08), 
                                                    borderTop: `1px solid ${alpha(theme.palette[status.color].main, 0.2)}`,
                                                    p: 1.5, 
                                                    px: 3, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: alpha(theme.palette[status.color].main, 0.15) }
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Box sx={{ color: theme.palette[status.color].main, display: 'flex' }}>
                                                        {status.icon}
                                                    </Box>
                                                    <Typography variant="subtitle2" color={`${status.color}.main`} fontWeight={700}>
                                                        {status.label}
                                                    </Typography>
                                                </Stack>
                                                <SwapVertIcon fontSize="small" color="action" />
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>}
                    </Container>
                </Box>

                {/* --- DIALOGS --- */}
                
                {/* 1. CREAR CAMPAÑA */}
                <Dialog open={openCampaignDialog} onClose={() => setOpenCampaignDialog(false)} TransitionComponent={Transition} fullWidth maxWidth="sm">
                    <DialogTitle>Nueva Campaña</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid item xs={12}><TextField label="Nombre" fullWidth value={campaignForm.name} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} /></Grid>
                            <Grid item xs={12}><TextField label="Descripción" fullWidth multiline rows={3} value={campaignForm.description} onChange={e => setCampaignForm({...campaignForm, description: e.target.value})} /></Grid>
                            <Grid item xs={6}><TextField label="Inicio" type="date" fullWidth InputLabelProps={{ shrink: true }} value={campaignForm.startDate} onChange={e => setCampaignForm({...campaignForm, startDate: e.target.value})} /></Grid>
                            <Grid item xs={6}><TextField label="Fin" type="date" fullWidth InputLabelProps={{ shrink: true }} value={campaignForm.endDate} onChange={e => setCampaignForm({...campaignForm, endDate: e.target.value})} /></Grid>
                            <Grid item xs={12}><FormControl fullWidth><InputLabel>Establo</InputLabel><Select label="Establo" value={campaignForm.stableId} onChange={e => setCampaignForm({...campaignForm, stableId: Number(e.target.value)})}>{stables.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</Select></FormControl></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenCampaignDialog(false)}>Cancelar</Button><Button onClick={handleCreateCampaign} variant="contained" disableElevation>Crear</Button></DialogActions>
                </Dialog>

                {/* 2. AGREGAR META */}
                <Dialog open={openGoalDialog} onClose={() => setOpenGoalDialog(false)} TransitionComponent={Transition} fullWidth maxWidth="sm">
                    <DialogTitle>Definir Meta</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid item xs={12}><TextField label="Descripción" fullWidth value={goalForm.description} onChange={e => setGoalForm({...goalForm, description: e.target.value})} /></Grid>
                            <Grid item xs={12}><FormControl fullWidth><InputLabel>Métrica</InputLabel><Select label="Métrica" value={goalForm.metric} onChange={e => setGoalForm({...goalForm, metric: e.target.value as Metric})}>{METRICS.map(m => <MenuItem key={m} value={m}>{METRIC_LABELS[m]}</MenuItem>)}</Select></FormControl></Grid>
                            <Grid item xs={6}><TextField label="Objetivo" type="number" fullWidth value={goalForm.targetValue} onChange={e => setGoalForm({...goalForm, targetValue: Number(e.target.value)})} /></Grid>
                            <Grid item xs={6}><TextField label="Actual (Opcional)" type="number" fullWidth value={goalForm.currentValue} placeholder="0" onChange={e => setGoalForm({...goalForm, currentValue: e.target.value === '' ? '' : Number(e.target.value)})} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenGoalDialog(false)}>Cancelar</Button><Button onClick={handleAddGoal} variant="contained" disableElevation>Guardar</Button></DialogActions>
                </Dialog>

                {/* 3. AGREGAR CANAL */}
                <Dialog open={openChannelDialog} onClose={() => setOpenChannelDialog(false)} TransitionComponent={Transition} fullWidth maxWidth="xs">
                    <DialogTitle>Configurar Canal</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid item xs={12}><FormControl fullWidth><InputLabel>Tipo</InputLabel><Select label="Tipo" value={channelForm.type} onChange={e => setChannelForm({...channelForm, type: e.target.value as ChannelType})}>{CHANNEL_TYPES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></Grid>
                            <Grid item xs={12}><TextField label="Detalles" fullWidth value={channelForm.details || ''} onChange={e => setChannelForm({...channelForm, details: e.target.value})} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenChannelDialog(false)}>Cancelar</Button><Button onClick={handleAddChannel} variant="contained" disableElevation>Guardar</Button></DialogActions>
                </Dialog>

                {/* 4. DIÁLOGO SELECCIÓN DE ESTADO (NUEVO) */}
                <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} TransitionComponent={Transition} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Cambiar Estado</DialogTitle>
                    <DialogContent sx={{ px: 2 }}>
                        <List component="nav">
                            {Object.keys(STATUS_INFO).map((key) => {
                                const statusKey = key as CampaignStatus;
                                const info = STATUS_INFO[statusKey];
                                const isSelected = selectedCampaign?.status === statusKey;
                                return (
                                    <ListItemButton 
                                        key={statusKey} 
                                        onClick={() => handleStatusChange(statusKey)}
                                        selected={isSelected}
                                        sx={{ 
                                            borderRadius: 3, 
                                            mb: 1, 
                                            border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: `${info.color}.main` }}>{info.icon}</ListItemIcon>
                                        <ListItemText 
                                            primary={info.label} 
                                            secondary={info.description}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                        />
                                        {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
                                    </ListItemButton>
                                )
                            })}
                        </List>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button onClick={() => setOpenStatusDialog(false)} color="inherit">Cancelar</Button>
                    </DialogActions>
                </Dialog>

                {/* 5. VER DETALLES */}
                <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} TransitionComponent={Transition} fullWidth maxWidth="md">
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="h6">{selectedCampaign?.name}</Typography>
                        <IconButton onClick={() => setOpenDetailsDialog(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0 }}>
                        <Grid container sx={{ height: '500px' }}>
                            {/* METAS */}
                            <Grid item xs={12} md={6} sx={{ borderRight: '1px solid #f0f0f0', p: 3, overflowY: 'auto' }}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Metas de Conversión</Typography>
                                {selectedCampaign?.goals && selectedCampaign.goals.length > 0 ? (
                                    <List disablePadding>
                                        {selectedCampaign.goals.map((goal, idx) => (
                                            <React.Fragment key={idx}>
                                                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                    <ListItemText 
                                                        primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" fontWeight="bold">{goal.description}</Typography><Typography variant="caption" fontWeight="bold">{goal.currentValue}/{goal.targetValue}</Typography></Box>}
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                <LinearProgress variant="determinate" value={getProgress(goal.currentValue, goal.targetValue)} sx={{ height: 6, borderRadius: 3 }} />
                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Métrica: {METRIC_LABELS[goal.metric]}</Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                <Divider component="li" />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : <Typography variant="body2" color="text.secondary" fontStyle="italic">No hay metas.</Typography>}
                            </Grid>
                            {/* CANALES */}
                            <Grid item xs={12} md={6} sx={{ p: 3, overflowY: 'auto' }}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Canales Activos</Typography>
                                {selectedCampaign?.channels && selectedCampaign.channels.length > 0 ? (
                                    <List disablePadding>
                                        {selectedCampaign.channels.map((channel, idx) => (
                                            <React.Fragment key={idx}>
                                                <ListItem sx={{ px: 0 }}>
                                                    <ListItemIcon><SmsIcon color="action" /></ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2" fontWeight="bold">{channel.type}</Typography>} secondary={channel.details || 'Sin detalles'} />
                                                </ListItem>
                                                <Divider component="li" />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                ) : <Typography variant="body2" color="text.secondary" fontStyle="italic">No hay canales.</Typography>}
                            </Grid>
                        </Grid>
                    </DialogContent>
                </Dialog>

                {/* 6. ELIMINAR */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} TransitionComponent={Transition}>
                    <DialogTitle sx={{ textAlign: 'center' }}>¿Eliminar Campaña?</DialogTitle>
                    <DialogContent><Typography variant="body2" color="text.secondary">Esta acción es irreversible.</Typography></DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}><Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancelar</Button><Button onClick={handleDeleteCampaign} color="error" variant="contained" disableElevation>Eliminar</Button></DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default CampaignsPage;