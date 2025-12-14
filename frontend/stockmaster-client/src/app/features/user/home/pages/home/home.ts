import { Component, signal } from '@angular/core';
import { LucideAngularModule, LucideIconNode, Package, Shield, Truck } from 'lucide-angular';
import type { Product } from '../../../../../core/models/product.model';
import productsData from '../../../../../data/productData.json';
import { CardProduct } from '../../../../../shared/ui/cards/card-product/card-product';

interface Feature {
  title: string;
  description: string;
  icon: LucideIconNode;
}

@Component({
  selector: 'app-home',
  imports: [CardProduct, LucideAngularModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly PackageIcon = Package;
  readonly TruckIcon = Truck;
  readonly ShieldIcon = Shield;

  products = signal<Product[]>(productsData as Product[]);
  features = [
    {
      title: 'Envío Rápido',
      description: 'Entregas en 24-48 horas a nivel nacional. Seguimiento en tiempo real.',
      icon: this.TruckIcon,
    },
    {
      title: 'Garantía Total',
      description: 'Todos nuestros productos cuentan con garantía oficial de fábrica.',
      icon: this.ShieldIcon,
    },
    {
      title: 'Stock Amplio',
      description: 'Más de 500 productos disponibles para entrega inmediata.',
      icon: this.PackageIcon,
    },
  ];
}
