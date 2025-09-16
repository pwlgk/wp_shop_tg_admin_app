// src/app/users/[id]/page.tsx
'use client';

import { useState, type ChangeEvent } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

// Сервисы и типы
import { getUserById, sendMessageToUser, blockUser, unblockUser, adjustUserPoints } from '@/services/userService';
import { AdminUserDetails } from '@/types/user';

// UI компоненты
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';

// Иконки
import { AlertCircle, ArrowLeft, Bot, Mail, MessageSquare, Send, User, Ban, ShieldCheck, Bell, Gift, UserCheck, UserX } from 'lucide-react';

// Создаем клиент для TanStack Query
const queryClient = new QueryClient();

// Компонент-обертка с провайдером. Это точка входа для этой страницы.
export default function UserProfilePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfilePage />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

// Основной компонент страницы
function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 text-center text-destructive">
        <AlertCircle className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Ошибка</h2>
        <p>{error.message}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-center">Пользователь не найден.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <UserProfileCard user={user} />
    </div>
  );
}

// Компонент карточки пользователя со всей логикой
function UserProfileCard({ user }: { user: AdminUserDetails }) {
  const queryClient = useQueryClient();

  // Состояния для модальных окон
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [isBlockAlertOpen, setIsBlockAlertOpen] = useState(false);
  const [isUnblockAlertOpen, setIsUnblockAlertOpen] = useState(false);

  // Состояния для форм
  const [messageText, setMessageText] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsComment, setPointsComment] = useState('');

  // --- МУТАЦИИ ДЛЯ ВСЕХ ДЕЙСТВИЙ ---

  const sendMessageMutation = useMutation({
    mutationFn: sendMessageToUser,
    onSuccess: () => {
      toast.success("Успех!", { description: "Сообщение успешно отправлено." });
      setIsNotifyDialogOpen(false);
      setMessageText('');
    },
    onError: (error) => toast.error("Ошибка отправки", { description: error.message }),
  });

  const blockUserMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      toast.success("Успех!", { description: "Пользователь заблокирован." });
      
      const queryKey = ['adminUser', String(user.id)];
      
      queryClient.setQueryData(queryKey, (oldData: AdminUserDetails | undefined) => {
        if (!oldData) return undefined;
        return { ...oldData, is_blocked: true };
      });
      queryClient.invalidateQueries({ queryKey });

      setIsBlockAlertOpen(false);
    },
    onError: (error) => toast.error("Ошибка блокировки", { description: error.message }),
  });

  const unblockUserMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      toast.success("Успех!", { description: "Пользователь разблокирован." });

      const queryKey = ['adminUser', String(user.id)];

      queryClient.setQueryData(queryKey, (oldData: AdminUserDetails | undefined) => {
        if (!oldData) return undefined;
        return { ...oldData, is_blocked: false };
      });
      queryClient.invalidateQueries({ queryKey });
      
      setIsUnblockAlertOpen(false);
    },
    onError: (error) => toast.error("Ошибка разблокировки", { description: error.message }),
  });

  const adjustPointsMutation = useMutation({
    mutationFn: adjustUserPoints,
    onSuccess: () => {
      toast.success("Успех!", { description: "Баланс пользователя успешно изменен." });
      queryClient.invalidateQueries({ queryKey: ['adminUser', String(user.id)] });
      setIsPointsDialogOpen(false);
      setPointsAmount('');
      setPointsComment('');
    },
    onError: (error) => toast.error("Ошибка изменения баланса", { description: error.message }),
  });

  // --- ОБРАБОТЧИКИ ОТПРАВКИ ФОРМ ---
  const handleSendMessage = () => {
    if (messageText.trim().length === 0) {
      toast.error("Ошибка", { description: "Текст сообщения не может быть пустым." });
      return;
    }
    sendMessageMutation.mutate({ userId: user.id, messageText });
  };

  const handleAdjustPoints = () => {
    const points = parseInt(pointsAmount, 10);
    if (isNaN(points) || points === 0) {
      toast.error("Ошибка", { description: "Количество баллов должно быть числом, не равным нулю." });
      return;
    }
    if (pointsComment.trim().length < 3) {
      toast.error("Ошибка", { description: "Комментарий должен содержать хотя бы 3 символа." });
      return;
    }
    adjustPointsMutation.mutate({ userId: user.id, points, comment: pointsComment });
  };

  const registrationDate = new Date(user.created_at).toLocaleDateString('ru-RU');
  const telegramUserLink = `tg://user?id=${user.telegram_id}`;

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {user.display_name}
          </h2>
          {user.username && <p className="text-sm text-muted-foreground ml-7">@{user.username}</p>}
          <p className="text-sm text-muted-foreground ml-7">Telegram ID: {user.telegram_id}</p>
        </div>
        
        <div className="space-y-2 text-sm pt-4 border-t">
          <InfoRow icon={Mail} label="Email" value={user.email || 'Не указан'} />
          <InfoRow icon={ShieldCheck} label="Уровень" value={<Badge variant="secondary">{user.level}</Badge>} />
          <InfoRow icon={Bot} label="Доступ к боту" value={<Badge variant={user.bot_accessible ? 'default' : 'destructive'}>{user.bot_accessible ? 'Есть' : 'Нет'}</Badge>} />
          <InfoRow icon={Ban} label="Статус" value={<Badge variant={user.is_blocked ? 'destructive' : 'outline'}>{user.is_blocked ? 'Заблокирован' : 'Активен'}</Badge>} />
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Зарегистрирован: {registrationDate} (WP ID: {user.wordpress_id})
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t">
          <a href={telegramUserLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full" variant="outline"><MessageSquare className="mr-2 h-4 w-4" />Открыть чат</Button>
          </a>
          <Button className="w-full" variant="outline" onClick={() => setIsNotifyDialogOpen(true)}><Bell className="mr-2 h-4 w-4" />Уведомление</Button>
          <Button className="w-full" variant="outline" onClick={() => setIsPointsDialogOpen(true)}><Gift className="mr-2 h-4 w-4" />Изменить баланс</Button>
          
          {user.is_blocked ? (
            <Button className="w-full" onClick={() => setIsUnblockAlertOpen(true)}><UserCheck className="mr-2 h-4 w-4" />Разблокировать</Button>
          ) : (
            <Button className="w-full" variant="destructive" onClick={() => setIsBlockAlertOpen(true)}><UserX className="mr-2 h-4 w-4" />Заблокировать</Button>
          )}
        </div>
      </div>
      
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить уведомление</DialogTitle>
            <DialogDescription>Пользователь получит это сообщение от вашего бота.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Введите текст сообщения..."
              value={messageText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessageText(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNotifyDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending}>
              {sendMessageMutation.isPending ? 'Отправка...' : <><Send className="mr-2 h-4 w-4" /> Отправить</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPointsDialogOpen} onOpenChange={setIsPointsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Изменить баланс баллов</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="points">Количество баллов</Label>
              <Input
                id="points"
                type="number"
                placeholder="Например, 100 или -50"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Используйте отрицательное число для списания.</p>
            </div>
            <div>
              <Label htmlFor="comment">Причина / Комментарий</Label>
              <Textarea
                id="comment"
                placeholder="Например, 'Бонус за участие в конкурсе'"
                value={pointsComment}
                onChange={(e) => setPointsComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPointsDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAdjustPoints} disabled={adjustPointsMutation.isPending}>
              {adjustPointsMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isBlockAlertOpen} onOpenChange={setIsBlockAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтвердите действие</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Вы уверены, что хотите заблокировать пользователя "{user.display_name}"? Он не сможет пользоваться ботом.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => blockUserMutation.mutate(user.id)} disabled={blockUserMutation.isPending}>
              {blockUserMutation.isPending ? 'Блокировка...' : 'Заблокировать'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isUnblockAlertOpen} onOpenChange={setIsUnblockAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтвердите действие</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Вы уверены, что хотите разблокировать пользователя "{user.display_name}"?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => unblockUserMutation.mutate(user.id)} disabled={unblockUserMutation.isPending}>
              {unblockUserMutation.isPending ? 'Разблокировка...' : 'Разблокировать'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
// Вспомогательный компонент для строк с информацией
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="flex items-center gap-2 text-muted-foreground"><Icon className="w-4 h-4" />{label}</span>
            <span className="text-right">{value}</span>
        </div>
    );
}

// Скелетон для страницы профиля
function UserProfileSkeleton() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
        <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="space-y-3 pt-4 border-t">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
            </div>
            <div className="pt-2 border-t">
                <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
  );
}