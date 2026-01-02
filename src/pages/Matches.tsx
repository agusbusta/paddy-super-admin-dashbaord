import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  ListItemIcon,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  SportsTennis as SportsIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Place as PlaceIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { matchService, Match } from '../services/matches';
import { clubService } from '../services/clubs';
import { colors } from '../utils/constants';
import { exportToCSV, exportToExcel, mapMatchesForExport } from '../utils/export';
import toast from 'react-hot-toast';

const MATCH_STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completado' },
];

export const Matches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterClub, setFilterClub] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterMixedMatch, setFilterMixedMatch] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const { data: matches = [], isLoading, error, refetch } = useQuery(
    ['matches', filterStatus, filterClub, filterStartDate, filterEndDate],
    () =>
      matchService.getMatches({
        limit: 1000,
        status: filterStatus || undefined,
        club_id: filterClub ? Number(filterClub) : undefined,
        start_date: filterStartDate || undefined,
        end_date: filterEndDate || undefined,
      })
  );

  const { data: clubs = [] } = useQuery('clubs', () => clubService.getClubs({ limit: 100 }));

  // Función para determinar si un match es mixto basándose en los géneros de los jugadores
  const isMixedMatch = (match: Match): boolean => {
    if (!match.players || match.players.length < 2) return false;
    const genders = match.players
      .map((p) => p.gender)
      .filter((g): g is string => !!g);
    const hasMale = genders.some((g) => g.toLowerCase() === 'masculino');
    const hasFemale = genders.some((g) => g.toLowerCase() === 'femenino');
    return hasMale && hasFemale;
  };

  const filteredMatches = matches.filter((match) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        match.club_name?.toLowerCase().includes(searchLower) ||
        match.court_name?.toLowerCase().includes(searchLower) ||
        match.creator_name?.toLowerCase().includes(searchLower) ||
        match.players.some((p) => p.name.toLowerCase().includes(searchLower)) ||
        match.score?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtro por tipo de partido (mixto/regular)
    if (filterMixedMatch === 'mixed') {
      if (!isMixedMatch(match)) return false;
    } else if (filterMixedMatch === 'regular') {
      if (isMixedMatch(match)) return false;
    }

    return true;
  });

  // Calcular matches paginados
  const paginatedMatches = filteredMatches.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterClub('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in_progress':
        return colors.warning;
      case 'reserved':
        return colors.primary;
      case 'available':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En Progreso';
      case 'reserved':
        return 'Reservado';
      case 'available':
        return 'Disponible';
      default:
        return status;
    }
  };

  const handleViewDetails = (match: Match) => {
    setSelectedMatch(match);
    setDetailDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar los partidos. Por favor, intenta nuevamente.
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Reintentar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Partidos Completados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filteredMatches.length} de {matches.length} partidos
            {(filterStatus || filterClub || filterStartDate || filterEndDate || searchTerm) && (
              <Chip
                label="Filtros activos"
                size="small"
                sx={{ ml: 1 }}
                color="primary"
                variant="outlined"
              />
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FileDownloadIcon />}
            variant="outlined"
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            disabled={filteredMatches.length === 0}
          >
            Exportar
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                if (filteredMatches.length === 0) {
                  toast.error('No hay partidos para exportar');
                  return;
                }
                const mappedData = mapMatchesForExport(filteredMatches);
                exportToCSV(mappedData, { filename: `partidos_${new Date().toISOString().split('T')[0]}` });
                toast.success(`Se exportaron ${filteredMatches.length} partidos a CSV`);
                setExportMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exportar a CSV</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (filteredMatches.length === 0) {
                  toast.error('No hay partidos para exportar');
                  return;
                }
                const mappedData = mapMatchesForExport(filteredMatches);
                exportToExcel(mappedData, { filename: `partidos_${new Date().toISOString().split('T')[0]}` });
                toast.success(`Se exportaron ${filteredMatches.length} partidos a Excel`);
                setExportMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <FileDownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exportar a Excel</ListItemText>
            </MenuItem>
          </Menu>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Actualizar
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar por club, cancha, jugador o resultado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ minWidth: 120 }}
            >
              Filtros
            </Button>
            {(filterStatus || filterClub || filterStartDate || filterEndDate || searchTerm) && (
              <Button variant="outlined" onClick={clearFilters}>
                Limpiar
              </Button>
            )}
          </Box>

          <Collapse in={showFilters}>
            <Paper sx={{ p: 2, mt: 2, backgroundColor: colors.background }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filterStatus}
                      label="Estado"
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      {MATCH_STATUSES.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Club</InputLabel>
                    <Select
                      value={filterClub}
                      label="Club"
                      onChange={(e) => setFilterClub(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {clubs.map((club) => (
                        <MenuItem key={club.id} value={club.id.toString()}>
                          {club.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha Desde"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Fecha Hasta"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Partido</InputLabel>
                    <Select
                      value={filterMixedMatch}
                      label="Tipo de Partido"
                      onChange={(e) => {
                        setFilterMixedMatch(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="mixed">Mixtos</MenuItem>
                      <MenuItem value="regular">Regulares</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Cancha</TableCell>
                <TableCell>Jugadores</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Resultado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || filterStatus || filterClub || filterStartDate || filterEndDate
                        ? 'No se encontraron partidos'
                        : 'No hay partidos registrados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMatches.map((match) => (
                  <TableRow key={match.id} hover>
                    <TableCell>{match.id}</TableCell>
                    <TableCell>
                      {match.start_time
                        ? new Date(match.start_time).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlaceIcon sx={{ fontSize: 16, color: colors.primary }} />
                        <Typography variant="body2">{match.club_name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{match.court_name || '-'}</TableCell>
                    <TableCell>
                      {match.players.length > 0 ? (
                        <Typography variant="body2">
                          {match.players.length} jugador{match.players.length !== 1 ? 'es' : ''}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(match.status)}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(match.status)}20`,
                          color: getStatusColor(match.status),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {match.score ? (
                        <Chip label={match.score} size="small" color="success" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin resultado
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(match)}
                        sx={{ color: colors.primary }}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredMatches.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </Card>

      {/* Dialog de detalles */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedMatch(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsIcon sx={{ color: colors.primary }} />
            <Typography variant="h6">Detalles del Partido #{selectedMatch?.id}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMatch && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Club
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMatch.club_name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cancha
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMatch.court_name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha y Hora de Inicio
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMatch.start_time
                      ? new Date(selectedMatch.start_time).toLocaleString('es-AR')
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha y Hora de Fin
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMatch.end_time
                      ? new Date(selectedMatch.end_time).toLocaleString('es-AR')
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getStatusLabel(selectedMatch.status)}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(selectedMatch.status)}20`,
                        color: getStatusColor(selectedMatch.status),
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resultado
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMatch.score || 'Sin resultado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Creador
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMatch.creator_name || selectedMatch.creator_email || '-'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Jugadores ({selectedMatch.players.length})
              </Typography>
              {selectedMatch.players.length > 0 ? (
                <List>
                  {selectedMatch.players.map((player, index) => (
                    <React.Fragment key={player.id}>
                      <ListItem>
                        <PersonIcon sx={{ color: colors.primary, mr: 1, fontSize: 20 }} />
                        <ListItemText
                          primary={player.name}
                          secondary={player.email}
                        />
                      </ListItem>
                      {index < selectedMatch.players.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay jugadores registrados para este partido.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
