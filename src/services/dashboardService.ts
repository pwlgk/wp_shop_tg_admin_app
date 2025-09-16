// src/services/dashboardService.ts
import api from '@/lib/api';
import { AdminDashboardStats } from '@/types/dashboard';

/**
 * Запрашивает сводную статистику для главного экрана админ-панели.
 */
export const getDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const response = await api.get('/api/v1/admin/dashboard');
    // ИСПРАВЛЕНИЕ: Добавляем время обновления прямо на клиенте
    const stats: AdminDashboardStats = {
      ...response.data,
      last_updated: new Date().toISOString(), // Добавляем текущее время
    };
    return stats;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error("Не удалось загрузить статистику");
  }
};