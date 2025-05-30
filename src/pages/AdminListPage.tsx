import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { adminService } from '../services/admin';
import { Admin } from '../types/admin';
import { colors } from '../utils/constants';

// Componente interno AdminList
const AdminList: React.FC<{
  admins: Admin[];
  isLoading: boolean;
  onEdit: (admin: Admin) => void;
  onRefresh: () => void;
}> = ({ admins, isLoading, onEdit }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell><Typography variant="subtitle2">Nombre</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Email</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Club</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Estado</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Acciones</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress size={24} sx={{ my: 2 }} />
              </TableCell>
            </TableRow>
          ) : admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No hay administradores registrados
              </TableCell>
            </TableRow>
          ) : (
            admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.club_name || 'Sin club asignado'}</TableCell>
                <TableCell>
                  <Chip
                    icon={admin.is_active ? <ActiveIcon fontSize="small" /> : <InactiveIcon fontSize="small" />}
                    label={admin.is_active ? 'Activo' : 'Inactivo'}
                    color={admin.is_active ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(admin)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Componente interno AdminDialog
const AdminDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, onClose, onSuccess }) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se manejaría la lógica de crear un admin
    onSuccess();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Crear Administrador</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            required
            name="name"
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            required
            name="email"
            type="email"
          />
          <TextField
            label="Contraseña"
            fullWidth
            margin="normal"
            required
            name="password"
            type="password"
          />
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            name="phone"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{
              backgroundColor: colors.secondary,
              '&:hover': {
                backgroundColor: colors.secondary,
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const AdminListPage: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const { data: admins = [], isLoading, refetch } = useQuery('admins', adminService.getAdmins);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseDialog();
  };

  return (
    <Container maxWidth="lg">
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 'bold', color: colors.primary }}
        >
          Administradores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: colors.secondary,
            '&:hover': {
              backgroundColor: colors.secondary,
            },
          }}
        >
          Nuevo Administrador
        </Button>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2, 
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
            Gestionar Administradores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aquí puede ver, agregar, editar o desactivar administradores de clubes.
          </Typography>
        </Box>
        <Divider />
        <AdminList 
          admins={admins} 
          isLoading={isLoading}
          onEdit={(admin) => navigate(`/admin/${admin.id}`)}
          onRefresh={refetch}
        />
      </Paper>

      <AdminDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </Container>
  );
}; 