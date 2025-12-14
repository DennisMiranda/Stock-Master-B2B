import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';

export const authRoutes: Routes = [
    {
        path: 'login',
        component: LoginPage
    },
    {
        path: 'register',
        component: RegisterPage
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
