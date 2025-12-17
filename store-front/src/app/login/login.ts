import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule 
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private router: Router 
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.http.post<any>('http://192.168.10.20:3000/login', loginData)
        .subscribe({
          next: (response) => {
            console.log('Login response:', response);
            
            // --- NEW LINE: Save user to memory ---
            localStorage.setItem('currentUser', loginData.email);
            // -------------------------------------

            alert('Login Success! Redirecting...');
            this.router.navigate(['/store']); 
          },
          error: (error) => {
            console.error('Login error:', error);
            this.errorMessage = 'Invalid email or password';
          }
        });
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
    }
  }
}
