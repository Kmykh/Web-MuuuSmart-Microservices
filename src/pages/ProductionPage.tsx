import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Button, Grid, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
    MenuItem, FormControl, InputLabel, Select, List, ListItemButton, ListItemIcon,
    Tooltip, Avatar, AppBar, Toolbar, CssBaseline, Slide, Divider, Snackbar, Alert,
    InputAdornment, Tabs, Tab, CircularProgress, Stack, LinearProgress, ListItemText
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { createTheme, ThemeProvider, alpha, styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- ICONOS ---
import {
    Add as AddIcon, Pets as PetsIcon,
    Search as SearchIcon, GridView as GridViewIcon, HouseSiding as HouseSidingIcon,
    LocalHospital as LocalHospitalIcon, WaterDrop as WaterDropIcon, Flag as FlagIcon,
    BarChart as BarChartIcon, Logout as LogoutIcon, CalendarToday as CalendarIcon,
    MonitorWeight as WeightIcon,
    TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
    Opacity as MilkIcon, Close as CloseIcon, Save as SaveIcon,
    Lock as LockIcon, Info as InfoIcon, WarningAmber as WarningIcon,
    WorkspacePremium as PremiumIcon, TipsAndUpdates as TipsIcon,
    Science as ScienceIcon, CheckCircle as CheckIcon, Restaurant as FoodIcon,
    PictureAsPdf as PdfIcon
} from '@mui/icons-material';

import {
    createMilkRecordAction, createWeightRecordAction,
    getMilkRecordsByAnimalIdAction, getWeightRecordsByAnimalIdAction,
    getAnimalAnalyticsAction, getMilkSummaryByAnimalIdAction, getWeightSummaryByAnimalIdAction
} from '../application/production';
import { getAllAnimalsAction } from '../application/animal';
import { MilkProductionRecordResponse, WeightRecordResponse, AnimalAnalytics, MilkSummary, WeightSummary } from '../domain/production';
import { Animal } from '../domain/animal';
import { useAuth } from '../contexts/AuthContext';

// --- ANIMACIONES ---
const fadeInUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// --- ESTILOS PERSONALIZADOS ---
const SoftInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#ffffff', borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid transparent',
        '& fieldset': { border: 'none' },
        '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.06)' },
        '&.Mui-focused': { boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` }
    },
    '& .MuiInputLabel-root': { color: '#78909c', fontWeight: 500 }
}));

// --- TEMA ---
const theme = createTheme({
    palette: {
        primary: { main: '#43a047', dark: '#2e7d32' },
        secondary: { main: '#0288d1' }, // Azul Leche
        info: { main: '#7b1fa2' }, // Violeta Peso
        warning: { main: '#ed6c02' }, // Naranja Calidad
        success: { main: '#2e7d32' },
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

// --- LÓGICA MEJORADA DE PROYECCIÓN DE CALIDAD ---
const calculateQualityProjection = (
    weightGain30d: number | null, 
    avgMilk: number | null, 
    lastWeight: number | null,
    weightRecords: WeightRecordResponse[],
    animalBaseWeight?: number
) => {
    // 1. PROYECCIÓN DE CARNE (Mejorada con peso actual y consistencia)
    let meatScore = 0;
    let meatLabel = "Sin Datos";
    let meatColor = "warning";
    
    // Usar el peso más reciente disponible
    const effectiveWeight = lastWeight !== null ? lastWeight : (animalBaseWeight || null);
    
    if (weightGain30d !== null && effectiveWeight !== null) {
        // Factor de peso óptimo (animales entre 450-600 kg son ideales para carne)
        const weightFactor = effectiveWeight >= 450 && effectiveWeight <= 600 ? 1.2 : 
                            effectiveWeight > 600 ? 1.0 : 0.8;
        
        // Factor de ganancia diaria (óptimo: >0.5 kg/día)
        const dailyGain = weightGain30d / 30;
        const gainFactor = dailyGain >= 0.5 ? 1.2 : 
                          dailyGain >= 0.3 ? 1.0 : 
                          dailyGain >= 0 ? 0.7 : 0.4;
        
        // Factor de consistencia (varianza en ganancias)
        let consistencyFactor = 1.0;
        if (weightRecords.length >= 3) {
            const sortedRecords = [...weightRecords].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            const gains = [];
            for (let i = 1; i < sortedRecords.length; i++) {
                gains.push(sortedRecords[i].weightKg - sortedRecords[i-1].weightKg);
            }
            const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
            const variance = gains.reduce((sum, g) => sum + Math.pow(g - avgGain, 2), 0) / gains.length;
            consistencyFactor = variance < 5 ? 1.15 : variance < 15 ? 1.0 : 0.85;
        }
        
        // Cálculo final combinado
        const baseScore = Math.min(100, (dailyGain / 0.8) * 100);
        meatScore = Math.round(baseScore * weightFactor * gainFactor * consistencyFactor);
        
        // Clasificación mejorada
        if (meatScore >= 85) { meatLabel = "Premium A+ (Exportación)"; meatColor = "success"; }
        else if (meatScore >= 70) { meatLabel = "Calidad Superior"; meatColor = "success"; }
        else if (meatScore >= 55) { meatLabel = "Calidad Estándar"; meatColor = "info"; }
        else if (meatScore >= 35) { meatLabel = "Bajo Rendimiento"; meatColor = "warning"; }
        else { meatLabel = "Crítico - Revisar"; meatColor = "error"; }
    } else if (effectiveWeight !== null && weightGain30d === null) {
        // Si solo tenemos peso base sin historial, hacer estimación básica
        if (effectiveWeight >= 500) { meatScore = 70; meatLabel = "Peso Óptimo"; meatColor = "success"; }
        else if (effectiveWeight >= 400) { meatScore = 55; meatLabel = "Peso Aceptable"; meatColor = "info"; }
        else if (effectiveWeight >= 300) { meatScore = 40; meatLabel = "En Crecimiento"; meatColor = "warning"; }
        else { meatScore = 25; meatLabel = "Peso Bajo"; meatColor = "warning"; }
    }

    // 2. PROYECCIÓN DE LECHE (Mantiene lógica original)
    let milkScore = 0;
    let milkLabel = "N/A";
    let milkColor = "info";

    if (avgMilk !== null) {
        if (avgMilk > 25) { milkScore = 95; milkLabel = "Élite Lechera"; milkColor = "success"; }
        else if (avgMilk > 15) { milkScore = 80; milkLabel = "Alta Producción"; milkColor = "info"; }
        else if (avgMilk > 5) { milkScore = 50; milkLabel = "Promedio"; milkColor = "warning"; }
        else { milkScore = 20; milkLabel = "Baja"; milkColor = "error"; }
    }

    return { meatScore, meatLabel, meatColor, milkScore, milkLabel, milkColor };
};

// --- LÓGICA DE RECOMENDACIONES (SISTEMA) ---
const generateRecommendations = (weightGain30d: number | null, avgMilk: number | null) => {
    const recs = [];

    // Peso
    if (weightGain30d !== null) {
        if (weightGain30d < 0) recs.push({ icon: <WarningIcon color="error" />, text: "Pérdida de peso detectada. Revisar dieta y salud." });
        else if (weightGain30d > 10) recs.push({ icon: <CheckIcon color="success" />, text: "Ganancia de peso óptima. Mantener ración actual." });
        else recs.push({ icon: <FoodIcon color="warning" />, text: "Ganancia moderada. Considerar suplementos proteicos." });
    }

    // Leche
    if (avgMilk !== null) {
        if (avgMilk > 20) recs.push({ icon: <CheckIcon color="success" />, text: "Alta producción. Asegurar hidratación constante." });
        else if (avgMilk < 8 && avgMilk > 0) recs.push({ icon: <TipsIcon color="info" />, text: "Producción baja. Revisar ciclo de lactancia." });
    }

    // General
    if (recs.length === 0) recs.push({ icon: <InfoIcon color="action" />, text: "Se necesitan más datos para generar recomendaciones." });

    return recs;
};

const ProductionPage: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [tabValue, setTabValue] = useState(0);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false); 
    const [username, setUsername] = useState('Ganadero');

    // Data States
    const [milkRecords, setMilkRecords] = useState<MilkProductionRecordResponse[]>([]);
    const [weightRecords, setWeightRecords] = useState<WeightRecordResponse[]>([]);
    const [analytics, setAnalytics] = useState<AnimalAnalytics | null>(null);
    const [milkSummary, setMilkSummary] = useState<MilkSummary | null>(null);
    const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null);

    // Dialogs & Forms
    const [openMilkDialog, setOpenMilkDialog] = useState(false);
    const [openWeightDialog, setOpenWeightDialog] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    const [milkForm, setMilkForm] = useState({ liters: 0, date: format(new Date(), 'yyyy-MM-dd') });
    const [weightForm, setWeightForm] = useState({ weightKg: 0, date: format(new Date(), 'yyyy-MM-dd') });

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        try { const p = JSON.parse(atob(token.split('.')[1])); setUsername(p.sub || p.username || 'Ganadero'); } catch (e) { }
        loadAnimals();
    }, [token]);

    const showSnackbar = (message: string, severity: 'success' | 'error') => setSnackbar({ open: true, message, severity });

    const loadAnimals = async () => {
        try {
            const data = await getAllAnimalsAction();
            setAnimals(data);
        } catch (error) { console.error("Error loading animals"); }
    };

    const loadDataForAnimal = async (animalId: number) => {
        setLoading(true);
        try {
            const [milk, weight, anal, mSum, wSum] = await Promise.all([
                getMilkRecordsByAnimalIdAction(animalId),
                getWeightRecordsByAnimalIdAction(animalId),
                getAnimalAnalyticsAction(animalId),
                getMilkSummaryByAnimalIdAction(animalId),
                getWeightSummaryByAnimalIdAction(animalId)
            ]);
            setMilkRecords(milk);
            setWeightRecords(weight);
            setAnalytics(anal);
            setMilkSummary(mSum);
            setWeightSummary(wSum);
        } catch (error) {
            showSnackbar('Error al cargar datos del animal', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (id: number | null) => {
        setSelectedAnimalId(id);
        if (id) loadDataForAnimal(id);
        else {
            setMilkRecords([]); setWeightRecords([]); setAnalytics(null);
        }
    };

    const handleCreateMilk = async () => {
        if (!selectedAnimalId) return;
        try {
            await createMilkRecordAction({ ...milkForm, animalId: selectedAnimalId, liters: Number(milkForm.liters) });
            showSnackbar('Producción registrada', 'success');
            setOpenMilkDialog(false);
            loadDataForAnimal(selectedAnimalId);
        } catch (err) { showSnackbar('Error al guardar', 'error'); }
    };

    const handleCreateWeight = async () => {
        if (!selectedAnimalId) return;
        try {
            await createWeightRecordAction({ ...weightForm, animalId: selectedAnimalId, weightKg: Number(weightForm.weightKg) });
            showSnackbar('Peso registrado', 'success');
            setOpenWeightDialog(false);
            loadDataForAnimal(selectedAnimalId);
        } catch (err) { showSnackbar('Error al guardar', 'error'); }
    };

    // Cálculos de Proyección y Recomendaciones
    const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
    const quality = analytics ? calculateQualityProjection(
        analytics.weightGain30Days, 
        analytics.averageMilk, 
        analytics.lastRecordedWeight,
        weightRecords,
        selectedAnimal?.weight
    ) : null;
    const recommendations = analytics ? generateRecommendations(analytics.weightGain30Days, analytics.averageMilk) : [];

    // --- FUNCIÓN PARA GENERAR PDF ---
    const generatePDF = () => {
        if (!selectedAnimalId || !analytics) {
            showSnackbar('Debe seleccionar un animal con datos', 'error');
            return;
        }

        const animal = animals.find(a => a.id === selectedAnimalId);
        if (!animal) return;

        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(67, 160, 71);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('MuuuSmart - Reporte de Producción', 15, 20);
        doc.setFontSize(10);
        doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 28);

        // Animal Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`Animal: ${animal.tag}`, 15, 45);
        doc.setFontSize(10);
        doc.text(`Raza: ${animal.breed}`, 15, 52);
        doc.text(`Estado: ${animal.status}`, 15, 58);
        doc.text(`Edad: ${animal.age} años`, 100, 52);
        doc.text(`Peso Inicial: ${animal.weight} kg`, 100, 58);

        // Analytics Summary
        doc.setFontSize(12);
        doc.setTextColor(67, 160, 71);
        doc.text('Resumen de Producción', 15, 70);
        doc.setDrawColor(67, 160, 71);
        doc.line(15, 72, 195, 72);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        let yPos = 80;
        doc.text(`Peso Actual: ${analytics.lastRecordedWeight || 'N/A'} kg`, 15, yPos);
        doc.text(`Ganancia 7 días: ${analytics.weightGain7Days !== null ? analytics.weightGain7Days.toFixed(1) : 'N/A'} kg`, 15, yPos + 6);
        doc.text(`Ganancia 30 días: ${analytics.weightGain30Days !== null ? analytics.weightGain30Days.toFixed(1) : 'N/A'} kg`, 15, yPos + 12);
        doc.text(`Producción Total Leche: ${analytics.totalMilk !== null ? analytics.totalMilk.toFixed(1) : 'N/A'} L`, 15, yPos + 18);
        doc.text(`Promedio Leche: ${analytics.averageMilk !== null ? analytics.averageMilk.toFixed(1) : 'N/A'} L/día`, 15, yPos + 24);

        // Quality Projection
        if (quality) {
            yPos += 35;
            doc.setFontSize(12);
            doc.setTextColor(237, 108, 2);
            doc.text('Proyección de Calidad', 15, yPos);
            doc.setDrawColor(237, 108, 2);
            doc.line(15, yPos + 2, 195, yPos + 2);
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text(`Potencial Cárnico: ${quality.meatLabel} (${quality.meatScore}%)`, 15, yPos + 10);
            doc.text(`Potencial Lechero: ${quality.milkLabel} (${quality.milkScore}%)`, 15, yPos + 16);
        }

        // Milk Records Table
        yPos += 30;
        doc.setFontSize(12);
        doc.setTextColor(2, 136, 209);
        doc.text('Historial de Producción Láctea', 15, yPos);
        
        const milkTableData = milkRecords.slice(0, 10).map(r => [
            format(parseISO(r.date), 'dd/MM/yyyy'),
            `${r.liters} L`,
            format(parseISO(r.createdAt), 'dd/MM/yyyy HH:mm')
        ]);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Fecha', 'Litros', 'Registrado']],
            body: milkTableData.length > 0 ? milkTableData : [['Sin registros', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [2, 136, 209] },
            styles: { fontSize: 9 }
        });

        // Weight Records Table
        yPos = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(12);
        doc.setTextColor(123, 31, 162);
        doc.text('Historial de Peso', 15, yPos);

        const weightTableData = weightRecords.slice(0, 10).map(r => [
            format(parseISO(r.date), 'dd/MM/yyyy'),
            `${r.weightKg} kg`,
            format(parseISO(r.createdAt), 'dd/MM/yyyy HH:mm')
        ]);

        autoTable(doc, {
            startY: yPos + 5,
            head: [['Fecha', 'Peso', 'Registrado']],
            body: weightTableData.length > 0 ? weightTableData : [['Sin registros', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [123, 31, 162] },
            styles: { fontSize: 9 }
        });

        // Recommendations
        if (recommendations.length > 0) {
            yPos = (doc as any).lastAutoTable.finalY + 15;
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(245, 127, 23);
            doc.text('Recomendaciones del Sistema', 15, yPos);
            doc.setDrawColor(245, 127, 23);
            doc.line(15, yPos + 2, 195, yPos + 2);
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            recommendations.forEach((rec, i) => {
                const lines = doc.splitTextToSize(rec.text, 170);
                doc.text(`• ${lines}`, 20, yPos + 10 + (i * 8));
            });
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

        // Save PDF
        doc.save(`Reporte_${animal.tag}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
        showSnackbar('Reporte PDF generado exitosamente', 'success');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)', backgroundSize: '200% 200%', overflow: 'hidden' }}>

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

                {/* CONTENIDO PRINCIPAL */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', pt: 2, px: 3 }}>
                        <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <WaterDropIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" color="text.primary">Control de Producción</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip avatar={<Avatar>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.5)', border: 'none' }} />
                                <IconButton onClick={logout} color="error"><LogoutIcon /></IconButton>
                            </Box>
                        </Toolbar>
                    </AppBar>

                    <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
                        
                        {/* SELECCIÓN DE ANIMAL */}
                        <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                                <PetsIcon color="action" />
                                <FormControl sx={{ minWidth: 300 }} size="small">
                                    <InputLabel>Seleccionar Animal para ver Analíticas</InputLabel>
                                    <Select
                                        value={selectedAnimalId || ''}
                                        onChange={(e) => handleFilterChange(e.target.value ? Number(e.target.value) : null)}
                                        label="Seleccionar Animal para ver Analíticas"
                                    >
                                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                                        {animals.map(animal => (
                                            <MenuItem key={animal.id} value={animal.id}>{animal.tag} - {animal.breed}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            {selectedAnimalId && analytics && (
                                <Button 
                                    variant="contained" 
                                    startIcon={<PdfIcon />} 
                                    onClick={generatePDF}
                                    sx={{ 
                                        bgcolor: '#d32f2f', 
                                        '&:hover': { bgcolor: '#b71c1c' },
                                        boxShadow: '0 4px 12px rgba(211,47,47,0.3)',
                                        borderRadius: 3
                                    }}
                                >
                                    Descargar PDF
                                </Button>
                            )}
                        </Paper>

                        {/* --- DASHBOARD SPLIT VIEW --- */}
                        {!selectedAnimalId ? (
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 6, 
                                    borderRadius: '24px', 
                                    bgcolor: 'rgba(255,255,255,0.7)', 
                                    border: '2px dashed rgba(67, 160, 71, 0.3)',
                                    textAlign: 'center',
                                    mt: 8
                                }}
                            >
                                <PetsIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5, mb: 2 }} />
                                <Typography variant="h4" color="primary.dark" fontWeight="bold" gutterBottom>
                                    Seleccione un Animal
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                                    Para visualizar las analíticas de producción, métricas de calidad y generar reportes, 
                                    por favor seleccione un animal del menú desplegable superior.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                                    <Chip icon={<MilkIcon />} label="Producción de Leche" color="secondary" />
                                    <Chip icon={<WeightIcon />} label="Control de Peso" sx={{ bgcolor: '#7b1fa2', color: 'white' }} />
                                    <Chip icon={<PremiumIcon />} label="Calidad de Carne" color="warning" />
                                </Box>
                            </Paper>
                        ) : selectedAnimalId && (
                            loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box> :
                            <Grid container spacing={3} sx={{ animation: `${fadeInUp} 0.5s ease`, height: 'calc(100vh - 220px)' }}>
                                
                                {/* COLUMNA IZQUIERDA: MÉTRICAS Y ANÁLISIS (Scrollable si es necesario) */}
                                <Grid item xs={12} md={5} sx={{ height: '100%', overflowY: 'auto', pr: { md: 1 } }}>
                                    <Stack spacing={3}>
                                        
                                        {/* 1. ACCIONES RÁPIDAS */}
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button fullWidth variant="outlined" startIcon={<WeightIcon />} onClick={() => setOpenWeightDialog(true)} sx={{ borderRadius: 3, borderColor: '#7b1fa2', color: '#7b1fa2', bgcolor: '#f3e5f5' }}>Reg. Peso</Button>
                                            <Button fullWidth variant="contained" startIcon={<MilkIcon />} onClick={() => setOpenMilkDialog(true)} sx={{ borderRadius: 3, bgcolor: '#0288d1' }}>Reg. Leche</Button>
                                        </Box>

                                        {/* 2. TARJETA LECHE */}
                                        <Card sx={{ background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)', color: 'white' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><MilkIcon /></Avatar>
                                                    <Typography variant="overline" sx={{ opacity: 0.8 }}>LECHE TOTAL</Typography>
                                                </Box>
                                                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{analytics?.totalMilk ? analytics.totalMilk.toFixed(1) : '0'} L</Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.9 }}>Promedio: {milkSummary?.averageLiters ? milkSummary.averageLiters.toFixed(1) : '0'} L/día</Typography>
                                            </CardContent>
                                        </Card>

                                        {/* 3. TARJETA PESO */}
                                        <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)', color: 'white' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><WeightIcon /></Avatar>
                                                    <Typography variant="overline" sx={{ opacity: 0.8 }}>PESO ACTUAL</Typography>
                                                </Box>
                                                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{analytics?.lastRecordedWeight ? analytics.lastRecordedWeight : '0'} kg</Typography>
                                                
                                                <Stack direction="row" spacing={2} sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="caption">7 días:</Typography>
                                                        {(analytics?.weightGain7Days || 0) >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                                                        <Typography variant="caption" fontWeight="bold">{Math.abs(analytics?.weightGain7Days || 0).toFixed(1)} kg</Typography>
                                                    </Box>
                                                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="caption">30 días:</Typography>
                                                        {(analytics?.weightGain30Days || 0) >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                                                        <Typography variant="caption" fontWeight="bold">{Math.abs(analytics?.weightGain30Days || 0).toFixed(1)} kg</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>

                                        {/* 4. TARJETA PROYECCIÓN DE CALIDAD */}
                                        <Card sx={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                    <PremiumIcon color="warning" />
                                                    <Typography variant="h6" color="text.primary">Proyección de Calidad</Typography>
                                                    <Tooltip title="Cálculo basado en ganancia de peso y producción histórica. Lógica del sistema."><InfoIcon fontSize="small" color="disabled" /></Tooltip>
                                                </Box>
                                                
                                                {/* Carne */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2" fontWeight="bold">Potencial Cárnico</Typography>
                                                        <Chip label={quality?.meatLabel} size="small" color={quality?.meatColor as any} variant="outlined" />
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={quality?.meatScore || 0} color={quality?.meatColor as any} sx={{ height: 8, borderRadius: 4 }} />
                                                </Box>

                                                {/* Leche */}
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2" fontWeight="bold">Potencial Lechero</Typography>
                                                        <Chip label={quality?.milkLabel} size="small" color={quality?.milkColor as any} variant="outlined" />
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={quality?.milkScore || 0} color={quality?.milkColor as any} sx={{ height: 8, borderRadius: 4 }} />
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        {/* 5. RECOMENDACIONES */}
                                        <Card sx={{ bgcolor: '#fffde7', border: '1px solid #fff9c4' }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: '#f57f17' }}>
                                                    <TipsIcon fontSize="small" /> Recomendaciones del Sistema
                                                </Typography>
                                                <List dense disablePadding>
                                                    {recommendations.map((rec, i) => (
                                                        <ListItemButton key={i} sx={{ px: 0, py: 0.5, cursor: 'default' }}>
                                                            <ListItemIcon sx={{ minWidth: 30 }}>{rec.icon}</ListItemIcon>
                                                            <ListItemText primary={rec.text} primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }} />
                                                        </ListItemButton>
                                                    ))}
                                                </List>
                                            </CardContent>
                                        </Card>

                                    </Stack>
                                </Grid>

                                {/* COLUMNA DERECHA: HISTORIAL COMPLETO */}
                                <Grid item xs={12} md={7} sx={{ height: '100%', overflowY: 'hidden' }}>
                                    <Paper sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth" sx={{ bgcolor: 'white', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                                            <Tab icon={<MilkIcon />} label="Historial Leche" iconPosition="start" />
                                            <Tab icon={<WeightIcon />} label="Historial Peso" iconPosition="start" />
                                        </Tabs>
                                        
                                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                                            {tabValue === 0 ? (
                                                <List>
                                                    {milkRecords.length === 0 ? <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Sin registros.</Typography></Box> : 
                                                    milkRecords.map((r, i) => (
                                                        <React.Fragment key={r.id}>
                                                            <ListItemButton sx={{ py: 2, cursor: 'default', '&:hover': { bgcolor: 'white' } }}>
                                                                <ListItemIcon><Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 2 }}><MilkIcon color="secondary" /></Box></ListItemIcon>
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography variant="subtitle2" fontWeight="bold">{format(parseISO(r.date), 'dd MMMM yyyy')}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">Registrado: {format(parseISO(r.createdAt), 'HH:mm')}</Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="h6" color="secondary.main" fontWeight="bold">{r.liters} L</Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', justifyContent: 'flex-end' }}>
                                                                        <LockIcon sx={{ fontSize: 12 }} />
                                                                        <Typography variant="caption">Fijo</Typography>
                                                                    </Box>
                                                                </Box>
                                                            </ListItemButton>
                                                            {i < milkRecords.length - 1 && <Divider variant="inset" component="li" />}
                                                        </React.Fragment>
                                                    ))}
                                                </List>
                                            ) : (
                                                <List>
                                                    {weightRecords.length === 0 ? <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Sin registros.</Typography></Box> :
                                                    weightRecords.map((r, i) => (
                                                        <React.Fragment key={r.id}>
                                                            <ListItemButton sx={{ py: 2, cursor: 'default', '&:hover': { bgcolor: 'white' } }}>
                                                                <ListItemIcon><Box sx={{ p: 1, bgcolor: '#f3e5f5', borderRadius: 2 }}><WeightIcon sx={{ color: '#7b1fa2' }} /></Box></ListItemIcon>
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Typography variant="subtitle2" fontWeight="bold">{format(parseISO(r.date), 'dd MMMM yyyy')}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">Registrado: {format(parseISO(r.createdAt), 'HH:mm')}</Typography>
                                                                </Box>
                                                                <Box sx={{ textAlign: 'right' }}>
                                                                    <Typography variant="h6" sx={{ color: '#7b1fa2' }} fontWeight="bold">{r.weightKg} kg</Typography>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', justifyContent: 'flex-end' }}>
                                                                        <LockIcon sx={{ fontSize: 12 }} />
                                                                        <Typography variant="caption">Fijo</Typography>
                                                                    </Box>
                                                                </Box>
                                                            </ListItemButton>
                                                            {i < weightRecords.length - 1 && <Divider variant="inset" component="li" />}
                                                        </React.Fragment>
                                                    ))}
                                                </List>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </Container>
                </Box>

                {/* --- DIÁLOGOS DE REGISTRO (MANTENIDOS IGUAL) --- */}
                <Dialog open={openMilkDialog} onClose={() => setOpenMilkDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderRadius: '24px 24px 0 0' }}>
                        <Typography variant="h6" color="#0288d1" display="flex" alignItems="center" gap={1}><MilkIcon /> Nueva Producción</Typography>
                        <IconButton onClick={() => setOpenMilkDialog(false)}><CloseIcon /></IconButton>
                    </Box>
                    <DialogContent sx={{ mt: 1 }}>
                        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="caption" fontWeight="bold">Nota: Acción irreversible. Asegúrese de los datos.</Typography>
                        </Alert>
                        <Grid container spacing={2}>
                            <Grid item xs={12}><SoftInput label="Litros" type="number" fullWidth value={milkForm.liters} onChange={(e) => setMilkForm({...milkForm, liters: parseFloat(e.target.value)})} InputProps={{ startAdornment: <InputAdornment position="start"><WaterDropIcon color="primary" /></InputAdornment> }} /></Grid>
                            <Grid item xs={12}><SoftInput label="Fecha" type="date" fullWidth value={milkForm.date} onChange={(e) => setMilkForm({...milkForm, date: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}><Button onClick={handleCreateMilk} variant="contained" fullWidth sx={{ bgcolor: '#0288d1', boxShadow: '0 4px 12px rgba(2,136,209,0.3)' }} startIcon={<SaveIcon />}>Confirmar</Button></DialogActions>
                </Dialog>

                <Dialog open={openWeightDialog} onClose={() => setOpenWeightDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderRadius: '24px 24px 0 0' }}>
                        <Typography variant="h6" color="#7b1fa2" display="flex" alignItems="center" gap={1}><WeightIcon /> Nuevo Peso</Typography>
                        <IconButton onClick={() => setOpenWeightDialog(false)}><CloseIcon /></IconButton>
                    </Box>
                    <DialogContent sx={{ mt: 1 }}>
                        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 2 }}>
                            <Typography variant="caption" fontWeight="bold">Nota: Acción irreversible. Asegúrese de los datos.</Typography>
                        </Alert>
                        <Grid container spacing={2}>
                            <Grid item xs={12}><SoftInput label="Peso (Kg)" type="number" fullWidth value={weightForm.weightKg} onChange={(e) => setWeightForm({...weightForm, weightKg: parseFloat(e.target.value)})} InputProps={{ startAdornment: <InputAdornment position="start"><WeightIcon color="secondary" /></InputAdornment> }} /></Grid>
                            <Grid item xs={12}><SoftInput label="Fecha" type="date" fullWidth value={weightForm.date} onChange={(e) => setWeightForm({...weightForm, date: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}><Button onClick={handleCreateWeight} variant="contained" fullWidth sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#4a148c' }, boxShadow: '0 4px 12px rgba(123,31,162,0.3)' }} startIcon={<SaveIcon />}>Confirmar</Button></DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
                </Snackbar>

            </Box>
        </ThemeProvider>
    );
};

export default ProductionPage;