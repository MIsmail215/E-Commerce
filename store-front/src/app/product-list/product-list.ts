import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
   
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit() {
    const url = `http://192.168.10.20:3000/products?t=${new Date().getTime()}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.products = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  addToCart(product: any) {
    const userEmail = localStorage.getItem('currentUser');

    if (!userEmail) {
      alert('Please log in to add items to your cart.');
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      username: userEmail,
      product: product
    };

    this.http.post('http://192.168.10.20:3000/cart/add', payload)
      .subscribe({
        next: (res: any) => {
          console.log('Cart updated:', res);
          alert(`${product.name} successfully added to your cart!`);
        },
        error: (err) => {
          console.error('Cart error:', err);
          alert('Failed to add item. Check server logs.');
        }
      });
  }

  // --- NEW FUNCTION: NAVIGATE TO CART PAGE ---
  goToCart() {
    this.router.navigate(['/cart']);
  }
  // -------------------------------------------

  logout() {
    localStorage.removeItem('currentUser'); 
    alert('You have been logged out.');
    this.router.navigate(['/login']); 
  }
}
