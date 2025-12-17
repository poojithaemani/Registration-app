import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChildInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
  placeOfBirth: string;
}

export interface ParentGuardianInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  relationship: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  email: string;
  phoneType: string;
  phoneNumber: string;
  alternatePhoneType: string;
  alternatePhoneNumber: string;
}

export interface MedicalInfo {
  physicianFirstName: string;
  physicianLastName: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  phoneType: string;
  phoneNumber: string;
  alternatePhoneType: string;
  alternatePhoneNumber: string;
}

export interface CareFacilityInfo {
  emergencyContactName: string;
  emergencyPhoneNumber: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  phoneType: string;
}

export interface EnrollmentProgramDetails {
  schoolDay: string;
  programStatus: string;
  programType: string | number;
  enrollmentDate: Date;
  roomType: string | number;
  planType: string;
  nextPaymentDue: Date;
}

export interface RegistrationData {
  childId?: number;
  childInfo: ChildInfo;
  parentGuardianInfo: ParentGuardianInfo;
  medicalInfo: MedicalInfo;
  careFacilityInfo: CareFacilityInfo;
  enrollmentProgramDetails: EnrollmentProgramDetails;
}

@Injectable({
  providedIn: 'root',
})
/**
 * RegistrationDataService - Manages registration data state across components
 * Uses BehaviorSubject for reactive data sharing between registration and edit-registration components
 * Persists data during navigation and allows updates to individual info sections
 */
export class RegistrationDataService {
  private registrationDataSubject =
    new BehaviorSubject<RegistrationData | null>(null);
  public registrationData$: Observable<RegistrationData | null> =
    this.registrationDataSubject.asObservable();

  constructor() {}

  /**
   * Save complete registration data to service
   */
  saveRegistrationData(data: RegistrationData): void {
    this.registrationDataSubject.next(data);
  }

  /**
   * Get current registration data
   */
  getRegistrationData(): RegistrationData | null {
    return this.registrationDataSubject.value;
  }

  /**
   * Get child ID from stored registration data
   */
  getChildId(): number | undefined {
    return this.registrationDataSubject.value?.childId;
  }

  /**
   * Clear stored registration data
   */
  clearRegistrationData(): void {
    this.registrationDataSubject.next(null);
  }

  updateChildInfo(childInfo: ChildInfo): void {
    const currentData = this.registrationDataSubject.value;
    if (currentData) {
      currentData.childInfo = childInfo;
      this.registrationDataSubject.next(currentData);
    }
  }

  updateParentGuardianInfo(parentGuardianInfo: ParentGuardianInfo): void {
    const currentData = this.registrationDataSubject.value;
    if (currentData) {
      currentData.parentGuardianInfo = parentGuardianInfo;
      this.registrationDataSubject.next(currentData);
    }
  }

  updateMedicalInfo(medicalInfo: MedicalInfo): void {
    const currentData = this.registrationDataSubject.value;
    if (currentData) {
      currentData.medicalInfo = medicalInfo;
      this.registrationDataSubject.next(currentData);
    }
  }

  updateCareFacilityInfo(careFacilityInfo: CareFacilityInfo): void {
    const currentData = this.registrationDataSubject.value;
    if (currentData) {
      currentData.careFacilityInfo = careFacilityInfo;
      this.registrationDataSubject.next(currentData);
    }
  }

  updateEnrollmentProgramDetails(
    enrollmentProgramDetails: EnrollmentProgramDetails
  ): void {
    const currentData = this.registrationDataSubject.value;
    if (currentData) {
      currentData.enrollmentProgramDetails = enrollmentProgramDetails;
      this.registrationDataSubject.next(currentData);
    }
  }
}
