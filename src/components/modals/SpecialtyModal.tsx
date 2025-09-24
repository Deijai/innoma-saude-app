'use client';
// components/modals/SpecialtyModal.tsx
import React, { useState, useEffect } from 'react';
import { Specialty, CreateSpecialtyData, UpdateSpecialtyData } from '@/types/api';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/useToast';

interface SpecialtyModalProps {
    isOpen: boolean;
    onClose: () => void;
    specialty?: Specialty | null;
    onSave: () => void;
}

const SpecialtyModal: React.FC<SpecialtyModalProps> = ({ isOpen, onClose, specialty, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
    });
    const [isLoading, setIsLoading] = useState(false);

    const { success, error: showError } = useToast();

    const isEditing = !!specialty;

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, specialty]);

    const resetForm = () => {
        if (specialty) {
            setFormData({
                name: specialty.name || '',
                description: specialty.description || '',
                isActive: specialty.isActive ?? true,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                isActive: true,
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            showError('Erro', 'Nome é obrigatório');
            return false;
        }

        if (formData.name.trim().length < 2) {
            showError('Erro', 'Nome deve ter pelo menos 2 caracteres');
            return false;
        }

        if (formData.name.trim().length > 100) {
            showError('Erro', 'Nome não pode ter mais de 100 caracteres');
            return false;
        }

        if (formData.description.trim().length > 500) {
            showError('Erro', 'Descrição não pode ter mais de 500 caracteres');
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
                name: formData.name.trim(),
                description: formData.description.trim(),
                ...(isEditing ? { isActive: formData.isActive } : {}),
            };

            if (isEditing) {
                await apiService.updateSpecialty(specialty.id, payload as UpdateSpecialtyData);
                success('Especialidade atualizada com sucesso!');
            } else {
                await apiService.createSpecialty(payload as CreateSpecialtyData);
                success('Especialidade criada com sucesso!');
            }

            onSave();
            onClose();
        } catch (error: any) {
            showError('Erro', error.message || 'Não foi possível salvar a especialidade');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {isEditing ? 'Editar Especialidade' : 'Nova Especialidade'}
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nome da Especialidade *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                required
                                                maxLength={100}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Ex: Cardiologia"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                            <div className="mt-1 text-xs text-gray-500">
                                                {formData.name.length}/100 caracteres
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                                Descrição
                                            </label>
                                            <textarea
                                                name="description"
                                                id="description"
                                                rows={4}
                                                maxLength={500}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Descreva a especialidade médica..."
                                                value={formData.description}
                                                onChange={handleChange}
                                            />
                                            <div className="mt-1 text-xs text-gray-500">
                                                {formData.description.length}/500 caracteres
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="flex items-center">
                                                <input
                                                    id="isActive"
                                                    name="isActive"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                                    Especialidade ativa
                                                </label>
                                            </div>
                                        )}
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
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {isEditing ? 'Atualizar' : 'Criar'}
                                    </>
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

export default SpecialtyModal;