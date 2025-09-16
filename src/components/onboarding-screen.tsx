// src/components/onboarding-screen.tsx
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket } from "lucide-react";

/**
 * Экран-заглушка для онбординга нового администратора.
 * В будущем здесь можно будет запрашивать начальные настройки.
 */
export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Rocket className="mb-4 h-12 w-12 text-primary" />
          <CardTitle>Добро пожаловать!</CardTitle>
          <CardDescription>
            Это панель администратора для вашего Telegram-магазина.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Вы готовы приступить к работе и управлять пользователями, заказами и рассылками.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onComplete}>
            Начать работу
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}