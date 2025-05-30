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
} from '@mui/material';
import {
  People as PeopleIcon,
  Place as PlaceIcon,
  SportsHandball as SportsIcon,
  EventNote as EventIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { adminService } from '../services/admin';
import { colors } from '../utils/constants';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

export const Dashboard: React.FC = () => {
  const { data: admins = [], isLoading } = useQuery('admins', adminService.getAdmins);

  const stats: StatCard[] = [
    {
      title: 'Total Administradores',
      value: admins.length,
      icon: <PeopleIcon />,
      color: colors.primary,
      bgColor: `${colors.primary}15`,
    },
    {
      title: 'Administradores Activos',
      value: admins.filter(admin => admin.is_active).length,
      icon: <CheckIcon />,
      color: colors.secondary,
      bgColor: `${colors.secondary}15`,
    },
    {
      title: 'Clubes Gestionados',
      value: new Set(admins.map(admin => admin.club_id).filter(Boolean)).size,
      icon: <PlaceIcon />,
      color: colors.accent,
      bgColor: `${colors.accent}15`,
    },
    {
      title: 'Administradores Inactivos',
      value: admins.filter(admin => !admin.is_active).length,
      icon: <CancelIcon />,
      color: colors.error,
      bgColor: `${colors.error}15`,
    },
  ];

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

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: stat.bgColor,
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: colors.primary, mb: 2 }}>
          Actividad Reciente
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
                Administradores Recientes
              </Typography>
              <Divider sx={{ mb: 2 }}/>
              {isLoading ? (
                <Typography variant="body2">Cargando...</Typography>
              ) : admins.length === 0 ? (
                <Typography variant="body2">No hay administradores registrados</Typography>
              ) : (
                <>
                  {admins.slice(-5).map((admin) => (
                    <Box 
                      key={admin.id} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        py: 1,
                        borderBottom: `1px solid ${colors.divider}`
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">{admin.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
                Estado de Administradores
              </Typography>
              <Divider sx={{ mb: 2 }}/>
              {isLoading ? (
                <Typography variant="body2">Cargando...</Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        backgroundColor: colors.secondary, 
                        mr: 1 
                      }} 
                    />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Activos:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {admins.filter(admin => admin.is_active).length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        backgroundColor: colors.error, 
                        mr: 1 
                      }} 
                    />
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Inactivos:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {admins.filter(admin => !admin.is_active).length}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 