import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../service/api';
@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CurrencyPipe, RouterModule],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);

  // Usar signals del servicio
  product = this.productService.currentProduct;
  loading = this.productService.productLoading;
  error = this.productService.productError;

  ngOnInit() {
    console.log('🎬 Componente Producto iniciado');

    this.activatedRoute.params.subscribe(async (params) => {
      const id = params['id'];
      if (id) {
        console.log(`🔗 Parámetro ID recibido: ${id}`);
        try {
          await this.productService.getProductById(Number(id));
        } catch (error) {
          console.error('Error en componente:', error);
        }
      }
    });
  }

  ngOnDestroy() {
    this.productService.clearCurrentProduct();
  }

  onReload() {
    const currentId = this.product()?.id;
    if (currentId) {
      this.productService.loadProductById(currentId);
    }
  }

  onClearError() {
    this.productService.clearCurrentProduct();
  }
}
