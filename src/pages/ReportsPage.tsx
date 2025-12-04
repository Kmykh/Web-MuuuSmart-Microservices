import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Button, Grid, Card, CardContent,
    IconButton, Chip, MenuItem, FormControl, InputLabel, Select, List, ListItemButton,
    ListItemIcon, Tooltip, Avatar, AppBar, Toolbar, CssBaseline, Divider, Snackbar, Alert,
    Stack, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- ICONOS ---
import {
    Pets as PetsIcon, GridView as GridViewIcon, HouseSiding as HouseSidingIcon,
    LocalHospital as LocalHospitalIcon, WaterDrop as WaterDropIcon, Flag as FlagIcon,
    BarChart as BarChartIcon, Logout as LogoutIcon, MonitorWeight as WeightIcon,
    TrendingUp as TrendingUpIcon, PictureAsPdf as PdfIcon, ExpandMore as ExpandMoreIcon,
    Assessment as AssessmentIcon, Warehouse as WarehouseIcon, LocationOn as LocationIcon,
    CheckCircle as CheckIcon, Warning as WarningIcon, Error as ErrorIcon,
    Restaurant as FeedIcon, CalendarToday as CalendarIcon
} from '@mui/icons-material';

import { getAnimalFullReportAction, getStableFullReportAction } from '../application/report';
import { getAllAnimalsAction } from '../application/animal';
import { getAllStablesAction } from '../application/stable';
import { AnimalFullReport, StableFullReport } from '../domain/report';
import { Animal } from '../domain/animal';
import { Stable } from '../domain/stable';
import { useAuth } from '../contexts/AuthContext';

// --- ANIMACIONES ---
const fadeInUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

// --- TEMA ---
const theme = createTheme({
    palette: {
        primary: { main: '#43a047', dark: '#2e7d32' },
        secondary: { main: '#0288d1' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#37474f', secondary: '#78909c' },
    },
    typography: { fontFamily: '"Poppins", "Roboto", sans-serif' },
    shape: { borderRadius: 16 },
    components: {
        MuiCard: { styleOverrides: { root: { boxShadow: '0 8px 24px rgba(0,0,0,0.04)', borderRadius: 20 } } },
        MuiButton: { styleOverrides: { root: { borderRadius: 12, textTransform: 'none', fontWeight: 700 } } }
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

const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case 'HEALTHY': return 'success';
        case 'SICK': return 'error';
        case 'OBSERVATION': return 'warning';
        case 'OPERATIVE': return 'success';
        default: return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
        case 'HEALTHY': return 'Sano';
        case 'SICK': return 'Enfermo';
        case 'OBSERVATION': return 'Observación';
        case 'OPERATIVE': return 'Operativo';
        case 'PLANNED': return 'Planificada';
        case 'ACTIVE': return 'Activa';
        case 'COMPLETED': return 'Completada';
        default: return status;
    }
};

const ReportsPage: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('Ganadero');

    const [reportType, setReportType] = useState<'animal' | 'stable'>('animal');
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [stables, setStables] = useState<Stable[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const [animalReport, setAnimalReport] = useState<AnimalFullReport | null>(null);
    const [stableReport, setStableReport] = useState<StableFullReport | null>(null);

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ 
        open: false, message: '', severity: 'success' 
    });

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        try { 
            const p = JSON.parse(atob(token.split('.')[1])); 
            setUsername(p.sub || p.username || 'Ganadero'); 
        } catch (e) { }
        loadAnimals();
        loadStables();
    }, [token]);

    const showSnackbar = (message: string, severity: 'success' | 'error') => 
        setSnackbar({ open: true, message, severity });

    const loadAnimals = async () => {
        try {
            const data = await getAllAnimalsAction();
            setAnimals(data);
        } catch (error) {
            console.error("Error loading animals");
        }
    };

    const loadStables = async () => {
        try {
            const data = await getAllStablesAction();
            setStables(data);
        } catch (error) {
            console.error("Error loading stables");
        }
    };

    const handleLoadReport = async () => {
        if (!selectedId) {
            showSnackbar('Debe seleccionar un elemento', 'error');
            return;
        }

        setLoading(true);
        try {
            if (reportType === 'animal') {
                const report = await getAnimalFullReportAction(selectedId);
                setAnimalReport(report);
                setStableReport(null);
                showSnackbar('Reporte de animal cargado', 'success');
            } else {
                const report = await getStableFullReportAction(selectedId);
                setStableReport(report);
                setAnimalReport(null);
                showSnackbar('Reporte de establo cargado', 'success');
            }
        } catch (error: any) {
            showSnackbar('Error al cargar reporte: ' + (error.message || 'Error desconocido'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateAnimalPDF = () => {
        if (!animalReport) return;

        const doc = new jsPDF();
        const animal = animalReport.animal;
        const analytics = animalReport.analytics;

        // Header
        doc.setFillColor(67, 160, 71);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Reporte Completo de Animal', 15, 22);
        doc.setFontSize(10);
        doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 32);

        // Animal Info Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setTextColor(67, 160, 71);
        doc.text('Información del Animal', 15, 52);
        doc.setDrawColor(67, 160, 71);
        doc.line(15, 54, 195, 54);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        let yPos = 62;
        doc.text(`Identificación: ${animal.tag}`, 15, yPos);
        doc.text(`Raza: ${animal.breed}`, 100, yPos);
        yPos += 8;
        doc.text(`Peso Inicial: ${animal.weight} kg`, 15, yPos);
        doc.text(`Edad: ${animal.age} años`, 100, yPos);
        yPos += 8;
        doc.text(`Estado: ${getStatusLabel(animal.status)}`, 15, yPos);
        doc.text(`Nivel de Alimentación: ${animal.feedLevel}/10`, 100, yPos);
        yPos += 8;
        doc.text(`Propietario: ${animal.ownerUsername}`, 15, yPos);

        // Analytics Section
        yPos += 15;
        doc.setFontSize(16);
        doc.setTextColor(2, 136, 209);
        doc.text('Analíticas de Producción', 15, yPos);
        doc.setDrawColor(2, 136, 209);
        doc.line(15, yPos + 2, 195, yPos + 2);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        yPos += 10;
        doc.text(`Producción Total de Leche: ${analytics.totalMilk !== null ? analytics.totalMilk.toFixed(1) + ' L' : 'N/A'}`, 15, yPos);
        yPos += 8;
        doc.text(`Promedio de Leche: ${analytics.averageMilk !== null ? analytics.averageMilk.toFixed(2) + ' L/día' : 'N/A'}`, 15, yPos);
        yPos += 8;
        doc.text(`Último Peso Registrado: ${analytics.lastRecordedWeight !== null ? analytics.lastRecordedWeight + ' kg' : 'N/A'}`, 15, yPos);
        yPos += 8;
        doc.text(`Ganancia de Peso (7 días): ${analytics.weightGain7Days !== null ? analytics.weightGain7Days.toFixed(1) + ' kg' : 'N/A'}`, 15, yPos);
        yPos += 8;
        doc.text(`Ganancia de Peso (30 días): ${analytics.weightGain30Days !== null ? analytics.weightGain30Days.toFixed(1) + ' kg' : 'N/A'}`, 15, yPos);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('MuuuSmart © 2025 - Sistema de Gestión Ganadera', 105, 285, { align: 'center' });

        doc.save(`Reporte_Animal_${animal.tag}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
        showSnackbar('PDF generado exitosamente', 'success');
    };

    const generateStablePDF = () => {
        if (!stableReport) return;

        const doc = new jsPDF();
        const stable = stableReport.stable;

        // Header
        doc.setFillColor(123, 31, 162);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Reporte Completo de Establo', 15, 22);
        doc.setFontSize(10);
        doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 32);

        // Stable Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setTextColor(123, 31, 162);
        doc.text('Información del Establo', 15, 52);
        doc.setDrawColor(123, 31, 162);
        doc.line(15, 54, 195, 54);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        let yPos = 62;
        doc.text(`Nombre: ${stable.name}`, 15, yPos);
        doc.text(`Estado: ${getStatusLabel(stable.status)}`, 100, yPos);
        yPos += 8;
        doc.text(`Ubicación: ${stable.location}`, 15, yPos);
        doc.text(`Capacidad: ${stable.capacity}`, 100, yPos);

        // Animals Table
        yPos += 15;
        doc.setFontSize(14);
        doc.setTextColor(67, 160, 71);
        doc.text(`Animales (${stableReport.animals.length})`, 15, yPos);

        const animalsData = stableReport.animals.map(a => [
            a.tag,
            a.breed,
            `${a.weight} kg`,
            `${a.age} años`,
            getStatusLabel(a.status)
        ]);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Tag', 'Raza', 'Peso', 'Edad', 'Estado']],
            body: animalsData.length > 0 ? animalsData : [['Sin animales', '-', '-', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [67, 160, 71] },
            styles: { fontSize: 9 }
        });

        // Campaigns Table
        yPos = (doc as any).lastAutoTable.finalY + 15;
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(237, 108, 2);
        doc.text(`Campañas (${stableReport.campaigns.length})`, 15, yPos);

        const campaignsData = stableReport.campaigns.map(c => [
            c.name,
            c.startDate,
            c.endDate,
            getStatusLabel(c.status)
        ]);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Nombre', 'Inicio', 'Fin', 'Estado']],
            body: campaignsData.length > 0 ? campaignsData : [['Sin campañas', '-', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [237, 108, 2] },
            styles: { fontSize: 9 }
        });

        // Note if exists
        if (stableReport.note) {
            yPos = (doc as any).lastAutoTable.finalY + 10;
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`Nota: ${stableReport.note}`, 15, yPos);
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('MuuuSmart © 2025 - Sistema de Gestión Ganadera', 105, 285, { align: 'center' });
        }

        doc.save(`Reporte_Establo_${stable.name}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
        showSnackbar('PDF generado exitosamente', 'success');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)' }}>

                {/* SIDEBAR */}
                <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, zIndex: 10 }}>
                    <Paper elevation={0} sx={{ width: '60px', height: '90%', borderRadius: '30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <List sx={{ width: '100%', px: 1, mt: 2 }}>
                            {MENU_ITEMS.map((item) => (
                                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                                    <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: 'center', borderRadius: '50%', mb: 1, color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
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
                        <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <AssessmentIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" color="text.primary">Reportes Completos</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip avatar={<Avatar>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.5)', border: 'none' }} />
                                <IconButton onClick={() => logout()} color="error"><LogoutIcon /></IconButton>
                            </Box>
                        </Toolbar>
                    </AppBar>

                    <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
                        
                        {/* SELECTOR DE REPORTE */}
                        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.9)' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tipo de Reporte</InputLabel>
                                        <Select
                                            value={reportType}
                                            onChange={(e) => {
                                                setReportType(e.target.value as 'animal' | 'stable');
                                                setSelectedId(null);
                                                setAnimalReport(null);
                                                setStableReport(null);
                                            }}
                                            label="Tipo de Reporte"
                                        >
                                            <MenuItem value="animal"><PetsIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} /> Animal</MenuItem>
                                            <MenuItem value="stable"><WarehouseIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} /> Establo</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={5}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>
                                            {reportType === 'animal' ? 'Seleccionar Animal' : 'Seleccionar Establo'}
                                        </InputLabel>
                                        <Select
                                            value={selectedId || ''}
                                            onChange={(e) => setSelectedId(Number(e.target.value))}
                                            label={reportType === 'animal' ? 'Seleccionar Animal' : 'Seleccionar Establo'}
                                        >
                                            {reportType === 'animal' ? (
                                                animals.map(a => (
                                                    <MenuItem key={a.id} value={a.id}>{a.tag} - {a.breed}</MenuItem>
                                                ))
                                            ) : (
                                                stables.map(s => (
                                                    <MenuItem key={s.id} value={s.id}>{s.name} - {s.location}</MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Stack direction="row" spacing={2}>
                                        <Button 
                                            variant="contained" 
                                            fullWidth 
                                            onClick={handleLoadReport}
                                            disabled={!selectedId || loading}
                                            startIcon={loading ? <CircularProgress size={16} /> : <AssessmentIcon />}
                                        >
                                            {loading ? 'Cargando...' : 'Generar Reporte'}
                                        </Button>
                                        {((animalReport && reportType === 'animal') || (stableReport && reportType === 'stable')) && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<PdfIcon />}
                                                onClick={reportType === 'animal' ? generateAnimalPDF : generateStablePDF}
                                            >
                                                PDF
                                            </Button>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* VISUALIZACIÓN DE REPORTE DE ANIMAL */}
                        {animalReport && reportType === 'animal' && (
                            <Box sx={{ animation: `${fadeInUp} 0.5s ease` }}>
                                <Grid container spacing={3}>
                                    {/* Información del Animal */}
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                                        <PetsIcon fontSize="large" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" fontWeight="bold">
                                                            {animalReport.animal.tag}
                                                        </Typography>
                                                        <Chip 
                                                            label={getStatusLabel(animalReport.animal.status)} 
                                                            color={getStatusColor(animalReport.animal.status) as any} 
                                                            size="small" 
                                                        />
                                                    </Box>
                                                </Box>
                                                <Divider sx={{ my: 2 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Raza</Typography>
                                                        <Typography variant="body1" fontWeight="bold">{animalReport.animal.breed}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Edad</Typography>
                                                        <Typography variant="body1" fontWeight="bold">{animalReport.animal.age} años</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Peso Inicial</Typography>
                                                        <Typography variant="body1" fontWeight="bold">{animalReport.animal.weight} kg</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary">Nivel Alimentación</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <FeedIcon color="primary" fontSize="small" />
                                                            <Typography variant="body1" fontWeight="bold">{animalReport.animal.feedLevel}/10</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">Propietario</Typography>
                                                        <Typography variant="body1" fontWeight="bold">{animalReport.animal.ownerUsername}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Analíticas */}
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', color: 'white' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                    Analíticas de Producción
                                                </Typography>
                                                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Producción Total de Leche</Typography>
                                                        <Typography variant="h4" fontWeight="bold">
                                                            {animalReport.analytics.totalMilk !== null ? `${animalReport.analytics.totalMilk.toFixed(1)} L` : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Promedio de Leche</Typography>
                                                        <Typography variant="h5" fontWeight="bold">
                                                            {animalReport.analytics.averageMilk !== null ? `${animalReport.analytics.averageMilk.toFixed(2)} L/día` : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                                                    <Box>
                                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>Último Peso Registrado</Typography>
                                                        <Typography variant="h5" fontWeight="bold">
                                                            {animalReport.analytics.lastRecordedWeight !== null ? `${animalReport.analytics.lastRecordedWeight} kg` : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>Ganancia 7 días</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {(animalReport.analytics.weightGain7Days || 0) >= 0 ? <TrendingUpIcon /> : <TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />}
                                                                <Typography variant="h6" fontWeight="bold">
                                                                    {animalReport.analytics.weightGain7Days !== null ? `${animalReport.analytics.weightGain7Days.toFixed(1)} kg` : 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>Ganancia 30 días</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {(animalReport.analytics.weightGain30Days || 0) >= 0 ? <TrendingUpIcon /> : <TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />}
                                                                <Typography variant="h6" fontWeight="bold">
                                                                    {animalReport.analytics.weightGain30Days !== null ? `${animalReport.analytics.weightGain30Days.toFixed(1)} kg` : 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* VISUALIZACIÓN DE REPORTE DE ESTABLO */}
                        {stableReport && reportType === 'stable' && (
                            <Box sx={{ animation: `${fadeInUp} 0.5s ease` }}>
                                <Grid container spacing={3}>
                                    {/* Info del Establo */}
                                    <Grid item xs={12}>
                                        <Card>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: '#7b1fa2', width: 56, height: 56 }}>
                                                        <WarehouseIcon fontSize="large" />
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h5" fontWeight="bold">{stableReport.stable.name}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                            <Chip icon={<LocationIcon />} label={stableReport.stable.location} size="small" />
                                                            <Chip 
                                                                label={getStatusLabel(stableReport.stable.status)} 
                                                                color={getStatusColor(stableReport.stable.status) as any} 
                                                                size="small" 
                                                            />
                                                            <Chip label={`Capacidad: ${stableReport.stable.capacity}`} size="small" variant="outlined" />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                {stableReport.note && (
                                                    <Alert severity="info" sx={{ mt: 2 }}>{stableReport.note}</Alert>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Tabla de Animales */}
                                    <Grid item xs={12}>
                                        <Accordion defaultExpanded>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <PetsIcon color="primary" />
                                                    <Typography variant="h6">Animales ({stableReport.animals.length})</Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <TableContainer>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell><strong>Tag</strong></TableCell>
                                                                <TableCell><strong>Raza</strong></TableCell>
                                                                <TableCell><strong>Peso</strong></TableCell>
                                                                <TableCell><strong>Edad</strong></TableCell>
                                                                <TableCell><strong>Estado</strong></TableCell>
                                                                <TableCell><strong>Alimentación</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {stableReport.animals.length === 0 ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={6} align="center">
                                                                        <Typography color="text.secondary">Sin animales</Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                stableReport.animals.map(animal => (
                                                                    <TableRow key={animal.id}>
                                                                        <TableCell>{animal.tag}</TableCell>
                                                                        <TableCell>{animal.breed}</TableCell>
                                                                        <TableCell>{animal.weight} kg</TableCell>
                                                                        <TableCell>{animal.age} años</TableCell>
                                                                        <TableCell>
                                                                            <Chip 
                                                                                label={getStatusLabel(animal.status)} 
                                                                                color={getStatusColor(animal.status) as any} 
                                                                                size="small" 
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>{animal.feedLevel}/10</TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>

                                    {/* Tabla de Campañas */}
                                    <Grid item xs={12}>
                                        <Accordion>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <FlagIcon color="warning" />
                                                    <Typography variant="h6">Campañas ({stableReport.campaigns.length})</Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <TableContainer>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell><strong>Nombre</strong></TableCell>
                                                                <TableCell><strong>Descripción</strong></TableCell>
                                                                <TableCell><strong>Fecha Inicio</strong></TableCell>
                                                                <TableCell><strong>Fecha Fin</strong></TableCell>
                                                                <TableCell><strong>Estado</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {stableReport.campaigns.length === 0 ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={5} align="center">
                                                                        <Typography color="text.secondary">Sin campañas</Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                stableReport.campaigns.map(campaign => (
                                                                    <TableRow key={campaign.id}>
                                                                        <TableCell>{campaign.name}</TableCell>
                                                                        <TableCell>{campaign.description}</TableCell>
                                                                        <TableCell>{campaign.startDate}</TableCell>
                                                                        <TableCell>{campaign.endDate}</TableCell>
                                                                        <TableCell>
                                                                            <Chip 
                                                                                label={getStatusLabel(campaign.status)} 
                                                                                size="small" 
                                                                                color="primary"
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Mensaje inicial */}
                        {!animalReport && !stableReport && !loading && (
                            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.7)', border: '2px dashed rgba(67, 160, 71, 0.3)', borderRadius: 4 }}>
                                <AssessmentIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5, mb: 2 }} />
                                <Typography variant="h5" color="primary.dark" fontWeight="bold" gutterBottom>
                                    Seleccione un elemento para generar el reporte
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Elija el tipo de reporte (Animal o Establo) y seleccione el elemento específico
                                </Typography>
                            </Paper>
                        )}
                    </Container>
                </Box>

                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={4000} 
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert 
                        onClose={() => setSnackbar({ ...snackbar, open: false })} 
                        severity={snackbar.severity} 
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default ReportsPage;
