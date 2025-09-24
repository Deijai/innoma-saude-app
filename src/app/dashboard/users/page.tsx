'use client';
// app/dashboard/users/page.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiService } from '@/services/api';
import { User, UserFilters, PaginatedResponse, UserRole } from '@/types/api';
import UserModal from '@/components/modals/UserModal';

const UsersPage = () => {
    const [users, setUsers] = useState<PaginatedResponse<User> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState<UserFilters>({
        page: 1,
        limit: 10,
    });

    const { hasRole } = useAuth();
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getUsers(filters);
            setUsers(response);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar os usuários');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (!hasRole('ADMIN')) {
            showError('Erro', 'Você não tem permissão para deletar usuários');
            return;
        }

        if (window.confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
            try {
                await apiService.deleteUser(user.id);
                success('Usuário deletado com sucesso!');
                loadUsers();
            } catch (error: any) {
                showError('Erro', error.message || 'Não foi possível deletar o usuário');
            }
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleFilterChange = (newFilters: Partial<UserFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const getRoleColor = (roles: UserRole[]) => {
        if (roles.includes('ADMIN')) return 'bg-red-100 text-red-800';
        if (roles.includes('DOCTOR')) return 'bg-blue-100 text-blue-800';
        if (roles.includes('USER')) return 'bg-green-100 text-green-800';
        if (roles.includes('PATIENT')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Gerencie os usuários do sistema
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    {(hasRole('ADMIN') || hasRole('USER')) && (
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Usuário
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
                            placeholder="Nome ou email..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Função
                        </label>
                        <select
                            id="role"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.roles?.[0] || ''}
                            onChange={(e) => handleFilterChange({
                                roles: e.target.value ? [e.target.value as UserRole] : undefined
                            })}
                        >
                            <option value="">Todas</option>
                            <option value="ADMIN">Admin</option>
                            <option value="DOCTOR">Médico</option>
                            <option value="USER">Usuário</option>
                            <option value="PATIENT">Paciente</option>
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
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {users?.total || 0} usuários encontrados
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuário
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Função
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Criado em
                                        </th>
                                        <th className="relative px-6 py-3">
                                            <span className="sr-only">Ações</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users?.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        {user.phone && (
                                                            <div className="text-sm text-gray-500">
                                                                {user.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role, index) => (
                                                        <span
                                                            key={index}
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor([role])}`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {hasRole('ADMIN') && (
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Deletar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        {users && users.totalPages > 1 && (
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
                                        disabled={(filters.page || 1) >= users.totalPages}
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
                                                {Math.min((filters.page || 1) * (filters.limit || 10), users.total)}
                                            </span>{' '}
                                            de{' '}
                                            <span className="font-medium">{users.total}</span> resultados
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

                                            {/* Números das páginas */}
                                            {Array.from({ length: Math.min(5, users.totalPages) }, (_, i) => {
                                                const pageNum = i + Math.max(1, (filters.page || 1) - 2);
                                                if (pageNum > users.totalPages) return null;
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
                                                disabled={(filters.page || 1) >= users.totalPages}
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
            {/* Modal de Usuário */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSave={loadUsers}
            />
        </div>
    );
};

export default UsersPage;