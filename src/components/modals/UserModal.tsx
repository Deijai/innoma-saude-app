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

    const { hasRole } = useAuth();
    const { success, error: showError } = useToast();

    const isEditing = !!user;
    const isDoctorSelected = formData.roles.includes('DOCTOR');

    useEffect(() => {
        if (isOpen) {
            loadSpecialties();
            resetForm();
        }
    }, [isOpen, user]);

    const loadSpecialties = async () => {
        try {
            setIsLoadingSpecialties(true);
            const response = await apiService.getSpecialties({ page: 1, limit: 100, isActive: true });
            setSpecialties(response.data);
        } catch (error: any) {
            showError('Erro', 'Não foi possível carregar as especialidades');
        } finally {
            setIsLoadingSpecialties(false);
        }
    };

    const resetForm = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                roles: user.roles || ['USER'],
                phone: user.phone || '',
                img: user.img || '',
                specialties: user.specialties?.map(s => s.id) || [],
                crm: user.crm || '',
                birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData((prev: any) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
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

            // Se não for mais DOCTOR, limpar especialidades e CRM
            if (!newRoles.includes('DOCTOR')) {
                return {
                    ...prev,
                    roles: newRoles,
                    specialties: [],
                    crm: '',
                };
            }

            return { ...prev, roles: newRoles };
        });
    };

    const handleSpecialtyChange = (specialtyId: string) => {
        setFormData((prev: any) => ({
            ...prev,
            specialties: prev.specialties.includes(specialtyId)
                ? prev.specialties.filter((id: string) => id !== specialtyId)
                : [...prev.specialties, specialtyId]
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            showError('Erro', 'Nome é obrigatório');
            return false;
        }

        if (!formData.email.trim()) {
            showError('Erro', 'Email é obrigatório');
            return false;
        }

        if (!isEditing && !formData.password) {
            showError('Erro', 'Senha é obrigatória');
            return false;
        }

        if (formData.password && formData.password.length < 6) {
            showError('Erro', 'Senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (formData.roles.length === 0) {
            showError('Erro', 'Pelo menos uma função deve ser selecionada');
            return false;
        }

        if (isDoctorSelected && formData.specialties.length === 0) {
            showError('Erro', 'Médicos devem ter pelo menos uma especialidade');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsLoading(true);

            const payload = {
                ...formData,
                // Se não for DOCTOR, não enviar especialidades nem CRM
                ...(isDoctorSelected ? {} : { specialties: undefined, crm: undefined }),
                // Se não há senha, não enviar (para edição)
                ...(formData.password ? {} : { password: undefined }),
            };

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
            showError('Erro', error.message || 'Não foi possível salvar o usuário');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const availableRoles: UserRole[] = hasRole('ADMIN')
        ? ['ADMIN', 'DOCTOR', 'USER', 'PATIENT']
        : ['PATIENT'];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                                        {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Dados Básicos */}
                                        <div className="space-y-4">
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
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                    {isEditing ? 'Nova Senha (opcional)' : 'Senha *'}
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    id="password"
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={formData.password}
                                                    onChange={handleChange}
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
                                                />
                                            </div>

                                            {/* Funções */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Funções *
                                                </label>
                                                <div className="space-y-2">
                                                    {availableRoles.map((role) => (
                                                        <label key={role} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.roles.includes(role)}
                                                                onChange={() => handleRoleChange(role)}
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
                                        </div>

                                        {/* Campos específicos e endereço */}
                                        <div className="space-y-4">
                                            {/* Campos específicos para DOCTOR */}
                                            {isDoctorSelected && (
                                                <>
                                                    <div>
                                                        <label htmlFor="crm" className="block text-sm font-medium text-gray-700">
                                                            CRM
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="crm"
                                                            id="crm"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.crm}
                                                            onChange={handleChange}
                                                            placeholder="12345-SP"
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
                                                </>
                                            )}

                                            {/* Campos específicos para PATIENT */}
                                            {formData.roles.includes('PATIENT') && (
                                                <>
                                                    <div>
                                                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                                                            Data de Nascimento
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="birthDate"
                                                            id="birthDate"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.birthDate}
                                                            onChange={handleChange}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                                                            CPF
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="cpf"
                                                            id="cpf"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.cpf}
                                                            onChange={handleChange}
                                                            placeholder="12345678901"
                                                            maxLength={11}
                                                        />
                                                    </div>

                                                    {/* Endereço */}
                                                    <div className="space-y-3">
                                                        <h4 className="font-medium text-gray-900">Endereço</h4>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    name="address.street"
                                                                    placeholder="Rua"
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                    value={formData.address.street}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    name="address.number"
                                                                    placeholder="Número"
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                    value={formData.address.number}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            name="address.complement"
                                                            placeholder="Complemento"
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                            value={formData.address.complement}
                                                            onChange={handleChange}
                                                        />

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    name="address.neighborhood"
                                                                    placeholder="Bairro"
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                    value={formData.address.neighborhood}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    name="address.city"
                                                                    placeholder="Cidade"
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                    value={formData.address.city}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    name="address.state"
                                                                    placeholder="Estado"
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                    value={formData.address.state}
                                                                    onChange={handleChange}
                                                                    maxLength={2}
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    name="address.zipCode"
                                                                    placeholder="CEP"
                                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                                    value={formData.address.zipCode}
                                                                    onChange={handleChange}
                                                                    maxLength={8}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (
                                    isEditing ? 'Atualizar' : 'Criar'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
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