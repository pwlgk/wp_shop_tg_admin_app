// src/app/page.tsx
'use client';

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatCard, StatCardSkeleton } from '@/components/dashboard/StatCard';
import { getDashboardStats } from '@/services/dashboardService';
import { Users, ShoppingCart, TrendingUp, DollarSign, AlertCircle, Search, Send } from 'lucide-react';

const queryClient = new QueryClient();

export default function DashboardPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>
  );
}

function DashboardPage() {
  const router = useRouter();
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getDashboardStats,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8 text-center text-destructive">
          <AlertCircle className="h-12 w-12" />
          <h2 className="mt-4 text-xl font-semibold">Ошибка загрузки</h2>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }

    if (data) {
      // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
      // Теперь мы используем правильные имена полей из API
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Всего пользователей"
            value={data.total_users_count}
            icon={<Users className="h-4 w-4" />}
            description="Общее количество в системе"
          />
          <StatCard
            title="Новые за сегодня"
            value={`+${data.new_users_today_count}`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Новые регистрации"
          />
          <StatCard
            title="Заказы в обработке"
            value={data.processing_orders_count}
            icon={<ShoppingCart className="h-4 w-4" />}
            description={`+${data.new_orders_count} новых`}
          />
          <StatCard
            title="Продажи за сегодня"
            value={`${data.sales_today.toLocaleString('ru-RU')} ₽`}
            icon={<DollarSign className="h-4 w-4" />}
            description="Сумма завершенных заказов"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Панель управления</h1>
        <p className="text-sm text-muted-foreground">
          {/* ИСПРАВЛЕНИЕ: Проверяем data.last_updated */}
          {data?.last_updated ? `Обновлено: ${new Date(data.last_updated).toLocaleString('ru-RU')}` : <>&nbsp;</>}
        </p>
      </div>

      {/* Блок со статистикой */}
      {renderContent()}

      {/* Блок быстрых действий (без изменений) */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" size="lg" onClick={() => router.push('/users')}>
            <Search className="mr-2 h-5 w-5" />
            Найти пользователя
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/more/broadcasts')}>
            <Send className="mr-2 h-5 w-5" />
            Создать рассылку
          </Button>
        </div>
      </div>
    </div>
  );
}