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
  Divider,
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

  const { data: reservations = [], isLoading, error } = useQuery(
    'all-reservations',
    () => pregameTurnService.getPregameTurns({ limit: 1000 }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const groupedReservations = React.useMemo(() => {
    return groupReservationsByTime(reservations);
  }, [reservations]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/reservations')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Reservas por Horario
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Error al cargar las reservas</Alert>
      ) : groupedReservations.length === 0 ? (
        <Alert severity="info">No hay reservas registradas</Alert>
      ) : (
        groupedReservations.map(([time, timeReservations]) => (
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
        ))
      )}
    </Container>
  );
}; 