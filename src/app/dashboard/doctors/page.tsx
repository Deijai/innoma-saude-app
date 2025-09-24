'use client';
// app/dashboard/doctors/page.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiService } from '@/services/api';
import { User, UserFilters, PaginatedResponse, Specialty } from '@/types/api';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState<PaginatedResponse<User> | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<UserFilters>({
        page: 1,
        limit: 12,
        roles: ['DOCTOR'],
        isActive: true,
    });

    const { hasRole } = useAuth();
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadDoctors();
    }, [filters]);

    const loadInitialData = async () => {
        try {
            // Carregar especialidades para o filtro
            const specialtiesResponse = await apiService.getSpecialties({
                page: 1,
                limit: 100,
                isActive: true
            });
            setSpecialties(specialtiesResponse.data);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar as especialidades');
        }
    };

    const loadDoctors = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getUsers(filters);
            setDoctors(response);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar os médicos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDoctor = (doctor: User) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleFilterChange = (newFilters: Partial<UserFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const getSpecialtyName = (specialtyId: string) => {
        const specialty = specialties.find(s => s.id === specialtyId);
        return specialty?.name || 'Especialidade não encontrada';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Encontre médicos por especialidade
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                            Buscar médico
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Nome ou CRM..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                            Especialidade
                        </label>
                        <select
                            id="specialty"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.specialties?.[0] || ''}
                            onChange={(e) => handleFilterChange({
                                specialties: e.target.value ? [e.target.value] : undefined
                            })}
                        >
                            <option value="">Todas as especialidades</option>
                            {specialties.map((specialty) => (
                                <option key={specialty.id} value={specialty.id}>
                                    {specialty.name}
                                </option>
                            ))}
                        </select>
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
                            <option value="">Todos</option>
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
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
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid de Médicos */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {doctors?.total || 0} médicos encontrados
                            </h3>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {doctors?.data.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleViewDoctor(doctor)}
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-lg font-medium text-white">
                                                        {doctor.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {doctor.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        CRM: {doctor.crm || 'Não informado'}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doctor.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {doctor.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {doctor.email}
                                                </div>

                                                {doctor.phone && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {doctor.phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                                    Especialidades:
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {doctor.specialties && doctor.specialties.length > 0 ? (
                                                        doctor.specialties.map((specialty, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {specialty.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">
                                                            Nenhuma especialidade cadastrada
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {doctors?.data.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Nenhum médico encontrado
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tente ajustar os filtros de busca
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Paginação */}
                        {doctors && doctors.totalPages > 1 && (
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
                                        disabled={(filters.page || 1) >= doctors.totalPages}
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
                                                {((filters.page || 1) - 1) * (filters.limit || 12) + 1}
                                            </span>{' '}
                                            até{' '}
                                            <span className="font-medium">
                                                {Math.min((filters.page || 1) * (filters.limit || 12), doctors.total)}
                                            </span>{' '}
                                            de{' '}
                                            <span className="font-medium">{doctors.total}</span> resultados
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

                                            {Array.from({ length: Math.min(5, doctors.totalPages) }, (_, i) => {
                                                const pageNum = i + Math.max(1, (filters.page || 1) - 2);
                                                if (pageNum > doctors.totalPages) return null;
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
                                                disabled={(filters.page || 1) >= doctors.totalPages}
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

            {/* Modal de Detalhes do Médico */}
            {isModalOpen && selectedDoctor && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-lg font-medium text-white">
                                            {selectedDoctor.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                                            {selectedDoctor.name}
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <strong>Email:</strong> {selectedDoctor.email}
                                            </p>
                                            {selectedDoctor.phone && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Telefone:</strong> {selectedDoctor.phone}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                                <strong>CRM:</strong> {selectedDoctor.crm || 'Não informado'}
                                            </p>
                                            <div className="mt-4">
                                                <strong className="text-sm text-gray-900">Especialidades:</strong>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {selectedDoctor.specialties && selectedDoctor.specialties.length > 0 ? (
                                                        selectedDoctor.specialties.map((specialty, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {specialty.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">
                                                            Nenhuma especialidade cadastrada
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;