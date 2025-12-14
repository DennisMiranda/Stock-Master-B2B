export interface RegisterRequest {
    email: string;
    password: string;
    ruc?: string;
    companyName?: string;
    contactName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    uid: string;
    email: string;
    role: 'client' | 'admin' | 'almacenero';
    ruc?: string;
    companyName?: string;
}
