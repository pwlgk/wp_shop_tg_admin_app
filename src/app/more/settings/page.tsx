// src/app/more/settings/page.tsx
'use client';

import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getShopSettings, clearServerCache } from '@/services/adminService';
import { ArrowLeft, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { ShopSettings } from '@/types/settings';

const queryClient = new QueryClient();

export default function SettingsPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsPage />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

function SettingsPage() {
  const router = useRouter();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [cacheTarget, setCacheTarget] = useState<'all' | 'settings' | 'catalog' | null>(null);

  const { data: settings, isLoading, isError, error } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: getShopSettings,
  });
  
  const clearCacheMutation = useMutation({
    mutationFn: clearServerCache,
    onSuccess: (data, variables) => {
      toast.success(`Кеш "${variables}" успешно очищен!`);
    },
    onError: (error) => {
      toast.error("Ошибка", { description: error.message });
    },
    onSettled: () => {
      setIsAlertOpen(false);
      setCacheTarget(null);
    }
  });

  const handleClearCacheClick = (target: 'all' | 'settings' | 'catalog') => {
    setCacheTarget(target);
    setIsAlertOpen(true);
  };
  
  const handleConfirmClearCache = () => {
    if (cacheTarget) {
      clearCacheMutation.mutate(cacheTarget);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Настройки</h1>
        </div>

        {/* Блок настроек магазина */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Параметры магазина</h2>
            <div className="rounded-lg border bg-card p-4 space-y-2">
                {isLoading && <SettingsSkeleton />}
                {isError && <p className="text-destructive">{error.message}</p>}
                {settings && <SettingsList settings={settings} />}
            </div>
        </div>
        
        {/* Блок управления кешем */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Управление кешем</h2>
            <div className="rounded-lg border bg-card p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleClearCacheClick('catalog')}><Trash2 className="mr-2 h-4 w-4" />Очистить кеш каталога</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleClearCacheClick('settings')}><Trash2 className="mr-2 h-4 w-4" />Очистить кеш настроек</Button>
                <Button variant="destructive" className="w-full justify-start" onClick={() => handleClearCacheClick('all')}><AlertCircle className="mr-2 h-4 w-4" />Очистить весь кеш</Button>
            </div>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтвердите действие</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Вы уверены, что хотите очистить кеш "{cacheTarget}"? Это действие может временно замедлить работу приложения.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearCache} disabled={clearCacheMutation.isPending}>
              {clearCacheMutation.isPending ? 'Очистка...' : 'Подтвердить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SettingsList({ settings }: { settings: ShopSettings }) {
  const settingsMap = {
    "Мин. сумма заказа": `${settings.min_order_amount} ₽`,
    "Приветственный бонус": `${settings.welcome_bonus_amount} баллов`,
    "Активность приветственного бонуса": settings.is_welcome_bonus_active ? "Включен" : "Выключен",
    "Макс. % оплаты баллами": `${settings.max_points_payment_percentage}%`,
    "Бонус за реферала": `${settings.referrer_bonus} баллов`,
    "Приветственный бонус рефералу": `${settings.referral_welcome_bonus} баллов`,
    "Бонус на день рождения": `${settings.birthday_bonus_amount} баллов`,
  };

  return (
    <div className="text-sm space-y-2">
        {Object.entries(settingsMap).map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
            </div>
        ))}
    </div>
  );
}

function SettingsSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({length: 7}).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
    );
}