// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Хук для "дебаунсинга" значения. Полезен для полей ввода,
 * чтобы избежать частых вызовов API.
 * @param value - Значение для дебаунсинга.
 * @param delay - Задержка в миллисекундах.
 * @returns "Отложенное" значение.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймаут при размонтировании или изменении значения/задержки
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}