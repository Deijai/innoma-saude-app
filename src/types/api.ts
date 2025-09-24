// types/api.ts
export type UserRole = 'USER' | 'DOCTOR' | 'ADMIN' | 'PATIENT';

export interface User {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
    img?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;

    // Campos específicos para DOCTOR
    specialties?: Specialty[];
    crm?: string;

    // Campos específicos para PATIENT
    birthDate?: string;
    cpf?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
}

export interface Specialty {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        roles: UserRole[];
    };
}

export interface LoginData {
    email: string;
    password: string;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    roles: UserRole[];
    phone?: string;
    img?: string;
    specialties?: string[];
    crm?: string;
    birthDate?: string;
    cpf?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    roles?: UserRole[];
    phone?: string;
    img?: string;
    isActive?: boolean;
    specialties?: string[];
    crm?: string;
    birthDate?: string;
    cpf?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
}

export interface CreateSpecialtyData {
    name: string;
    description: string;
}

export interface UpdateSpecialtyData {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface UserFilters {
    roles?: UserRole[];
    isActive?: boolean;
    search?: string;
    specialties?: string[];
    page?: number;
    limit?: number;
}

export interface SpecialtyFilters {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface SystemStats {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    totalActiveUsers: number;
    totalInactiveUsers: number;
    totalSpecialties: number;
    totalActiveSpecialties: number;
    usersByRole: {
        [key: string]: number;
    };
}

export interface EmailCheckResponse {
    email: string;
    available: boolean;
    message: string;
}