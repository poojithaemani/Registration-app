import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegistrationData } from './registration-data.service';

export interface PaymentPlan {
  paymentplanid: number;
  plantype: string;
  planduration: number;
}

export interface Program {
  programid: number;
  programname: string;
}

export interface RoomType {
  roomtypeid: number;
  roomtype: string;
}

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

  updateEnrollment(
    childId: number,
    enrollmentProgramDetails: any
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/registrations/${childId}/enrollment`,
      enrollmentProgramDetails
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

  /**Get all Plans, Programs and Room Types
   * @returns Observable with array of all plans, programs, and room types
   */
  getAllPlans(): Observable<PaymentPlan[]> {
    return this.http.get<PaymentPlan[]>(`${this.apiUrl}/payment-plans`);
  }

  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/programs`);
  }

  getAllRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.apiUrl}/room-types`);
  }

  /**Update plan, program, or room type information using PUT
   * @param id - Unique identifier for the plan, program, or room type to update
   * @param data - Updated information for the plan, program, or room type
   * @returns Observable with update response
   */
  updatePlan(id: number, data: PaymentPlan): Observable<PaymentPlan> {
    return this.http.put<PaymentPlan>(
      `${this.apiUrl}/payment-plans/${id}`,
      data
    );
  }

  updateProgram(id: number, data: Program): Observable<Program> {
    return this.http.put<Program>(`${this.apiUrl}/programs/${id}`, data);
  }

  updateRoomType(id: number, data: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/room-types/${id}`, data);
  }
}
