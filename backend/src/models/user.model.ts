export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'admin' | 'client' | 'warehouse' | 'driver';
    companyName?: string;
    contactName?: string;
    ruc?: string;
    provider: 'password' | 'google';
    createdAt: string;
    isActive: boolean;
    lastLogin?: string;
}
