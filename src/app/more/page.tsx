// src/app/more/page.tsx
'use client';

import Link from 'next/link';
import { ChevronRight, Settings, Send, Trash2 } from 'lucide-react';

const menuItems = [
  {
    href: '/more/broadcasts',
    icon: Send,
    title: 'Массовые рассылки',
    description: 'Отправка сообщений пользователям',
  },
  {
    href: '/more/settings',
    icon: Settings,
    title: 'Настройки',
    description: 'Просмотр параметров и управление кешем',
  },
];

export default function MorePage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Прочее</h1>
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <item.icon className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}