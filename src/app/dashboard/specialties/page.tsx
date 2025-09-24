'use client';
// app/dashboard/specialties/page.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiService } from '@/services/api';
import { Specialty, SpecialtyFilters, PaginatedResponse } from '@/types/api';

const SpecialtiesPage = () => {
    const [specialties, setSpecialties] = useState<PaginatedResponse<Specialty> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<SpecialtyFilters>({
        page: 1,
        limit: 10,
        isActive: true,
    });

    const { hasRole } = useAuth();
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadSpecialties();
    }, [filters]);

    const loadSpecialties = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getSpecialties(filters);
            setSpecialties(response);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar as especialidades');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (specialty: Specialty) => {
        if (!hasRole('ADMIN')) {
            showError('Erro', 'Você não tem permissão para deletar especialidades');
            return;
        }

        if (window.confirm(`Tem certeza que deseja deletar a especialidade ${specialty.name}?`)) {
            try {
                await apiService.deleteSpecialty(specialty.id);
                success('Especialidade deletada com sucesso!');
                loadSpecialties();
            } catch (error: any) {
                showError('Erro', error.message || 'Não foi possível deletar a especialidade');
            }
        }
    };

    const handleEdit = (specialty: Specialty) => {
        setSelectedSpecialty(specialty);
        setIsModalOpen(true);
    };

    const handleFilterChange = (newFilters: Partial<SpecialtyFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Especialidades</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Gerencie as especialidades médicas do sistema
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    {hasRole('ADMIN') && (
                        <button
                            onClick={() => {
                                setSelectedSpecialty(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nova Especialidade
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                            Buscar
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Nome ou descrição..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                            onChange={(e) => handleFilterChange({
                                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                            })}
                        >
                            <option value="">Todas</option>
                            <option value="true">Ativas</option>
                            <option value="false">Inativas</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
                            Por página
                        </label>
                        <select
                            id="limit"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.limit}
                            onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Cards de Especialidades */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {specialties?.total || 0} especialidades encontradas
                            </h3>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {specialties?.data.map((specialty) => (
                                    <div
                                        key={specialty.id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                                {specialty.name}
                                                            </h3>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${specialty.isActive
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {specialty.isActive ? 'Ativa' : 'Inativa'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="mt-3 text-sm text-gray-600">
                                                        {specialty.description || 'Sem descrição'}
                                                    </p>

                                                    <div className="mt-4 text-xs text-gray-500">
                                                        Criada em {formatDate(specialty.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            {hasRole('ADMIN') && (
                                                <div className="mt-6 flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(specialty)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(specialty)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Deletar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {specialties?.data.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Nenhuma especialidade encontrada
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tente ajustar os filtros de busca
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Paginação */}
                        {specialties && specialties.totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
                                        disabled={(filters.page || 1) <= 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                                        disabled={(filters.page || 1) >= specialties.totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando{' '}
                                            <span className="font-medium">
                                                {((filters.page || 1) - 1) * (filters.limit || 10) + 1}
                                            </span>{' '}
                                            até{' '}
                                            <span className="font-medium">
                                                {Math.min((filters.page || 1) * (filters.limit || 10), specialties.total)}
                                            </span>{' '}
                                            de{' '}
                                            <span className="font-medium">{specialties.total}</span> resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
                                                disabled={(filters.page || 1) <= 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Anterior</span>
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {Array.from({ length: Math.min(5, specialties.totalPages) }, (_, i) => {
                                                const pageNum = i + Math.max(1, (filters.page || 1) - 2);
                                                if (pageNum > specialties.totalPages) return null;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handleFilterChange({ page: pageNum })}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === (filters.page || 1)
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                                                disabled={(filters.page || 1) >= specialties.totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Próxima</span>
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SpecialtiesPage;