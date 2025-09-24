'use client';
// app/dashboard/stats/page.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiService } from '@/services/api';
import { SystemStats } from '@/types/api';

const StatsPage = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { hasRole } = useAuth();
    const { error: showError } = useToast();

    useEffect(() => {
        if (!hasRole('ADMIN')) {
            showError('Acesso Negado', 'Você não tem permissão para acessar esta página');
            return;
        }

        loadStats();
    }, [hasRole]);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getUserStats();
            setStats(response);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar as estatísticas');
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasRole('ADMIN')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
                    <p className="text-gray-500">
                        Você não tem permissão para acessar as estatísticas do sistema.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Não foi possível carregar as estatísticas
                    </h3>
                    <button
                        onClick={loadStats}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    const getPercentage = (value: number, total: number) => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Estatísticas do Sistema</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Visão geral dos dados do sistema de agendamento médico
                </p>
            </div>

            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total de Usuários
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalUsers}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <div className="text-xs text-gray-500">
                                                ({stats.totalActiveUsers} ativos)
                                            </div>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Médicos
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalDoctors}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <div className="text-xs text-gray-500">
                                                ({getPercentage(stats.totalDoctors, stats.totalUsers)}%)
                                            </div>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Pacientes
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalPatients}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <div className="text-xs text-gray-500">
                                                ({getPercentage(stats.totalPatients, stats.totalUsers)}%)
                                            </div>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Especialidades
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalSpecialties}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                            <div className="text-xs text-gray-500">
                                                ({stats.totalActiveSpecialties} ativas)
                                            </div>
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição por Função */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Distribuição por Função
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.usersByRole).map(([role, count]) => {
                                const percentage = getPercentage(count, stats.totalUsers);
                                const colors = {
                                    ADMIN: 'bg-red-500',
                                    DOCTOR: 'bg-blue-500',
                                    USER: 'bg-green-500',
                                    PATIENT: 'bg-purple-500',
                                };
                                const color = colors[role as keyof typeof colors] || 'bg-gray-500';

                                return (
                                    <div key={role} className="flex items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
                                                    <span className="font-medium text-gray-900">
                                                        {role === 'ADMIN' ? 'Administradores' :
                                                            role === 'DOCTOR' ? 'Médicos' :
                                                                role === 'USER' ? 'Usuários' :
                                                                    role === 'PATIENT' ? 'Pacientes' : role}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-500">{count}</span>
                                                    <span className="text-gray-400">({percentage}%)</span>
                                                </div>
                                            </div>
                                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`${color} h-2 rounded-full transition-all duration-300`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Status dos Usuários */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Status dos Usuários
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Usuários Ativos</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.totalActiveUsers}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-600">
                                        {getPercentage(stats.totalActiveUsers, stats.totalUsers)}%
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-sm font-medium text-red-900">Usuários Inativos</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.totalInactiveUsers}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-red-600">
                                        {getPercentage(stats.totalInactiveUsers, stats.totalUsers)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Especialidades</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalActiveSpecialties}</p>
                                    <p className="text-sm text-gray-500">Ativas</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalSpecialties - stats.totalActiveSpecialties}
                                    </p>
                                    <p className="text-sm text-gray-500">Inativas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumo Executivo */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Resumo Executivo
                    </h3>
                    <div className="prose text-sm text-gray-600">
                        <p className="mb-4">
                            O sistema atualmente possui <strong>{stats.totalUsers} usuários registrados</strong>,
                            sendo <strong>{stats.totalActiveUsers} ativos</strong> ({getPercentage(stats.totalActiveUsers, stats.totalUsers)}%)
                            e <strong>{stats.totalInactiveUsers} inativos</strong> ({getPercentage(stats.totalInactiveUsers, stats.totalUsers)}%).
                        </p>

                        <p className="mb-4">
                            A distribuição por função mostra <strong>{stats.totalDoctors} médicos</strong> ({getPercentage(stats.totalDoctors, stats.totalUsers)}%),
                            <strong>{stats.totalPatients} pacientes</strong> ({getPercentage(stats.totalPatients, stats.totalUsers)}%),
                            <strong>{stats.usersByRole.USER || 0} usuários administrativos</strong> e <strong>{stats.usersByRole.ADMIN || 0} administradores</strong>.
                        </p>

                        <p>
                            O sistema oferece <strong>{stats.totalSpecialties} especialidades médicas</strong>,
                            sendo <strong>{stats.totalActiveSpecialties} ativas</strong> e disponíveis para agendamentos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ações rápidas */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Ações Rápidas
                    </h3>
                    <div className="flex space-x-4">
                        <button
                            onClick={loadStats}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Atualizar Dados
                        </button>

                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar Relatório
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;