import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  House as HouseIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

// --- CONFIGURACIÓN DE DISEÑO ---
const DRAWER_WIDTH = 260;
const CARD_RADIUS = 3; // 24px (3 * 8)
const PRIMARY_COLOR = '#2E7D32'; // Verde MuuSmart
const SECONDARY_COLOR = '#1565C0'; // Azul Corporativo
const BG_COLOR = '#F4F6F8'; // Gris muy claro para fondo

// --- INTERFACES ---
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'blocked';
  animalsCount?: number;
  stablesCount?: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalAnimals: number;
  totalStables: number;
  newUsersThisMonth: number;
  systemHealth: number;
}

// --- MENÚ ---
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
  { text: 'Usuarios', icon: <PeopleIcon />, value: 'users' },
  { text: 'Animales Global', icon: <PetsIcon />, value: 'animals' },
  { text: 'Establos Global', icon: <HouseIcon />, value: 'stables' },
  { text: 'Reportes', icon: <BarChartIcon />, value: 'reports' },
  { text: 'Configuración', icon: <SettingsIcon />, value: 'settings' },
];

const AdminPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, username, isAdmin } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAnimals: 0,
    totalStables: 0,
    newUsersThisMonth: 0,
    systemHealth: 98
  });

  // Auth Check
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data replacement for demonstration if API fails
      // const usersResponse = await api.get('/admin/users');
      // setUsers(usersResponse.data);
      
      // Simulate API delay and data
      setTimeout(() => {
        setUsers([
          { id: 1, username: 'admin', email: 'admin@muusmart.com', role: 'ADMIN', createdAt: '2024-01-01', status: 'active', animalsCount: 150, stablesCount: 10 },
          { id: 2, username: 'ganadero1', email: 'ganadero1@email.com', role: 'USER', createdAt: '2024-02-15', lastLogin: '2024-12-03', status: 'active', animalsCount: 45, stablesCount: 3 },
          { id: 3, username: 'ganadero2', email: 'ganadero2@email.com', role: 'USER', createdAt: '2024-03-20', lastLogin: '2024-12-01', status: 'active', animalsCount: 78, stablesCount: 5 },
          { id: 4, username: 'usuario_test', email: 'test@email.com', role: 'USER', createdAt: '2024-06-10', status: 'inactive', animalsCount: 0, stablesCount: 0 },
          { id: 5, username: 'finca_norte', email: 'norte@finca.com', role: 'USER', createdAt: '2024-07-05', lastLogin: '2024-11-28', status: 'blocked', animalsCount: 120, stablesCount: 8 },
        ]);
        setStats({
          totalUsers: 154,
          activeUsers: 140,
          totalAnimals: 3930,
          totalStables: 265,
          newUsersThisMonth: 12,
          systemHealth: 99
        });
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => logout('manual');

  const handleUserAction = (action: string, user: User) => {
    setSelectedUser(user);
    if (action === 'view') setOpenUserDialog(true);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HELPERS DE UI ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, subtext, icon, color }: any) => (
    <Card sx={{ 
      borderRadius: CARD_RADIUS, 
      boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ color: '#2d3748', my: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: color, bgcolor: alpha(color, 0.1), py: 0.5, px: 1, borderRadius: 1, display: 'inline-block' }}>
              {subtext}
            </Typography>
          </Box>
          <Avatar variant="rounded" sx={{ bgcolor: alpha(color, 0.15), color: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

  // --- VISTAS ---
  const renderDashboard = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Usuarios" 
            value={stats.totalUsers} 
            subtext={`+${stats.newUsersThisMonth} este mes`}
            icon={<PeopleIcon fontSize="large" />}
            color={SECONDARY_COLOR}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Animales" 
            value={stats.totalAnimals} 
            subtext="En gestión activa"
            icon={<PetsIcon fontSize="large" />}
            color={PRIMARY_COLOR}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Establos" 
            value={stats.totalStables} 
            subtext="Infraestructura"
            icon={<HouseIcon fontSize="large" />}
            color="#ED6C02" // Naranja
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Salud Sistema" 
            value={`${stats.systemHealth}%`} 
            subtext="Operativo"
            icon={<SecurityIcon fontSize="large" />}
            color="#0288D1" // Cyan
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, borderRadius: CARD_RADIUS, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Usuarios Recientes</Typography>
              <Button size="small" startIcon={<RefreshIcon />} onClick={loadData}>Actualizar</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Datos</TableCell>
                    <TableCell align="right">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 5).map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(PRIMARY_COLOR, 0.8), fontSize: '0.8rem' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">{user.username}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" variant="outlined" color={user.role === 'ADMIN' ? 'secondary' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">{user.animalsCount} Animales</Typography>
                      </TableCell>
                      <TableCell align="right">
                         <Chip label={user.status} size="small" color={getStatusColor(user.status) as any} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: CARD_RADIUS, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Acciones Rápidas</Typography>
            <Stack spacing={2} sx={{ mt: 3 }}>
              {[
                { label: 'Gestionar Usuarios', icon: <PeopleIcon />, color: SECONDARY_COLOR, tab: 'users' },
                { label: 'Exportar Backup', icon: <DownloadIcon />, color: PRIMARY_COLOR, tab: null },
                { label: 'Ver Reportes', icon: <BarChartIcon />, color: '#ED6C02', tab: 'reports' }
              ].map((action, idx) => (
                <Button 
                  key={idx}
                  variant="contained" 
                  fullWidth 
                  startIcon={action.icon}
                  onClick={() => action.tab && setActiveTab(action.tab)}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    py: 1.5,
                    bgcolor: action.color,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: alpha(action.color, 0.9), boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderUsersTable = () => (
    <Paper sx={{ borderRadius: CARD_RADIUS, overflow: 'hidden', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h5" fontWeight="bold">Gestión de Usuarios</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              placeholder="Buscar..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }}
              sx={{ minWidth: 250 }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />}>Filtros</Button>
            <Button variant="contained" color="primary" disableElevation>+ Nuevo</Button>
          </Stack>
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#FAFAFA' }}>
            <TableRow>
              {['Usuario', 'Rol', 'Métricas', 'Registro', 'Estado', 'Acciones'].map((head) => (
                <TableCell key={head} sx={{ fontWeight: 600, color: 'text.secondary' }}>{head}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? SECONDARY_COLOR : PRIMARY_COLOR }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{user.username}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={user.role} 
                      color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                      <Tooltip title="Animales"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PetsIcon fontSize="small" color="action" /><Typography variant="body2">{user.animalsCount || 0}</Typography></Box></Tooltip>
                      <Tooltip title="Establos"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><HouseIcon fontSize="small" color="action" /><Typography variant="body2">{user.stablesCount || 0}</Typography></Box></Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={user.status === 'active' ? 'Activo' : user.status === 'blocked' ? 'Bloqueado' : 'Inactivo'} 
                      color={getStatusColor(user.status) as any}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleUserAction('view', user)}><ViewIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                    {user.role !== 'ADMIN' && (
                      <IconButton size="small" color="warning"><BlockIcon fontSize="small" /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BG_COLOR }}>
      {/* SIDEBAR UNIFORME */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#111827', // Dark Slate
            color: 'white',
            borderRight: 'none'
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Avatar sx={{ bgcolor: PRIMARY_COLOR, width: 40, height: 40 }} variant="rounded">
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1 }}>MuuSmart</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 1 }}>ADMIN PANEL</Typography>
          </Box>
        </Box>

        <List sx={{ px: 2, py: 3 }}>
          {menuItems.map((item) => (
            <ListItem key={item.value} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={activeTab === item.value}
                onClick={() => setActiveTab(item.value)}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    bgcolor: PRIMARY_COLOR,
                    color: 'white',
                    '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.8) },
                    '& .MuiListItemIcon-root': { color: 'white' }
                  },
                  '&:not(.Mui-selected):hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: activeTab === item.value ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button 
            fullWidth 
            onClick={handleLogout} 
            startIcon={<LogoutIcon />} 
            sx={{ color: '#ef5350', bgcolor: 'rgba(239, 83, 80, 0.1)', '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.2)' } }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Drawer>

      {/* CONTENIDO PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ bgcolor: 'white', borderBottom: `1px solid ${theme.palette.divider}`, color: 'text.primary', px: 2 }}
        >
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {menuItems.find(m => m.value === activeTab)?.text || 'Dashboard'}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={loadData} size="small"><RefreshIcon /></IconButton>
              <Divider orientation="vertical" sx={{ height: 20, my: 'auto' }} />
              <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                endIcon={<ArrowDownIcon fontSize="small" />}
                startIcon={<Avatar sx={{ width: 30, height: 30, bgcolor: SECONDARY_COLOR }}>{username ? username.charAt(0) : 'A'}</Avatar>}
                sx={{ textTransform: 'none', color: 'text.primary', fontWeight: 600 }}
              >
                {username || 'Administrador'}
              </Button>
            </Stack>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ elevation: 2, sx: { minWidth: 180, mt: 1 } }}
            >
              <MenuItem onClick={() => navigate('/dashboard')}><ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon> Ver como Usuario</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Salir</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        {loading && <LinearProgress sx={{ height: 2 }} color="secondary" />}

        <Box sx={{ p: 4, flexGrow: 1, overflow: 'auto' }}>
          {activeTab === 'dashboard' ? renderDashboard() : 
           activeTab === 'users' ? renderUsersTable() : 
           (
             <Paper sx={{ p: 5, borderRadius: CARD_RADIUS, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
               <Box sx={{ p: 4, bgcolor: alpha(PRIMARY_COLOR, 0.05), borderRadius: '50%', mb: 3 }}>
                  {menuItems.find(i => i.value === activeTab)?.icon}
               </Box>
               <Typography variant="h5" fontWeight="bold" gutterBottom>Módulo de {menuItems.find(i => i.value === activeTab)?.text}</Typography>
               <Typography color="text.secondary">Esta sección está en desarrollo.</Typography>
             </Paper>
           )}
        </Box>
      </Box>

      {/* DIALOGO DE DETALLE UNIFORME */}
      <Dialog 
        open={openUserDialog} 
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: CARD_RADIUS } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 3, py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: SECONDARY_COLOR, width: 48, height: 48 }}>
              {selectedUser?.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">{selectedUser?.username}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser?.email}</Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">ROL DEL SISTEMA</Typography>
              <Chip label={selectedUser?.role} size="small" sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">ESTADO ACTUAL</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={selectedUser?.status} color={getStatusColor(selectedUser?.status || '') as any} size="small" />
              </Box>
            </Grid>
            <Grid item xs={12}><Divider /></Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PetsIcon color="action" />
                <Box>
                  <Typography variant="h6">{selectedUser?.animalsCount || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Animales</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <HouseIcon color="action" />
                <Box>
                  <Typography variant="h6">{selectedUser?.stablesCount || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Establos</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenUserDialog(false)} color="inherit">Cerrar</Button>
          <Button variant="contained" disableElevation>Editar Información</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;