import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Box, LucideAngularModule, Package, ShoppingCart, Tag } from 'lucide-angular';
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
