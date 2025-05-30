import React from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../utils/constants';

const NavigationCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => {
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
        height: '100%',
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: `${colors.primary}10`,
              borderRadius: '50%',
              p: 2,
              mb: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export const Reservations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Reservas
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <NavigationCard
            title="Reservas por Club"
            description="Ver todas las reservas organizadas por club"
            icon={<BusinessIcon sx={{ fontSize: 40, color: colors.primary }} />}
            onClick={() => navigate('/reservations/by-club')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NavigationCard
            title="Reservas por Horario"
            description="Ver todas las reservas organizadas por horario"
            icon={<AccessTimeIcon sx={{ fontSize: 40, color: colors.primary }} />}
            onClick={() => navigate('/reservations/by-time')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}; 