import { Component } from '@angular/core';
import { Header } from "../../shared/ui/header/header";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-user-layout',
  imports: [Header, RouterOutlet],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.css'],
})
export class UserLayout {

}
