import { Routes } from '@angular/router';
import { Tienda } from './pages/tienda/tienda';
import { Home } from './pages/home/home';
import { Producto } from './pages/tienda/producto/producto';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tienda', component: Tienda },
  { path: 'producto/:id', component: Producto },
];
