import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Button, Grid, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip,
    CircularProgress, MenuItem, FormControl, InputLabel, Select,
    List, ListItemButton, ListItemIcon, Tooltip, Avatar, AppBar,
    Toolbar, CssBaseline, Slide, Divider, Snackbar, Alert, LinearProgress,
    Stack, InputAdornment
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { createTheme, ThemeProvider, alpha, styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- ICONOS ---
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    LocalHospital as HealthIcon, Search as SearchIcon,
    GridView as GridViewIcon, Pets as PetsIcon, HouseSiding as HouseSidingIcon,
    WaterDrop as WaterDropIcon, Flag as FlagIcon, BarChart as BarChartIcon,
    Logout as LogoutIcon, CalendarToday as CalendarIcon,
    Healing as HealingIcon, Vaccines as VaccineIcon, Description as NoteIcon,
    WarningAmber as WarningIcon, MedicalServices as DiagnosisIcon,
    PictureAsPdf as PdfIcon, Info as InfoIcon, Lock as LockIcon,
    AutoAwesome as AutoIcon, Close as CloseIcon, Save as SaveIcon
} from '@mui/icons-material';

import {
    createHealthRecordAction,
    getAllHealthRecordsAction,
    getHealthRecordsByAnimalIdAction,
    updateHealthRecordAction,
    deleteHealthRecordAction,
    getHealthPenaltyByAnimalIdAction
} from '../application/health';
import { getAllAnimalsAction } from '../application/animal';
import { HealthRecord, CreateHealthRecordRequest, UpdateHealthRecordRequest } from '../domain/health';
import { Animal } from '../domain/animal';
import { useAuth } from '../contexts/AuthContext';

// --- ANIMACIONES ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 150, 136, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(0, 150, 136, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 150, 136, 0); }
`;

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// --- ESTILOS PERSONALIZADOS (Inputs tipo "Burbuja") ---
const SoftInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        border: '1px solid transparent',
        transition: 'all 0.2s',
        '& fieldset': { border: 'none' }, // Quita el borde gris feo
        '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
            transform: 'translateY(-1px)'
        },
        '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            border: `1px solid ${theme.palette.primary.main}`
        }
    },
    '& .MuiInputLabel-root': {
        color: '#78909c',
        fontWeight: 500,
        '&.Mui-focused': { color: theme.palette.primary.main }
    }
}));

// --- TEMA ---
const theme = createTheme({
    palette: {
        primary: { main: '#009688', light: '#b2dfdb', dark: '#00796b' },
        secondary: { main: '#546e7a' },
        error: { main: '#e53935' },
        warning: { main: '#ff9800' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#263238', secondary: '#607d8b' },
    },
    typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
    shape: { borderRadius: 16 },
    components: {
        MuiCard: { styleOverrides: { root: { borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } } },
        MuiButton: { styleOverrides: { root: { borderRadius: 12, textTransform: 'none', fontWeight: 700, boxShadow: 'none' } } },
        MuiDialog: { styleOverrides: { paper: { borderRadius: 24, backgroundColor: '#f8f9fa' } } } // Fondo gris claro para el dialog
    }
});

const MENU_ITEMS = [
    { text: 'Panel General', icon: <GridViewIcon />, path: '/dashboard' },
    { text: 'Animales', icon: <PetsIcon />, path: '/animals' },
    { text: 'Establos', icon: <HouseSidingIcon />, path: '/stables' },
    { text: 'Salud', icon: <HealthIcon />, path: '/health' },
    { text: 'Producción', icon: <WaterDropIcon />, path: '/production' },
    { text: 'Campañas', icon: <FlagIcon />, path: '/campaigns' },
    { text: 'Reportes', icon: <BarChartIcon />, path: '/reports' },
];

interface HealthFormState {
    animalId: number;
    diagnosis: string;
    treatment: string;
    vaccine: string;
    date: string;
    penalty: number;
    notes: string;
}

const HealthPage: React.FC = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
    const [healthPenalty, setHealthPenalty] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string>('Veterinario');
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

    // Dialogs
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

    const [formData, setFormData] = useState<HealthFormState>({
        animalId: 0,
        diagnosis: '',
        treatment: '',
        vaccine: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        penalty: 0,
        notes: ''
    });

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        try { const p = JSON.parse(atob(token.split('.')[1])); setUsername(p.sub || p.username || 'Veterinario'); } catch (e) { }
        loadData();
    }, [token]);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => setSnackbar({ open: true, message, severity });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [animalsData, recordsData] = await Promise.all([getAllAnimalsAction(), getAllHealthRecordsAction()]);
            setAnimals(animalsData);
            setHealthRecords(recordsData);
        } catch (err) {
            showSnackbar('Error cargando datos del sistema', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFilterChange = async (animalId: number | null) => {
        setSelectedAnimalId(animalId);
        setLoading(true);
        try {
            if (animalId) {
                const [records, penalty] = await Promise.all([
                    getHealthRecordsByAnimalIdAction(animalId),
                    getHealthPenaltyByAnimalIdAction(animalId)
                ]);
                setHealthRecords(records);
                setHealthPenalty(penalty);
            } else {
                const records = await getAllHealthRecordsAction();
                setHealthRecords(records);
                setHealthPenalty(null);
            }
        } catch (error) {
            showSnackbar('Error al filtrar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateSmartPenalty = (diagnosis: string): number => {
        const severeKeywords = ['grave', 'infección', 'rotura', 'cirugía', 'virus', 'crítico', 'fractura'];
        const moderateKeywords = ['leve', 'gripe', 'corte', 'inflamación', 'parásitos'];
        const text = diagnosis.toLowerCase();
        if (severeKeywords.some(k => text.includes(k))) return parseFloat((Math.random() * (0.8 - 0.4) + 0.4).toFixed(2));
        if (moderateKeywords.some(k => text.includes(k))) return parseFloat((Math.random() * (0.3 - 0.1) + 0.1).toFixed(2));
        return 0.05; 
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFillColor(0, 150, 136);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Muu Smart - Historial Médico", 14, 13);

        const tableColumn = ["Fecha", "Paciente", "Diagnóstico", "Tratamiento", "Impacto"];
        const tableRows: any[] = [];

        healthRecords.forEach(record => {
            const animal = animals.find(a => a.id === record.animalId);
            const recordData = [
                format(new Date(record.date), 'dd/MM/yyyy'),
                animal ? animal.tag : 'N/A',
                record.diagnosis,
                record.treatment || 'N/A',
                `${(record.penalty * 100).toFixed(0)}%`
            ];
            tableRows.push(recordData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [0, 150, 136] },
            styles: { fontSize: 9 },
        });

        doc.save(`MuuSmart_Historial_${new Date().toISOString().slice(0, 10)}.pdf`);
        showSnackbar('Historial exportado a PDF', 'success');
    };

    const handleOpenDialog = (record?: HealthRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                animalId: record.animalId,
                diagnosis: record.diagnosis,
                treatment: record.treatment,
                vaccine: record.vaccine,
                date: record.date,
                penalty: record.penalty,
                notes: record.notes
            });
        } else {
            setEditingRecord(null);
            setFormData({
                animalId: selectedAnimalId || (animals.length > 0 ? animals[0].id : 0),
                diagnosis: '',
                treatment: '',
                vaccine: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                penalty: 0,
                notes: ''
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.diagnosis.trim()) { showSnackbar('El diagnóstico es obligatorio', 'error'); return; }

            let finalPenalty = Number(formData.penalty);
            if (!editingRecord) {
                finalPenalty = generateSmartPenalty(formData.diagnosis);
            }

            const payload = { ...formData, penalty: finalPenalty };

            if (editingRecord) {
                await updateHealthRecordAction(editingRecord.id, payload as UpdateHealthRecordRequest);
                showSnackbar('Historial actualizado', 'success');
            } else {
                await createHealthRecordAction(payload as CreateHealthRecordRequest);
                showSnackbar(`Historial agregado. Impacto IA: ${(finalPenalty * 100).toFixed(0)}%`, 'success');
            }
            setOpenDialog(false);
            handleFilterChange(selectedAnimalId); 
        } catch (err) {
            showSnackbar('Error al procesar', 'error');
        }
    };

    const confirmDelete = (id: number) => { setRecordToDelete(id); setOpenDeleteDialog(true); }
    const handleDelete = async () => {
        if (recordToDelete === null) return;
        try { await deleteHealthRecordAction(recordToDelete); showSnackbar('Registro eliminado', 'success'); handleFilterChange(selectedAnimalId); } 
        catch (err) { showSnackbar('Error al eliminar', 'error'); } finally { setOpenDeleteDialog(false); }
    };

    const getAnimalTag = (id: number) => animals.find(a => a.id === id)?.tag || `ID: ${id}`;
    const getAnimalName = (id: number) => { const a = animals.find(b => b.id === id); return a ? `${a.tag} - ${a.breed}` : 'Desconocido'; };
    
    const getSeverityColor = (penalty: number) => {
        if (penalty <= 0.1) return '#4caf50'; 
        if (penalty <= 0.4) return '#ff9800'; 
        return '#f44336'; 
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', background: '#f4f6f8', overflow: 'hidden' }}>

                {/* SIDEBAR */}
                <Box sx={{ width: '80px', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 4, zIndex: 10 }}>
                    <Paper elevation={0} sx={{ width: '60px', height: '90%', borderRadius: '30px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                        <List sx={{ width: '100%', px: 1, mt: 2 }}>
                            {MENU_ITEMS.map((item) => (
                                <Tooltip title={item.text} placement="right" arrow key={item.text}>
                                    <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: 'center', borderRadius: '50%', mb: 1, color: location.pathname === item.path ? 'primary.main' : 'text.secondary', bgcolor: location.pathname === item.path ? 'rgba(0, 150, 136, 0.1)' : 'transparent' }}>
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
                        <Toolbar sx={{ justifyContent: 'space-between', bgcolor: 'white', borderRadius: '16px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <HealthIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h6" color="text.primary">Clínica Muu Smart</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip avatar={<Avatar>{username[0]}</Avatar>} label={username} variant="outlined" sx={{ border: 'none', bgcolor: '#f5f5f5' }} />
                                <IconButton onClick={logout} color="error"><LogoutIcon /></IconButton>
                            </Box>
                        </Toolbar>
                    </AppBar>

                    <Container maxWidth={false} sx={{ mt: 3, mb: 3, flexGrow: 1, overflow: 'auto' }}>
                        
                        {/* BARRA DE ACCIONES */}
                        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '20px', bgcolor: 'white', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                                <FormControl sx={{ minWidth: 250 }}>
                                    <InputLabel>Historial del Paciente</InputLabel>
                                    <Select
                                        value={selectedAnimalId || ''}
                                        onChange={(e) => handleFilterChange(e.target.value ? Number(e.target.value) : null)}
                                        label="Historial del Paciente"
                                        sx={{ borderRadius: 3 }}
                                    >
                                        <MenuItem value=""><em>Todos los pacientes</em></MenuItem>
                                        {animals.map(animal => (
                                            <MenuItem key={animal.id} value={animal.id}>{animal.tag} - {animal.breed}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button startIcon={<PdfIcon />} onClick={handleExportPDF} variant="outlined" sx={{ borderRadius: 3, borderColor: 'primary.light', color: 'primary.main' }}>
                                    Exportar PDF
                                </Button>
                            </Box>

                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ px: 4, borderRadius: 3, bgcolor: 'primary.main', boxShadow: '0 8px 16px rgba(0, 150, 136, 0.2)' }}>
                                Nuevo Historial
                            </Button>
                        </Paper>

                        {/* GRID DE TICKETS (TARJETAS ESTILIZADAS) */}
                        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box> :
                        healthRecords.length === 0 ? <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'white' }}><Typography color="text.secondary">No hay historial médico activo.</Typography></Paper> :
                        
                        <Grid container spacing={3}>
                            {healthRecords.map((record, index) => {
                                const borderColor = getSeverityColor(record.penalty);
                                return (
                                    <Grid item xs={12} md={6} lg={4} key={record.id}>
                                        <Card sx={{ 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            animation: `${fadeInUp} 0.5s ease backwards`, 
                                            animationDelay: `${index * 0.05}s`, 
                                            borderLeft: `6px solid ${borderColor}`,
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)' }
                                        }}>
                                            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                                {/* Encabezado: Paciente y Fecha */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PetsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>{getAnimalTag(record.animalId)}</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">{format(new Date(record.date), 'dd MMM yyyy')}</Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={`Impacto: ${(record.penalty * 100).toFixed(0)}%`} 
                                                        size="small" 
                                                        sx={{ bgcolor: alpha(borderColor, 0.1), color: borderColor, fontWeight: 'bold', borderRadius: 2 }}
                                                    />
                                                </Box>

                                                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                                                {/* Diagnóstico Principal */}
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#263238', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DiagnosisIcon fontSize="small" color="primary" /> {record.diagnosis}
                                                </Typography>

                                                {/* Detalles Médicos */}
                                                <Stack spacing={1} sx={{ mt: 1 }}>
                                                    {record.treatment && (
                                                        <Box sx={{ pl: 1.5, borderLeft: '2px solid #e0e0e0' }}>
                                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>TRATAMIENTO</Typography>
                                                            <Typography variant="body2">{record.treatment}</Typography>
                                                        </Box>
                                                    )}
                                                    {record.vaccine && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e0f2f1', p: 1, borderRadius: 2 }}>
                                                            <VaccineIcon fontSize="small" color="primary" />
                                                            <Typography variant="body2" fontWeight={500}>Vacuna: {record.vaccine}</Typography>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </CardContent>

                                            {/* Footer Acciones */}
                                            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', gap: 1, bgcolor: '#fafafa' }}>
                                                <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(record)} sx={{ color: 'primary.main' }}>Editar</Button>
                                                <Button size="small" startIcon={<DeleteIcon />} onClick={() => confirmDelete(record.id)} color="error">Borrar</Button>
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>}
                    </Container>
                </Box>

                {/* --- DIÁLOGO MEJORADO (NO PARECE FORMULARIO) --- */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} TransitionComponent={Transition} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f8f9fa' } }}>
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderRadius: '24px 24px 0 0' }}>
                        <Typography variant="h6" color="primary.dark">
                            {editingRecord ? 'Editar Historial Médico' : 'Nuevo Historial Médico'}
                        </Typography>
                        <IconButton onClick={() => setOpenDialog(false)}><CloseIcon /></IconButton>
                    </Box>
                    
                    <DialogContent sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            
                            {/* 1. SELECCIÓN DE PACIENTE (Tarjeta vs Input) */}
                            <Grid item xs={12}>
                                {editingRecord ? (
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #bbdefb' }}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}><PetsIcon /></Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" color="primary.dark">PACIENTE (Bloqueado)</Typography>
                                            <Typography variant="h6">{getAnimalName(formData.animalId)}</Typography>
                                        </Box>
                                        <LockIcon sx={{ ml: 'auto', color: 'primary.light' }} />
                                    </Paper>
                                ) : (
                                    <SoftInput
                                        select
                                        label="Seleccionar Paciente"
                                        fullWidth
                                        value={formData.animalId}
                                        onChange={(e) => setFormData({ ...formData, animalId: Number(e.target.value) })}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><PetsIcon color="action" /></InputAdornment> }}
                                    >
                                        {animals.map(animal => (
                                            <MenuItem key={animal.id} value={animal.id}>{animal.tag} - {animal.breed}</MenuItem>
                                        ))}
                                    </SoftInput>
                                )}
                            </Grid>

                            {/* 2. FECHA Y DIAGNÓSTICO */}
                            <Grid item xs={12} sm={5}>
                                <SoftInput
                                    label="Fecha de Atención"
                                    type="date"
                                    fullWidth
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SoftInput
                                    label="Diagnóstico Principal"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    placeholder="Ej. Infección respiratoria leve..."
                                    InputProps={{ startAdornment: <InputAdornment position="start"><DiagnosisIcon color="primary" /></InputAdornment> }}
                                />
                            </Grid>

                            {/* 3. CÁLCULO DE IMPACTO (Caja Especial vs Input) */}
                            <Grid item xs={12}>
                                {!editingRecord ? (
                                    <Paper elevation={0} sx={{ 
                                        p: 2, borderRadius: 3, 
                                        background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        border: '1px dashed #009688'
                                    }}>
                                        <AutoIcon sx={{ color: '#00796b', animation: `${pulse} 2s infinite` }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">Cálculo Automático por IA</Typography>
                                            <Typography variant="caption" color="text.secondary">El impacto en la salud se calculará al guardar basado en el diagnóstico.</Typography>
                                        </Box>
                                    </Paper>
                                ) : (
                                    <Box sx={{ position: 'relative' }}>
                                        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 1, borderRadius: 2 }}>
                                            <Typography variant="caption" fontWeight="bold">Ajuste Manual Permitido</Typography>
                                        </Alert>
                                        <SoftInput
                                            label="Penalización (0.0 - 1.0)"
                                            type="number"
                                            fullWidth
                                            value={formData.penalty}
                                            onChange={(e) => setFormData({ ...formData, penalty: parseFloat(e.target.value) || 0 })}
                                            inputProps={{ min: 0, max: 1, step: 0.1 }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                            {/* 4. TRATAMIENTO Y VACUNAS (Dos columnas) */}
                            <Grid item xs={12} sm={6}>
                                <SoftInput
                                    label="Tratamiento"
                                    fullWidth
                                    value={formData.treatment}
                                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><HealingIcon color="action" /></InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <SoftInput
                                    label="Vacuna"
                                    fullWidth
                                    value={formData.vaccine}
                                    onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><VaccineIcon color="info" /></InputAdornment> }}
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <SoftInput
                                    label="Notas Adicionales"
                                    fullWidth
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><NoteIcon color="action" /></InputAdornment> }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 1 }}>
                        <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ borderRadius: 3, px: 3 }}>Cancelar</Button>
                        <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />} sx={{ borderRadius: 3, px: 4, boxShadow: '0 4px 14px rgba(0, 150, 136, 0.4)' }}>
                            Guardar Historial
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* --- DIÁLOGO ELIMINAR --- */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#ffebee', color: 'error.main', mx: 'auto', mb: 2 }}>
                            <DeleteIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">¿Eliminar Historial?</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            Esta acción no se puede deshacer. El registro desaparecerá del sistema.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" color="inherit" sx={{ borderRadius: 3, px: 3 }}>Cancelar</Button>
                            <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 3, px: 3, boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)' }}>Eliminar Definitivamente</Button>
                        </Box>
                    </Box>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{snackbar.message}</Alert>
                </Snackbar>

            </Box>
        </ThemeProvider>
    );
};

export default HealthPage;