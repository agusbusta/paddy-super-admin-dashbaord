import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControlLabel, 
  Switch, 
  Grid, 
  Typography, 
  Paper 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Admin, CreateAdminData, UpdateAdminData } from '../../types/admin';
import { colors } from '../../utils/constants';

interface AdminFormProps {
  admin?: Admin;
  onSubmit: (data: CreateAdminData | UpdateAdminData) => void;
  isLoading: boolean;
}

// Componente para el formulario de creación
const CreateAdminFormContent: React.FC<{
  onSubmit: (data: CreateAdminData) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  // Esquema para la creación de administrador
  const createSchema = yup.object().shape({
    name: yup.string().required('El nombre es requerido'),
    email: yup.string().email('Formato de email inválido').required('El email es requerido'),
    password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
    phone: yup.string().nullable(),
    club_id: yup.number().nullable()
  });

  const { control, handleSubmit, formState: { errors } } = useForm<CreateAdminData>({
    resolver: yupResolver(createSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      club_id: null,
    },
  });

  return (
    <Paper sx={{ p: 3, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
        Crear Nuevo Administrador
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Contraseña"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Teléfono"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ 
              backgroundColor: colors.primary,
              '&:hover': {
                backgroundColor: `${colors.primary}dd`,
              },
              color: colors.white,
              fontWeight: 'bold',
              px: 3
            }}
          >
            {isLoading ? 'Procesando...' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// Componente para el formulario de edición
const UpdateAdminFormContent: React.FC<{
  admin: Admin;
  onSubmit: (data: UpdateAdminData) => void;
  isLoading: boolean;
}> = ({ admin, onSubmit, isLoading }) => {
  // Esquema para actualización de administrador
  const updateSchema = yup.object().shape({
    name: yup.string().required('El nombre es requerido'),
    email: yup.string().email('Formato de email inválido').required('El email es requerido'),
    phone: yup.string().nullable(),
    club_id: yup.number().nullable(),
    is_active: yup.boolean().required()
  });

  const { control, handleSubmit, formState: { errors } } = useForm<UpdateAdminData>({
    resolver: yupResolver(updateSchema),
    defaultValues: {
      name: admin.name,
      email: admin.email,
      phone: admin.phone || '',
      club_id: admin.club_id || null,
      is_active: admin.is_active,
    },
  });

  return (
    <Paper sx={{ p: 3, boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h6" gutterBottom color={colors.primary} fontWeight="bold">
        Editar Administrador
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nombre"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Teléfono"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Administrador activo"
                />
              )}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ 
              backgroundColor: colors.primary,
              '&:hover': {
                backgroundColor: `${colors.primary}dd`,
              },
              color: colors.white,
              fontWeight: 'bold',
              px: 3
            }}
          >
            {isLoading ? 'Procesando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// Componente principal que elige cual mostrar
export const AdminForm: React.FC<AdminFormProps> = ({ admin, onSubmit, isLoading }) => {
  if (admin) {
    return (
      <UpdateAdminFormContent 
        admin={admin} 
        onSubmit={(data) => onSubmit(data)} 
        isLoading={isLoading} 
      />
    );
  }
  
  return (
    <CreateAdminFormContent 
      onSubmit={(data) => onSubmit(data)} 
      isLoading={isLoading}
    />
  );
}; 