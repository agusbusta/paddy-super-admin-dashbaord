import React, { useState } from 'react';
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Collapse,
  Grid,
  Tabs,
  Tab,
  Menu,
  ListItemIcon,
  ListItemText,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService, User, UserUpdate } from '../services/users';
import { georefService } from '../services/georef';
import { colors } from '../utils/constants';
import { exportToCSV, exportToExcel, mapUsersForExport } from '../utils/export';
import toast from 'react-hot-toast';

type SortField = 'id' | 'name' | 'email' | 'category' | 'gender' | 'is_active';
type SortDirection = 'asc' | 'desc';

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterProfileComplete, setFilterProfileComplete] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [editForm, setEditForm] = useState<UserUpdate>({});
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [reservationsPage, setReservationsPage] = useState(0);
  const [reservationsRowsPerPage, setReservationsRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error, refetch } = useQuery(
    'users',
    () => userService.getUsers({ limit: 1000 }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: userReservations = [], isLoading: isLoadingReservations } = useQuery(
    ['user-reservations', selectedUser?.id],
    () => userService.getUserReservations(selectedUser!.id),
    {
      enabled: !!selectedUser && detailDialogOpen,
      refetchOnWindowFocus: false,
    }
  );

  const updateUserMutation = useMutation(
    (data: { id: number; data: UserUpdate }) => userService.updateUser(data.id, data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Usuario actualizado exitosamente');
        setEditDialogOpen(false);
        setSelectedUser(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al actualizar usuario');
      },
    }
  );

  const toggleStatusMutation = useMutation(
    (id: number) => userService.toggleUserStatus(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Estado del usuario actualizado');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al actualizar estado');
      },
    }
  );

  // Obtener valores únicos para los filtros (categorías y géneros de usuarios)
  const categories = Array.from(new Set(users.map(u => u.category).filter(Boolean))) as string[];
  const genders = Array.from(new Set(users.map(u => u.gender).filter(Boolean))) as string[];
  
  // Cargar provincias y ciudades desde la API Georef
  const { data: provincias = [], isLoading: loadingProvincias } = useQuery(
    'provincias-argentina',
    () => georefService.getProvincias(),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 24, // Cache por 24 horas
    }
  );

  const { data: localidades = [], isLoading: loadingLocalidades } = useQuery(
    ['localidades-argentina', filterProvince],
    () => {
      if (!filterProvince) return Promise.resolve([]);
      const provincia = provincias.find((p) => p.nombre === filterProvince);
      if (!provincia) return Promise.resolve([]);
      return georefService.getLocalidadesPorProvincia(provincia.id);
    },
    {
      enabled: !!filterProvince && provincias.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 24, // Cache por 24 horas
    }
  );

  const filteredUsers = users
    .filter((user) => {
      // Búsqueda por texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
          (user.category && user.category.toLowerCase().includes(searchLower)) ||
          (user.gender && user.gender.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filtro por categoría
      if (filterCategory && user.category !== filterCategory) return false;

      // Filtro por género
      if (filterGender && user.gender !== filterGender) return false;

      // Filtro por estado activo
      if (filterActive === 'active' && !user.is_active) return false;
      if (filterActive === 'inactive' && user.is_active) return false;

      // Filtro por perfil completo
      if (filterProfileComplete === 'complete' && !user.is_profile_complete) return false;
      if (filterProfileComplete === 'incomplete' && user.is_profile_complete) return false;

      // Filtro por provincia
      if (filterProvince && user.province !== filterProvince) return false;

      // Filtro por ciudad
      if (filterCity && user.city !== filterCity) return false;

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = `${a.name} ${a.last_name || ''}`.toLowerCase();
          bValue = `${b.name} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'gender':
          aValue = a.gender || '';
          bValue = b.gender || '';
          break;
        case 'is_active':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Calcular usuarios paginados
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReservationsPageChange = (event: unknown, newPage: number) => {
    setReservationsPage(newPage);
  };

  const handleReservationsRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReservationsRowsPerPage(parseInt(event.target.value, 10));
    setReservationsPage(0);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterGender('');
    setFilterActive('all');
    setFilterProfileComplete('all');
    setFilterCity('');
    setFilterProvince('');
    setPage(0);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      category: user.category,
      gender: user.gender,
      height: user.height,
      is_active: user.is_active,
    });
    setEditDialogOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailTab(0);
    setReservationsPage(0);
    setDetailDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data: editForm });
    }
  };

  const handleToggleStatus = (userId: number) => {
    if (window.confirm('¿Estás seguro de cambiar el estado de este usuario?')) {
      toggleStatusMutation.mutate(userId);
    }
  };

  const getStatusColor = (isActive?: boolean) => {
    return isActive ? colors.success : colors.error;
  };

  const getStatusLabel = (isActive?: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar los usuarios. Por favor, intenta nuevamente.
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Reintentar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filteredUsers.length} de {users.length} usuarios
            {(filterCategory || filterGender || filterActive !== 'all' || filterProfileComplete !== 'all' || searchTerm) && (
              <Chip
                label="Filtros activos"
                size="small"
                sx={{ ml: 1 }}
                color="primary"
                variant="outlined"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            variant="outlined"
            sx={{ borderColor: colors.primary, color: colors.primary }}
            disabled={filteredUsers.length === 0}
          >
            Exportar
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                const exportData = mapUsersForExport(filteredUsers);
                exportToCSV(exportData, { filename: `usuarios_${new Date().toISOString().split('T')[0]}` });
                toast.success('Datos exportados a CSV exitosamente');
                setExportMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exportar a CSV</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                const exportData = mapUsersForExport(filteredUsers);
                exportToExcel(exportData, { filename: `usuarios_${new Date().toISOString().split('T')[0]}` });
                toast.success('Datos exportados a Excel exitosamente');
                setExportMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exportar a Excel</ListItemText>
            </MenuItem>
          </Menu>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Actualizar
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, email, categoría o género..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ minWidth: 120 }}
            >
              Filtros
            </Button>
            {(filterCategory || filterGender || filterActive !== 'all' || filterProfileComplete !== 'all' || filterCity || filterProvince) && (
              <Button variant="outlined" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </Box>

          <Collapse in={showFilters}>
            <Paper sx={{ p: 2, mt: 2, backgroundColor: colors.background }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={filterCategory}
                      label="Categoría"
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Género</InputLabel>
                    <Select
                      value={filterGender}
                      label="Género"
                      onChange={(e) => setFilterGender(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {genders.map((gender) => (
                        <MenuItem key={gender} value={gender}>
                          {gender}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filterActive}
                      label="Estado"
                      onChange={(e) => setFilterActive(e.target.value)}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="active">Activos</MenuItem>
                      <MenuItem value="inactive">Inactivos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Perfil</InputLabel>
                    <Select
                      value={filterProfileComplete}
                      label="Perfil"
                      onChange={(e) => setFilterProfileComplete(e.target.value)}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="complete">Completos</MenuItem>
                      <MenuItem value="incomplete">Incompletos</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Provincia</InputLabel>
                    <Select
                      value={filterProvince}
                      label="Provincia"
                      onChange={(e) => {
                        setFilterProvince(e.target.value);
                        setFilterCity(''); // Resetear ciudad al cambiar provincia
                        setPage(0);
                      }}
                      disabled={loadingProvincias}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {provincias.map((provincia) => (
                        <MenuItem key={provincia.id} value={provincia.nombre}>
                          {provincia.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ciudad</InputLabel>
                    <Select
                      value={filterCity}
                      label="Ciudad"
                      onChange={(e) => {
                        setFilterCity(e.target.value);
                        setPage(0);
                      }}
                      disabled={!filterProvince || loadingLocalidades}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {localidades.map((localidad) => (
                        <MenuItem key={localidad.id} value={localidad.nombre}>
                          {localidad.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    ID
                    <SortIcon field="id" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Nombre
                    <SortIcon field="name" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('email')}>
                    Email
                    <SortIcon field="email" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    Categoría
                    <SortIcon field="category" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('gender')}>
                    Género
                    <SortIcon field="gender" />
                  </Box>
                </TableCell>
                <TableCell>Perfil Completo</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
                    Estado
                    <SortIcon field="is_active" />
                  </Box>
                </TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: colors.primary, fontSize: 20 }} />
                        <Typography variant="body2">
                          {user.name} {user.last_name || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.category ? (
                        <Chip label={user.category} size="small" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin categoría
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.gender || (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_profile_complete ? (
                        <CheckIcon sx={{ color: colors.success }} />
                      ) : (
                        <CancelIcon sx={{ color: colors.error }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(user.is_active)}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(user.is_active)}20`,
                          color: getStatusColor(user.is_active),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(user)}
                        sx={{ color: colors.primary }}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user)}
                        sx={{ color: colors.primary }}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(user.id)}
                        sx={{
                          color: user.is_active ? colors.error : colors.success,
                        }}
                        title={user.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {user.is_active ? <CancelIcon /> : <CheckIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </Card>

      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Apellido"
              value={editForm.last_name || ''}
              onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
              type="email"
            />
            <TextField
              label="Teléfono"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                label="Categoría"
              >
                <MenuItem value="">Sin categoría</MenuItem>
                <MenuItem value="9na">9na</MenuItem>
                <MenuItem value="8va">8va</MenuItem>
                <MenuItem value="7ma">7ma</MenuItem>
                <MenuItem value="6ta">6ta</MenuItem>
                <MenuItem value="5ta">5ta</MenuItem>
                <MenuItem value="4ta">4ta</MenuItem>
                <MenuItem value="3ra">3ra</MenuItem>
                <MenuItem value="2da">2da</MenuItem>
                <MenuItem value="1ra">1ra</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={editForm.gender || ''}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                label="Género"
              >
                <MenuItem value="">Sin especificar</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Altura (cm)"
              value={editForm.height || ''}
              onChange={(e) => setEditForm({ ...editForm, height: parseInt(e.target.value) || undefined })}
              fullWidth
              type="number"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Mano Dominante</InputLabel>
                  <Select
                    value={editForm.dominant_hand || ''}
                    onChange={(e) => setEditForm({ ...editForm, dominant_hand: e.target.value })}
                    label="Mano Dominante"
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="Izquierda">Izquierda</MenuItem>
                    <MenuItem value="Derecha">Derecha</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Lado Preferido</InputLabel>
                  <Select
                    value={editForm.preferred_side || ''}
                    onChange={(e) => setEditForm({ ...editForm, preferred_side: e.target.value })}
                    label="Lado Preferido"
                  >
                    <MenuItem value="">Sin especificar</MenuItem>
                    <MenuItem value="DRIVE">Drive</MenuItem>
                    <MenuItem value="REVES">Revés</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ciudad"
                  value={editForm.city || ''}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Provincia"
                  value={editForm.province || ''}
                  onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.is_active ?? true}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
              }
              label="Usuario activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={updateUserMutation.isLoading}
            sx={{ backgroundColor: colors.primary }}
          >
            {updateUserMutation.isLoading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles del usuario */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedUser(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: colors.primary }} />
            <Typography variant="h6">
              {selectedUser?.name} {selectedUser?.last_name || ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={detailTab} onChange={(e, newValue) => setDetailTab(newValue)} sx={{ mb: 2 }}>
            <Tab icon={<InfoIcon />} label="Información" iconPosition="start" />
            <Tab icon={<HistoryIcon />} label="Historial de Reservas" iconPosition="start" />
          </Tabs>

          {detailTab === 0 && selectedUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser.phone || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Categoría
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser.category ? (
                      <Chip label={selectedUser.category} size="small" />
                    ) : (
                      'Sin categoría'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Género
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser.gender || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Altura
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser.height ? `${selectedUser.height} cm` : 'No especificada'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={selectedUser.is_active ? 'Activo' : 'Inactivo'}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(selectedUser.is_active)}20`,
                        color: getStatusColor(selectedUser.is_active),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Perfil Completo
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedUser.is_profile_complete ? (
                      <Chip
                        label="Completo"
                        size="small"
                        color="success"
                        icon={<CheckIcon />}
                      />
                    ) : (
                      <Chip
                        label="Incompleto"
                        size="small"
                        color="error"
                        icon={<CancelIcon />}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Registro
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString('es-AR')
                      : 'No disponible'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {detailTab === 1 && (
            <Box>
              {isLoadingReservations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : userReservations.length === 0 ? (
                <Alert severity="info">
                  Este usuario no tiene reservas registradas.
                </Alert>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Hora</TableCell>
                          <TableCell>Club</TableCell>
                          <TableCell>Cancha</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Jugadores</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userReservations
                          .slice(
                            reservationsPage * reservationsRowsPerPage,
                            reservationsPage * reservationsRowsPerPage + reservationsRowsPerPage
                          )
                          .map((reservation: any) => {
                        const getStatusLabel = (status: string) => {
                          switch (status) {
                            case 'PENDING':
                              return 'Pendiente';
                            case 'READY_TO_PLAY':
                              return 'Listo para Jugar';
                            case 'CANCELLED':
                              return 'Cancelado';
                            case 'COMPLETED':
                              return 'Completado';
                            default:
                              return status || 'N/A';
                          }
                        };

                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'READY_TO_PLAY':
                              return 'success';
                            case 'CANCELLED':
                              return 'error';
                            case 'PENDING':
                              return 'warning';
                            case 'COMPLETED':
                              return 'info';
                            default:
                              return 'default';
                          }
                        };

                        return (
                          <TableRow key={reservation.id}>
                            <TableCell>{reservation.id}</TableCell>
                            <TableCell>
                              {reservation.date
                                ? new Date(reservation.date).toLocaleDateString('es-AR')
                                : '-'}
                            </TableCell>
                            <TableCell>{reservation.start_time || '-'}</TableCell>
                            <TableCell>{reservation.club_name || reservation.club_id || '-'}</TableCell>
                            <TableCell>{reservation.court_name || reservation.court_id || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(reservation.status)}
                                size="small"
                                color={getStatusColor(reservation.status) as any}
                              />
                            </TableCell>
                            <TableCell>
                              {reservation.players_count || 0}/4
                              {reservation.is_mixed_match && (
                                <Chip
                                  label="Mixto"
                                  size="small"
                                  sx={{ ml: 0.5 }}
                                  color="secondary"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={userReservations.length}
                    page={reservationsPage}
                    onPageChange={handleReservationsPageChange}
                    rowsPerPage={reservationsRowsPerPage}
                    onRowsPerPageChange={handleReservationsRowsPerPageChange}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetailDialogOpen(false);
              setSelectedUser(null);
              setReservationsPage(0);
              setDetailTab(0);
            }}
          >
            Cerrar
          </Button>
          {selectedUser && (
            <Button
              onClick={() => {
                setDetailDialogOpen(false);
                handleEdit(selectedUser);
              }}
              variant="contained"
              sx={{ backgroundColor: colors.primary }}
            >
              Editar Usuario
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

