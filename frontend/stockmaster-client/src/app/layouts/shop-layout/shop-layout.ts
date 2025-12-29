import { Component, inject } from '@angular/core';
import { Header } from "../../shared/ui/header/header";
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { Modal } from '../../shared/ui/modal/modal';
import { Login } from '../../features/auth/components/login/login';
import { Register } from '../../features/auth/components/register/register';
import { Footer } from "../../footer/footer";

@Component({
  selector: 'app-shop-layout',
  imports: [Header, RouterOutlet, Modal, Login, Register, Footer],
  templateUrl: './shop-layout.html',
  styleUrl: './shop-layout.css',
})
export class ShopLayout {
  //inject obtiene instancia del layoutService para poder acceder a sus metodos y propiedades y lo asigna a la variable layoutService
  layoutService = inject(LayoutService);
}
