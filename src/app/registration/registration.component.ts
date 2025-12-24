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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  private destroy$ = new Subject<void>();

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
    public validationService: ValidationService,
    private usStatesService: USStatesService,
    private registrationDataService: RegistrationDataService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    this.usStates = this.usStatesService.getAllStates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        [Validators.required, this.validationService.nameValidator()],
      ],
      childMiddleName: ['', this.validationService.nameValidator()],
      childLastName: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],
      gender: ['', Validators.required],
      dateOfBirth: [
        '',
        [Validators.required, this.validationService.dateOfBirthValidator()],
      ],
      placeOfBirth: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],

      // Parent/Guardian Info
      parentFirstName: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],
      parentMiddleName: ['', this.validationService.nameValidator()],
      parentLastName: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],
      relationship: ['', Validators.required],
      parentAddress1: [
        '',
        [Validators.required, this.validationService.addressValidator()],
      ],
      parentAddress2: ['', this.validationService.addressValidator()],
      parentCountry: [
        { value: 'United States', disabled: true },
        Validators.required,
      ],
      parentState: ['', Validators.required],
      parentCity: [
        '',
        [Validators.required, this.validationService.cityValidator()],
      ],
      parentZipCode: [
        '',
        [Validators.required, this.validationService.zipCodeValidator()],
      ],
      parentEmail: [
        '',
        [Validators.required, this.validationService.emailValidator()],
      ],
      parentPhoneType: ['', Validators.required],
      parentPhoneNumber: [
        '',
        [Validators.required, this.validationService.phoneValidator()],
      ],
      parentAlternatePhoneType: [''],
      parentAlternatePhoneNumber: ['', this.validationService.phoneValidator()],

      // Medical Info
      physicianFirstName: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],
      physicianMiddleName: ['', this.validationService.nameValidator()],
      physicianLastName: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],
      medicalAddress1: [
        '',
        [Validators.required, this.validationService.addressValidator()],
      ],
      medicalAddress2: ['', this.validationService.addressValidator()],
      medicalCountry: [
        { value: 'United States', disabled: true },
        Validators.required,
      ],
      medicalState: ['', Validators.required],
      medicalCity: [
        '',
        [Validators.required, this.validationService.cityValidator()],
      ],
      medicalZipCode: [
        '',
        [Validators.required, this.validationService.zipCodeValidator()],
      ],
      medicalPhoneType: ['', Validators.required],
      medicalPhoneNumber: [
        '',
        [Validators.required, this.validationService.phoneValidator()],
      ],
      medicalAlternatePhoneType: [''],
      medicalAlternatePhoneNumber: [
        '',
        this.validationService.phoneValidator(),
      ],

      // Care Facility Info
      emergencyContactName: [
        '',
        [Validators.required, this.validationService.nameValidator()],
      ],
      careFacilityAddress1: [
        '',
        [Validators.required, this.validationService.addressValidator()],
      ],
      careFacilityAddress2: ['', this.validationService.addressValidator()],
      careFacilityCountry: [
        { value: 'United States', disabled: true },
        Validators.required,
      ],
      careFacilityState: ['', Validators.required],
      careFacilityCity: [
        '',
        [Validators.required, this.validationService.cityValidator()],
      ],
      careFacilityZipCode: [
        '',
        [Validators.required, this.validationService.zipCodeValidator()],
      ],
      careFacilityPhoneType: ['', Validators.required],
      emergencyPhoneNumber: [
        '',
        [Validators.required, this.validationService.phoneValidator()],
      ],

      // Enrollment Program Details
      programType: ['', Validators.required],
      roomType: ['', Validators.required],
      planType: ['', Validators.required],
      enrollmentDate: [
        { value: this.getTodayDate(), disabled: true },
        Validators.required,
      ],
    });
  }

  /**
   * Loads dropdown options for program type, room type, and plan type
   * Calls getAllPrograms, getAllRoomTypes, and getAllPlans APIs and
   * maps the responses to the respective dropdown options arrays
   * If any of the calls fail, an error notification is displayed
   */
  loadDropdownOptions(): void {
    this.apiService
      .getAllPrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.programTypeOptions = this.filterExcludedOptions(
            data,
            'programname'
          );
        },
        error: () => this.notificationService.error('Failed to load programs'),
      });

    this.apiService
      .getAllRoomTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.roomTypeOptions = this.filterExcludedOptions(data, 'roomtype');
        },
        error: () =>
          this.notificationService.error('Failed to load room types'),
      });

    this.apiService
      .getAllPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.planTypeOptions = this.filterExcludedOptions(data, 'plantype');
        },
        error: () =>
          this.notificationService.error('Failed to load payment plans'),
      });
  }

  filterExcludedOptions(list: any[], field: string): any[] {
    if (!Array.isArray(list)) return [];
    const exclude = ['summer', 'delux', 'deluxe'];
    return list.filter((item) => {
      const val = (item[field] || '').toString().toLowerCase();
      return !exclude.some((ex) => val.includes(ex));
    });
  }

  scrollToFirstInvalid() {
    setTimeout(() => {
      const el = document.querySelector('.is-invalid');
      if (el && (el as HTMLElement).focus) {
        (el as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        try {
          (el as HTMLElement).focus();
        } catch (e) {}
      }
    }, 50);
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

  /** Trim leading/trailing spaces for all string controls in the form */
  trimAllStringControls() {
    if (!this.registrationForm) return;
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      if (!control) return;
      const val = control.value;
      if (typeof val === 'string') {
        const res = this.validationService.trimStringValue(val);
        const trimmed = res.trimmed;
        const currentErrors = control.errors ? { ...control.errors } : {};

        // If the user entered only spaces (has length but trims to empty),
        // set an explicit onlySpaces error and do not overwrite the value.
        if (res.onlySpaces) {
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
   * Formats name input by removing invalid characters
   * For name fields: keeps only letters, spaces, hyphens, apostrophes
   */
  formatNameInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const value = this.validationService.formatNameValue(raw);
    input.value = value;
    this.registrationForm.get(fieldName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Formats phone number input: keeps only digits, limits to 10
   */
  formatPhoneInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const value = this.validationService.formatPhoneDigits(raw);
    input.value = value;
    this.registrationForm.get(fieldName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Formats zip code input: keeps only digits, limits to 5
   */
  formatZipCode(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const value = this.validationService.formatZipDigits(raw);
    input.value = value;
    this.registrationForm.get(fieldName)?.setValue(value, { emitEvent: false });
  }

  /**
   * Gets error message for a specific field
   */
  getFieldErrorMessage(fieldName: string): string {
    const control = this.registrationForm.get(fieldName);
    return this.validationService.getFieldErrorMessage(control, fieldName);
  }

  /**
   * Formats a 10-digit phone number to (XXX) XXX-XXXX format
   * Removes all non-digit characters first, then applies formatting
   * @param {string} phoneNumber - The phone number to format
   * @returns {string} Formatted phone number or original if not 10 digits
   */
  formatPhoneNumber(phoneNumber: string): string {
    return this.validationService.formatPhoneNumber(phoneNumber);
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
      const val = control?.value;

      // treat null/undefined/empty/only-spaces as invalid
      if (!control || this.validationService.isFieldEmpty(val)) {
        allFieldsValid = false;
        if (control) {
          const currentErrors = control.errors ? { ...control.errors } : {};
          if (
            typeof val === 'string' &&
            val.length > 0 &&
            val.trim().length === 0
          ) {
            currentErrors['onlySpaces'] = true;
          } else {
            currentErrors['required'] = true;
          }
          control.setErrors(currentErrors);
          control.markAsTouched();
        }
      }
    }

    if (!allFieldsValid) {
      this.errorMessage =
        'Please fill all required fields to complete your registration';
      this.scrollToFirstInvalid();
      return;
    }

    // Validate phone numbers
    if (
      !this.validationService.isValidPhoneNumber(
        this.registrationForm.get('parentPhoneNumber')?.value
      )
    ) {
      const control = this.registrationForm.get('parentPhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.errorMessage = 'Parent phone number must be 10 digits';
      this.scrollToFirstInvalid();
      return;
    }

    if (
      !this.validationService.isValidPhoneNumber(
        this.registrationForm.get('medicalPhoneNumber')?.value
      )
    ) {
      const control = this.registrationForm.get('medicalPhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.errorMessage = 'Medical phone number must be 10 digits';
      this.scrollToFirstInvalid();
      return;
    }

    if (
      !this.validationService.isValidPhoneNumber(
        this.registrationForm.get('emergencyPhoneNumber')?.value
      )
    ) {
      const control = this.registrationForm.get('emergencyPhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.errorMessage = 'Emergency contact phone number must be 10 digits';
      this.scrollToFirstInvalid();
      return;
    }

    // Validate alternate phone numbers if provided
    const parentAlternateRaw = this.registrationForm.get(
      'parentAlternatePhoneNumber'
    )?.value;
    const parentAlternate = parentAlternateRaw
      ? String(parentAlternateRaw).trim()
      : '';
    if (
      parentAlternate &&
      !this.validationService.isValidPhoneNumber(parentAlternate)
    ) {
      const control = this.registrationForm.get('parentAlternatePhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.errorMessage = 'Parent alternate phone number must be 10 digits';
      this.scrollToFirstInvalid();
      return;
    }

    const medicalAlternateRaw = this.registrationForm.get(
      'medicalAlternatePhoneNumber'
    )?.value;
    const medicalAlternate = medicalAlternateRaw
      ? String(medicalAlternateRaw).trim()
      : '';
    if (
      medicalAlternate &&
      !this.validationService.isValidPhoneNumber(medicalAlternate)
    ) {
      const control = this.registrationForm.get('medicalAlternatePhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.errorMessage = 'Medical alternate phone number must be 10 digits';
      this.scrollToFirstInvalid();
      return;
    }

    // Final validity gate: ensure form is valid before constructing payload
    if (!this.registrationForm.valid) {
      Object.keys(this.registrationForm.controls).forEach((key) => {
        const ctrl = this.registrationForm.get(key);
        if (!ctrl) return;
        if (ctrl.invalid) {
          ctrl.markAsTouched();
          ctrl.markAsDirty();
        }
      });
      this.errorMessage = 'Please fill all required fields before submitting';
      this.scrollToFirstInvalid();
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
          this.registrationForm.get('parentPhoneNumber')?.value || ''
        ),
        alternatePhoneType: this.registrationForm.get(
          'parentAlternatePhoneType'
        )?.value,
        alternatePhoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('parentAlternatePhoneNumber')?.value || ''
        ),
      },
      medicalInfo: {
        physicianFirstName:
          this.registrationForm.get('physicianFirstName')?.value,
        physicianMiddleName: this.registrationForm.get('physicianMiddleName')
          ?.value,
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
          this.registrationForm.get('medicalPhoneNumber')?.value || ''
        ),
        alternatePhoneType: this.registrationForm.get(
          'medicalAlternatePhoneType'
        )?.value,
        alternatePhoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('medicalAlternatePhoneNumber')?.value || ''
        ),
      },
      careFacilityInfo: {
        emergencyContactName: this.registrationForm.get('emergencyContactName')
          ?.value,
        emergencyPhoneNumber: this.formatPhoneNumber(
          this.registrationForm.get('emergencyPhoneNumber')?.value || ''
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
    this.isSubmitting = true;
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
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Registration failed';
        this.notificationService.error('Registration failed');
        this.scrollToFirstInvalid();
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
