# Funcionalidades Faltantes en el Dashboard de Super Admin

## 🎯 Contexto Importante

**Este es el dashboard de SUPER ADMIN (dueños de la app), NO de administradores de clubs.**

**Diferencias clave:**
- **Super Admin:** Acceso total al sistema, gestiona todo globalmente
- **Admin de Club:** Solo gestiona su club específico (turnos, canchas, etc.)

**El super admin debe poder:**
- ✅ Gestionar administradores de clubs (ya existe)
- ✅ Gestionar usuarios del sistema
- ✅ Gestionar clubs (crear, editar, activar/desactivar)
- ✅ Ver estadísticas globales
- ✅ Enviar notificaciones globales
- ✅ Ver reportes y analytics

**El super admin NO debe:**
- ❌ Gestionar o monitorear turnos (eso es para admins de club)
- ❌ Gestionar canchas específicas (eso es para admins de club)
- ❌ Gestionar invitaciones específicas (eso es para usuarios)

---

## 📊 Estado Actual del Dashboard

**Funcionalidades Implementadas:**
- ✅ Gestión de administradores de clubs (crear, editar, listar, activar/desactivar)
- ✅ **Gestión completa de clubs** (listar, crear, editar, activar/desactivar con datos reales de API)
- ✅ **Gestión de usuarios del sistema** (listar, ver, editar, activar/desactivar)
- ✅ Integración con API real para clubs y usuarios
- ✅ Formulario multi-paso para creación de clubs
- ✅ Autenticación básica
- ✅ Dashboard básico con estadísticas de administradores

**Problemas Identificados:**
- ⚠️ Navegación de reservas (sin datos reales - pero no es prioridad para super admin)
- ❌ Falta sistema de notificaciones globales
- ❌ Dashboard con estadísticas globales aún básico

---

## 🚨 Funcionalidades Críticas Faltantes

### 1. **Gestión de Usuarios** ✅ COMPLETADO
**Estado:** ✅ Implementado

**Funcionalidades implementadas:**
- ✅ Listar todos los usuarios con datos reales de API
- ✅ Ver información básica de usuario
- ✅ Activar/desactivar usuarios
- ✅ Búsqueda básica de usuarios

**Funcionalidades pendientes (mejoras futuras):**
- ⚠️ Ver perfil completo de usuario (detalles extendidos)
- ⚠️ Editar información de usuario (categoría, género, altura, etc.)
- ⚠️ Ver historial de reservas de un usuario
- ⚠️ Ver estadísticas de usuario (partidos jugados, categoría, etc.)
- ⚠️ Filtros avanzados (por categoría, género, estado)

**Endpoints disponibles en backend:**
- `GET /users/` - Listar usuarios ✅
- `GET /users/{user_id}` - Obtener usuario ⚠️
- `PUT /users/{user_id}` - Actualizar usuario ⚠️
- `GET /users/{user_id}/reservations` - Reservas del usuario ⚠️

---

### 2. **Gestión de Clubs** ✅ COMPLETADO
**Estado:** ✅ Implementado completamente

**Funcionalidades implementadas:**
- ✅ Listar todos los clubs del sistema (con datos reales de API)
- ✅ Ver detalles de un club:
  - ✅ Información básica (nombre, dirección, teléfono, email)
  - ✅ Horarios de apertura
  - ✅ Estado (activo/inactivo)
  - ✅ Administrador asignado
- ✅ Crear nuevos clubs (con formulario multi-paso):
  - ✅ Paso 1: Información básica (nombre, dirección, teléfono, email)
  - ✅ Paso 2: Horarios (apertura, cierre, duración de turno)
  - ✅ Paso 3: Precio y canchas (precio por turno en pesos, cantidad de canchas)
  - ✅ Creación automática de canchas al crear club
- ✅ Editar información de clubs
- ✅ Activar/desactivar clubs
- ✅ Eliminar clubs (con confirmación)
- ✅ Campo de email agregado al modelo y formulario
- ✅ Conversión automática de precio (pesos a centavos)

**Funcionalidades pendientes (mejoras futuras):**
- ⚠️ Asignar administradores a clubs desde el formulario
- ⚠️ Buscar clubs por nombre, dirección, etc.
- ⚠️ Ver canchas disponibles en detalle
- ⚠️ Estadísticas:
  - Clubs activos vs inactivos
  - Clubs por región/ciudad
  - Canchas totales por club

**Endpoints disponibles en backend:**
- `GET /clubs/` - Listar clubs ✅
- `GET /clubs/search` - Buscar clubs ⚠️
- `GET /clubs/{club_id}` - Detalles del club ⚠️
- `POST /clubs/` - Crear club ✅
- `PUT /clubs/{club_id}` - Actualizar club ✅
- `DELETE /clubs/{club_id}` - Eliminar club ✅

---

### 3. **Notificaciones Globales** 🟠 Media Prioridad
**Estado:** No existe en el dashboard

**Funcionalidades necesarias:**
- Enviar notificaciones masivas:
  - A todos los usuarios
  - A usuarios por categoría
  - A usuarios por club favorito
  - A usuarios por región
- Ver historial de notificaciones enviadas
- Ver estadísticas de notificaciones:
  - Notificaciones enviadas por tipo
  - Tasa de lectura
  - Notificaciones por fecha
- **NO debe gestionar:** Notificaciones individuales de usuarios (eso es automático del sistema)

**Endpoints disponibles en backend:**
- `POST /notifications/send` - Enviar notificación (verificar si soporta masivas)

---

### 4. **Dashboard con Estadísticas Globales** 🔴 Alta Prioridad
**Estado:** Dashboard básico existe pero falta información

**Funcionalidades necesarias:**
- Estadísticas generales del sistema:
  - Total de usuarios activos
  - Total de clubs activos
  - Total de administradores
  - Turnos activos (PENDING + READY_TO_PLAY)
  - Turnos completados hoy/semana/mes
  - Turnos cancelados hoy/semana/mes
  - Usuarios nuevos (últimos 7/30 días)
- Gráficos:
  - Turnos por día (últimos 7/30 días)
  - Turnos por club
  - Usuarios nuevos por mes
  - Tasa de cancelación
  - Distribución de categorías de usuarios
- Alertas:
  - Clubs sin actividad reciente
  - Usuarios inactivos (más de X días)
  - Turnos con alta tasa de cancelación

---

### 5. **Gestión de Matches (Partidos Completados)** 🟡 Baja Prioridad
**Estado:** No existe en el dashboard

**Funcionalidades necesarias:**
- Listar partidos completados
- Ver detalles de partido:
  - Jugadores participantes
  - Resultado
  - Fecha y hora
  - Club y cancha
- Estadísticas de partidos:
  - Partidos por club
  - Partidos por fecha
  - Jugadores más activos

**Endpoints disponibles en backend:**
- `GET /matches/` - Listar partidos
- `GET /matches/{match_id}` - Detalles de partido

---

### 6. **Integración Real con API** ⚠️ PARCIALMENTE COMPLETADO
**Estado:** Integración básica completada para clubs y usuarios

**Servicios implementados:**
- ✅ `clubs.ts` - Gestión completa de clubs (listar, crear, editar, eliminar)
- ✅ `users.ts` - Gestión básica de usuarios (listar, activar/desactivar)
- ✅ `admin.ts` - Gestión de administradores
- ✅ `api.ts` - Configuración de Axios con interceptores

**Servicios pendientes:**
- ❌ `pregameTurns.ts` - Gestión de turnos (no es prioridad para super admin)
- ❌ `invitations.ts` - Gestión de invitaciones (no es prioridad para super admin)
- ❌ `notifications.ts` - Gestión de notificaciones (necesario para notificaciones globales)
- ❌ `courts.ts` - Gestión de canchas (no es prioridad para super admin)
- ❌ `matches.ts` - Gestión de partidos (baja prioridad)

**Páginas actualizadas:**
- ✅ `Clubs.tsx` - Usa API real, formulario multi-paso implementado
- ✅ `Users.tsx` - Usa API real para listar usuarios
- ⚠️ `ReservationsByClub.tsx` - Aún usa datos mock (no es prioridad)
- ⚠️ `ReservationsByTime.tsx` - Aún usa datos mock (no es prioridad)

---

### 7. **Dashboard con Estadísticas** 🟠 Media Prioridad
**Estado:** Dashboard básico existe pero falta información

**Funcionalidades necesarias:**
- Estadísticas generales:
  - Total de usuarios activos
  - Total de turnos activos (PENDING + READY_TO_PLAY)
  - Turnos completados hoy/semana/mes
  - Turnos cancelados hoy/semana/mes
  - Invitaciones pendientes
  - Clubs activos
- Gráficos:
  - Turnos por día (últimos 7/30 días)
  - Turnos por club
  - Usuarios nuevos por mes
  - Tasa de cancelación
- Alertas:
  - Turnos con problemas (muchos cancelados)
  - Usuarios inactivos
  - Clubs sin actividad

---

### 8. **Filtros y Búsqueda Avanzada** 🟠 Media Prioridad
**Estado:** No existe

**Funcionalidades necesarias:**
- Búsqueda global en todas las entidades
- Filtros avanzados:
  - Por fecha (rango)
  - Por club
  - Por estado
  - Por tipo de partido (mixto/regular)
  - Por categoría de usuario
- Ordenamiento:
  - Por fecha (ascendente/descendente)
  - Por relevancia
  - Por estado

---

### 9. **Gestión de Partidos Mixtos** 🟡 Baja Prioridad
**Estado:** No existe visibilidad específica

**Funcionalidades necesarias:**
- Ver turnos mixtos separados de regulares
- Verificar balance de géneros en turnos mixtos
- Ver categoría libre configurada
- Alertas si un turno mixto no tiene balance correcto

---

## 📋 Resumen de Prioridades para Super Admin

### ✅ COMPLETADO
1. ✅ **Integración real con API** (clubs y usuarios integrados)
2. ✅ **Gestión de Usuarios** (listar, activar/desactivar - funcionalidad básica)
3. ✅ **Gestión de Clubs** (crear, editar, activar/desactivar, eliminar con formulario multi-paso)

### 🔴 Alta Prioridad (Implementar ahora)
4. **Dashboard con Estadísticas Globales** (métricas del sistema completo)
   - Total de usuarios activos
   - Total de clubs activos
   - Total de administradores
   - Gráficos de actividad
   - Alertas importantes

### 🟠 Media Prioridad
5. **Notificaciones Globales** (enviar notificaciones masivas)
6. **Filtros y Búsqueda Avanzada** (en todas las secciones)
7. **Mejoras en Gestión de Usuarios** (editar perfil completo, ver historial)

### 🟡 Baja Prioridad
8. **Reportes y Analytics** (exportar datos, gráficos avanzados)
9. **Gestión de Matches** (ver partidos completados)
10. **Asignar administradores a clubs** (desde el formulario de creación/edición)

---

## 🛠️ Recomendaciones de Implementación para Super Admin

### ✅ Fase 1: Integración con API y Clubs - COMPLETADA
1. ✅ Crear servicio `clubs.ts` para reemplazar datos mock
2. ✅ Actualizar `Clubs.tsx` para usar API real
3. ✅ Agregar funcionalidad de crear/editar clubs (con formulario multi-paso)
4. ✅ Agregar manejo de errores y loading states
5. ✅ Agregar campo de email a clubs
6. ✅ Agregar creación automática de canchas
7. ✅ Implementar conversión de precio (pesos a centavos)

### ✅ Fase 2: Gestión de Usuarios - COMPLETADA (básica)
1. ✅ Crear servicio `users.ts`
2. ✅ Crear página `Users.tsx` con:
   - ✅ Listado con datos reales de API
   - ✅ Activar/desactivar usuarios
   - ⚠️ Vista de detalle de usuario (pendiente)
   - ⚠️ Edición de usuario (pendiente)
   - ⚠️ Búsqueda y filtros avanzados (pendiente)

### 🔴 Fase 3: Dashboard con Estadísticas - EN PROGRESO (SIGUIENTE)
1. Crear servicios para obtener estadísticas
2. Actualizar `Dashboard.tsx` con:
   - Estadísticas globales (usuarios, clubs, turnos)
   - Gráficos de actividad
   - Alertas y notificaciones importantes

### 🟠 Fase 4: Notificaciones Globales - PENDIENTE
1. Crear servicio `notifications.ts`
2. Crear página para enviar notificaciones masivas
3. Ver historial de notificaciones enviadas

### 🟡 Fase 5: Mejoras y Optimizaciones - PENDIENTE
1. Mejorar gestión de usuarios (editar perfil completo, ver historial)
2. Agregar búsqueda y filtros avanzados en todas las secciones
3. Asignar administradores a clubs desde el formulario
4. Exportar datos a CSV/Excel

---

## 📝 Notas Adicionales

- El backend ya tiene todos los endpoints necesarios
- La estructura del dashboard está bien organizada
- Se recomienda usar React Query para el manejo de datos (ya está instalado)
- Considerar usar Material-UI DataGrid para tablas complejas
- Implementar paginación en todas las listas
- Agregar exportación a CSV/Excel para reportes

---

## 📈 Progreso Actual (Última actualización: 2026-01-01)

### ✅ Completado Recientemente
1. **Gestión de Clubs - COMPLETA**
   - ✅ Integración completa con API real
   - ✅ Formulario multi-paso para creación (3 pasos)
   - ✅ Edición de clubs
   - ✅ Activación/desactivación de clubs
   - ✅ Eliminación de clubs
   - ✅ Campo de email agregado
   - ✅ Creación automática de canchas
   - ✅ Conversión automática de precio (pesos a centavos)

2. **Gestión de Usuarios - BÁSICA**
   - ✅ Listado con datos reales de API
   - ✅ Activación/desactivación de usuarios
   - ⚠️ Pendiente: edición completa, ver historial

3. **Integración con API**
   - ✅ Servicios creados: `clubs.ts`, `users.ts`, `admin.ts`
   - ✅ Manejo de errores y loading states
   - ✅ Interceptores de Axios configurados

### 🔴 Próximos Pasos (Alta Prioridad)
1. **Dashboard con Estadísticas Globales**
   - Implementar métricas del sistema
   - Agregar gráficos de actividad
   - Mostrar alertas importantes

2. **Notificaciones Globales**
   - Crear servicio de notificaciones
   - Implementar envío masivo de notificaciones
   - Ver historial de notificaciones

### 📊 Estado General
- **Progreso:** ~60% de funcionalidades críticas completadas
- **Próxima fase:** Dashboard con estadísticas globales
- **Tiempo estimado para completar alta prioridad:** 1-2 semanas
