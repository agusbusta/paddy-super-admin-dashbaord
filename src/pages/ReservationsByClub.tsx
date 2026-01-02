import React from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SportsHandball as SportsIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { pregameTurnService } from '../services/pregameTurns';
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

  const timeRange = reservation.end_time 
    ? `${reservation.start_time} - ${reservation.end_time}`
    : reservation.start_time;

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTimeIcon sx={{ color: colors.primary }} />
              <Typography variant="body2" color="text.secondary">
                {timeRange}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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

export const ReservationsByClub: React.FC = () => {
  const navigate = useNavigate();

  const { data: reservations = [], isLoading, error } = useQuery(
    'all-reservations',
    () => pregameTurnService.getPregameTurns({ limit: 1000 }),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Agrupar reservas por club
  const reservationsByClub = React.useMemo(() => {
    const grouped: { [clubName: string]: Reservation[] } = {};
    reservations.forEach((reservation) => {
      const clubName = reservation.club_name || 'Sin club';
      if (!grouped[clubName]) {
        grouped[clubName] = [];
      }
      grouped[clubName].push(reservation);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [reservations]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/reservations')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Reservas por Club
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error al cargar las reservas</Alert>
      ) : reservationsByClub.length === 0 ? (
        <Alert severity="info">No hay reservas registradas</Alert>
      ) : (
        reservationsByClub.map(([clubName, clubReservations]) => (
          <Box key={clubName} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BusinessIcon sx={{ color: colors.primary }} />
              <Typography variant="h6" fontWeight="bold">
                {clubName} ({clubReservations.length} reservas)
              </Typography>
            </Box>
            {clubReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </Box>
        ))
      )}
    </Container>
  );
}; 