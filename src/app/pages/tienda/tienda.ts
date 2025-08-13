import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from './service/api';

@Component({
  selector: 'app-tienda',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './tienda.html',
  styleUrl: './tienda.css',
})
export class Tienda {
  private productService = inject(ProductService);

  constructor() {
    this.productService.loadProducts();
  }

  products = this.productService.products;
  loading = this.productService.loading;
  error = this.productService.error;
  hasProducts = this.productService.hasProducts;
  productCount = this.productService.productCount;

  onReload() {
    this.productService.reload();
  }

  onClearError() {
    this.productService.clearError();
  }
}
