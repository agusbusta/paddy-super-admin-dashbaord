import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from 'react-query';
import { notificationService, BroadcastNotificationRequest, BroadcastHistoryItem } from '../services/notifications';
import { colors } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';

const USER_CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: '9na', label: '9na' },
  { value: '8va', label: '8va' },
  { value: '7ma', label: '7ma' },
  { value: '6ta', label: '6ta' },
  { value: '5ta', label: '5ta' },
  { value: '4ta', label: '4ta' },
  { value: '3ra', label: '3ra' },
  { value: '2da', label: '2da' },
  { value: '1ra', label: '1ra' },
];

export const Notifications: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string>('');
  const [onlyActiveUsers, setOnlyActiveUsers] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const { data: history = [], isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery(
    'broadcast-history',
    () => notificationService.getBroadcastHistory({ limit: 100 }),
    {
      enabled: activeTab === 1,
      refetchOnWindowFocus: false,
    }
  );

  const sendMutation = useMutation(
    (data: BroadcastNotificationRequest) => notificationService.sendBroadcast(data),
    {
      onSuccess: (response) => {
        toast.success(
          `Notificación enviada: ${response.sent_count} exitosas, ${response.failed_count} fallidas`
        );
        // Limpiar formulario
        setTitle('');
        setBody('');
        setCategory('');
        // Refrescar historial si está en esa pestaña
        if (activeTab === 1) {
          refetchHistory();
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Error al enviar la notificación');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      toast.error('Título y mensaje son obligatorios');
      return;
    }

    const notificationData: BroadcastNotificationRequest = {
      title: title.trim(),
      body: body.trim(),
      only_active_users: onlyActiveUsers,
    };

    if (category) {
      notificationData.category = category;
    }

    sendMutation.mutate(notificationData);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NotificationsIcon sx={{ fontSize: 32, color: colors.primary, mr: 2 }} />
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 'bold', color: colors.primary }}
        >
          Notificaciones Globales
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Envía notificaciones masivas a todos los usuarios o filtradas por categoría.
        Solo los usuarios con tokens FCM activos recibirán la notificación.
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab icon={<SendIcon />} label="Enviar Notificación" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="Historial" iconPosition="start" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Nueva Notificación
          </Typography>

          <TextField
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="Ej: Nuevo torneo disponible"
            helperText="Título corto y descriptivo de la notificación"
          />

          <TextField
            label="Mensaje *"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            margin="normal"
            placeholder="Ej: Te invitamos a participar en nuestro próximo torneo..."
            helperText="Mensaje completo de la notificación"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Filtros de Destinatarios
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría de Usuario</InputLabel>
            <Select
              value={category}
              label="Categoría de Usuario"
              onChange={(e) => setCategory(e.target.value)}
            >
              {USER_CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={onlyActiveUsers}
                onChange={(e) => setOnlyActiveUsers(e.target.checked)}
                color="primary"
              />
            }
            label="Solo usuarios activos"
            sx={{ mt: 2, mb: 2 }}
          />

          {sendMutation.data && (
            <Alert
              severity={sendMutation.data.success ? 'success' : 'warning'}
              sx={{ mt: 2, mb: 2 }}
            >
              {sendMutation.data.message}
              <br />
              <strong>Enviadas:</strong> {sendMutation.data.sent_count} |{' '}
              <strong>Fallidas:</strong> {sendMutation.data.failed_count}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setTitle('');
                setBody('');
                setCategory('');
              }}
              disabled={sendMutation.isLoading}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                sendMutation.isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              disabled={sendMutation.isLoading || !title.trim() || !body.trim()}
              sx={{ backgroundColor: colors.primary }}
            >
              {sendMutation.isLoading ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </Box>
        </form>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Historial de Notificaciones Masivas
            </Typography>

            {isLoadingHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : history.length === 0 ? (
              <Alert severity="info">
                No hay notificaciones masivas enviadas aún.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Título</strong></TableCell>
                      <TableCell><strong>Mensaje</strong></TableCell>
                      <TableCell><strong>Categoría</strong></TableCell>
                      <TableCell><strong>Destinatarios</strong></TableCell>
                      <TableCell><strong>Resultado</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((item: BroadcastHistoryItem) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          {new Date(item.created_at).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300 }}>
                            {item.message.length > 100
                              ? `${item.message.substring(0, 100)}...`
                              : item.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.data?.category ? (
                            <Chip label={item.data.category} size="small" />
                          ) : (
                            <Chip label="Todas" size="small" color="default" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.data?.users_with_tokens || 0} usuarios
                            {item.data?.target_users_count && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                de {item.data.target_users_count} totales
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Chip
                              label={`${item.data?.sent_count || 0} enviadas`}
                              size="small"
                              color="success"
                              sx={{ mr: 0.5 }}
                            />
                            {item.data?.failed_count && item.data.failed_count > 0 && (
                              <Chip
                                label={`${item.data.failed_count} fallidas`}
                                size="small"
                                color="error"
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {activeTab === 0 && sendMutation.data && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            backgroundColor: colors.secondary + '10',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Última Notificación Enviada
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Título:</strong> {title || sendMutation.data.message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Resultado:</strong> {sendMutation.data.message}
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};
