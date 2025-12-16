import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * ApiService - Centralized API communication layer
 * Handles all HTTP requests to backend endpoints
 * Provides methods for authentication, registration, and data management
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  /**
   * User Authentication Endpoints
   */

  /**
   * Login user with email and password
   * @param credentials - { email: string, password: string }
   * @returns Observable with login response containing user data and canRegister flag
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Student Registration Endpoints
   */

  /**
   * Register a new student with form data
   * @param studentData - Student registration form data
   * @returns Observable with registration response
   */
  registerStudent(studentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-student`, studentData);
  }

  /**
   * Retrieve student registration data by ID
   * @param studentId - Unique student identifier
   * @returns Observable with student data
   */
  getStudentData(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${studentId}`);
  }

  /**
   * Update existing student registration data
   * @param studentId - Unique student identifier
   * @param studentData - Updated student data
   * @returns Observable with update response
   */
  updateStudentData(studentId: number, studentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/student/${studentId}`, studentData);
  }

  /**
   * User Management Endpoints
   */

  /**
   * Get all users with their role information
   * @returns Observable with array of all users
   */
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  /**
   * Get user profile by ID
   * @param userId - Unique user identifier
   * @returns Observable with user profile data
   */
  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Update user profile
   * @param userId - Unique user identifier
   * @param userData - Updated user data
   * @returns Observable with update response
   */
  updateUserProfile(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/${userId}`, userData);
  }

  /**
   * Change user password
   * @param userId - Unique user identifier
   * @param passwordData - { oldPassword: string, newPassword: string }
   * @returns Observable with change password response
   */
  changePassword(
    userId: number,
    passwordData: { oldPassword: string; newPassword: string }
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/user/${userId}/change-password`,
      passwordData
    );
  }
}
