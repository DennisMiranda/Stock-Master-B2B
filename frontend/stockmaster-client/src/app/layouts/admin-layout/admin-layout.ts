import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminHeader } from './components/admin-header';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminSidebar, AdminHeader],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
})
export class AdminLayout {
  layoutService = inject(LayoutService);

  constructor() {
    console.log('✅ AdminLayout Initialized');
  }
}
