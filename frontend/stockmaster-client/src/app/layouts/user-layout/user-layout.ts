import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeader } from '../admin-layout/components/admin-header';
@Component({
  selector: 'app-user-layout',
  imports: [ RouterOutlet, AdminHeader],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css'],
})
export class UserLayout {

}
