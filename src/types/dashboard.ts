export interface AdminDashboardStats {
  new_orders_count: number;
  processing_orders_count: number;
  new_users_today_count: number;
  total_users_count: number;
  sales_today: number;
  // Добавим last_updated как опциональное поле,
  // так как его нет в ответе API, но мы можем его генерировать на клиенте.
  last_updated?: string;
}