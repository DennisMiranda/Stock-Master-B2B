import { LoginRequest, RegisterRequest, User } from '../models/auth.model';

export abstract class AuthRepository {
    abstract login(data: LoginRequest): Promise<User>;
    abstract loginWithGoogle(): Promise<User>;
    abstract register(data: RegisterRequest): Promise<User>;
    abstract logout(): Promise<void>;
}
