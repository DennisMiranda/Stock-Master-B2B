import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { HomePage } from './features/home/pages/home-page';

export const routes: Routes = [
    {
        path: 'home',
        component: HomePage
    },
    ...authRoutes
];
