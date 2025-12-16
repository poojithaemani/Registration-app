import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService } from '../services/validation.service';

/**
 * LoginComponent handles user authentication
 * Provides email/password form with validation and navigation to registration
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false; // Tracks whether password field is visible or masked
  submitted = false; // Tracks if form has been submitted
  errorMessage = ''; // Stores form validation error messages

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private validationService: ValidationService
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
   * Validates form fields and navigates to registration page on success
   */
  onLogin(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'All fields are required';
      return;
    }

    // Simulate successful login
    this.router.navigate(['/registration']);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
