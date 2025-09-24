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

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
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
    const isPatientSelected = formData.roles.includes('PATIENT');

    const availableRoles: UserRole[] = hasRole('ADMIN')
        ? ['USER', 'DOCTOR', 'ADMIN', 'PATIENT']
        : ['PATIENT'];

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
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                roles: user.roles || ['USER'],
                phone: user.phone || '',
                img: user.img || '',
                specialties: user.specialties?.map(s => s.id) || [],
                crm: user.crm || '',
                birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

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
            const payload: any = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                roles: formData.roles,
                phone: formData.phone.trim(),
            };
            if (!isEditing || formData.password.trim()) {
                payload.password = formData.password;
            }
            if (isDoctorSelected) {
                payload.crm = formData.crm.trim();
                payload.specialties = formData.specialties;
            }
            if (isPatientSelected) {
                payload.birthDate = formData.birthDate;
                payload.cpf = formData.cpf.trim();
                const hasAddress = Object.values(formData.address).some((value: any) => value && value.trim());
                if (hasAddress) payload.address = formData.address;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-gray-500 bg-opacity-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    {/* Cabeçalho */}
                    <div className="px-6 py-4 border-b flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
                        </h3>
                    </div>

                    {/* Formulário completo */}
                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
                        {/* Dados Básicos */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">Dados Básicos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="name" placeholder="Nome *" value={formData.name} onChange={handleChange} className="border p-2 rounded w-full text-gray-800 placeholder-gray-500" />
                                <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} className="border p-2 rounded w-full text-gray-800 placeholder-gray-500" />
                                <input type="password" name="password" placeholder={isEditing ? 'Deixe em branco para manter a senha' : 'Senha *'} value={formData.password} onChange={handleChange} className="border p-2 rounded w-full text-gray-800 placeholder-gray-500" />
                                <input type="tel" name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} className="border p-2 rounded w-full text-gray-800 placeholder-gray-500" />
                            </div>
                        </div>

                        {/* Funções */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">Funções *</h4>
                            {availableRoles.map((role) => (
                                <label key={role} className="flex items-center space-x-2 text-gray-800 placeholder-gray-500">
                                    <input
                                        type="checkbox"
                                        checked={formData.roles.includes(role)}
                                        onChange={() => handleRoleChange(role)}
                                        disabled={isLoading}
                                    />
                                    <span>{role}</span>
                                </label>
                            ))}
                        </div>

                        {/* Dados Médicos */}
                        {isDoctorSelected && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">Dados Médicos</h4>
                                <input type="text" name="crm" placeholder="CRM *" value={formData.crm} onChange={handleChange} className="border p-2 rounded w-full mb-2" />
                                <div className="max-h-32 overflow-y-auto border p-2 rounded">
                                    {specialties.map((specialty) => (
                                        <label key={specialty.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.specialties.includes(specialty.id)}
                                                onChange={() => handleSpecialtyChange(specialty.id)}
                                                disabled={isLoading}
                                            />
                                            <span>{specialty.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dados do Paciente */}
                        {isPatientSelected && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3 border-b pb-1">Dados do Paciente</h4>
                                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="border p-2 rounded w-full mb-2" />
                                <input type="text" name="cpf" placeholder="CPF *" value={formData.cpf} onChange={handleChange} className="border p-2 rounded w-full mb-2" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" name="address.street" placeholder="Rua" value={formData.address.street} onChange={handleChange} className="border p-2 rounded" />
                                    <input type="text" name="address.number" placeholder="Número" value={formData.address.number} onChange={handleChange} className="border p-2 rounded" />
                                    <input type="text" name="address.city" placeholder="Cidade" value={formData.address.city} onChange={handleChange} className="border p-2 rounded" />
                                    <input type="text" name="address.state" placeholder="Estado" value={formData.address.state} onChange={handleChange} className="border p-2 rounded" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar' : 'Criar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
