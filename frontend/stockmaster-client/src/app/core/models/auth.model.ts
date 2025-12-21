export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'admin' | 'client' | 'warehouse' | 'driver';
    companyName?: string;
    contactName?: string;
    ruc?: string;
    isActive: boolean;
    lastLogin?: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RegisterRequest {
    email: string;
    password?: string;
    ruc: string;
    companyName: string;
    contactName: string;
}
