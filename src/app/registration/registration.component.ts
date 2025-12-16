import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService } from '../services/validation.service';
import { USStatesService, USState } from '../services/us-states.service';
import {
  RegistrationDataService,
  RegistrationData,
} from '../services/registration-data.service';

/**
 * RegistrationComponent handles the multi-step student registration form
 * Collects comprehensive information across 5 sections:
 * - Child Information (name, gender, DOB, place of birth)
 * - Parent/Guardian Information (contact, address, relationship)
 * - Medical Information (physician details and contact)
 * - Care Facility Information (facility details and contact)
 * - Enrollment Program Details (program type, room type, enrollment date)
 *
 * Validates all fields and stores data in RegistrationDataService
 * Navigates to EditRegistrationComponent on successful submission
 */
@Component({
  selector: 'app-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup; // Reactive form for registration data
  submitted = false; // Tracks if form has been submitted for validation display
  errorMessage = ''; // Stores form-level error messages
  usStates: USState[] = []; // List of US states for dropdown selection

  // Dropdown options for form fields
  phoneTypeOptions = ['Cell', 'Home', 'Work', 'Other'];
  programTypeOptions = [
    'Full Time',
    'School Day',
    'Three Day Program',
    'Half Day Program',
  ];
  roomTypeOptions = ['Infant', 'Toddler', 'Primary'];
  relationshipOptions = ['Father', 'Mother', 'Guardian'];
  genderOptions = ['Male', 'Female', 'Other'];

  minDateOfBirth = new Date(2000, 0, 1);
  todayDate = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: ValidationService,
    private usStatesService: USStatesService,
    private registrationDataService: RegistrationDataService
  ) {
    this.usStates = this.usStatesService.getAllStates();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initializes the reactive form with all registration fields
   * Groups fields into logical sections: Child Info, Parent/Guardian, Medical, Care Facility, Enrollment
   * All required fields have Validators.required, optional fields are empty validators
   */
  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      // Child Info
      childFirstName: ['', Validators.required],
      childMiddleName: [''],
      childLastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      placeOfBirth: ['', Validators.required],

      // Parent/Guardian Info
      parentFirstName: ['', Validators.required],
      parentMiddleName: [''],
      parentLastName: ['', Validators.required],
      relationship: ['', Validators.required],
      parentAddress1: ['', Validators.required],
      parentAddress2: [''],
      parentCountry: ['United States', Validators.required],
      parentState: ['', Validators.required],
      parentCity: ['', Validators.required],
      parentZipCode: ['', Validators.required],
      parentEmail: ['', [Validators.required, Validators.email]],
      parentPhoneType: ['', Validators.required],
      parentPhoneNumber: ['', Validators.required],
      parentAlternatePhoneType: [''],
      parentAlternatePhoneNumber: [''],

      // Medical Info
      physicianFirstName: ['', Validators.required],
      physicianLastName: ['', Validators.required],
      medicalAddress1: ['', Validators.required],
      medicalAddress2: [''],
      medicalCountry: ['United States', Validators.required],
      medicalState: ['', Validators.required],
      medicalCity: ['', Validators.required],
      medicalZipCode: ['', Validators.required],
      medicalPhoneType: ['', Validators.required],
      medicalPhoneNumber: ['', Validators.required],
      medicalAlternatePhoneType: [''],
      medicalAlternatePhoneNumber: [''],

      // Care Facility Info
      careFacilityName: ['', Validators.required],
      careFacilityAddress1: ['', Validators.required],
      careFacilityAddress2: [''],
      careFacilityCountry: ['United States', Validators.required],
      careFacilityState: ['', Validators.required],
      careFacilityCity: ['', Validators.required],
      careFacilityZipCode: ['', Validators.required],
      careFacilityPhoneType: ['', Validators.required],
      careFacilityPhoneNumber: ['', Validators.required],

      // Enrollment Program Details
      programType: ['', Validators.required],
      roomType: ['', Validators.required],
      enrollmentDate: [this.getTodayDate(), Validators.required],
    });
  }

  /**
   * Gets today's date in ISO format (YYYY-MM-DD)
   * Used as default value for enrollment date field
   * @returns {string} Today's date in ISO format
   */
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Gets the minimum date of birth (01/01/2000) in ISO format
   * Used to restrict date picker to only allow children born from year 2000 onwards
   * @returns {string} Minimum DOB date in ISO format
   */
  getMinDateOfBirth(): string {
    return this.minDateOfBirth.toISOString().split('T')[0];
  }

  /**
   * Validates name fields to ensure they contain only letters, spaces, hyphens, and apostrophes
   * Empty values are allowed (for optional fields like middle name)
   * @param {string} value - The field value to validate
   * @param {string} fieldName - Name of the field being validated (for logging)
   * @returns {boolean} True if valid or empty, false if contains invalid characters
   */
  validateNameField(value: string, fieldName: string): boolean {
    if (!value) return true;
    if (!/^[a-zA-Z\s'-]*$/.test(value)) {
      return false;
    }
    return true;
  }

  /**
   * Formats a 10-digit phone number to (XXX) XXX-XXXX format
   * Removes all non-digit characters first, then applies formatting
   * @param {string} phoneNumber - The phone number to format
   * @returns {string} Formatted phone number or original if not 10 digits
   */
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

  /**
   * Handles form submission and validation
   * Validates all required fields and validates phone numbers (10 digits)
   * Formats phone numbers and collects all form data into RegistrationData object
   * Saves data to service and navigates to edit-registration page on success
   */
  onCompleteRegistration(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Validate required fields
    const requiredFields = [
      'childFirstName',
      'childLastName',
      'gender',
      'dateOfBirth',
      'placeOfBirth',
      'parentFirstName',
      'parentLastName',
      'relationship',
      'parentAddress1',
      'parentState',
      'parentCity',
      'parentZipCode',
      'parentEmail',
      'parentPhoneType',
      'parentPhoneNumber',
      'physicianFirstName',
      'physicianLastName',
      'medicalAddress1',
      'medicalState',
      'medicalCity',
      'medicalZipCode',
      'medicalPhoneType',
      'medicalPhoneNumber',
      'careFacilityName',
      'careFacilityAddress1',
      'careFacilityState',
      'careFacilityCity',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'careFacilityPhoneNumber',
      'programType',
      'roomType',
      'enrollmentDate',
    ];

    let allFieldsValid = true;
    for (const field of requiredFields) {
      const control = this.registrationForm.get(field);
      if (!control || !control.value) {
        allFieldsValid = false;
        control?.markAsTouched();
      }
    }

    if (!allFieldsValid) {
      this.errorMessage =
        'Please fill all required fields to complete your registration';
      return;
    }

    // Validate phone numbers
    if (
      !this.validationService.isValidPhoneNumber(
        this.registrationForm.get('parentPhoneNumber')?.value
      )
    ) {
      this.errorMessage = 'Parent phone number must be 10 digits';
      return;
    }

    if (
      !this.validationService.isValidPhoneNumber(
        this.registrationForm.get('medicalPhoneNumber')?.value
      )
    ) {
      this.errorMessage = 'Medical phone number must be 10 digits';
      return;
    }

    if (
      !this.validationService.isValidPhoneNumber(
        this.registrationForm.get('careFacilityPhoneNumber')?.value
      )
    ) {
      this.errorMessage = 'Care facility phone number must be 10 digits';
      return;
    }

    // Validate alternate phone numbers if provided
    const parentAlternate = this.registrationForm.get(
      'parentAlternatePhoneNumber'
    )?.value;
    if (
      parentAlternate &&
      !this.validationService.isValidPhoneNumber(parentAlternate)
    ) {
      this.errorMessage = 'Parent alternate phone number must be 10 digits';
      return;
    }

    const medicalAlternate = this.registrationForm.get(
      'medicalAlternatePhoneNumber'
    )?.value;
    if (
      medicalAlternate &&
      !this.validationService.isValidPhoneNumber(medicalAlternate)
    ) {
      this.errorMessage = 'Medical alternate phone number must be 10 digits';
      return;
    }

    // Save registration data
    const registrationData: RegistrationData = {
      childInfo: {
        firstName: this.registrationForm.get('childFirstName')?.value,
        middleName: this.registrationForm.get('childMiddleName')?.value,
        lastName: this.registrationForm.get('childLastName')?.value,
        gender: this.registrationForm.get('gender')?.value,
        dateOfBirth: this.registrationForm.get('dateOfBirth')?.value,
        placeOfBirth: this.registrationForm.get('placeOfBirth')?.value,
      },
      parentGuardianInfo: {
        firstName: this.registrationForm.get('parentFirstName')?.value,
        middleName: this.registrationForm.get('parentMiddleName')?.value,
        lastName: this.registrationForm.get('parentLastName')?.value,
        relationship: this.registrationForm.get('relationship')?.value,
        address1: this.registrationForm.get('parentAddress1')?.value,
        address2: this.registrationForm.get('parentAddress2')?.value,
        country: this.registrationForm.get('parentCountry')?.value,
        state: this.registrationForm.get('parentState')?.value,
        city: this.registrationForm.get('parentCity')?.value,
        zipCode: this.registrationForm.get('parentZipCode')?.value,
        email: this.registrationForm.get('parentEmail')?.value,
        phoneType: this.registrationForm.get('parentPhoneType')?.value,
        phoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('parentPhoneNumber')?.value
        ),
        alternatePhoneType: this.registrationForm.get(
          'parentAlternatePhoneType'
        )?.value,
        alternatePhoneNumber: this.registrationForm.get(
          'parentAlternatePhoneNumber'
        )?.value,
      },
      medicalInfo: {
        physicianFirstName:
          this.registrationForm.get('physicianFirstName')?.value,
        physicianLastName:
          this.registrationForm.get('physicianLastName')?.value,
        address1: this.registrationForm.get('medicalAddress1')?.value,
        address2: this.registrationForm.get('medicalAddress2')?.value,
        country: this.registrationForm.get('medicalCountry')?.value,
        state: this.registrationForm.get('medicalState')?.value,
        city: this.registrationForm.get('medicalCity')?.value,
        zipCode: this.registrationForm.get('medicalZipCode')?.value,
        phoneType: this.registrationForm.get('medicalPhoneType')?.value,
        phoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('medicalPhoneNumber')?.value
        ),
        alternatePhoneType: this.registrationForm.get(
          'medicalAlternatePhoneType'
        )?.value,
        alternatePhoneNumber: this.registrationForm.get(
          'medicalAlternatePhoneNumber'
        )?.value,
      },
      careFacilityInfo: {
        name: this.registrationForm.get('careFacilityName')?.value,
        address1: this.registrationForm.get('careFacilityAddress1')?.value,
        address2: this.registrationForm.get('careFacilityAddress2')?.value,
        country: this.registrationForm.get('careFacilityCountry')?.value,
        state: this.registrationForm.get('careFacilityState')?.value,
        city: this.registrationForm.get('careFacilityCity')?.value,
        zipCode: this.registrationForm.get('careFacilityZipCode')?.value,
        phoneType: this.registrationForm.get('careFacilityPhoneType')?.value,
        phoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('careFacilityPhoneNumber')?.value
        ),
      },
      enrollmentProgramDetails: {
        schoolDay: '',
        programStatus: '',
        programType: this.registrationForm.get('programType')?.value,
        enrollmentDate: this.registrationForm.get('enrollmentDate')?.value,
        roomType: this.registrationForm.get('roomType')?.value,
        nextPaymentDue: new Date(),
      },
    };

    this.registrationDataService.saveRegistrationData(registrationData);
    this.router.navigate(['/edit-registration']);
  }

  /**
   * Checks if a form field should display error messages
   * Shows errors when field is invalid and has been touched, made dirty, or form has been submitted
   * @param {string} fieldName - The name of the form field to check
   * @returns {boolean} True if field has validation errors that should be displayed
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.submitted)
    );
  }

  /**
   * Checks if a form field has the required validator
   * @param {string} fieldName - The name of the form field to check
   * @returns {boolean} True if field is required, false otherwise
   */
  isRequiredField(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    if (!field || !field.validator) return false;
    const validator = field.validator({} as any);
    return validator && validator['required'];
  }

  /**
   * Restricts phone number input to digits only and enforces 10-digit maximum
   * Prevents entry of letters and special characters via keypress event
   * @param {KeyboardEvent} event - The keyboard event from the input field
   * @param {string} fieldName - The name of the phone field being edited
   */
  onPhoneKeypress(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');

    // Allow only digits
    if (!/\d/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Prevent more than 10 digits
    if (digitsOnly.length >= 10) {
      event.preventDefault();
      return;
    }
  }

  /**
   * Navigates user back to login page
   * Called when user clicks "Back to Login" link
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
