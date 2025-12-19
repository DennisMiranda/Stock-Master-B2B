import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

export const authRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    }
];
