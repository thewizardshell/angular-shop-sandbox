import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  private state = signal<ProductState>({
    products: [],
    loading: false,
    error: null,
  });

  constructor() {
    console.log('🛒 State inicial', this.state());
  }

  private productDetailState = signal<{
    product: Product | null;
    loading: boolean;
    error: string | null;
  }>({
    product: null,
    loading: false,
    error: null,
  });

  readonly products = computed(() => {
    const value = this.state().products;
    console.log('📦 Productos:', value);
    return value;
  });
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly hasProducts = computed(() => this.state().products.length > 0);
  readonly productCount = computed(() => this.state().products.length);

  readonly currentProduct = computed(() => this.productDetailState().product);
  readonly productLoading = computed(() => this.productDetailState().loading);
  readonly productError = computed(() => this.productDetailState().error);

  async loadProducts() {
    this.updateState({
      loading: true,
      error: null,
    });

    try {
      const products = await firstValueFrom(
        this.http.get<Product[]>('https://fakestoreapi.com/products'),
      );

      this.updateState({
        products: products || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.updateState({
        loading: false,
        error: 'Error al cargar productos',
      });
    }
  }
  async loadProductById(id: number) {
    console.log(`🔍 Cargando producto ID: ${id}`);
    this.updateProductDetailState({ loading: true, error: null });

    try {
      const product = await firstValueFrom(
        this.http.get<Product>(`https://fakestoreapi.com/products/${id}`),
      );

      console.log('✅ Producto cargado:', product);
      this.updateProductDetailState({
        product,
        loading: false,
        error: null,
      });

      return product;
    } catch (error) {
      console.error('❌ Error al cargar producto:', error);
      this.updateProductDetailState({
        loading: false,
        error: 'Error al cargar el producto',
      });
      throw error;
    }
  }

  getProductFromCache(id: number): Product | undefined {
    return this.products().find((p) => p.id === id);
  }

  async getProductById(id: number): Promise<Product | null> {
    // Intentar obtener desde caché primero
    const cachedProduct = this.getProductFromCache(id);
    if (cachedProduct) {
      console.log('📦 Producto encontrado en caché:', cachedProduct);
      this.updateProductDetailState({
        product: cachedProduct,
        loading: false,
        error: null,
      });
      return cachedProduct;
    }

    return await this.loadProductById(id);
  }

  private updateState(partial: Partial<ProductState>) {
    this.state.update((current) => ({ ...current, ...partial }));
  }

  private updateProductDetailState(
    partial: Partial<{
      product: Product | null;
      loading: boolean;
      error: string | null;
    }>,
  ) {
    this.productDetailState.update((current) => ({ ...current, ...partial }));
  }

  clearCurrentProduct() {
    this.updateProductDetailState({
      product: null,
      loading: false,
      error: null,
    });
  }

  reload() {
    return this.loadProducts();
  }

  clearError() {
    this.updateState({ error: null });
  }
}
