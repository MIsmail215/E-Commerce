import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { ProductListComponent } from './product-list/product-list';
// 1. IMPORT THE CART COMPONENT
import { CartComponent } from './cart/cart'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'store', component: ProductListComponent },
  
  // 2. ADD THE CART ROUTE HERE
  { path: 'cart', component: CartComponent }, 
  
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
