import React, { useState } from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Collapse,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SportsHandball as SportsIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { pregameTurnService } from '../services/pregameTurns';
import { clubService } from '../services/clubs';
import { colors } from '../utils/constants';

// Tipo para los datos de reserva
interface Reservation {
  id: number;
  club_name?: string;
  court_name?: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  players_count?: number;
}

const ReservationCard: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
  const getStatusColor = (status: string) => {
    if (status === 'READY_TO_PLAY' || status === 'COMPLETED') return colors.success;
    if (status === 'CANCELLED') return colors.error;
    return colors.warning;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'READY_TO_PLAY') return 'Listo para jugar';
    if (status === 'COMPLETED') return 'Completo';
    if (status === 'CANCELLED') return 'Cancelado';
    if (status === 'PENDING') return 'Pendiente';
    return status;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon sx={{ color: colors.primary }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {reservation.club_name || 'Sin club'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsIcon sx={{ color: colors.primary }} />
              <Typography variant="body2" color="text.secondary">
                {reservation.court_name || 'Sin cancha'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip
                label={getStatusLabel(reservation.status)}
                size="small"
                sx={{
                  backgroundColor: `${getStatusColor(reservation.status)}20`,
                  color: getStatusColor(reservation.status),
                  fontWeight: 600,
                }}
              />
              {reservation.players_count !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  {reservation.players_count}/4 jugadores
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Agrupar reservas por horario
const groupReservationsByTime = (reservations: Reservation[]) => {
  const grouped = reservations.reduce((acc, reservation) => {
    const timeKey = reservation.end_time 
      ? `${reservation.start_time} - ${reservation.end_time}`
      : reservation.start_time;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(reservation);
    return acc;
  }, {} as Record<string, Reservation[]>);

  return Object.entries(grouped).sort(([timeA], [timeB]) => {
    // Ordenar por hora de inicio
    const timeAStart = timeA.split(' - ')[0];
    const timeBStart = timeB.split(' - ')[0];
    return timeAStart.localeCompare(timeBStart);
  });
};

export const ReservationsByTime: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const { data: reservations = [], isLoading, error } = useQuery(
    'all-reservations',
    () => pregameTurnService.getPregameTurns({ limit: 10000 }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: clubs = [] } = useQuery(
    'clubs',
    () => clubService.getClubs({ limit: 1000 }),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Filtrar reservas
  const filteredReservations = React.useMemo(() => {
    return reservations.filter((reservation) => {
      // Búsqueda por texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          (reservation.club_name && reservation.club_name.toLowerCase().includes(searchLower)) ||
          (reservation.court_name && reservation.court_name.toLowerCase().includes(searchLower)) ||
          (reservation.start_time && reservation.start_time.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filtro por club
      if (filterClub && reservation.club_name !== filterClub) return false;

      // Filtro por status
      if (filterStatus !== 'all' && reservation.status !== filterStatus) return false;

      // Filtro por fecha
      if (filterStartDate && reservation.date < filterStartDate) return false;
      if (filterEndDate && reservation.date > filterEndDate) return false;

      return true;
    });
  }, [reservations, searchTerm, filterClub, filterStatus, filterStartDate, filterEndDate]);

  const groupedReservations = React.useMemo(() => {
    return groupReservationsByTime(filteredReservations);
  }, [filteredReservations]);

  // Paginación
  const totalTimeSlots = groupedReservations.length;
  const paginatedTimeSlots = groupedReservations.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const clearFilters = () => {
    setSearchTerm('');
    setFilterClub('');
    setFilterStatus('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(0);
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/reservations')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Reservas por Horario
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {filteredReservations.length} reservas encontradas
        </Typography>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Buscar por club, cancha o horario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          {(filterClub || filterStatus !== 'all' || filterStartDate || filterEndDate || searchTerm) && (
            <Button variant="outlined" onClick={clearFilters} startIcon={<ClearIcon />}>
              Limpiar
            </Button>
          )}
        </Box>

        <Collapse in={showFilters}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Club</InputLabel>
                <Select
                  value={filterClub}
                  label="Club"
                  onChange={(e) => {
                    setFilterClub(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {clubs.map((club) => (
                    <MenuItem key={club.id} value={club.name}>
                      {club.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  label="Estado"
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="PENDING">Pendiente</MenuItem>
                  <MenuItem value="READY_TO_PLAY">Listo para jugar</MenuItem>
                  <MenuItem value="COMPLETED">Completo</MenuItem>
                  <MenuItem value="CANCELLED">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha desde"
                value={filterStartDate}
                onChange={(e) => {
                  setFilterStartDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Fecha hasta"
                value={filterEndDate}
                onChange={(e) => {
                  setFilterEndDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error al cargar las reservas</Alert>
      ) : paginatedTimeSlots.length === 0 ? (
        <Alert severity="info">No hay reservas con los filtros aplicados</Alert>
      ) : (
        <>
          {paginatedTimeSlots.map(([time, timeReservations]) => (
            <Box key={time} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTimeIcon sx={{ color: colors.primary }} />
                <Typography variant="h6" fontWeight="bold">
                  {time} ({timeReservations.length} reservas)
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {timeReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </Box>
          ))}
          {totalTimeSlots > rowsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
              <Pagination
                count={Math.ceil(totalTimeSlots / rowsPerPage)}
                page={page + 1}
                onChange={handleChangePage}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}; 