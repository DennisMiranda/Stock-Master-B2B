import { Component, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ShoppingCart,
  LucideIconNode,
  Tag,
  Package,
  Box,
} from 'lucide-angular';
import type { Product } from '../../../../core/models/product.model';

interface PriceTypeIcon {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-card-product',
  imports: [RouterLink, LucideAngularModule, CurrencyPipe],
  templateUrl: './card-product.html',
  styleUrl: './card-product.css',
})
export class CardProduct {
  readonly ShoppingCart = ShoppingCart;
  readonly Tag = Tag;
  readonly Package = Package;
  product = input<Product>();
  icons = [Package, Tag, Box];

  priceTypes: PriceTypeIcon[] = [
    { label: 'unit', icon: 'package' },
    { label: 'wholesale', icon: 'tag' },
    { label: 'box', icon: 'hash' },
  ];

  openModal() {}
  getPriceLabel(label: string): string {
    const labels: { [key: string]: string } = {
      unit: 'Unitario',
      wholesale: 'Mayorista',
      box: 'Por Caja',
    };
    return labels[label.toLowerCase()] || label;
  }
}
