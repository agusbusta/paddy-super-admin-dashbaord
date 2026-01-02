import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Place as PlaceIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  NewReleases as NewReleasesIcon,
  PersonAdd as PersonAddIcon,
  SportsTennis as SportsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { statisticsService } from '../services/statistics';
import { adminService } from '../services/admin';
import { colors } from '../utils/constants';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
  subtitle?: string;
}

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery('dashboard-statistics', statisticsService.getDashboardStatistics);
  const { data: usersByMonth = [], isLoading: isLoadingUsersByMonth } = useQuery(
    'users-by-month',
    () => statisticsService.getUsersByMonth(12)
  );
  const { data: superAdmins = [], isLoading: isLoadingSuperAdmins } = useQuery(
    'super-admins',
    adminService.getSuperAdmins
  );

  const [chartFilter, setChartFilter] = React.useState<'todos' | 'jugadores' | 'administradores'>('todos');

  // Calcular alertas
  const alerts: Array<{ type: 'warning' | 'info' | 'error'; message: string }> = [];
  
  if (stats) {
    // Alertas de usuarios inactivos
    if (stats.users.inactive > stats.users.active * 0.3) {
      alerts.push({
        type: 'warning',
        message: `Alto porcentaje de usuarios inactivos: ${stats.users.inactive} de ${stats.users.total}`,
      });
    }

    // Alertas de clubs inactivos
    if (stats.clubs.inactive > 0) {
      alerts.push({
        type: 'info',
        message: `${stats.clubs.inactive} club(s) inactivo(s)`,
      });
    }

    // Alertas de perfiles incompletos
    const incompleteProfiles = stats.users.total - stats.users.withCompleteProfile;
    if (incompleteProfiles > stats.users.total * 0.5) {
      alerts.push({
        type: 'warning',
        message: `Muchos perfiles incompletos: ${incompleteProfiles} de ${stats.users.total}`,
      });
    }
  }

  const statsCards: StatCard[] = stats
    ? [
        {
          title: 'Total Usuarios',
          value: stats.users.total,
          icon: <PersonIcon />,
      color: colors.primary,
      bgColor: `${colors.primary}15`,
    },
    {
          title: 'Usuarios Activos',
          value: stats.users.active,
      icon: <CheckIcon />,
      color: colors.secondary,
      bgColor: `${colors.secondary}15`,
          subtitle: `${stats.users.inactive} inactivos`,
    },
    {
          title: 'Total Clubs',
          value: stats.clubs.total,
      icon: <PlaceIcon />,
      color: colors.accent,
      bgColor: `${colors.accent}15`,
          subtitle: `${stats.clubs.active} activos`,
        },
        {
          title: 'Administradores',
          value: stats.admins.total,
          icon: <PeopleIcon />,
          color: colors.warning,
          bgColor: `${colors.warning}15`,
          subtitle: `${stats.admins.active} activos`,
        },
        {
          title: 'Nuevos (7 días)',
          value: stats.users.newLast7Days,
          icon: <PersonAddIcon />,
          color: colors.secondary,
          bgColor: `${colors.secondary}15`,
          subtitle: `${stats.users.newLast30Days} en 30 días`,
        },
        {
          title: 'Perfiles Completos',
          value: stats.users.withCompleteProfile,
          icon: <TrendingUpIcon />,
          color: colors.accent,
          bgColor: `${colors.accent}15`,
          subtitle: `${Math.round((stats.users.withCompleteProfile / stats.users.total) * 100)}% del total`,
        },
        ...(stats.matches
          ? [
              {
                title: 'Partidos Completados',
                value: stats.matches.completed,
                icon: <SportsIcon />,
                color: colors.success,
                bgColor: `${colors.success}15`,
                subtitle: `${stats.matches.completedToday} hoy, ${stats.matches.completedLast7Days} en 7 días`,
              },
            ]
          : []),
        ...(stats.notifications
          ? [
              {
                title: 'Notificaciones Enviadas',
                value: stats.notifications.totalBroadcasts,
                icon: <NotificationsIcon />,
                color: colors.primary,
                bgColor: `${colors.primary}15`,
                subtitle: `${stats.notifications.sentLast7Days} en 7 días, ${stats.notifications.totalSent} totales`,
              },
            ]
          : []),
      ]
    : [];

  // Formatear datos para gráficos
  const chartData = usersByMonth.map((item) => ({
    month: item.month.split('-')[1] + '/' + item.month.split('-')[0].slice(-2),
    jugadores: item.jugadores,
    administradores: item.administradores,
    total: item.total,
  }));

  const handleChartFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'todos' | 'jugadores' | 'administradores' | null,
  ) => {
    if (newFilter !== null) {
      setChartFilter(newFilter);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold', color: colors.primary, mb: 3 }}
      >
        Dashboard
      </Typography>

      {/* Alertas */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              severity={alert.type}
              icon={alert.type === 'warning' ? <WarningIcon /> : <NewReleasesIcon />}
              sx={{ mb: 1 }}
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  },
              }}
            >
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        width: 48,
                        height: 48,
                      borderRadius: '50%',
                      backgroundColor: stat.bgColor,
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                    <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {stat.title}
                    </Typography>
                      {stat.subtitle && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {stat.subtitle}
                        </Typography>
                      )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          ))
        )}
      </Grid>

      {/* Gráficos y Estadísticas Detalladas */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: colors.primary, mb: 2 }}>
          Estadísticas Detalladas
        </Typography>
        <Grid container spacing={3}>
          {/* Gráfico de Usuarios Nuevos */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color={colors.primary} fontWeight="bold">
                  Usuarios Nuevos por Mes
              </Typography>
                <ToggleButtonGroup
                  value={chartFilter}
                  exclusive
                  onChange={handleChartFilterChange}
                  size="small"
                  sx={{ height: 32 }}
                >
                  <ToggleButton value="todos" aria-label="todos">
                    Todos
                  </ToggleButton>
                  <ToggleButton value="jugadores" aria-label="jugadores">
                    Jugadores
                  </ToggleButton>
                  <ToggleButton value="administradores" aria-label="administradores">
                    Administradores
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {isLoadingUsersByMonth ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {(chartFilter === 'todos' || chartFilter === 'jugadores') && (
                      <Line
                        type="monotone"
                        dataKey="jugadores"
                        stroke={colors.primary}
                        strokeWidth={2}
                        name="Jugadores"
                      />
                    )}
                    {(chartFilter === 'todos' || chartFilter === 'administradores') && (
                      <Line
                        type="monotone"
                        dataKey="administradores"
                        stroke={colors.warning}
                        strokeWidth={2}
                        name="Administradores"
                      />
                    )}
                    {chartFilter === 'todos' && (
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={colors.secondary}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Total"
                        opacity={0.6}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Estadísticas de Usuarios */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
                Usuarios
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : stats ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        backgroundColor: colors.secondary, 
                          mr: 1,
                      }} 
                    />
                      <Typography variant="body2">Activos:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.users.active} / {stats.users.total}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        backgroundColor: colors.error, 
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">Inactivos:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.users.inactive}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: colors.accent,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">Perfiles Completos:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.users.withCompleteProfile} / {stats.users.total}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonAddIcon sx={{ color: colors.secondary, fontSize: 20, mr: 1 }} />
                      <Typography variant="body2">Nuevos (7 días):</Typography>
                    </Box>
                    <Chip
                      label={stats.users.newLast7Days}
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>
              ) : null}
            </Paper>
          </Grid>

          {/* Estadísticas de Clubs y Administradores */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
                Clubs y Administradores
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : stats ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PlaceIcon sx={{ color: colors.accent, fontSize: 20, mr: 1 }} />
                      <Typography variant="body2">Clubs Activos:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.clubs.active} / {stats.clubs.total}
                    </Typography>
                  </Box>
                  {stats.clubs.inactive > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PlaceIcon sx={{ color: colors.error, fontSize: 20, mr: 1 }} />
                        <Typography variant="body2">Clubs Inactivos:</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.clubs.inactive}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ color: colors.warning, fontSize: 20, mr: 1 }} />
                      <Typography variant="body2">Admins Activos:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.admins.active} / {stats.admins.total}
                    </Typography>
                  </Box>
                  {stats.admins.inactive > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon sx={{ color: colors.error, fontSize: 20, mr: 1 }} />
                        <Typography variant="body2">Admins Inactivos:</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.admins.inactive}
                      </Typography>
                    </Box>
                  )}
                  {stats.clubs.total > 0 && stats.users.total > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ color: colors.primary, fontSize: 20, mr: 1 }} />
                        <Typography variant="body2">Promedio Usuarios/Club:</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round(stats.users.total / stats.clubs.total)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : null}
            </Paper>
          </Grid>

          {/* Resumen de Actividad */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
                Resumen de Actividad
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : stats ? (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Crecimiento de Usuarios
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`+${stats.users.newLast7Days} últimos 7 días`}
                        size="small"
                        color="secondary"
                        icon={<TrendingUpIcon />}
                      />
                      <Chip
                        label={`+${stats.users.newLast30Days} últimos 30 días`}
                        size="small"
                        color="primary"
                        icon={<TrendingUpIcon />}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estado del Sistema
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${Math.round((stats.users.active / stats.users.total) * 100)}% usuarios activos`}
                        size="small"
                        color={stats.users.active / stats.users.total > 0.7 ? 'success' : 'warning'}
                      />
                      <Chip
                        label={`${Math.round((stats.users.withCompleteProfile / stats.users.total) * 100)}% perfiles completos`}
                        size="small"
                        color={stats.users.withCompleteProfile / stats.users.total > 0.5 ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                </Box>
              ) : null}
            </Paper>
          </Grid>
        </Grid>

        {/* Sección de Super Administradores */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon sx={{ color: colors.primary, fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold" sx={{ color: colors.primary }}>
                Super Administradores
              </Typography>
            </Box>
            {isLoadingSuperAdmins ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : superAdmins.length === 0 ? (
              <Alert severity="info">No hay super administradores registrados.</Alert>
            ) : (
              <Grid container spacing={2}>
                {superAdmins.map((superAdmin: any) => (
                  <Grid item xs={12} sm={6} md={4} key={superAdmin.id}>
                    <Card
                      sx={{
                        p: 2,
                        backgroundColor: superAdmin.is_active ? `${colors.primary}08` : `${colors.error}08`,
                        border: `1px solid ${superAdmin.is_active ? colors.primary : colors.error}30`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: superAdmin.is_active ? colors.primary : colors.error,
                            width: 48,
                            height: 48,
                          }}
                        >
                          {superAdmin.name?.charAt(0)?.toUpperCase() || 'A'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {superAdmin.name} {superAdmin.last_name || ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {superAdmin.email}
                          </Typography>
                          {superAdmin.phone && (
                            <Typography variant="body2" color="text.secondary">
                              {superAdmin.phone}
                            </Typography>
                          )}
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={superAdmin.is_active ? 'Activo' : 'Inactivo'}
                              size="small"
                              sx={{
                                backgroundColor: superAdmin.is_active ? `${colors.success}20` : `${colors.error}20`,
                                color: superAdmin.is_active ? colors.success : colors.error,
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label="Super Admin"
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: `${colors.primary}20`,
                                color: colors.primary,
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Box>
    </Container>
  );
}; 
