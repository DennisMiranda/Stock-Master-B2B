import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p class="text-gray-500 mt-2">Bienvenido al Panel de Administración (Vista Preliminar)</p>
    </div>
  `
})
export class DashboardPage { }
