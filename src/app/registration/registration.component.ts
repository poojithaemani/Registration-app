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
import {
  ApiService,
  Program,
  RoomType,
  PaymentPlan,
} from '../services/api.service';
import { NotificationService } from '../services/notification.service';
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
  isSubmitting = false; // Tracks if form is currently being submitted
  errorMessage = ''; // Stores form-level error messages
  successMessage = ''; // Stores success messages
  usStates: USState[] = []; // List of US states for dropdown selection

  // Dropdown options for form field selections
  phoneTypeOptions = ['Cell', 'Home', 'Work', 'Other'];
  programTypeOptions: Program[] = [];
  roomTypeOptions: RoomType[] = [];
  relationshipOptions = ['Father', 'Mother', 'Guardian'];
  genderOptions = ['Male', 'Female'];
  planTypeOptions: PaymentPlan[] = [];

  minDateOfBirth = new Date(2000, 0, 1);

  /** Today's date for validation */
  todayDate = new Date();

  /**
   * Component constructor - initializes services
   * @param formBuilder - Angular FormBuilder for reactive form creation
   * @param router - Angular Router for navigation
   * @param validationService - Service for form field validation rules
   * @param usStatesService - Service providing US states list
   * @param registrationDataService - Service for persisting registration data across routes
   * @param apiService - Service for backend API communication
   * @param notificationService - Service for displaying notifications/logs
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: ValidationService,
    private usStatesService: USStatesService,
    private registrationDataService: RegistrationDataService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    this.usStates = this.usStatesService.getAllStates();
  }

  /**
   * Angular lifecycle hook - called after component initialization
   * Triggers form creation
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownOptions();
  }

  /**
   * Initializes the reactive form with all registration fields
   * Groups fields into logical sections: Child Info, Parent/Guardian, Medical, Care Facility, Enrollment
   * All required fields have Validators.required, optional fields are empty validators
   * Includes custom validators for email, phone, zip code formats
   */

  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      // Child Info
      childFirstName: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      childMiddleName: ['', this.nameValidator.bind(this)],
      childLastName: ['', [Validators.required, this.nameValidator.bind(this)]],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      placeOfBirth: ['', [Validators.required, this.nameValidator.bind(this)]],

      // Parent/Guardian Info
      parentFirstName: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      parentMiddleName: ['', this.nameValidator.bind(this)],
      parentLastName: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      relationship: ['', Validators.required],
      parentAddress1: ['', Validators.required],
      parentAddress2: [''],
      parentCountry: [
        { value: 'United States', disabled: true },
        Validators.required,
      ],
      parentState: ['', Validators.required],
      parentCity: ['', [Validators.required, this.nameValidator.bind(this)]],
      parentZipCode: [
        '',
        [Validators.required, this.zipCodeValidator.bind(this)],
      ],
      parentEmail: ['', [Validators.required, Validators.email]],
      parentPhoneType: ['', Validators.required],
      parentPhoneNumber: [
        '',
        [Validators.required, this.phoneValidator.bind(this)],
      ],
      parentAlternatePhoneType: [''],
      parentAlternatePhoneNumber: ['', this.phoneValidator.bind(this)],

      // Medical Info
      physicianFirstName: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      physicianLastName: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      medicalAddress1: ['', Validators.required],
      medicalAddress2: [''],
      medicalCountry: [
        { value: 'United States', disabled: true },
        Validators.required,
      ],
      medicalState: ['', Validators.required],
      medicalCity: ['', [Validators.required, this.nameValidator.bind(this)]],
      medicalZipCode: [
        '',
        [Validators.required, this.zipCodeValidator.bind(this)],
      ],
      medicalPhoneType: ['', Validators.required],
      medicalPhoneNumber: [
        '',
        [Validators.required, this.phoneValidator.bind(this)],
      ],
      medicalAlternatePhoneType: [''],
      medicalAlternatePhoneNumber: ['', this.phoneValidator.bind(this)],

      // Care Facility Info
      emergencyContactName: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      careFacilityAddress1: ['', Validators.required],
      careFacilityAddress2: [''],
      careFacilityCountry: [
        { value: 'United States', disabled: true },
        Validators.required,
      ],
      careFacilityState: ['', Validators.required],
      careFacilityCity: [
        '',
        [Validators.required, this.nameValidator.bind(this)],
      ],
      careFacilityZipCode: [
        '',
        [Validators.required, this.zipCodeValidator.bind(this)],
      ],
      careFacilityPhoneType: ['', Validators.required],
      emergencyPhoneNumber: [
        '',
        [Validators.required, this.phoneValidator.bind(this)],
      ],

      // Enrollment Program Details
      programType: ['', Validators.required],
      roomType: ['', Validators.required],
      planType: ['', Validators.required],
      enrollmentDate: [this.getTodayDate(), Validators.required],
    });
  }

  /**
   * Loads dropdown options for program type, room type, and plan type
   * Calls getAllPrograms, getAllRoomTypes, and getAllPlans APIs and
   * maps the responses to the respective dropdown options arrays
   * If any of the calls fail, an error notification is displayed
   */
  loadDropdownOptions(): void {
    this.apiService.getAllPrograms().subscribe({
      next: (data) => {
        this.programTypeOptions = data;
      },
      error: () => this.notificationService.error('Failed to load programs'),
    });

    this.apiService.getAllRoomTypes().subscribe({
      next: (data) => {
        this.roomTypeOptions = data;
      },
      error: () => this.notificationService.error('Failed to load room types'),
    });

    this.apiService.getAllPlans().subscribe({
      next: (data) => {
        this.planTypeOptions = data;
      },
      error: () =>
        this.notificationService.error('Failed to load payment plans'),
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
   * Formats a camelCase string to a capitalized, space-separated string
   * @param text The text to format
   * @returns The formatted text
   */
  formatDropdownText(text: string): string {
    if (!text) return '';
    const spacedText = text.replace(/([A-Z])/g, ' $1');
    return spacedText.charAt(0).toUpperCase() + spacedText.slice(1);
  }

  /**
   * Validates name fields to ensure they contain only letters, spaces, hyphens, and apostrophes
   * Empty values are allowed (for optional fields like middle name)
   * Custom validator for use in FormBuilder
   */
  nameValidator(control: any) {
    if (control.value == null) return null;
    const raw = String(control.value);
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmed)) {
      return { invalidName: true };
    }
    return null;
  }

  /** Trim leading/trailing spaces for all string controls in the form */
  trimAllStringControls() {
    if (!this.registrationForm) return;
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      if (!control) return;
      const val = control.value;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const currentErrors = control.errors ? { ...control.errors } : {};

        // If the user entered only spaces (has length but trims to empty),
        // set an explicit onlySpaces error and do not overwrite the value.
        if (val.length > 0 && trimmed.length === 0) {
          currentErrors['onlySpaces'] = true;
          control.setErrors(currentErrors);
          return;
        }

        // Remove onlySpaces error if present and value is not only spaces
        if (currentErrors['onlySpaces']) {
          delete currentErrors['onlySpaces'];
          const hasOther = Object.keys(currentErrors).length > 0;
          control.setErrors(hasOther ? currentErrors : null);
        }

        // Trim normal values
        if (trimmed !== val) {
          control.setValue(trimmed, { emitEvent: false });
        }
      }
    });
  }

  // Note: Using Angular's built-in Validators.email for generic email validation

  /**
   * Validates phone numbers to be 10 digits only (US format)
   * Custom validator for use in FormBuilder
   */
  phoneValidator(control: any) {
    if (!control.value) return null;
    const phoneRegex = /^\d{10}$/;
    const digitsOnly = control.value.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return { invalidPhone: true };
    }
    return null;
  }

  /**
   * Validates zip codes to be 5 digits (US format)
   * Custom validator for use in FormBuilder
   */
  zipCodeValidator(control: any) {
    if (!control.value) return null;
    const zipRegex = /^\d{5}$/;
    const digitsOnly = control.value.replace(/\D/g, '');
    if (digitsOnly.length !== 5) {
      return { invalidZipCode: true };
    }
    return null;
  }

  /**
   * Sanitizes input by removing invalid characters
   * For name fields: keeps only letters, spaces, hyphens, apostrophes
   */
  sanitizeNameInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    // Allow only letters, spaces, hyphens, and apostrophes
    value = value.replace(/[^a-zA-Z\s'-]/g, '');
    input.value = value;
    this.registrationForm.get(fieldName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Sanitizes phone number input
   * For phone fields: keeps only digits, limits to 10
   */
  sanitizePhoneInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    // Limit to 10 digits
    value = value.substring(0, 10);
    input.value = value;
    this.registrationForm.get(fieldName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Sanitizes zip code input
   * For zip fields: keeps only digits, limits to 5
   */
  sanitizeZipInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    // Limit to 5 digits
    value = value.substring(0, 5);
    input.value = value;
    this.registrationForm.get(fieldName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Gets error message for a specific field
   */
  getFieldErrorMessage(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    if (!control || !control.errors) return '';
    const rawLabel = fieldName.replace(/([A-Z])/g, ' $1').trim();
    const label =
      rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();

    if (control.errors['onlySpaces']) return 'Only spaces are not allowed';
    if (control.errors['required']) return `${label} is required`;
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['whitespace']) {
      if (this.isRequiredField(fieldName)) return `${label} is required`;
      return '';
    }
    if (control.errors['invalidName'])
      return 'Only letters, spaces, hyphens, and apostrophes are allowed';
    if (control.errors['invalidPhone'])
      return 'Phone number must be exactly 10 digits';
    if (control.errors['invalidZipCode'])
      return 'Zip code must be exactly 5 digits';
    return 'Invalid input';
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
  submitRegistration(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Trim whitespace from all string controls before validating
    this.trimAllStringControls();

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
      'emergencyContactName',
      'careFacilityAddress1',
      'careFacilityState',
      'careFacilityCity',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'emergencyPhoneNumber',
      'programType',
      'roomType',
      'planType',
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
        this.registrationForm.get('emergencyPhoneNumber')?.value
      )
    ) {
      this.errorMessage = 'Emergency contact phone number must be 10 digits';
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
    const registrationData: any = {
      email: this.registrationForm.get('parentEmail')?.value,
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
        alternatePhoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('parentAlternatePhoneNumber')?.value
        ),
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
        alternatePhoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('medicalAlternatePhoneNumber')?.value
        ),
      },
      careFacilityInfo: {
        emergencyContactName: this.registrationForm.get('emergencyContactName')
          ?.value,
        emergencyPhoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('emergencyPhoneNumber')?.value
        ),
        address1: this.registrationForm.get('careFacilityAddress1')?.value,
        address2: this.registrationForm.get('careFacilityAddress2')?.value,
        country: this.registrationForm.get('careFacilityCountry')?.value,
        state: this.registrationForm.get('careFacilityState')?.value,
        city: this.registrationForm.get('careFacilityCity')?.value,
        zipCode: this.registrationForm.get('careFacilityZipCode')?.value,
        phoneType: this.registrationForm.get('careFacilityPhoneType')?.value,
      },
      enrollmentProgramDetails: {
        schoolDay: '',
        programStatus: '',
        programType: Number(this.registrationForm.get('programType')?.value),
        enrollmentDate: this.registrationForm.get('enrollmentDate')?.value,
        roomType: Number(this.registrationForm.get('roomType')?.value),
        planType: Number(this.registrationForm.get('planType')?.value),
        nextPaymentDue: new Date(),
      },
    };
    this.apiService.registerStudent(registrationData).subscribe({
      next: (response) => {
        // Save the registration data (both response and local data for backup)
        const dataToSave: any = {
          ...response,
          // Fallback to local data structure if response doesn't have all fields
          childInfo: response.childInfo || registrationData.childInfo,
          parentGuardianInfo:
            response.parentGuardianInfo || registrationData.parentGuardianInfo,
          medicalInfo: response.medicalInfo || registrationData.medicalInfo,
          careFacilityInfo:
            response.careFacilityInfo || registrationData.careFacilityInfo,
          enrollmentProgramDetails:
            response.enrollmentProgramDetails ||
            registrationData.enrollmentProgramDetails,
        };
        this.registrationDataService.saveRegistrationData(dataToSave);
        this.notificationService.success('Registration Saved Successfully!');
        this.successMessage = 'Registration Saved Successfully!';
        // Navigate after 3 seconds to show the snackbar message
        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/edit-registration']);
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Registration failed';
        this.notificationService.error('Registration failed');
      },
    });
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
   * Navigates user to students page
   * Called when user clicks "Back to Students" link
   */
  navigateToStudents(): void {
    this.router.navigate(['/students']);
  }
}
