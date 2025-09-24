'use client';
// components/modals/UserModal.tsx
import React, { useState, useEffect } from 'react';
import { User, CreateUserData, UpdateUserData, UserRole, Specialty } from '@/types/api';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        password: '',
        roles: ['USER'],
        phone: '',
        img: '',
        specialties: [],
        crm: '',
        birthDate: '',
        cpf: '',
        address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
        }
    });
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);

    const { hasRole, user: currentUser } = useAuth();
    const { success, error: showError } = useToast();

    const isEditing = !!user;
    const isDoctorSelected = formData.roles.includes('DOCTOR');
    const isPatientSelected = formData.roles.includes('PATIENT');

    // Roles disponíveis baseado nas permissões
    const availableRoles: UserRole[] = hasRole('ADMIN')
        ? ['USER', 'DOCTOR', 'ADMIN', 'PATIENT']
        : ['PATIENT']; // USER só pode criar PATIENT

    useEffect(() => {
        if (isOpen) {
            loadSpecialties();
            resetForm();
        }
    }, [isOpen, user]);

    const loadSpecialties = async () => {
        try {
            setIsLoadingSpecialties(true);
            const response = await apiService.getSpecialties({
                page: 1,
                limit: 100,
                isActive: true
            });
            setSpecialties(response.data);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar as especialidades');
        } finally {
            setIsLoadingSpecialties(false);
        }
    };

    const resetForm = () => {
        if (user) {
            // Edição - preencher com dados do usuário
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Sempre vazio ao editar
                roles: user.roles || ['USER'],
                phone: user.phone || '',
                img: user.img || '',
                specialties: user.specialties?.map(s => s.id) || [],
                crm: user.crm || '',
                birthDate: user.birthDate ?
                    new Date(user.birthDate).toISOString().split('T')[0] : '',
                cpf: user.cpf || '',
                address: {
                    street: user.address?.street || '',
                    number: user.address?.number || '',
                    complement: user.address?.complement || '',
                    neighborhood: user.address?.neighborhood || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipCode: user.address?.zipCode || '',
                }
            });
        } else {
            // Criação - formulário vazio
            setFormData({
                name: '',
                email: '',
                password: '',
                roles: ['USER'],
                phone: '',
                img: '',
                specialties: [],
                crm: '',
                birthDate: '',
                cpf: '',
                address: {
                    street: '',
                    number: '',
                    complement: '',
                    neighborhood: '',
                    city: '',
                    state: '',
                    zipCode: '',
                }
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData((prev: any) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleRoleChange = (role: UserRole) => {
        setFormData((prev: any) => {
            const newRoles = prev.roles.includes(role)
                ? prev.roles.filter((r: UserRole) => r !== role)
                : [...prev.roles, role];

            // Limpar especialidades se não for DOCTOR
            const newSpecialties = newRoles.includes('DOCTOR')
                ? prev.specialties
                : [];

            return {
                ...prev,
                roles: newRoles,
                specialties: newSpecialties,
                crm: newRoles.includes('DOCTOR') ? prev.crm : ''
            };
        });
    };

    const handleSpecialtyChange = (specialtyId: string) => {
        setFormData((prev: any) => {
            const newSpecialties = prev.specialties.includes(specialtyId)
                ? prev.specialties.filter((id: string) => id !== specialtyId)
                : [...prev.specialties, specialtyId];

            return { ...prev, specialties: newSpecialties };
        });
    };

    const validateForm = () => {
        // Validações básicas
        if (!formData.name.trim()) {
            showError('Erro', 'Nome é obrigatório');
            return false;
        }

        if (!formData.email.trim()) {
            showError('Erro', 'Email é obrigatório');
            return false;
        }

        if (!isEditing && !formData.password.trim()) {
            showError('Erro', 'Senha é obrigatória');
            return false;
        }

        if (formData.roles.length === 0) {
            showError('Erro', 'Pelo menos uma função deve ser selecionada');
            return false;
        }

        // Validações específicas para DOCTOR
        if (isDoctorSelected) {
            if (!formData.crm.trim()) {
                showError('Erro', 'CRM é obrigatório para médicos');
                return false;
            }

            if (formData.specialties.length === 0) {
                showError('Erro', 'Pelo menos uma especialidade deve ser selecionada para médicos');
                return false;
            }
        }

        // Validações específicas para PATIENT
        if (isPatientSelected) {
            if (!formData.birthDate) {
                showError('Erro', 'Data de nascimento é obrigatória para pacientes');
                return false;
            }

            if (!formData.cpf.trim()) {
                showError('Erro', 'CPF é obrigatório para pacientes');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Preparar payload
            const payload: any = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                roles: formData.roles,
                phone: formData.phone.trim(),
            };

            // Senha apenas se não estiver editando ou se foi preenchida
            if (!isEditing || formData.password.trim()) {
                payload.password = formData.password;
            }

            // Campos específicos para DOCTOR
            if (isDoctorSelected) {
                payload.crm = formData.crm.trim();
                payload.specialties = formData.specialties;
            }

            // Campos específicos para PATIENT
            if (isPatientSelected) {
                payload.birthDate = formData.birthDate;
                payload.cpf = formData.cpf.trim();

                // Endereço (apenas se algum campo foi preenchido)
                const hasAddress = Object.values(formData.address).some(
                    (value: any) => value && value.trim()
                );

                if (hasAddress) {
                    payload.address = formData.address;
                }
            }

            if (isEditing) {
                await apiService.updateUser(user.id, payload as UpdateUserData);
                success('Usuário atualizado com sucesso!');
            } else {
                await apiService.createUser(payload as CreateUserData);
                success('Usuário criado com sucesso!');
            }

            onSave();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar usuário:', error);
            showError('Erro', error.message || 'Não foi possível salvar o usuário');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                {/* Centralizador */}
                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        {/* Cabeçalho */}
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    {/* Título com ícone */}
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                            <svg
                                                className="w-5 h-5 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                                        </h3>
                                    </div>

                                    {/* Formulário */}
                                    <div className="space-y-6 max-h-96 overflow-y-auto">
                                        {/* Dados Básicos */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">
                                                Dados Básicos
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                        Nome *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                        Email *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                        Senha {isEditing ? '(deixe em branco para manter)' : '*'}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        placeholder={isEditing ? 'Deixe em branco para manter a senha atual' : ''}
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                        Telefone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        id="phone"
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Funções */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">
                                                Funções *
                                            </h4>
                                            <div className="space-y-2">
                                                {availableRoles.map((role) => (
                                                    <label key={role} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.roles.includes(role)}
                                                            onChange={() => handleRoleChange(role)}
                                                            disabled={isLoading}
                                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">
                                                            {role === 'ADMIN' ? 'Administrador' :
                                                                role === 'DOCTOR' ? 'Médico' :
                                                                    role === 'USER' ? 'Usuário' :
                                                                        role === 'PATIENT' ? 'Paciente' : role}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Campos específicos para DOCTOR */}
                                        {isDoctorSelected && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">
                                                    Dados Médicos
                                                </h4>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label htmlFor="crm" className="block text-sm font-medium text-gray-700">
                                                            CRM *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="crm"
                                                            id="crm"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.crm}
                                                            onChange={handleChange}
                                                            disabled={isLoading}
                                                            placeholder="Ex: 12345-SP"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Especialidades *
                                                        </label>
                                                        {isLoadingSpecialties ? (
                                                            <div className="text-sm text-gray-500">Carregando especialidades...</div>
                                                        ) : (
                                                            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                                                                {specialties.map((specialty) => (
                                                                    <label key={specialty.id} className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.specialties.includes(specialty.id)}
                                                                            onChange={() => handleSpecialtyChange(specialty.id)}
                                                                            disabled={isLoading}
                                                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                        />
                                                                        <span className="ml-2 text-sm text-gray-700">
                                                                            {specialty.name}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Campos específicos para PATIENT */}
                                        {isPatientSelected && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">
                                                    Dados do Paciente
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                                                            Data de Nascimento *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="birthDate"
                                                            id="birthDate"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.birthDate}
                                                            onChange={handleChange}
                                                            disabled={isLoading}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                                                            CPF *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="cpf"
                                                            id="cpf"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.cpf}
                                                            onChange={handleChange}
                                                            disabled={isLoading}
                                                            placeholder="000.000.000-00"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Endereço */}
                                                <div className="mt-4">
                                                    <h5 className="text-sm font-medium text-gray-600 mb-3">
                                                        Endereço
                                                    </h5>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                                                                Rua
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="address.street"
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                value={formData.address.street}
                                                                onChange={handleChange}
                                                                disabled={isLoading}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="address.number" className="block text-sm font-medium text-gray-700">
                                                                Número
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="address.number"
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                value={formData.address.number}
                                                                onChange={handleChange}
                                                                disabled={isLoading}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                                                                Cidade
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="address.city"
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                value={formData.address.city}
                                                                onChange={handleChange}
                                                                disabled={isLoading}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                                                                Estado
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="address.state"
                                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                value={formData.address.state}
                                                                onChange={handleChange}
                                                                disabled={isLoading}
                                                                maxLength={2}
                                                                placeholder="SP"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer com botões */}
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isEditing ? 'Atualizando...' : 'Criando...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {isEditing ? 'Atualizar' : 'Criar'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserModal;