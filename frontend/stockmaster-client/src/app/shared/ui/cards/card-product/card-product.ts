import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../../core/models/product.model';

interface PriceTypeIcon {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-card-product',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './card-product.html',
  styleUrl: './card-product.css',
})
export class CardProduct {
  product = input<Product>();
  icons = ['package', 'tag', 'box'];

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
