// src/components/ForbiddenScreen.tsx
'use client';

import { ShieldAlert } from 'lucide-react';

export function ForbiddenScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="mt-6 text-2xl font-bold">Доступ запрещен</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        У вас нет прав для доступа к этой панели администратора. Обратитесь к системному администратору.
      </p>
    </div>
  );
}