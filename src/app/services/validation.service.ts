import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
/**
 * ValidationService - Regex-based field validation rules
 * Provides validators for names, emails, phones, addresses, dates, zip codes
 */
export class ValidationService {
  private readonly nameRegex = /^(?=.*[a-zA-ZÀ-ÿ'])[a-zA-ZÀ-ÿ' ]{1,20}$/;
  private readonly phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  private readonly addressRegex =
    /^(?!\s+$)(?=.*[A-Za-z0-9])[A-Za-z0-9\s.,'#\-\/&()]{3,100}$/;
  private readonly cityRegex = /^[A-Za-zÀ-ÿ''.\- ]{1,100}$/;
  private readonly emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly dateOfBirthRegex =
    /^(?:(?:0[13578]|1[02])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}|(?:0[469]|11)\/(?:0[1-9]|[12]\d|30)\/(?:19|20)\d{2}|02\/(?:0[1-9]|1\d|2[0-8])\/(?:19|20)\d{2}|02\/29\/(?:19|20)(?:0[48]|[2468][048]|[13579][26]))$/;
  private readonly zipCodeRegex = /^\d{5}(-\d{4})?$/;

  constructor() {}

  isValidName(value: string): boolean {
    return this.nameRegex.test(value);
  }

  isValidPhone(value: string): boolean {
    return this.phoneRegex.test(value);
  }

  isValidAddress(value: string): boolean {
    return this.addressRegex.test(value);
  }

  isValidCity(value: string): boolean {
    return this.cityRegex.test(value);
  }

  isValidEmail(value: string): boolean {
    return this.emailRegex.test(value);
  }

  /**
   * Returns an Angular ValidatorFn that validates an email using the service regex.
   * Usage: [Validators.required, validationService.emailValidator()]
   */
  emailValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      return this.emailRegex.test(val) ? null : { email: true };
    };
  }

  isValidDateOfBirth(value: string): boolean {
    return this.dateOfBirthRegex.test(value);
  }

  isValidZipCode(value: string): boolean {
    return this.zipCodeRegex.test(value);
  }

  isValidPhoneNumber(phoneNumber: string): boolean {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.length === 10;
  }

  formatPhoneNumber(phoneNumber: string): string {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(
        3,
        6
      )}-${digitsOnly.slice(6)}`;
    }
    return phoneNumber;
  }

  isValidDateOfBirthDate(date: Date): boolean {
    if (!date) return false;
    const today = new Date();
    return date < today;
  }

  isValidFutureDate(date: Date): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  isFieldEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    return false;
  }
}
