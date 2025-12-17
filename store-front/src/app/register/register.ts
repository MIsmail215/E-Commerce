import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styles: [`
    .register-container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    input { width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px; }
    button { width: 100%; padding: 10px; background: #28a745; color: white; border: none; cursor: pointer; }
    button:hover { background: #218838; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // --- NEW FIELD: Security Answer ---
      securityAnswer: ['', Validators.required] 
      // ----------------------------------
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Send data (email, password, AND securityAnswer) to Backend
      this.http.post('http://192.168.10.20:3000/register', this.registerForm.value)
        .subscribe({
          next: () => {
            alert('Registration Successful! Please Login.');
            this.router.navigate(['/login']); 
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Registration failed. Email might be taken.';
          }
        });
    }
  }
}
