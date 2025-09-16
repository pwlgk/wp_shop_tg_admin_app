// src/components/navigation/TabBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/users', label: 'Пользователи', icon: Users },
  { href: '/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/more', label: 'Прочее', icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 ${
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}