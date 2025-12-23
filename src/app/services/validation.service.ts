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
  // Name must start with a letter and may contain letters, spaces, hyphens, apostrophes (1-20 chars)
  private readonly nameRegex = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\- ]{0,19}$/;
  private readonly phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  // Address must start with letter or number, 3-100 chars
  private readonly addressRegex = /^[A-Za-z0-9][A-Za-z0-9\s.,'#\-\/&()]{2,99}$/;
  // City must start with a letter, allow letters, periods, hyphens, apostrophes and spaces
  private readonly cityRegex = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'.\- ]{0,99}$/;
  private readonly emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private readonly dateOfBirthRegex =
    /^(?:(?:0[13578]|1[02])\/(?:0[1-9]|[12]\d|3[01])\/(?:19|20)\d{2}|(?:0[469]|11)\/(?:0[1-9]|[12]\d|30)\/(?:19|20)\d{2}|02\/(?:0[1-9]|1\d|2[0-8])\/(?:19|20)\d{2}|02\/29\/(?:19|20)(?:0[48]|[2468][048]|[13579][26]))$/;
  private readonly zipCodeRegex = /^\d{5}$/;

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

  /**
   * Validator for names: must start with letter and match nameRegex
   */
  nameValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      const str = String(val).trim();
      if (str.length === 0) return null;
      return this.nameRegex.test(str) ? null : { invalidName: true };
    };
  }

  /**
   * Validator for phone numbers (10 digits)
   */
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      const digits = String(val).replace(/\D/g, '');
      if (digits.length !== 10 || /^0+$/.test(digits))
        return { invalidPhone: true };
      return null;
    };
  }

  /**
   * Validator for US zip codes (5 digits)
   */
  zipCodeValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      const str = String(val).replace(/\D/g, '');
      if (!this.zipCodeRegex.test(str) || /^0+$/.test(str))
        return { invalidZipCode: true };
      return null;
    };
  }

  /**
   * Validator for city names
   */
  cityValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      const str = String(val).trim();
      if (str.length === 0) return null;
      return this.cityRegex.test(str) ? null : { invalidCity: true };
    };
  }

  isValidDateOfBirth(value: string): boolean {
    return this.dateOfBirthRegex.test(value);
  }

  /**
   * Validator for Date of Birth fields.
   * Enforces: valid date, not in the future (today or later), and not earlier than 2000-01-01.
   * Usage: [Validators.required, validationService.dateOfBirthValidator()]
   */
  dateOfBirthValidator(minDate?: Date): ValidatorFn {
    const min = minDate ? new Date(minDate) : new Date(2000, 0, 1);
    min.setHours(0, 0, 0, 0);
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      const d = new Date(val);
      if (isNaN(d.getTime())) return { invalidDate: true };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d >= today) return { futureDate: true };
      if (d < min) return { minDate: true };
      return null;
    };
  }

  /**
   * Validator for addresses using the service regex.
   */
  addressValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const val = control.value;
      if (!val) return null;
      return this.addressRegex.test(String(val))
        ? null
        : { invalidAddress: true };
    };
  }

  isValidZipCode(value: string): boolean {
    if (!this.zipCodeRegex.test(value)) return false;
    const digitsOnly = value.replace(/\D/g, '');
    // reject zip codes composed only of zeros
    if (/^0+$/.test(digitsOnly)) return false;
    return true;
  }

  isValidPhoneNumber(phoneNumber: string): boolean {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    // must be exactly 10 digits and not all zeros
    return digitsOnly.length === 10 && !/^0+$/.test(digitsOnly);
  }

  /**
   * Trims a string and detects if it was only spaces
   * Returns an object with trimmed value and a flag indicating only-spaces
   */
  trimStringValue(value: string): { trimmed: string; onlySpaces: boolean } {
    if (value == null) return { trimmed: '', onlySpaces: false };
    const raw = String(value);
    const trimmed = raw.trim();
    const onlySpaces = raw.length > 0 && trimmed.length === 0;
    return { trimmed, onlySpaces };
  }

  /**
   * Format a name input value by removing invalid characters
   * Keeps letters, spaces, hyphens and apostrophes
   */
  formatNameValue(value: string): string {
    if (value == null) return '';
    return String(value).replace(/[^a-zA-ZÀ-ÿ\s' -]/g, '');
  }

  /**
   * Format a phone input value: keep only digits, max 10
   */
  formatPhoneDigits(value: string): string {
    if (value == null) return '';
    const digits = String(value).replace(/\D/g, '');
    return digits.substring(0, 10);
  }

  /**
   * Format a zip code value: keep only digits, max 5
   */
  formatZipDigits(value: string): string {
    if (value == null) return '';
    const digits = String(value).replace(/\D/g, '');
    return digits.substring(0, 5);
  }

  /**
   * Key press handler to allow only numeric input and optional max length.
   * Usage in template: (keypress)="validationService.keyPressNumbers($event,10)"
   */
  keyPressNumbers(event: KeyboardEvent, maxLength?: number): boolean {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Enter',
      'Home',
      'End',
    ];

    if (allowedKeys.includes(event.key)) return true;

    // allow ctrl/cmd shortcuts (copy/paste/select all)
    if ((event.ctrlKey || event.metaKey) && event.key.length === 1) return true;

    // only digits
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }

    if (maxLength && event.target) {
      try {
        const input = event.target as HTMLInputElement;
        const current = input.value || '';
        const digitsOnly = current.replace(/\D/g, '');
        if (digitsOnly.length >= maxLength) {
          event.preventDefault();
          return false;
        }
      } catch (e) {
        // ignore
      }
    }
    return true;
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

  /**
   * Returns a user-friendly error message for a form control.
   * If `fieldName` is provided, it will be used to create a readable label for required messages.
   */
  getFieldErrorMessage(
    control: AbstractControl | null,
    fieldName?: string
  ): string {
    if (!control || !control.errors) return '';

    const rawLabel = fieldName
      ? fieldName.replace(/([A-Z])/g, ' $1').trim()
      : '';
    const label = rawLabel
      ? rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase()
      : '';

    const errors = control.errors;
    if (errors['onlySpaces']) return 'Only spaces are not allowed';
    if (errors['futureDate']) return 'Date of birth cannot be in the future';
    if (errors['required'])
      return label ? `${label} is required` : 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['invalidAddress'])
      return 'Address must start with a letter or number and be 3-100 characters';
    if (errors['invalidName'])
      return 'Only starting with letters in between spaces, hyphens, and apostrophes are allowed';
    if (errors['invalidPhone']) return 'Phone number must be exactly 10 digits';
    if (errors['invalidZipCode']) return 'Zip code must be exactly 5 digits';
    return 'Invalid input';
  }
}
