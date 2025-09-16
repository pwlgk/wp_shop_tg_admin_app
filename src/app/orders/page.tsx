// src/app/orders/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAdminOrders } from '@/services/orderService';
import { useDebounce } from '@/hooks/useDebounce';
import { AlertCircle, Search, SlidersHorizontal, User } from 'lucide-react';
import { AdminOrderListItem } from '@/types/order';

const queryClient = new QueryClient();

export default function OrdersPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersPage />
    </QueryClientProvider>
  );
}

// Словарь для отображения статусов на русском языке
const statusTranslations: { [key: string]: string } = {
  pending: "Ожидает оплаты",
  processing: "В обработке",
  'on-hold': "На удержании",
  completed: "Выполнен",
  cancelled: "Отменен",
  refunded: "Возвращен",
  failed: "Не удался",
};

// Цвета для статусов
const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    pending: "outline",
    processing: "default",
    'on-hold': "secondary",
    completed: "secondary",
    cancelled: "destructive",
    refunded: "destructive",
    failed: "destructive",
};

function OrdersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminOrders', page, debouncedSearchTerm, statusFilter],
    queryFn: () => getAdminOrders({ page, search: debouncedSearchTerm, status: statusFilter }),
  });

  const handlePageChange = (newPage: number) => {
    if (data && newPage > 0 && newPage <= data.total_pages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setPage(1); // Сбрасываем на первую страницу при смене фильтра
    setStatusFilter(newStatus === 'all' ? '' : newStatus);
  };

  if (isLoading) {
    return <OrdersTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 text-center text-destructive">
        <AlertCircle className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Ошибка загрузки</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Заказы</h1>
      
      {/* Блок фильтров (без изменений) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру, имени..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <Select onValueChange={handleFilterChange} defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает оплаты</SelectItem>
                <SelectItem value="processing">В обработке</SelectItem>
                <SelectItem value="on-hold">На удержании</SelectItem>
                <SelectItem value="completed">Выполнен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      <div className="rounded-md border">
        {/* --- ИЗМЕНЕНИЕ: Добавляем 'table-fixed' для лучшего контроля ширины колонок --- */}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              {/* --- ИЗМЕНЕНИЕ: Явно задаем ширину колонок --- */}
              <TableHead className="w-[50%] sm:w-[45%]">Заказ</TableHead>
              <TableHead className="w-[30%] sm:w-[35%]">Клиент</TableHead>
              <TableHead className="w-[20%] text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.items.length > 0 ? (
              data.items.map((order: AdminOrderListItem) => (
                <TableRow key={order.id}>
                  <TableCell className="align-top">
                    <div className="font-medium text-primary">#{order.number}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_date).toLocaleString('ru-RU')}
                    </div>
                    
                    {/* --- ИЗМЕНЕНИЕ: Разбиваем строку состава заказа на отдельные элементы --- */}
                    <div className="text-xs mt-2 space-y-1 break-words">
                      {order.items_summary.split(', ').map((item, index) => (
                        <div key={index}>{item}</div>
                      ))}
                    </div>

                    <Badge variant={statusColors[order.status] || 'outline'} className="mt-2">
                        {statusTranslations[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <Link
                      href={`/users/${order.customer_telegram_id}`}
                      className="inline-flex items-start gap-2 font-medium text-primary hover:underline"
                    >
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{order.customer_display_name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono align-top">
                    {parseFloat(order.total).toLocaleString('ru-RU')} ₽
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Заказы не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total_pages > 1 && (
        <Pagination>
          {/* ... блок пагинации без изменений ... */}
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(page - 1)} aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationItem>
            <span className="p-2 text-sm font-medium">Стр. {data.current_page} из {data.total_pages}</span>
            <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(page + 1)} aria-disabled={page === data.total_pages} className={page === data.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-4 animate-pulse">
      <Skeleton className="h-10 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-grow" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%] sm:w-[45%]"><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead className="w-[30%] sm:w-[35%]"><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead className="w-[20%] text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                    {/* --- ИЗМЕНЕНИЕ: Скелетон теперь выше и имитирует несколько строк --- */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-full mt-2" />
                        <Skeleton className="h-3 w-4/5" />
                        <Skeleton className="h-5 w-24 mt-1" />
                    </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}