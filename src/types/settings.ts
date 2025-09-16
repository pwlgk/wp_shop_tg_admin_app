// src/types/settings.ts
export interface ShopSettings {
  min_order_amount: number;
  welcome_bonus_amount: number;
  is_welcome_bonus_active: boolean;
  max_points_payment_percentage: number;
  referral_welcome_bonus: number;
  referrer_bonus: number;
  birthday_bonus_amount: number;
  client_data_version: number;
}