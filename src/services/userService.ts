// src/services/userService.ts
import api from '@/lib/api';
import { AdminUserDetails, PaginatedAdminUsers } from '@/types/user';

// Определяем тип для параметров запроса
interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
  level?: string;
  bot_blocked?: boolean;
}

/**
 * Запрашивает список пользователей с сервера с пагинацией и фильтрами.
 * @param params - Объект с параметрами для запроса.
 * @returns Промис с пагинированным списком пользователей.
 */
export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedAdminUsers> => {
  try {
    const response = await api.get('/api/v1/admin/users', {
      params: {
        page: params.page || 1,
        size: params.size || 10, // Запрашиваем по 10 пользователей
        search: params.search || undefined, // Отправляем только если есть значение
        level: params.level || undefined,
        bot_blocked: params.bot_blocked,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    // Пробрасываем ошибку дальше, чтобы TanStack Query мог ее обработать
    throw new Error("Не удалось загрузить список пользователей");
  }
};

/**
 * Запрашивает детальную информацию о пользователе по его ID.
 * @param userId - ID пользователя в нашей системе.
 * @returns Промис с детальной информацией о пользователе.
 */
export const getUserById = async (userId: string | number): Promise<AdminUserDetails> => {
  try {
    const response = await api.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with id ${userId}:`, error);
    throw new Error("Не удалось загрузить данные пользователя");
  }
};
/**
 * Отправляет сообщение пользователю от имени бота.
 * @param userId - ID пользователя в нашей системе.
 * @param messageText - Текст сообщения.
 * @returns Промис, который разрешается при успешной отправке.
 */
export const sendMessageToUser = async ({ userId, messageText }: { userId: string | number, messageText: string }): Promise<void> => {
  try {
    await api.post(`/api/v1/admin/users/${userId}/message`, {
      message_text: messageText,
    });
  } catch (error) {
    console.error(`Failed to send message to user ${userId}:`, error);
    // Пробрасываем ошибку с понятным текстом
    const errorMessage = (error as any).response?.data?.detail || "Не удалось отправить сообщение";
    throw new Error(errorMessage);
  }
};
/**
 * Блокирует пользователя.
 * @param userId - ID пользователя.
 */
export const blockUser = async (userId: string | number): Promise<void> => {
  try {
    await api.post(`/api/v1/admin/users/${userId}/block`);
  } catch (error) {
    console.error(`Failed to block user ${userId}:`, error);
    throw new Error("Не удалось заблокировать пользователя");
  }
};

/**
 * Разблокирует пользователя.
 * @param userId - ID пользователя.
 */
export const unblockUser = async (userId: string | number): Promise<void> => {
  try {
    await api.post(`/api/v1/admin/users/${userId}/unblock`);
  } catch (error) {
    console.error(`Failed to unblock user ${userId}:`, error);
    throw new Error("Не удалось разблокировать пользователя");
  }
};

/**
 * Начисляет или списывает баллы пользователю.
 * @param params - Объект с userId, points и comment.
 */
export const adjustUserPoints = async ({ userId, points, comment }: { userId: string | number; points: number; comment: string }): Promise<void> => {
  try {
    await api.post(`/api/v1/admin/users/${userId}/points`, { points, comment });
  } catch (error) {
    console.error(`Failed to adjust points for user ${userId}:`, error);
    const errorMessage = (error as any).response?.data?.detail || "Не удалось изменить баланс";
    throw new Error(errorMessage);
  }
};