import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';

/**
 * LoginComponent handles user authentication
 * - Validates email and password
 * - Calls backend API for authentication
 * - Stores user session in localStorage
 * - Navigates to registration page on successful login
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false; // Tracks whether password field is visible or masked
  submitted = false; // Tracks if form has been submitted
  errorMessage = ''; // Stores form validation error messages
  isLoading = false; // Tracks if login request is in progress

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private authService: AuthenticationService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Toggles password visibility between plain text and masked
   * Updates showPassword flag to control input type binding
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles login form submission
   * - Validates form fields
   * - Calls backend authentication API
   * - Navigates to registration on success
   * - Displays appropriate error messages
   */
  onLogin(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter valid email and password';
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.authService.login(credentials).subscribe(
      (response) => {
        this.isLoading = false;

        if (response.success) {
          // Navigate to students on successful login
          this.router.navigate(['/students']);
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Login error:', error);

        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 400) {
          this.errorMessage = 'Email and password are required';
        } else {
          this.errorMessage = 'Server error. Please try again later.';
        }
      }
    );
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
