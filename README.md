# Paddio Admin Dashboard

Panel de administración para la plataforma Paddio, desarrollado con React y Material-UI.

## Características

- Gestión de administradores
- Gestión de clubs
- Sistema de reservas
- Interfaz moderna y responsiva
- Autenticación y autorización

## Requisitos

- Node.js (versión 14 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/paddio-admin-dashboard.git
cd paddio-admin-dashboard
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con los valores correspondientes.

4. Iniciar el servidor de desarrollo:
```bash
npm start
# o
yarn start
```

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes reutilizables
  ├── hooks/         # Custom hooks
  ├── pages/         # Páginas de la aplicación
  ├── utils/         # Utilidades y constantes
  └── App.tsx        # Componente principal
```

## Tecnologías Utilizadas

- React
- TypeScript
- Material-UI
- React Router
- React Query
- React Hot Toast

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm build`: Construye la aplicación para producción
- `npm test`: Ejecuta las pruebas
- `npm eject`: Expulsa la configuración de Create React App

## Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. 