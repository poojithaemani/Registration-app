import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegistrationData } from './registration-data.service';

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
    return this.http.post(`${this.apiUrl}/registrations`, studentData);
  }

  /**
   * Retrieve student registration data by ID
   * @param studentId - Unique student identifier
   * @returns Observable with student data
   */
  getStudentData(childId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/registrations/${childId}`);
  }

  /**
   * Update existing student registration data
   * @param studentId - Unique student identifier
   * @param studentData - Updated student data
   * @returns Observable with update response
   */
  updateStudentData(childId: number, studentData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/registrations/${childId}`,
      studentData
    );
  }

  /**
   * Update existing student registration data
   * @param childId - Child ID for the registration to update
   * @param registrationData - Updated student data
   * @returns Observable with update response
   */
  updateRegistration(
    childId: number,
    registrationData: RegistrationData
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/registrations/${childId}`,
      registrationData
    );
  }

  /**
   * Student Management Endpoints
   */

  /**
   * Get all students with complete information
   * @returns Observable with array of all students
   */
  getAllStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`);
  }

  /**
   * Get single student by ID with complete information
   * @param childId - Child ID to retrieve
   * @returns Observable with student data
   */
  getStudentById(childId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${childId}`);
  }

  /**
   * Update student information using PATCH
   * @param childId - Child ID to update
   * @param studentData - Updated student data
   * @returns Observable with update response
   */
  updateStudent(childId: number, studentData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/students/${childId}`, studentData);
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
}
