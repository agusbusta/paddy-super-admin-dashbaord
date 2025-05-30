import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { AdminForm } from '../components/forms/AdminForm';
import { adminService } from '../services/admin';
import { Admin, CreateAdminData, UpdateAdminData } from '../types/admin';
import { colors } from '../utils/constants';

export const AdminManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const queryClient = useQueryClient();

  const { data: admins = [], isLoading, error } = useQuery('admins', adminService.getAdmins);

  const createMutation = useMutation(adminService.createAdmin, {
    onSuccess: () => {
      queryClient.invalidateQueries('admins');
      toast.success('Administrador creado exitosamente');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al crear administrador');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: UpdateAdminData }) =>
      adminService.updateAdmin(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admins');
        toast.success('Administrador actualizado exitosamente');
        setOpen(false);
        setEditingAdmin(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al actualizar administrador');
      },
    }
  );

  const deleteMutation = useMutation(adminService.deleteAdmin, {
    onSuccess: () => {
      queryClient.invalidateQueries('admins');
      toast.success('Administrador eliminado exitosamente');
      setDeletingAdmin(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al eliminar administrador');
      setDeletingAdmin(null);
    },
  });

  const toggleStatusMutation = useMutation(adminService.toggleAdminStatus, {
    onSuccess: (admin) => {
      queryClient.invalidateQueries('admins');
      toast.success(`Administrador ${admin.is_active ? 'activado' : 'desactivado'} exitosamente`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al cambiar estado del administrador');
    },
  });

  const handleCreate = () => {
    setEditingAdmin(null);
    setOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setOpen(true);
  };

  const handleSubmit = (data: CreateAdminData | UpdateAdminData) => {
    if (editingAdmin) {
      updateMutation.mutate({ id: editingAdmin.id, data: data as UpdateAdminData });
    } else {
      createMutation.mutate(data as CreateAdminData);
    }
  };

  const handleDelete = (admin: Admin) => {
    setDeletingAdmin(admin);
  };

  const confirmDelete = () => {
    if (deletingAdmin) {
      deleteMutation.mutate(deletingAdmin.id);
    }
  };

  const handleToggleStatus = (admin: Admin) => {
    toggleStatusMutation.mutate(admin.id);
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar administradores. Por favor, intenta más tarde.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ fontWeight: 'bold', color: colors.primary }}
        >
          Gestión de Administradores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ 
            bgcolor: colors.primary,
            '&:hover': {
              bgcolor: `${colors.primary}dd`,
            },
            fontWeight: 'bold'
          }}
        >
          Nuevo Administrador
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      ) : admins.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No hay administradores registrados
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ 
              mt: 2,
              bgcolor: colors.primary,
              '&:hover': {
                bgcolor: `${colors.primary}dd`,
              }
            }}
          >
            Crear Primer Administrador
          </Button>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper} 
          elevation={0} 
          sx={{ 
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: `${colors.primary}10` }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Club</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha Creación</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phone || '-'}</TableCell>
                  <TableCell>{admin.club_name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.is_active ? 'Activo' : 'Inactivo'}
                      color={admin.is_active ? 'success' : 'error'}
                      size="small"
                      sx={{ 
                        bgcolor: admin.is_active ? `${colors.secondary}20` : `${colors.error}20`,
                        color: admin.is_active ? colors.secondary : colors.error,
                        fontWeight: 'medium'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => handleEdit(admin)}
                          size="small"
                          sx={{ color: colors.primary }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={admin.is_active ? 'Desactivar' : 'Activar'}>
                        <IconButton
                          onClick={() => handleToggleStatus(admin)}
                          size="small"
                          sx={{ color: admin.is_active ? colors.error : colors.secondary }}
                          disabled={toggleStatusMutation.isLoading}
                        >
                          {admin.is_active ? (
                            <CloseIcon fontSize="small" />
                          ) : (
                            <CheckIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => handleDelete(admin)}
                          size="small"
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogo para crear/editar administrador */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <AdminForm
            admin={editingAdmin || undefined}
            onSubmit={handleSubmit}
            isLoading={createMutation.isLoading || updateMutation.isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogo para confirmar eliminación */}
      <Dialog 
        open={!!deletingAdmin} 
        onClose={() => setDeletingAdmin(null)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al administrador{' '}
            <strong>{deletingAdmin?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeletingAdmin(null)}
            disabled={deleteMutation.isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deleteMutation.isLoading}
            variant="contained"
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 