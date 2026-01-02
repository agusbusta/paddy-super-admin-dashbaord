import { userService } from './users';
import { clubService } from './clubs';
import { adminService } from './admin';

export interface DashboardStatistics {
  users: {
    total: number;
    active: number;
    inactive: number;
    withCompleteProfile: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  clubs: {
    total: number;
    active: number;
    inactive: number;
  };
  admins: {
    total: number;
    active: number;
    inactive: number;
  };
  // Estas estadísticas se calcularían desde pregame_turns si tuviéramos acceso
  // Por ahora las dejamos como opcionales
  turns?: {
    active: number;
    pending: number;
    readyToPlay: number;
    completedToday: number;
    cancelledToday: number;
  };
}

export const statisticsService = {
  getDashboardStatistics: async (): Promise<DashboardStatistics> => {
    try {
      // Obtener todos los datos necesarios
      const [users, clubs, admins] = await Promise.all([
        userService.getUsers({ limit: 10000 }),
        clubService.getClubs({ limit: 1000 }),
        adminService.getAdmins(),
      ]);

      // Calcular fechas
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calcular estadísticas de usuarios
      const activeUsers = users.filter((u) => u.is_active);
      const inactiveUsers = users.filter((u) => !u.is_active);
      const usersWithCompleteProfile = users.filter((u) => u.is_profile_complete);
      const newUsersLast7Days = users.filter((u) => {
        if (!u.created_at) return false;
        const createdDate = new Date(u.created_at);
        return createdDate >= last7Days;
      });
      const newUsersLast30Days = users.filter((u) => {
        if (!u.created_at) return false;
        const createdDate = new Date(u.created_at);
        return createdDate >= last30Days;
      });

      // Calcular estadísticas de clubs
      const activeClubs = clubs.filter((c) => c.is_active !== false);
      const inactiveClubs = clubs.filter((c) => c.is_active === false);

      // Calcular estadísticas de admins
      const activeAdmins = admins.filter((a) => a.is_active);
      const inactiveAdmins = admins.filter((a) => !a.is_active);

      return {
        users: {
          total: users.length,
          active: activeUsers.length,
          inactive: inactiveUsers.length,
          withCompleteProfile: usersWithCompleteProfile.length,
          newLast7Days: newUsersLast7Days.length,
          newLast30Days: newUsersLast30Days.length,
        },
        clubs: {
          total: clubs.length,
          active: activeClubs.length,
          inactive: inactiveClubs.length,
        },
        admins: {
          total: admins.length,
          active: activeAdmins.length,
          inactive: inactiveAdmins.length,
        },
      };
    } catch (error) {
      console.error('Error getting dashboard statistics:', error);
      throw error;
    }
  },

  getUsersByMonth: async (months: number = 12): Promise<Array<{ month: string; jugadores: number; administradores: number; total: number }>> => {
    try {
      const users = await userService.getUsers({ limit: 10000 });
      const now = new Date();
      const result: { [key: string]: { jugadores: number; administradores: number; total: number } } = {};

      // Inicializar los últimos N meses con 0
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        result[key] = { jugadores: 0, administradores: 0, total: 0 };
      }

      // Contar usuarios por mes separando jugadores de administradores
      users.forEach((user) => {
        if (user.created_at) {
          const createdDate = new Date(user.created_at);
          const key = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
          if (result[key] !== undefined) {
            // Si es admin o super admin, contar como administrador
            if (user.is_admin || user.is_super_admin) {
              result[key].administradores++;
            } else {
              result[key].jugadores++;
            }
            result[key].total++;
          }
        }
      });

      return Object.entries(result).map(([month, counts]) => ({
        month,
        jugadores: counts.jugadores,
        administradores: counts.administradores,
        total: counts.total,
      }));
    } catch (error) {
      console.error('Error getting users by month:', error);
      return [];
    }
  },
};
