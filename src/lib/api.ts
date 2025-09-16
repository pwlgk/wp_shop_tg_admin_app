// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000', // Обновите при необходимости
});

// Interceptor для добавления токена в заголовки
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- НОВЫЙ БЛОК: Interceptor для обработки ответов ---
api.interceptors.response.use(
  // Если ответ успешный (статус 2xx), просто возвращаем его
  (response) => response,
  // Если в ответе ошибка, обрабатываем ее
  (error) => {
    // Проверяем, есть ли у ошибки объект ответа (response)
    if (error.response) {
      // ИЗМЕНЕНИЕ ЗДЕСЬ: Если статус ответа 403,
      // меняем глобальное состояние на 'forbidden'
      if (error.response.status === 403) {
        console.error("⛔ Access Forbidden (403). Setting auth status to 'forbidden'.");
        useAuthStore.getState().setStatus('forbidden');
      }
    }
    // Пробрасываем ошибку дальше, чтобы useQuery мог ее обработать
    return Promise.reject(error);
  }
);


export default api;