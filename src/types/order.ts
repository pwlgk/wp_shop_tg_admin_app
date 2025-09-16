// src/types/order.ts

// Описывает один заказ в списке администратора
export interface AdminOrderListItem {
  id: number;
  number: string;
  status: string;
  created_date: string; // ISO date string
  total: string;
  customer_display_name: string;
  customer_telegram_id: number;
  items_summary: string; // "Товар1 (x2), Товар2 (x1)..."
}

// Описывает ответ API с пагинацией
export interface PaginatedAdminOrders {
  total_items: number;
  total_pages: number;
  current_page: number;
  size: number;
  items: AdminOrderListItem[];
}