import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
   
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const email = localStorage.getItem('currentUser');
    if (!email) {
      this.router.navigate(['/login']);
      return;
    }

    console.log('>>> Requesting cart for user:', email);

    this.http.get<any>(`http://192.168.10.20:3000/cart/${email}`)
      .subscribe({
        next: (data) => {
          console.log('>>> SERVER RESPONSE:', data); 

          // 1. Assign the data
          this.cartItems = data.products || []; 
          
          // 2. Calculate totals
          this.calculateTotal();

          // 3. FORCE UPDATE THE SCREEN
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading cart:', err)
      });
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((acc, item) => {
      const qty = item.quantity || 1;
      return acc + (item.price * qty);
    }, 0);
  }

  goBack() {
    this.router.navigate(['/store']);
  }
   
  // --- UPDATED CHECKOUT FUNCTION ---
  checkout() {
    const email = localStorage.getItem('currentUser');
    
    if (!email) {
      alert('Error: You must be logged in to checkout.');
      return;
    }

    if (confirm(`Total is $${this.totalPrice}. Confirm purchase?`)) {
      
      // Call the backend to clear the cart
      this.http.post('http://192.168.10.20:3000/cart/checkout', { email: email })
        .subscribe({
          next: (res) => {
            console.log('Checkout success:', res);
            alert('Order placed successfully! Thank you for shopping.');
            
            // 1. Clear local data
            this.cartItems = [];
            this.totalPrice = 0;
            
            // 2. Redirect to Store
            this.router.navigate(['/store']);
          },
          error: (err) => {
            console.error('Checkout error:', err);
            alert('Failed to place order. Please try again.');
          }
        });
    }
  }
}
