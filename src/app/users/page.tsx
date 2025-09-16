// src/app/users/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'; // <-- 1. Импортируем useRouter

import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getUsers } from '@/services/userService';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertCircle, Search } from 'lucide-react';

// Создаем клиент для TanStack Query.
// Хорошая практика - создавать его один раз.
const queryClient = new QueryClient();

// Компонент-обертка с провайдером. Это точка входа для этой страницы.
export default function UsersPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>
  );
}

// Основной компонент страницы со всей логикой
function UsersPage() {
  const router = useRouter(); // <-- 2. Получаем экземпляр роутера
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Используем useQuery для получения и кеширования данных
  const { data, isLoading, isError, error } = useQuery({
    // Ключ запроса уникален для каждой страницы и поискового запроса.
    // TanStack Query автоматически перезапросит данные, когда ключ изменится.
    queryKey: ['adminUsers', page, debouncedSearchTerm],
    queryFn: () => getUsers({ page, search: debouncedSearchTerm }),
  });

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    // Убеждаемся, что `data` существует перед тем, как читать из него
    if (data && page < data.total_pages) {
      setPage((prev) => prev + 1);
    }
  };
  
  // Функция для перехода на страницу пользователя
  const handleUserClick = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  // --- Рендеринг различных состояний ---

  // 1. Состояние загрузки
  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  // 2. Состояние ошибки
  if (isError) {
    return (
      <div className="container mx-auto p-4 text-center text-destructive">
        <AlertCircle className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Ошибка загрузки</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  // 3. Основное состояние с данными
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Пользователи</h1>

      {/* Поле поиска */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, ID, username..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Сбрасываем на первую страницу при новом поиске
          }}
          className="pl-10"
        />
      </div>

      {/* Таблица пользователей */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead className="hidden sm:table-cell">Уровень</TableHead>
              <TableHead className="hidden md:table-cell">Статус</TableHead>
              <TableHead>Дата регистрации</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.items.length > 0 ? (
              data.items.map((user) => (
                <TableRow
                  key={user.id}
                  onClick={() => handleUserClick(user.id)} // <-- 3. Добавляем обработчик клика
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="font-medium">{user.display_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.username ? `@${user.username}` : `TG ID: ${user.telegram_id}`}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{user.level}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={user.is_blocked ? 'destructive' : 'outline'}>
                      {user.is_blocked ? 'Заблокирован' : 'Активен'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Пользователи не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {data && data.total_pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="p-2 text-sm font-medium">
                Страница {data.current_page} из {data.total_pages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                aria-disabled={page === data.total_pages}
                className={page === data.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

// Отдельный компонент для скелетона таблицы для чистоты кода
function UsersTableSkeleton() {
  const skeletonRows = Array.from({ length: 7 }); // Создаем массив для 7 строк скелетона

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-full" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead className="hidden sm:table-cell"><Skeleton className="h-5 w-16" /></TableHead>
              <TableHead className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}