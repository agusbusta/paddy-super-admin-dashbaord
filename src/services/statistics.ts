import { userService } from './users';
import { clubService } from './clubs';
import { adminService } from './admin';
import { matchService } from './matches';
import { notificationService } from './notifications';
import { courtService } from './courts';
import { pregameTurnService } from './pregameTurns';

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
  matches?: {
    total: number;
    completed: number;
    inProgress: number;
    reserved: number;
    available: number;
    completedToday: number;
    completedLast7Days: number;
    completedLast30Days: number;
  };
  notifications?: {
    totalBroadcasts: number;
    sentLast7Days: number;
    sentLast30Days: number;
    totalSent: number;
    totalFailed: number;
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

      // Obtener estadísticas de matches
      let matchesStats = undefined;
      try {
        const allMatches = await matchService.getMatches({ limit: 10000 });
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const completedMatches = allMatches.filter((m) => m.status === 'completed');
        const inProgressMatches = allMatches.filter((m) => m.status === 'in_progress');
        const reservedMatches = allMatches.filter((m) => m.status === 'reserved');
        const availableMatches = allMatches.filter((m) => m.status === 'available');

        const completedToday = completedMatches.filter((m) => {
          if (!m.start_time) return false;
          const matchDate = new Date(m.start_time);
          return matchDate >= today;
        });

        const completedLast7Days = completedMatches.filter((m) => {
          if (!m.start_time) return false;
          const matchDate = new Date(m.start_time);
          return matchDate >= last7Days;
        });

        const completedLast30Days = completedMatches.filter((m) => {
          if (!m.start_time) return false;
          const matchDate = new Date(m.start_time);
          return matchDate >= last30Days;
        });

        matchesStats = {
          total: allMatches.length,
          completed: completedMatches.length,
          inProgress: inProgressMatches.length,
          reserved: reservedMatches.length,
          available: availableMatches.length,
          completedToday: completedToday.length,
          completedLast7Days: completedLast7Days.length,
          completedLast30Days: completedLast30Days.length,
        };
      } catch (error) {
        console.error('Error getting matches statistics:', error);
      }

      // Obtener estadísticas de notificaciones
      let notificationsStats = undefined;
      try {
        const allNotifications = await notificationService.getBroadcastHistory({ limit: 10000 });
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const sentLast7Days = allNotifications.filter((n) => {
          if (!n.created_at) return false;
          const notificationDate = new Date(n.created_at);
          return notificationDate >= last7Days;
        });

        const sentLast30Days = allNotifications.filter((n) => {
          if (!n.created_at) return false;
          const notificationDate = new Date(n.created_at);
          return notificationDate >= last30Days;
        });

        const totalSent = allNotifications.reduce((sum, n) => sum + (n.data?.sent_count || 0), 0);
        const totalFailed = allNotifications.reduce((sum, n) => sum + (n.data?.failed_count || 0), 0);

        notificationsStats = {
          totalBroadcasts: allNotifications.length,
          sentLast7Days: sentLast7Days.length,
          sentLast30Days: sentLast30Days.length,
          totalSent,
          totalFailed,
        };
      } catch (error) {
        console.error('Error getting notifications statistics:', error);
      }

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
        matches: matchesStats,
        notifications: notificationsStats,
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

  /**
   * Obtener distribución de categorías de usuarios
   */
  getUsersByCategory: async (): Promise<Array<{ category: string; count: number }>> => {
    try {
      const users = await userService.getUsers({ limit: 10000 });
      const categoryCount: { [key: string]: number } = {};

      users.forEach((user) => {
        const category = user.category || 'Sin categoría';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      return Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting users by category:', error);
      return [];
    }
  },

  /**
   * Obtener distribución de usuarios por provincia
   */
  getUsersByProvince: async (): Promise<Array<{ province: string; count: number }>> => {
    try {
      const users = await userService.getUsers({ limit: 10000 });
      const provinceCount: { [key: string]: number } = {};

      users.forEach((user) => {
        if (user.province) {
          provinceCount[user.province] = (provinceCount[user.province] || 0) + 1;
        }
      });

      return Object.entries(provinceCount)
        .map(([province, count]) => ({ province, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 provincias
    } catch (error) {
      console.error('Error getting users by province:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de canchas por club
   */
  getCourtsByClub: async (): Promise<Array<{ clubName: string; courtsCount: number; clubId: number }>> => {
    try {
      const [clubs, courts] = await Promise.all([
        clubService.getClubs({ limit: 1000 }),
        courtService.getCourts({ limit: 10000 }),
      ]);

      // Agrupar canchas por club
      const courtsByClub: { [clubId: number]: number } = {};
      courts.forEach((court) => {
        courtsByClub[court.club_id] = (courtsByClub[court.club_id] || 0) + 1;
      });

      // Mapear a formato con nombre de club
      return clubs
        .map((club) => ({
          clubName: club.name,
          courtsCount: courtsByClub[club.id] || 0,
          clubId: club.id,
        }))
        .sort((a, b) => b.courtsCount - a.courtsCount);
    } catch (error) {
      console.error('Error getting courts by club:', error);
      return [];
    }
  },

  /**
   * Obtener tasa de cancelación de turnos
   */
  getCancellationRate: async (startDate?: string, endDate?: string): Promise<{
    total: number;
    cancelled: number;
    rate: number;
  }> => {
    try {
      return await pregameTurnService.getCancellationRate(startDate, endDate);
    } catch (error) {
      console.error('Error getting cancellation rate:', error);
      return { total: 0, cancelled: 0, rate: 0 };
    }
  },

  /**
   * Obtener turnos por día y club
   */
  getTurnsByDayAndClub: async (startDate?: string, endDate?: string): Promise<Array<{
    date: string;
    club_id: number;
    club_name: string;
    count: number;
  }>> => {
    try {
      return await pregameTurnService.getTurnsByDayAndClub(startDate, endDate);
    } catch (error) {
      console.error('Error getting turns by day and club:', error);
      return [];
    }
  },
};
