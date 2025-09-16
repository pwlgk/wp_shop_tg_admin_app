// src/services/adminService.ts
import api from '@/lib/api';
import { ShopSettings } from '@/types/settings';

/**
 * Запрашивает текущие настройки магазина.
 */
export const getShopSettings = async (): Promise<ShopSettings> => {
  try {
    const response = await api.get('/api/v1/admin/settings');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch shop settings:", error);
    throw new Error("Не удалось загрузить настройки магазина");
  }
};

/**
 * Создает задачу на массовую рассылку.
 * @param messageText - Текст сообщения.
 * @param targetLevel - Целевая аудитория ('all', 'bronze', etc.).
 */
export const createBroadcast = async ({ messageText, targetLevel }: { messageText: string; targetLevel: string }): Promise<void> => {
  try {
    await api.post('/api/v1/admin/broadcasts', {
      message_text: messageText,
      target_level: targetLevel,
    });
  } catch (error) {
    console.error("Failed to create broadcast:", error);
    throw new Error("Не удалось создать рассылку");
  }
};

/**
 * Очищает кеш на сервере.
 * @param target - Цель для очистки ('all', 'settings', 'catalog').
 */
export const clearServerCache = async (target: 'all' | 'settings' | 'catalog'): Promise<void> => {
  try {
    await api.post('/api/v1/admin/cache/clear', null, { params: { target } });
  } catch (error) {
    console.error(`Failed to clear cache for target ${target}:`, error);
    throw new Error("Не удалось очистить кеш");
  }
};