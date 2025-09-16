// src/hooks/use-telegram-back-button.ts
'use client';

import { useBackButton } from '@tma.js/sdk-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

/**
 * Управляет нативной кнопкой "Назад" в Telegram.
 * Показывает кнопку на всех страницах, кроме главной ('/').
 * При клике выполняет навигацию назад.
 */
export function useManageTelegramBackButton() {
  const backButton = useBackButton();
  const router = useRouter();
  const pathname = usePathname();

  // Определяем, должна ли кнопка быть видимой.
  // Она видна везде, кроме главной страницы.
  const shouldBeVisible = useMemo(() => pathname !== '/', [pathname]);

  useEffect(() => {
    const handleBackClick = () => {
      router.back();
    };

    if (shouldBeVisible) {
      // Показываем кнопку и вешаем обработчик
      backButton.show();
      backButton.on('click', handleBackClick);
    } else {
      // Скрываем кнопку
      backButton.hide();
    }

    // Важно: очищаем обработчик при размонтировании компонента
    // или при изменении shouldBeVisible, чтобы избежать утечек памяти.
    return () => {
      backButton.off('click', handleBackClick);
    };
  }, [shouldBeVisible, backButton, router]);
}