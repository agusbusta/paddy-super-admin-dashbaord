// Colores de la app móvil
export const colors = {
  primary: '#1A2842',      // Color primario azul oscuro
  secondary: '#4EAF52',    // Color secundario verde
  accent: '#4169E1',       // Color de acento azul
  background: '#F8F9FA',   // Color de fondo gris claro
  error: '#E53935',        // Color de error rojo
  success: '#4EAF52',      // Color de éxito verde
  warning: '#FFA726',      // Color de advertencia naranja
  textPrimary: '#1A2842',  // Color de texto principal
  textSecondary: '#666666', // Color de texto secundario
  divider: '#EAEAEA',      // Color de divisor
  white: '#FFFFFF',        // Color blanco
  black: '#000000',        // Color negro
};

// URL de la API
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8001';

// Roles de usuario
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
};

// LocalStorage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
};

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN_MANAGEMENT: '/admins',
  ADMIN_DETAIL: '/admins/:id',
};

// Estado de los administradores
export const ADMIN_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

// Mensajes de error
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Credenciales inválidas. Por favor verifica tu email y contraseña.',
  UNAUTHORIZED: 'No tienes permisos para acceder a esta página.',
  SERVER_ERROR: 'Error en el servidor. Por favor intenta más tarde.',
  NETWORK_ERROR: 'Error de conexión. Por favor verifica tu conexión a internet.',
  FORM_VALIDATION: 'Por favor verifica los campos del formulario.',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso.',
  ADMIN_CREATED: 'Administrador creado exitosamente.',
  ADMIN_UPDATED: 'Administrador actualizado exitosamente.',
  ADMIN_DELETED: 'Administrador eliminado exitosamente.',
  STATUS_UPDATED: 'Estado del administrador actualizado exitosamente.',
}; 