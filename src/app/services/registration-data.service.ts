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
  name: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  phoneType: string;
  phoneNumber: string;
}

export interface EnrollmentProgramDetails {
  schoolDay: string;
  programStatus: string;
  programType: string;
  enrollmentDate: Date;
  roomType: string;
  nextPaymentDue: Date;
}

export interface RegistrationData {
  childInfo: ChildInfo;
  parentGuardianInfo: ParentGuardianInfo;
  medicalInfo: MedicalInfo;
  careFacilityInfo: CareFacilityInfo;
  enrollmentProgramDetails: EnrollmentProgramDetails;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationDataService {
  private registrationDataSubject =
    new BehaviorSubject<RegistrationData | null>(null);
  public registrationData$: Observable<RegistrationData | null> =
    this.registrationDataSubject.asObservable();

  constructor() {}

  saveRegistrationData(data: RegistrationData): void {
    this.registrationDataSubject.next(data);
  }

  getRegistrationData(): RegistrationData | null {
    return this.registrationDataSubject.value;
  }

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
