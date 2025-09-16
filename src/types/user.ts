// src/types/user.ts

// Описывает одного пользователя в списке администратора
export interface AdminUserListItem {
  id: number;
  telegram_id: number;
  display_name: string;
  username: string | null;
  level: 'bronze' | 'silver' | 'gold' | string; // string для гибкости
  is_blocked: boolean;
  bot_accessible: boolean;
  created_at: string; // ISO date string
}

// Описывает ответ API с пагинацией
export interface PaginatedAdminUsers {
  total_items: number;
  total_pages: number;
  current_page: number;
  size: number;
  items: AdminUserListItem[];
}

export interface AdminUserDetails {
  id: number;
  telegram_id: number;
  display_name: string;
  username: string | null;
  level: string;
  is_blocked: boolean;
  bot_accessible: boolean;
  created_at: string; // ISO date string
  wordpress_id: number;
  email: string;
  // Пока мы не будем реализовывать вложенные списки,
  // поэтому можем описать их как `any` для простоты.
  latest_orders: any; 
  loyalty_history: any;
}