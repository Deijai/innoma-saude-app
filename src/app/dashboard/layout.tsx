'use client';
// app/dashboard/layout.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardLayoutPage({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Mostrar loading enquanto verifica autenticação
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">
                        Carregando...
                    </h2>
                </div>
            </div>
        );
    }

    // Se não estiver autenticado, não mostrar nada (vai redirecionar)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}