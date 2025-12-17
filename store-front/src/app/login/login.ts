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
  mfaForm: FormGroup;           // <--- New Form for Step 2
  errorMessage: string = '';
  showMFA: boolean = false;     // <--- Switch to control which form user sees

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private router: Router 
  ) {
    // Step 1: Standard Login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', Validators.required]
    });

    // Step 2: Security Question
    this.mfaForm = this.fb.group({
      securityAnswer: ['', Validators.required]
    });
  }

  // --- STEP 1: VERIFY PASSWORD ---
  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.http.post<any>('http://192.168.10.20:3000/login', loginData)
        .subscribe({
          next: (response) => {
            console.log('Step 1 Response:', response);
            
            // CHECK: Does server want MFA?
            if (response.mfaRequired) {
              this.showMFA = true; // <--- Switch to Step 2
              this.errorMessage = '';
            } 
            // Fallback for old users (no MFA setup) or if MFA was somehow skipped
            else if (response.email) {
              this.finalizeLogin(response.email);
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            this.errorMessage = 'Invalid email or password';
          }
        });
    }
  }

  // --- STEP 2: VERIFY SECURITY ANSWER ---
  onMfaSubmit() {
    if (this.mfaForm.valid) {
      // Send: Email, Password (from Step 1), and Answer (from Step 2)
      const payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        securityAnswer: this.mfaForm.value.securityAnswer
      };

      this.http.post<any>('http://192.168.10.20:3000/login', payload)
        .subscribe({
          next: (response) => {
            // If we get an email back here, we are fully in!
            if (response.email) {
              this.finalizeLogin(response.email);
            }
          },
          error: (error) => {
            this.errorMessage = 'Incorrect Security Answer! Access Denied.';
          }
        });
    }
  }

  // --- HELPER: Save & Redirect ---
  finalizeLogin(email: string) {
    localStorage.setItem('currentUser', email);
    alert('Login Success! Redirecting...');
    this.router.navigate(['/store']); 
  }
}
