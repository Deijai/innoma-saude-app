'use client';
// app/providers.tsx
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toasts, removeToast } = useToast();

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
};

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AuthProvider>
    );
};