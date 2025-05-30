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
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  SportsHandball as SportsIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { colors } from '../utils/constants';

// Tipo para los datos del club
interface Club {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
  fields: number;
  address: string;
  phone: string;
  email: string;
  schedule: {
    open: string;
    close: string;
  };
  status: 'online' | 'offline' | 'maintenance';
}

// Datos de ejemplo (después se reemplazarán con datos reales de la API)
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Club Paddio Central',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    fields: 4,
    address: 'Av. Rivadavia 1234, CABA',
    phone: '+54 11 1234-5678',
    email: 'info@clubpaddio.com',
    schedule: {
      open: '08:00',
      close: '22:00',
    },
    status: 'online',
  },
  {
    id: '2',
    name: 'Club Paddio Norte',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    fields: 3,
    address: 'Av. del Libertador 5678, CABA',
    phone: '+54 11 8765-4321',
    email: 'norte@clubpaddio.com',
    schedule: {
      open: '09:00',
      close: '23:00',
    },
    status: 'maintenance',
  },
  // Agregar más clubs según sea necesario
];

const ClubCard: React.FC<{ club: Club; onClick: () => void }> = ({ club, onClick }) => {
  const getStatusColor = (status: Club['status']) => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'offline':
        return colors.error;
      case 'maintenance':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
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
              backgroundColor: getStatusColor(club.status),
              boxShadow: `0 0 8px ${getStatusColor(club.status)}`,
            }}
          />
          <Chip
            label={club.status === 'online' ? 'Activo' : club.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
            size="small"
            sx={{
              backgroundColor: `${getStatusColor(club.status)}20`,
              color: getStatusColor(club.status),
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {club.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SportsIcon sx={{ color: colors.primary }} />
          <Typography variant="body2" color="text.secondary">
            {club.fields} canchas
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ color: colors.primary }} />
          <Typography variant="body2" color="text.secondary">
            {club.schedule.open} - {club.schedule.close}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const ClubModal: React.FC<{ club: Club | null; onClose: () => void }> = ({ club, onClose }) => {
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
            sx={{ width: 120, height: 120 }}
          />
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {club.name}
            </Typography>
            <Chip
              label={club.status === 'online' ? 'Activo' : club.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
              sx={{
                backgroundColor: `${club.status === 'online' ? colors.success : club.status === 'maintenance' ? colors.warning : colors.error}20`,
                color: club.status === 'online' ? colors.success : club.status === 'maintenance' ? colors.warning : colors.error,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <SportsIcon sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Canchas"
              secondary={`${club.fields} canchas disponibles`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationIcon sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Dirección"
              secondary={club.address}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Teléfono"
              secondary={club.phone}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <EmailIcon sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Email"
              secondary={club.email}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTimeIcon sx={{ color: colors.primary }} />
            </ListItemIcon>
            <ListItemText
              primary="Horario"
              secondary={`${club.schedule.open} - ${club.schedule.close}`}
            />
          </ListItem>
        </List>
      </Box>
    </Modal>
  );
};

export const Clubs: React.FC = () => {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Clubs
      </Typography>
      
      <Grid container spacing={3}>
        {mockClubs.map((club) => (
          <Grid item xs={12} sm={6} md={4} key={club.id}>
            <ClubCard
              club={club}
              onClick={() => setSelectedClub(club)}
            />
          </Grid>
        ))}
      </Grid>

      <ClubModal
        club={selectedClub}
        onClose={() => setSelectedClub(null)}
      />
    </Container>
  );
}; 