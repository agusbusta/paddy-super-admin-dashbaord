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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SportsHandball as SportsIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../utils/constants';

// Tipo para los datos de reserva
interface Reservation {
  id: string;
  clubName: string;
  fieldNumber: number;
  time: string;
  status: 'complete' | 'incomplete';
  date: string;
}

// Datos de ejemplo (después se reemplazarán con datos reales de la API)
const mockReservations: Reservation[] = [
  {
    id: '1',
    clubName: 'Club Paddio Central',
    fieldNumber: 1,
    time: '10:00 - 11:00',
    status: 'complete',
    date: '2024-03-20',
  },
  {
    id: '2',
    clubName: 'Club Paddio Central',
    fieldNumber: 2,
    time: '10:00 - 11:00',
    status: 'incomplete',
    date: '2024-03-20',
  },
  {
    id: '3',
    clubName: 'Club Paddio Norte',
    fieldNumber: 1,
    time: '11:00 - 12:00',
    status: 'complete',
    date: '2024-03-20',
  },
];

// Agrupar reservas por horario
const groupReservationsByTime = (reservations: Reservation[]) => {
  const grouped = reservations.reduce((acc, reservation) => {
    if (!acc[reservation.time]) {
      acc[reservation.time] = [];
    }
    acc[reservation.time].push(reservation);
    return acc;
  }, {} as Record<string, Reservation[]>);

  return Object.entries(grouped).sort(([timeA], [timeB]) => timeA.localeCompare(timeB));
};

const ReservationCard: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
  const getStatusColor = (status: Reservation['status']) => {
    return status === 'complete' ? colors.success : colors.warning;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BusinessIcon sx={{ color: colors.primary }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {reservation.clubName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsIcon sx={{ color: colors.primary }} />
              <Typography variant="body2" color="text.secondary">
                Cancha {reservation.fieldNumber}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Chip
              label={reservation.status === 'complete' ? 'Completo' : 'A completar'}
              size="small"
              sx={{
                backgroundColor: `${getStatusColor(reservation.status)}20`,
                color: getStatusColor(reservation.status),
                fontWeight: 600,
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const ReservationsByTime: React.FC = () => {
  const navigate = useNavigate();

  const groupedReservations = groupReservationsByTime(mockReservations);

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

      {groupedReservations.map(([time, reservations]) => (
        <Box key={time} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccessTimeIcon sx={{ color: colors.primary }} />
            <Typography variant="h6" fontWeight="bold">
              {time}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </Box>
      ))}
    </Container>
  );
}; 