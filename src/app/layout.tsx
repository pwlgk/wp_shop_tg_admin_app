// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders'; // <-- Импортируем наш новый компонент

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Admin Panel',
    description: 'Telegram Mini App Admin Panel',
};

// layout.tsx остается Серверным компонентом
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                {/* Вся клиентская логика теперь инкапсулирована здесь */}
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}