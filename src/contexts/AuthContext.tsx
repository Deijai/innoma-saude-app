'use client';
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { User, UserRole, LoginData } from '@/types/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginData) => Promise<void>;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
    hasAnyRole: (roles: UserRole[]) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    const hasRole = (role: UserRole): boolean => {
        return user?.roles?.includes(role) ?? false;
    };

    const hasAnyRole = (roles: UserRole[]): boolean => {
        return roles.some(role => hasRole(role));
    };

    const login = async (data: LoginData) => {
        try {
            const response = await apiService.login(data);
            apiService.setToken(response.token);

            // Buscar dados completos do usuário
            const authData = await apiService.getAuthUsers();
            setUser(authData.user);
        } catch (error) {
            apiService.removeToken();
            throw error;
        }
    };

    const logout = () => {
        apiService.removeToken();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const authData = await apiService.getAuthUsers();
            setUser(authData.user);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            logout();
        }
    };

    const loadUser = async () => {
        try {
            setIsLoading(true);

            // Verificar se há token salvo
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            // Buscar dados do usuário
            const authData = await apiService.getAuthUsers();
            setUser(authData.user);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            apiService.removeToken();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasAnyRole,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};