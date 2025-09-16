// src/components/AppLogic.tsx
'use client';

import { useEffect } from 'react';
import { useLaunchParams } from '@tma.js/sdk-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { useManageTelegramBackButton } from '@/hooks/use-telegram-back-button'; // Проверьте путь
import { ForbiddenScreen } from './ForbiddenScreen'; // <-- Импортируем новый компонент

// Компоненты Loader и ErrorDisplay
const Loader = ({ text = "Инициализация..." }: { text?: string }) => (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        {text}
    </div>
);
const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="flex h-screen w-full items-center justify-center bg-background text-destructive">
        {message}
    </div>
);

export function AppLogic({ children }: { children: React.ReactNode }) {
    const { status, setToken, setStatus } = useAuthStore();
    const { setTheme } = useTheme();
    const launchParams = useLaunchParams();

    useManageTelegramBackButton();

    useEffect(() => {
        // --- ИЗМЕНЕНИЕ 1: Логика установки темы ---
        // Устанавливаем тему, как только появляются themeParams. Это можно делать параллельно.
        const themeParams = (launchParams.themeParams as unknown) as { colorScheme?: 'light' | 'dark' };
        if (themeParams?.colorScheme) {
            setTheme(themeParams.colorScheme);
        }

        // --- ИЗМЕНЕНИЕ 2: Усовершенствованная логика аутентификации ---

        // Если мы уже не в состоянии загрузки, ничего не делаем.
        // Это предотвращает повторную аутентификацию.
        if (status !== 'loading') {
            return;
        }

        const initDataRaw = launchParams.initDataRaw;

        // Если данные от Telegram пришли, немедленно аутентифицируемся.
        if (initDataRaw) {
            console.log("✅ initDataRaw найден, начинаем аутентификацию...");
            authenticate(initDataRaw);
            return; // Выходим из эффекта
        }

        // Если данных нет, и мы в режиме разработки, запускаем тайм-аут.
        // Это позволяет приложению "подождать" данные, а если их нет - перейти в режим разработки.
        if (process.env.NODE_ENV === 'development') {
            console.log("⏳ initDataRaw не найден. Ждем 1 секунду в режиме разработки...");
            const timer = setTimeout(() => {
                // Проверяем снова, вдруг данные появились за эту секунду
                if (useAuthStore.getState().status === 'loading') {
                    console.warn("⏰ Тайм-аут: initDataRaw так и не появился. Переход в режим разработки (unauthenticated).");
                    setStatus('unauthenticated');
                }
            }, 1000); // Ждем 1 секунду

            // Очищаем таймер, если компонент размонтируется
            return () => clearTimeout(timer);
        }

        // Внутренняя функция для чистоты кода
        async function authenticate(data: string) {
            try {
                const response = await api.post('/api/v1/auth/telegram', { init_data: data });
                const { access_token } = response.data;
                if (access_token) {
                    console.log("✅ Аутентификация успешна!");
                    setToken(access_token);
                } else {
                    throw new Error('Access token not found in response');
                }
            } catch (error) {
                console.error('Authentication failed:', error);
                setStatus('error');
            }
        }

    }, [launchParams, status, setTheme, setStatus, setToken]);

    if (status === 'forbidden') {
      return <ForbiddenScreen />;
    }

    if (status === 'loading') return <Loader />;
    if (status === 'unauthenticated' && process.env.NODE_ENV !== 'development') {
        // В продакшене неаутентифицированное состояние - это ошибка
        return <ErrorDisplay message="Не удалось аутентифицироваться." />;
    }
    if (status === 'error') return <ErrorDisplay message="Ошибка авторизации" />;
    
    // Показываем приложение, если аутентифицированы или в режиме разработки
    return <>{children}</>;
}