import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { pregameTurnService } from '../services/pregameTurns';
import { colors } from '../utils/constants';

export const ReservationsCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obtener el primer día del mes y el último día
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Obtener reservas para el mes actual
  const { data: reservations = [], isLoading } = useQuery(
    ['reservations-calendar', year, month],
    async () => {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return await pregameTurnService.getPregameTurns({ 
        start_date: startDate,
        end_date: endDate,
        limit: 10000 
      });
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getReservationsForDate = (date: Date): any[] => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter((r: any) => {
      const resDate = r.date ? new Date(r.date).toISOString().split('T')[0] : null;
      return resDate === dateStr;
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Días del mes anterior (para completar la primera semana)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(
        <Grid item xs key={`prev-${i}`}>
          <Box
            sx={{
              minHeight: 100,
              p: 1,
              border: '1px solid',
              borderColor: colors.background,
              backgroundColor: colors.background,
              opacity: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {date.getDate()}
            </Typography>
          </Box>
        </Grid>
      );
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayReservations = getReservationsForDate(date);
      const today = isToday(date);
      const selected = isSelected(date);

      days.push(
        <Grid item xs key={day}>
          <Box
            onClick={() => setSelectedDate(date)}
            sx={{
              minHeight: 100,
              p: 1,
              border: '1px solid',
              borderColor: selected ? colors.primary : colors.background,
              backgroundColor: selected ? `${colors.primary}10` : 'transparent',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: `${colors.primary}05`,
              },
              ...(today && {
                borderColor: colors.accent,
                borderWidth: 2,
              }),
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography
                variant="body2"
                fontWeight={today ? 'bold' : 'normal'}
                color={today ? colors.accent : 'text.primary'}
              >
                {day}
              </Typography>
              {dayReservations.length > 0 && (
                <Chip
                  label={dayReservations.length}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: colors.primary,
                    color: 'white',
                  }}
                />
              )}
            </Box>
            {dayReservations.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                {dayReservations.slice(0, 2).map((res: any, idx: number) => (
                  <Typography
                    key={idx}
                    variant="caption"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: colors.textSecondary,
                    }}
                  >
                    {res.start_time || 'Reserva'}
                  </Typography>
                ))}
                {dayReservations.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayReservations.length - 2} más
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      );
    }

    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(
        <Grid item xs key={`next-${day}`}>
          <Box
            sx={{
              minHeight: 100,
              p: 1,
              border: '1px solid',
              borderColor: colors.background,
              backgroundColor: colors.background,
              opacity: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {date.getDate()}
            </Typography>
          </Box>
        </Grid>
      );
    }

    return days;
  };

  const selectedDateReservations = selectedDate ? getReservationsForDate(selectedDate) : [];

  return (
    <Container maxWidth="xl">
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Calendario de Reservas
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              startIcon={<TodayIcon />}
              onClick={goToToday}
              variant="outlined"
              size="small"
            >
              Hoy
            </Button>
            <IconButton onClick={goToPreviousMonth} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {monthNames[month]} {year}
            </Typography>
            <IconButton onClick={goToNextMonth} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={0.5} sx={{ mb: 3 }}>
              {dayNames.map((day) => (
                <Grid item xs key={day}>
                  <Box
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      backgroundColor: colors.primary,
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    <Typography variant="caption">{day}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={0.5}>
              {renderCalendarDays()}
            </Grid>

            {selectedDate && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Reservas del {selectedDate.toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
                {selectedDateReservations.length === 0 ? (
                  <Alert severity="info">No hay reservas para esta fecha.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {selectedDateReservations.map((res: any, idx: number) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {res.club_name || 'Club'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {res.start_time} - {res.end_time}
                            </Typography>
                            <Chip
                              label={res.status}
                              size="small"
                              sx={{ mt: 1 }}
                              color={
                                res.status === 'READY_TO_PLAY'
                                  ? 'success'
                                  : res.status === 'PENDING'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};
