import React, { useState } from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Modal,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  InputAdornment,
  Paper,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Pagination,
  Box as MuiBox,
} from '@mui/material';
import {
  SportsHandball as SportsIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { clubService, Club, ClubCreate, ClubUpdate } from '../services/clubs';
import { adminService } from '../services/admin';
import { Admin } from '../types/admin';
import { colors } from '../utils/constants';
import { exportToCSV, exportToExcel, mapClubsForExport } from '../utils/export';
import toast from 'react-hot-toast';

const ClubCard: React.FC<{ club: Club; onClick: () => void }> = ({ club, onClick }) => {
  const getStatusColor = (isActive?: boolean) => {
    return isActive ? colors.success : colors.error;
  };

  const getStatusLabel = (isActive?: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="140"
          image={club.logo}
          alt={club.name}
          sx={{ objectFit: 'contain', backgroundColor: colors.background }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: getStatusColor(club.is_active),
              boxShadow: `0 0 8px ${getStatusColor(club.is_active)}`,
            }}
          />
          <Chip
            label={getStatusLabel(club.is_active)}
            size="small"
            sx={{
              backgroundColor: `${getStatusColor(club.is_active)}20`,
              color: getStatusColor(club.is_active),
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {club.name}
        </Typography>
        {club.address && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon sx={{ color: colors.primary, fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {club.address}
            </Typography>
          </Box>
        )}
        {club.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ color: colors.primary, fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">
              {club.phone}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ClubModal: React.FC<{ 
  club: Club | null; 
  onClose: () => void; 
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ club, onClose, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!club) return null;

  return (
    <Modal
      open={!!club}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3, mb: 3 }}>
          <Avatar
            src={club.logo}
            alt={club.name}
            sx={{ width: 120, height: 120, bgcolor: colors.primary }}
          >
            {club.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {club.name}
            </Typography>
            <Chip
              label={club.is_active !== false ? 'Activo' : 'Inactivo'}
              sx={{
                backgroundColor: `${club.is_active !== false ? colors.success : colors.error}20`,
                color: club.is_active !== false ? colors.success : colors.error,
                fontWeight: 600,
              }}
            />
            {club.admin_name && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Admin: {club.admin_name}
              </Typography>
            )}
          </Box>
          {(onEdit || onDelete) && (
            <Box>
              {onEdit && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  variant="outlined"
                  color="error"
                >
                  Eliminar
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          {club.address && (
            <ListItem>
              <ListItemIcon>
                <LocationIcon sx={{ color: colors.primary }} />
              </ListItemIcon>
              <ListItemText
                primary="Dirección"
                secondary={club.address}
              />
            </ListItem>
          )}
          {club.phone && (
            <ListItem>
              <ListItemIcon>
                <PhoneIcon sx={{ color: colors.primary }} />
              </ListItemIcon>
              <ListItemText
                primary="Teléfono"
                secondary={club.phone}
              />
            </ListItem>
          )}
          {club.email && (
            <ListItem>
              <ListItemIcon>
                <EmailIcon sx={{ color: colors.primary }} />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={club.email}
              />
            </ListItem>
          )}
          {club.admin_name && (
            <ListItem>
              <ListItemIcon>
                <SportsIcon sx={{ color: colors.primary }} />
              </ListItemIcon>
              <ListItemText
                primary="Administrador"
                secondary={club.admin_name}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Modal>
  );
};

const ClubFormDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  club?: Club | null;
  onSuccess: () => void;
}> = ({ open, onClose, club, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<ClubCreate>>({
    name: club?.name || '',
    address: club?.address || '',
    phone: club?.phone || '',
    email: club?.email || '',
    description: '',
    opening_time: '08:00:00',
    closing_time: '22:00:00',
    turn_duration_minutes: 90,
    price_per_turn: 0,
    monday_open: true,
    tuesday_open: true,
    wednesday_open: true,
    thursday_open: true,
    friday_open: true,
    saturday_open: true,
    sunday_open: true,
    courts_count: 1,
    admin_user_id: undefined,
  });
  const [isActive, setIsActive] = useState(club?.is_active !== false);
  const [activeStep, setActiveStep] = useState(0);

  const queryClient = useQueryClient();

  // Obtener lista de administradores disponibles (solo para creación)
  const { data: admins = [] } = useQuery<Admin[]>(
    'admins',
    adminService.getAdmins,
    {
      enabled: !club, // Solo cargar si estamos creando un club nuevo
    }
  );

  // Filtrar administradores que no tengan club asignado
  const availableAdmins = admins.filter((admin: Admin) => !admin.club_id && admin.is_active);

  const createMutation = useMutation(
    (data: ClubCreate) => clubService.createClub(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clubs');
        toast.success('Club creado exitosamente');
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al crear el club');
      },
    }
  );

  const updateMutation = useMutation(
    (data: ClubUpdate) => clubService.updateClub(club!.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clubs');
        toast.success('Club actualizado exitosamente');
        onSuccess();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al actualizar el club');
      },
    }
  );

  const handleSubmit = () => {
    if (club) {
      // Actualizar - solo campos que se pueden actualizar
      const updateData: ClubUpdate = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        is_active: isActive,
      };
      updateMutation.mutate(updateData);
    } else {
      // Crear - el backend requiere campos obligatorios
      if (!formData.name || !formData.address) {
        toast.error('Nombre y dirección son obligatorios');
        return;
      }
      // Asegurar que los campos requeridos estén presentes
      const createData: ClubCreate = {
        name: formData.name!,
        address: formData.address!,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        opening_time: formData.opening_time || '08:00:00',
        closing_time: formData.closing_time || '22:00:00',
        turn_duration_minutes: formData.turn_duration_minutes || 90,
        price_per_turn: formData.price_per_turn || 0,
        monday_open: formData.monday_open !== false,
        tuesday_open: formData.tuesday_open !== false,
        wednesday_open: formData.wednesday_open !== false,
        thursday_open: formData.thursday_open !== false,
        friday_open: formData.friday_open !== false,
        saturday_open: formData.saturday_open !== false,
        sunday_open: formData.sunday_open !== false,
        courts_count: formData.courts_count || 1,
        admin_user_id: formData.admin_user_id,
      };
      createMutation.mutate(createData);
    }
  };

  React.useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || '',
        address: club.address || '',
        phone: club.phone || '',
        email: club.email || '',
      });
      setIsActive(club.is_active !== false);
      setActiveStep(0); // Solo un paso para edición
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        opening_time: '08:00:00',
        closing_time: '22:00:00',
        turn_duration_minutes: 90,
        price_per_turn: 0,
        monday_open: true,
        tuesday_open: true,
        wednesday_open: true,
        thursday_open: true,
        friday_open: true,
        saturday_open: true,
        sunday_open: true,
        courts_count: 1,
      });
      setIsActive(true);
      setActiveStep(0); // Resetear al primer paso
    }
  }, [club, open]);

  const steps = club 
    ? ['Información Básica'] 
    : ['Información Básica', 'Horarios', 'Precio y Canchas'];

  const handleNext = () => {
    // Validar paso actual antes de avanzar
    if (activeStep === 0) {
      if (!formData.name || !formData.address) {
        toast.error('Nombre y dirección son obligatorios');
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {club ? 'Editar Club' : 'Nuevo Club'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Paso 1: Información Básica */}
            <Step>
              <StepLabel>Información Básica</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label="Nombre *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Dirección *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
          />
          <TextField
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            type="email"
            helperText="Email de contacto del club"
          />
          {!club && availableAdmins.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Administrador (Opcional)</InputLabel>
              <Select
                value={formData.admin_user_id || ''}
                label="Administrador (Opcional)"
                onChange={(e) => setFormData({ ...formData, admin_user_id: e.target.value ? Number(e.target.value) : undefined })}
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {availableAdmins.map((admin: any) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin.name} {admin.email ? `(${admin.email})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {club && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                        />
                      }
                      label="Club Activo"
                    />
                  )}
                </Box>
                {!club && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Siguiente
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>

            {/* Paso 2: Horarios (solo para creación) */}
            {!club && (
              <Step>
                <StepLabel>Horarios</StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                    <TextField
                      label="Hora de Apertura"
                value={formData.opening_time?.substring(0, 5) || '08:00'}
                onChange={(e) => {
                  const timeValue = e.target.value;
                  // Convertir HH:MM a HH:MM:SS
                  const timeWithSeconds = timeValue ? `${timeValue}:00` : '08:00:00';
                  setFormData({ ...formData, opening_time: timeWithSeconds });
                }}
                fullWidth
                type="time"
                InputLabelProps={{ shrink: true }}
                helperText="Formato: HH:MM (ej: 08:00)"
              />
              <TextField
                label="Hora de Cierre"
                value={formData.closing_time?.substring(0, 5) || '22:00'}
                onChange={(e) => {
                  const timeValue = e.target.value;
                  // Convertir HH:MM a HH:MM:SS
                  const timeWithSeconds = timeValue ? `${timeValue}:00` : '22:00:00';
                  setFormData({ ...formData, closing_time: timeWithSeconds });
                }}
                fullWidth
                type="time"
                InputLabelProps={{ shrink: true }}
                helperText="Formato: HH:MM (ej: 22:00)"
              />
              <TextField
                label="Duración del Turno (minutos)"
                value={formData.turn_duration_minutes}
                onChange={(e) => setFormData({ ...formData, turn_duration_minutes: parseInt(e.target.value) || 90 })}
                fullWidth
                type="number"
                      defaultValue={90}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Atrás
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Siguiente
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            )}

            {/* Paso 3: Precio y Canchas (solo para creación) */}
            {!club && (
              <Step>
                <StepLabel>Precio y Canchas</StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                    <TextField
                      label="Precio por Turno (pesos)"
                value={formData.price_per_turn ? (formData.price_per_turn / 100).toString() : '0'}
                onChange={(e) => {
                  const pesos = parseFloat(e.target.value) || 0;
                  // Convertir pesos a centavos para el backend
                  const centavos = Math.round(pesos * 100);
                  setFormData({ ...formData, price_per_turn: centavos });
                }}
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 100 }}
                helperText="Ingrese el precio en pesos (ej: 30000 para $30.000)"
              />
              <TextField
                label="Cantidad de Canchas"
                value={formData.courts_count || 1}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 1;
                  setFormData({ ...formData, courts_count: Math.max(1, Math.min(20, count)) });
                }}
                fullWidth
                type="number"
                inputProps={{ min: 1, max: 20 }}
                      helperText="Número de canchas a crear automáticamente (1-20)"
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Atrás
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            )}
          </Stepper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {club ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            sx={{ backgroundColor: colors.primary }}
          >
            {createMutation.isLoading || updateMutation.isLoading ? 'Guardando...' : 'Actualizar'}
          </Button>
        ) : (
          <Button 
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} 
            variant="contained"
            disabled={createMutation.isLoading}
            sx={{ backgroundColor: colors.primary }}
          >
            {createMutation.isLoading ? 'Guardando...' : activeStep === steps.length - 1 ? 'Crear' : 'Siguiente'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export const Clubs: React.FC = () => {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const queryClient = useQueryClient();

  const { data: clubs = [], isLoading, error, refetch } = useQuery(
    'clubs',
    () => clubService.getClubs({ limit: 100 }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const deleteMutation = useMutation(
    (id: number) => clubService.deleteClub(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clubs');
        toast.success('Club eliminado exitosamente');
        setDeleteConfirmOpen(false);
        setClubToDelete(null);
        setSelectedClub(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al eliminar el club');
      },
    }
  );

  const handleRefresh = () => {
    refetch();
    toast.success('Clubs actualizados');
  };

  const handleCreateClub = () => {
    setEditingClub(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClub = () => {
    setEditingClub(selectedClub);
    setSelectedClub(null);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClub = () => {
    if (selectedClub) {
      setClubToDelete(selectedClub);
      setDeleteConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (clubToDelete) {
      deleteMutation.mutate(clubToDelete.id);
    }
  };

  const handleFormSuccess = () => {
    refetch();
  };

  // Filtrar clubs
  const filteredClubs = clubs.filter((club) => {
    // Búsqueda por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        club.name.toLowerCase().includes(searchLower) ||
        (club.address && club.address.toLowerCase().includes(searchLower)) ||
        (club.phone && club.phone.toLowerCase().includes(searchLower)) ||
        (club.email && club.email.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Filtro por estado activo
    if (filterActive === 'active' && club.is_active === false) return false;
    if (filterActive === 'inactive' && club.is_active !== false) return false;

    return true;
  });

  // Calcular clubs paginados
  const paginatedClubs = filteredClubs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterActive('all');
    setPage(0);
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
          Error al cargar los clubs. Por favor, intenta nuevamente.
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={handleRefresh}>
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
            Clubs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filteredClubs.length} de {clubs.length} clubs
            {(filterActive !== 'all' || searchTerm) && (
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
        <Box>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            variant="outlined"
            sx={{ mr: 1, borderColor: colors.primary, color: colors.primary }}
            disabled={filteredClubs.length === 0}
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
                const exportData = mapClubsForExport(filteredClubs);
                exportToCSV(exportData, { filename: `clubs_${new Date().toISOString().split('T')[0]}` });
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
                const exportData = mapClubsForExport(filteredClubs);
                exportToExcel(exportData, { filename: `clubs_${new Date().toISOString().split('T')[0]}` });
                toast.success('Datos exportados a Excel exitosamente');
                setExportMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exportar a Excel</ListItemText>
            </MenuItem>
          </Menu>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClub}
            sx={{ backgroundColor: colors.primary }}
          >
            Nuevo Club
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, dirección, teléfono o email..."
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
            {(filterActive !== 'all' || searchTerm) && (
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
              </Grid>
            </Paper>
          </Collapse>
        </CardContent>
      </Card>

      {clubs.length === 0 ? (
        <Alert severity="info">
          No hay clubs registrados en el sistema.
        </Alert>
      ) : filteredClubs.length === 0 ? (
        <Alert severity="warning">
          No se encontraron clubs con los filtros aplicados.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedClubs.map((club) => (
              <Grid item xs={12} sm={6} md={4} key={club.id}>
                <ClubCard
                  club={club}
                  onClick={() => setSelectedClub(club)}
                />
              </Grid>
            ))}
          </Grid>
          {filteredClubs.length > rowsPerPage && (
            <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Items por página</InputLabel>
                <Select
                  value={rowsPerPage}
                  label="Items por página"
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                  <MenuItem value={48}>48</MenuItem>
                </Select>
              </FormControl>
              <Pagination
                count={Math.ceil(filteredClubs.length / rowsPerPage)}
                page={page + 1}
                onChange={handleChangePage}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
              <Typography variant="body2" color="text.secondary">
                Mostrando {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredClubs.length)} de {filteredClubs.length}
              </Typography>
            </MuiBox>
          )}
        </>
      )}

      <ClubModal
        club={selectedClub}
        onClose={() => setSelectedClub(null)}
        onEdit={handleEditClub}
        onDelete={handleDeleteClub}
      />

      <ClubFormDialog
        open={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setEditingClub(null);
        }}
        club={editingClub}
        onSuccess={handleFormSuccess}
      />

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el club "{clubToDelete?.name}"? 
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 