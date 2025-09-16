// src/components/dashboard/StatCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

/**
 * Карточка для отображения одной метрики на дашборде.
 */
export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Скелетон-версия карточки для состояния загрузки.
 */
export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-6 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );
}