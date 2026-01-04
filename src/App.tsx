import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, CircularProgress, Typography, Button } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/common/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Clubs } from './pages/Clubs';
import { Notifications } from './pages/Notifications';
import { Matches } from './pages/Matches';
import { Reservations } from './pages/Reservations';
import { ReservationsByClub } from './pages/ReservationsByClub';
import { ReservationsByTime } from './pages/ReservationsByTime';
import { ReservationsCalendar } from './pages/ReservationsCalendar';
import { colors } from './utils/constants';

// Crear un tema con los colores de la app móvil
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    error: {
      main: colors.error,
    },
    background: {
      default: colors.background,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isSuperAdmin, logout } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Solo super admins pueden acceder al dashboard
  if (!isSuperAdmin) {
    const handleLogout = () => {
      logout();
      window.location.href = '/login';
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 4 }}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Acceso Denegado
          </Typography>
          <Typography variant="body1">
            Solo los super administradores pueden acceder a este dashboard.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    );
  }

  return <Layout>{children}</Layout>;
};

// Router con rutas de la aplicación
function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clubs"
        element={
          <ProtectedRoute>
            <Clubs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <Reservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations/by-club"
        element={
          <ProtectedRoute>
            <ReservationsByClub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations/by-time"
        element={
          <ProtectedRoute>
            <ReservationsByTime />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations-calendar"
        element={
          <ProtectedRoute>
            <ReservationsCalendar />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <AppRouter />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '16px',
                }
              }}
            />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App; 