import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

/**
 * AdminComponent - Debug and test API endpoints
 * Used for testing and debugging backend API functionality
 * Allows testing of getAllUsers and other endpoints
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Fetch all users from database
   * GET /api/users
   */
  getAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.getAllUsers().subscribe(
      (response) => {
        this.users = response.users || [];
        this.successMessage = `✅ Fetched ${this.users.length} users`;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = '❌ Failed to fetch users: ' + error.message;
        this.isLoading = false;
      }
    );
  }

  /**
   * Clear all data and messages
   */
  clearData(): void {
    this.users = [];
    this.errorMessage = '';
    this.successMessage = '';
  }
}
