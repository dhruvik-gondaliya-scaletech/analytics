"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { AUTH_STORAGE_KEYS, FRONTEND_ROUTES } from '@/lib/constants';
import { setStorageItem } from '@/lib/storage';

export function LoginContainer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (apiKey: string) => {
    setIsLoading(true);
    
    // Simulate a brief API call/validation delay
    setTimeout(() => {
      setStorageItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, apiKey);
      setIsLoading(false);
      router.push(FRONTEND_ROUTES.DASHBOARD || '/dashboard');
    }, 800);
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
