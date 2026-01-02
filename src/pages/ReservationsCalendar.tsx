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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { pregameTurnService } from '../services/pregameTurns';
import { clubService } from '../services/clubs';
import { colors } from '../utils/constants';

export const ReservationsCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterClub, setFilterClub] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Obtener el primer día del mes y el último día
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const { data: clubs = [] } = useQuery(
    'clubs',
    () => clubService.getClubs({ limit: 1000 }),
    {
      refetchOnWindowFocus: false,
    }
  );

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

  // Filtrar reservas
  const filteredReservations = React.useMemo(() => {
    return reservations.filter((reservation: any) => {
      // Filtro por club
      if (filterClub && reservation.club_name !== filterClub) return false;

      // Filtro por status
      if (filterStatus !== 'all' && reservation.status !== filterStatus) return false;

      return true;
    });
  }, [reservations, filterClub, filterStatus]);

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
    return filteredReservations.filter((r: any) => {
      if (!r.date) return false;
      const resDate = new Date(r.date).toISOString().split('T')[0];
      return resDate === dateStr;
    });
  };

  const clearFilters = () => {
    setFilterClub('');
    setFilterStatus('all');
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Calendario de Reservas
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filtros
            </Button>
            {(filterClub || filterStatus !== 'all') && (
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                Limpiar
              </Button>
            )}
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

        {/* Panel de filtros */}
        <Collapse in={showFilters}>
          <Paper sx={{ p: 2, mb: 3, backgroundColor: colors.background }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Club</InputLabel>
                  <Select
                    value={filterClub}
                    label="Club"
                    onChange={(e) => setFilterClub(e.target.value)}
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
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Estado"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="PENDING">Pendiente</MenuItem>
                    <MenuItem value="READY_TO_PLAY">Listo para jugar</MenuItem>
                    <MenuItem value="COMPLETED">Completo</MenuItem>
                    <MenuItem value="CANCELLED">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

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
                    {selectedDateReservations.map((res: any) => (
                      <Grid item xs={12} sm={6} md={4} key={res.id}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {res.club_name || 'Sin club'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {res.court_name || 'Sin cancha'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {res.start_time} {res.end_time ? `- ${res.end_time}` : ''}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                              <Chip
                                label={res.status === 'READY_TO_PLAY' ? 'Listo' : res.status === 'PENDING' ? 'Pendiente' : res.status === 'CANCELLED' ? 'Cancelado' : res.status}
                                size="small"
                                color={
                                  res.status === 'READY_TO_PLAY'
                                    ? 'success'
                                    : res.status === 'PENDING'
                                    ? 'warning'
                                    : res.status === 'CANCELLED'
                                    ? 'error'
                                    : 'default'
                                }
                              />
                              {res.players_count !== undefined && (
                                <Typography variant="caption" color="text.secondary">
                                  {res.players_count}/4
                                </Typography>
                              )}
                            </Box>
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
