// src/app/more/broadcasts/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { createBroadcast } from '@/services/adminService';
import { ArrowLeft, Send } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const queryClient = new QueryClient();

export default function BroadcastPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <BroadcastPage />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

function BroadcastPage() {
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const [targetLevel, setTargetLevel] = useState('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const broadcastMutation = useMutation({
    mutationFn: createBroadcast,
    onSuccess: () => {
      toast.success("Рассылка успешно запущена!", {
        description: "Сообщения будут доставлены в фоновом режиме."
      });
      setMessageText('');
      setTargetLevel('all');
    },
    onError: (error) => {
      toast.error("Ошибка", { description: error.message });
    },
  });

  const handleSubmit = () => {
    if (messageText.trim().length < 10) {
      toast.error("Ошибка валидации", { description: "Сообщение должно содержать не менее 10 символов." });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    broadcastMutation.mutate({ messageText, targetLevel });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Новая рассылка</h1>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div>
            <Label htmlFor="message">Текст сообщения</Label><br />
            <Textarea
              id="message"
              placeholder="Введите сообщение для пользователей..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={8}
            />
          </div>
          <div>
            <Label htmlFor="target">Аудитория</Label> <br />
            <Select value={targetLevel} onValueChange={setTargetLevel}>
              <SelectTrigger id="target">
                <SelectValue placeholder="Выберите аудиторию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={broadcastMutation.isPending} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {broadcastMutation.isPending ? "Запуск..." : "Запустить рассылку"}
          </Button>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Подтвердите действие</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            Вы уверены, что хотите запустить рассылку для аудитории "{targetLevel}"? Это действие нельзя отменить.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Подтвердить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}