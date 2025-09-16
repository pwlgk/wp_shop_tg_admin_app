// src/components/fullscreen-loader.tsx
'use client';

import { Loader2 } from 'lucide-react';

/**
 * Полноэкранный компонент-заглушка для отображения состояния загрузки.
 * Центрирует анимированную иконку и текст.
 * Использует семантические цвета из shadcn/ui для поддержки тем.
 */
export function FullscreenLoader({ text = "Загрузка..." }: { text?: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="mt-4 text-muted-foreground">{text}</p>}
    </div>
  );
}