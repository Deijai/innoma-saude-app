// services/api.ts
import {
    User,
    Specialty,
    PaginatedResponse,
    AuthResponse,
    LoginData,
    CreateUserData,
    UpdateUserData,
    CreateSpecialtyData,
    UpdateSpecialtyData,
    UserFilters,
    SpecialtyFilters,
    SystemStats,
    EmailCheckResponse
} from '@/types/api';

class ApiService {
    private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api';

    private getHeaders(token?: string) {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(this.getToken() ?? undefined),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    setToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }

    // ===== AUTH =====
    async login(data: LoginData): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/signin', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async register(data: CreateUserData): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getAuthUsers(): Promise<{ users: User[], user: User }> {
        return this.request<{ users: User[], user: User }>('/auth/users');
    }

    // ===== USERS =====
    async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
        const queryString = new URLSearchParams();

        if (filters?.roles) {
            filters.roles.forEach(role => queryString.append('roles', role));
        }
        if (filters?.isActive !== undefined) {
            queryString.append('isActive', filters.isActive.toString());
        }
        if (filters?.search) {
            queryString.append('search', filters.search);
        }
        if (filters?.specialties) {
            filters.specialties.forEach(specialty => queryString.append('specialties', specialty));
        }
        if (filters?.page) {
            queryString.append('page', filters.page.toString());
        }
        if (filters?.limit) {
            queryString.append('limit', filters.limit.toString());
        }

        return this.request<PaginatedResponse<User>>(`/users?${queryString}`);
    }

    async getUserById(id: string): Promise<User> {
        return this.request<User>(`/users/${id}`);
    }

    async createUser(data: CreateUserData): Promise<User> {
        return this.request<User>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateUser(id: string, data: UpdateUserData): Promise<User> {
        return this.request<User>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
        return this.request<{ success: boolean; message: string }>(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async getDoctorsBySpecialty(
        specialtyId: string,
        page?: number,
        limit?: number
    ): Promise<PaginatedResponse<User>> {
        const queryString = new URLSearchParams();
        if (page) queryString.append('page', page.toString());
        if (limit) queryString.append('limit', limit.toString());

        return this.request<PaginatedResponse<User>>(
            `/users/doctors-by-specialty/${specialtyId}?${queryString}`
        );
    }

    async getUserStats(): Promise<SystemStats> {
        return this.request<SystemStats>('/users/stats');
    }

    async checkEmail(email: string): Promise<EmailCheckResponse> {
        return this.request<EmailCheckResponse>('/users/check-email', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // ===== SPECIALTIES =====
    async getSpecialties(filters?: SpecialtyFilters): Promise<PaginatedResponse<Specialty>> {
        const queryString = new URLSearchParams();

        if (filters?.isActive !== undefined) {
            queryString.append('isActive', filters.isActive.toString());
        }
        if (filters?.search) {
            queryString.append('search', filters.search);
        }
        if (filters?.page) {
            queryString.append('page', filters.page.toString());
        }
        if (filters?.limit) {
            queryString.append('limit', filters.limit.toString());
        }

        return this.request<PaginatedResponse<Specialty>>(`/specialties?${queryString}`);
    }

    async getSpecialtyById(id: string): Promise<Specialty> {
        return this.request<Specialty>(`/specialties/${id}`);
    }

    async createSpecialty(data: CreateSpecialtyData): Promise<Specialty> {
        return this.request<Specialty>('/specialties', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateSpecialty(id: string, data: UpdateSpecialtyData): Promise<Specialty> {
        return this.request<Specialty>(`/specialties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteSpecialty(id: string): Promise<{ success: boolean; message: string }> {
        return this.request<{ success: boolean; message: string }>(`/specialties/${id}`, {
            method: 'DELETE',
        });
    }
}

export const apiService = new ApiService();