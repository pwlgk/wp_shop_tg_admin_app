// src/services/orderService.ts
import api from '@/lib/api';
import { PaginatedAdminOrders } from '@/types/order'; // <-- Обновляем тип

interface GetOrdersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

/**
 * Запрашивает список всех заказов с сервера с пагинацией и фильтрами для админ-панели.
 * @param params - Объект с параметрами для запроса.
 * @returns Промис с пагинированным списком заказов.
 */
export const getAdminOrders = async (params: GetOrdersParams = {}): Promise<PaginatedAdminOrders> => {
  try {
    // Удаляем пустые параметры, чтобы не отправлять их в запросе
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
      
    const response = await api.get('/api/v1/admin/orders', {
      params: {
        page: 1,
        size: 15,
        ...cleanParams,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    throw new Error("Не удалось загрузить список заказов");
  }
};