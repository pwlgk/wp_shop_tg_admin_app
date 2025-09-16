// src/components/ClientProviders.tsx
'use client'; // <-- Самая важная строка!

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TabBar } from '@/components/navigation/TabBar';

// 1. Динамически импортируем TmaProvider с отключенным SSR
const TmaProvider = dynamic(() =>
    import('@/components/TmaProvider').then((mod) => mod.TmaProvider),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black text-black dark:text-white">
                Загрузка приложения...
            </div>
        ),
    }
);

/**
 * Этот компонент является "клиентской точкой входа".
 * Он оборачивает дочерние элементы во все провайдеры,
 * которые должны работать только на клиенте.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TmaProvider>
                <main className="pb-16">{children}</main>
                <TabBar />
            </TmaProvider>
        </ThemeProvider>
    );
}