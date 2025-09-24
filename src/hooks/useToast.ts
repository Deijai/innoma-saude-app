// hooks/useToast.ts
import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((
        type: ToastType,
        title: string,
        message?: string,
        duration = 5000
    ) => {
        const id = (++toastId).toString();
        const toast: Toast = {
            id,
            type,
            title,
            message,
            duration,
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('success', title, message, duration);
    }, [addToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('error', title, message, duration);
    }, [addToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('warning', title, message, duration);
    }, [addToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        return addToast('info', title, message, duration);
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };
};