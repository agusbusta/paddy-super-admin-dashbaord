import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  ExitToApp as ExitToAppIcon, 
  Menu as MenuIcon,
  Place as PlaceIcon,
  EventNote as EventIcon,
  Notifications as NotificationsIcon,
  SportsTennis as SportsIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../../utils/constants';

const drawerWidth = 250;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Administradores', icon: <PeopleIcon />, path: '/admins' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/users' },
    { text: 'Clubes', icon: <PlaceIcon />, path: '/clubs' },
    { text: 'Notificaciones', icon: <NotificationsIcon />, path: '/notifications' },
    { text: 'Partidos', icon: <SportsIcon />, path: '/matches' },
    { text: 'Reservas', icon: <EventIcon />, path: '/reservations' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          backgroundColor: colors.primary,
          color: colors.white
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ my: 2 }}>
          Paddio Admin
        </Typography>
        {user && user.name && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: colors.secondary,
                color: colors.white,
                mr: 1
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">{user.name}</Typography>
              <Typography variant="caption">Super Admin</Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                handleDrawerToggle();
              }
            }}
            sx={{
              backgroundColor: location.pathname === item.path ? `${colors.primary}20` : 'transparent',
              borderLeft: location.pathname === item.path ? `4px solid ${colors.primary}` : '4px solid transparent',
              '&:hover': {
                backgroundColor: `${colors.primary}10`,
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? colors.primary : colors.textPrimary }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                color: location.pathname === item.path ? colors.primary : colors.textPrimary
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={logout}>
          <ListItemIcon sx={{ color: colors.error }}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ color: colors.error }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.background }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: colors.white,
          color: colors.textPrimary,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Paddio | Super Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="menu options"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          overflow: 'auto'
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}; 