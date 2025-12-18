import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService } from '../services/validation.service';
import { USStatesService, USState } from '../services/us-states.service';
import {
  RegistrationDataService,
  RegistrationData,
} from '../services/registration-data.service';
import { ApiService } from '../services/api.service';
import { AuthenticationService } from '../services/authentication.service';
import { NotificationService } from '../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-registration',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-registration.component.html',
  styleUrl: './edit-registration.component.css',
})
/**
 * EditRegistrationComponent - View and edit student registration information
 *
 * Features:
 * - Display all student registration data from the service
 * - Edit mode to allow field modifications (except enrollment details)
 * - Search and highlight functionality to find specific fields
 * - Save changes to backend API or cancel to revert
 * - Form validation matching registration component rules
 * - Auto-populate from stored registration data or redirect to login
 */
export class EditRegistrationComponent implements OnInit, OnDestroy {
  registrationForm!: FormGroup;
  registrationData: RegistrationData | null = null;
  originalFormData: any = null;
  isEditMode = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  usStates: USState[] = [];
  searchTerm = '';
  highlightedFields: Set<string> = new Set();
  loading = true;

  phoneTypeOptions = ['Cell', 'Home', 'Work', 'Other'];
  relationshipOptions = ['Father', 'Mother', 'Guardian'];
  genderOptions = ['Male', 'Female', 'Other'];

  /** Maps database program type IDs to string values */
  programTypeReverseMapping: { [key: number]: string } = {
    1: 'fullTime',
    2: 'schoolDay',
    3: 'threeDayProgram',
    4: 'halfDayProgram',
  };

  /** Maps database room type IDs to string values */
  roomTypeReverseMapping: { [key: number]: string } = {
    1: 'infant',
    2: 'toddler',
    3: 'primary',
  };

  minDateOfBirth = new Date(2000, 0, 1);
  todayDate = new Date();
  childId: number | null = null;

  private destroy$ = new Subject<void>();

  /**
   * Component constructor - initializes services and loads US states dropdown
   * @param formBuilder - Angular FormBuilder for reactive form creation
   * @param router - Angular Router for navigation
   * @param validationService - Service for form field validation
   * @param usStatesService - Service providing US states list
   * @param registrationDataService - Service managing registration data state
   * @param apiService - Service for backend API communication
   * @param authService - Service for authentication and user data
   * @param notificationService - Service for displaying notifications/logs
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private validationService: ValidationService,
    private usStatesService: USStatesService,
    private registrationDataService: RegistrationDataService,
    private apiService: ApiService,
    private authService: AuthenticationService,
    private notificationService: NotificationService
  ) {
    this.usStates = this.usStatesService.getAllStates();
  }

  /**
   * Angular lifecycle hook - called after component initialization
   * Triggers loading of registration data from service
   */
  ngOnInit(): void {
    this.loadRegistrationData();
  }

  /**
   * Angular lifecycle hook - called before component destruction
   * Completes the destroy$ subject to unsubscribe from all observables
   * Prevents memory leaks from active subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load registration data from RegistrationDataService
   * If data is not available, redirects user to login page
   * Sets loading state and initializes form once data is loaded
   *
   */
  loadRegistrationData(): void {
    this.registrationData = this.registrationDataService.getRegistrationData();

    if (this.registrationData && this.registrationData.childInfo) {
      this.initializeForm();
      this.loading = false;
    } else {
      // Try to fetch from API if available
      this.router.navigate(['/login']);
    }
  }

  /**
   * Initialize the reactive form with all fields
   */
  initializeForm(): void {
    if (!this.registrationData) {
      this.router.navigate(['/login']);
      return;
    }

    const data = this.registrationData;

    // Store child ID for API updates
    this.childId = this.registrationData.childId || null;

    this.registrationForm = this.formBuilder.group({
      // Child Info
      childFirstName: [
        { value: data.childInfo.firstName, disabled: !this.isEditMode },
        Validators.required,
      ],
      childMiddleName: [
        { value: data.childInfo.middleName, disabled: !this.isEditMode },
      ],
      childLastName: [
        { value: data.childInfo.lastName, disabled: !this.isEditMode },
        Validators.required,
      ],
      gender: [
        { value: data.childInfo.gender, disabled: !this.isEditMode },
        Validators.required,
      ],
      dateOfBirth: [
        { value: data.childInfo.dateOfBirth, disabled: !this.isEditMode },
        Validators.required,
      ],
      placeOfBirth: [
        { value: data.childInfo.placeOfBirth, disabled: !this.isEditMode },
        Validators.required,
      ],

      // Parent/Guardian Info
      parentFirstName: [
        {
          value: data.parentGuardianInfo.firstName,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      parentMiddleName: [
        {
          value: data.parentGuardianInfo.middleName,
          disabled: !this.isEditMode,
        },
      ],
      parentLastName: [
        { value: data.parentGuardianInfo.lastName, disabled: !this.isEditMode },
        Validators.required,
      ],
      relationship: [
        {
          value: data.parentGuardianInfo.relationship,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      parentAddress1: [
        { value: data.parentGuardianInfo.address1, disabled: !this.isEditMode },
        Validators.required,
      ],
      parentAddress2: [
        { value: data.parentGuardianInfo.address2, disabled: !this.isEditMode },
      ],
      parentCountry: [
        {
          value: data.parentGuardianInfo.country || 'United States',
          disabled: true,
        },
      ],
      parentState: [
        { value: data.parentGuardianInfo.state, disabled: !this.isEditMode },
        Validators.required,
      ],
      parentCity: [
        { value: data.parentGuardianInfo.city, disabled: !this.isEditMode },
        Validators.required,
      ],
      parentZipCode: [
        { value: data.parentGuardianInfo.zipCode, disabled: !this.isEditMode },
        Validators.required,
      ],
      parentEmail: [
        { value: data.parentGuardianInfo.email, disabled: !this.isEditMode },
        [Validators.required, Validators.email],
      ],
      parentPhoneType: [
        {
          value: data.parentGuardianInfo.phoneType,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      parentPhoneNumber: [
        {
          value: data.parentGuardianInfo.phoneNumber,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      parentAlternatePhoneType: [
        {
          value: data.parentGuardianInfo.alternatePhoneType,
          disabled: !this.isEditMode,
        },
      ],
      parentAlternatePhoneNumber: [
        {
          value: data.parentGuardianInfo.alternatePhoneNumber,
          disabled: !this.isEditMode,
        },
      ],

      // Medical Info
      physicianFirstName: [
        {
          value: data.medicalInfo.physicianFirstName,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      physicianLastName: [
        {
          value: data.medicalInfo.physicianLastName,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      medicalAddress1: [
        { value: data.medicalInfo.address1, disabled: !this.isEditMode },
        Validators.required,
      ],
      medicalAddress2: [
        { value: data.medicalInfo.address2, disabled: !this.isEditMode },
      ],
      medicalCountry: [
        { value: data.medicalInfo.country || 'United States', disabled: true },
      ],
      medicalState: [
        { value: data.medicalInfo.state, disabled: !this.isEditMode },
        Validators.required,
      ],
      medicalCity: [
        { value: data.medicalInfo.city, disabled: !this.isEditMode },
        Validators.required,
      ],
      medicalZipCode: [
        { value: data.medicalInfo.zipCode, disabled: !this.isEditMode },
        Validators.required,
      ],
      medicalPhoneType: [
        { value: data.medicalInfo.phoneType, disabled: !this.isEditMode },
        Validators.required,
      ],
      medicalPhoneNumber: [
        { value: data.medicalInfo.phoneNumber, disabled: !this.isEditMode },
        Validators.required,
      ],
      medicalAlternatePhoneType: [
        {
          value: data.medicalInfo.alternatePhoneType,
          disabled: !this.isEditMode,
        },
      ],
      medicalAlternatePhoneNumber: [
        {
          value: data.medicalInfo.alternatePhoneNumber,
          disabled: !this.isEditMode,
        },
      ],

      // Care Facility Info
      emergencyContactName: [
        {
          value: data.careFacilityInfo.emergencyContactName,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],
      careFacilityAddress1: [
        { value: data.careFacilityInfo.address1, disabled: !this.isEditMode },
        Validators.required,
      ],
      careFacilityAddress2: [
        { value: data.careFacilityInfo.address2, disabled: !this.isEditMode },
      ],
      careFacilityCountry: [
        {
          value: data.careFacilityInfo.country || 'United States',
          disabled: true,
        },
      ],
      careFacilityState: [
        { value: data.careFacilityInfo.state, disabled: !this.isEditMode },
        Validators.required,
      ],
      careFacilityCity: [
        { value: data.careFacilityInfo.city, disabled: !this.isEditMode },
        Validators.required,
      ],
      careFacilityZipCode: [
        { value: data.careFacilityInfo.zipCode, disabled: !this.isEditMode },
        Validators.required,
      ],
      careFacilityPhoneType: [
        { value: data.careFacilityInfo.phoneType, disabled: !this.isEditMode },
        Validators.required,
      ],
      emergencyPhoneNumber: [
        {
          value: data.careFacilityInfo.emergencyPhoneNumber,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],

      // Enrollment Program Details (Read-only)
      programType: [
        {
          value: this.getProgramTypeDisplay(
            data.enrollmentProgramDetails.programType
          ),
          disabled: true,
        },
      ],
      roomType: [
        {
          value: this.getRoomTypeDisplay(
            data.enrollmentProgramDetails.roomType
          ),
          disabled: true,
        },
      ],
      enrollmentDate: [
        { value: data.enrollmentProgramDetails.enrollmentDate, disabled: true },
      ],
    });

    // Store original form data for cancel functionality
    this.originalFormData = this.registrationForm.getRawValue();
  }

  /**
   * Enable edit mode - allows user to modify registration fields
   * Called when user clicks "Edit Details" button
   */
  enableEditMode(): void {
    this.isEditMode = true;
    this.submitted = false;
    this.errorMessage = '';

    const fieldsToEnable = [
      'childFirstName',
      'childMiddleName',
      'childLastName',
      'gender',
      'dateOfBirth',
      'placeOfBirth',
      'parentFirstName',
      'parentMiddleName',
      'parentLastName',
      'relationship',
      'parentAddress1',
      'parentAddress2',
      'parentState',
      'parentCity',
      'parentZipCode',
      'parentEmail',
      'parentPhoneType',
      'parentPhoneNumber',
      'parentAlternatePhoneType',
      'parentAlternatePhoneNumber',
      'physicianFirstName',
      'physicianLastName',
      'medicalAddress1',
      'medicalAddress2',
      'medicalState',
      'medicalCity',
      'medicalZipCode',
      'medicalPhoneType',
      'medicalPhoneNumber',
      'medicalAlternatePhoneType',
      'medicalAlternatePhoneNumber',
      'emergencyContactName',
      'careFacilityAddress1',
      'careFacilityAddress2',
      'careFacilityState',
      'careFacilityCity',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'emergencyPhoneNumber',
    ];

    fieldsToEnable.forEach((fieldName) => {
      const control = this.registrationForm.get(fieldName);
      if (control) {
        control.enable();
      }
    });

    this.highlightedFields.clear();
  }

  /**
   * Disable edit mode
   */
  disableEditMode(): void {
    this.isEditMode = false;
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';

    const fieldsToDisable = [
      'childFirstName',
      'childMiddleName',
      'childLastName',
      'gender',
      'dateOfBirth',
      'placeOfBirth',
      'parentFirstName',
      'parentMiddleName',
      'parentLastName',
      'relationship',
      'parentAddress1',
      'parentAddress2',
      'parentState',
      'parentCity',
      'parentZipCode',
      'parentEmail',
      'parentPhoneType',
      'parentPhoneNumber',
      'parentAlternatePhoneType',
      'parentAlternatePhoneNumber',
      'physicianFirstName',
      'physicianLastName',
      'medicalAddress1',
      'medicalAddress2',
      'medicalState',
      'medicalCity',
      'medicalZipCode',
      'medicalPhoneType',
      'medicalPhoneNumber',
      'medicalAlternatePhoneType',
      'medicalAlternatePhoneNumber',
      'emergencyContactName',
      'careFacilityAddress1',
      'careFacilityAddress2',
      'careFacilityState',
      'careFacilityCity',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'emergencyPhoneNumber',
    ];

    fieldsToDisable.forEach((fieldName) => {
      const control = this.registrationForm.get(fieldName);
      if (control) {
        control.disable();
      }
    });

    this.highlightedFields.clear();
  }

  /**
   * Format phone number
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
   * Convert program type ID or string to display value
   * Handles both numeric IDs from database and string values from form
   */
  getProgramTypeDisplay(value: any): string {
    if (!value) return '';
    // If it's already a string like "fullTime", return as-is
    if (typeof value === 'string') {
      return value;
    }
    // If it's a number, use the mapping
    return this.programTypeReverseMapping[value] || '';
  }

  /**
   * Convert room type ID or string to display value
   * Handles both numeric IDs from database and string values from form
   */
  getRoomTypeDisplay(value: any): string {
    if (!value) return '';
    // If it's already a string like "infant", return as-is
    if (typeof value === 'string') {
      return value;
    }
    // If it's a number, use the mapping
    return this.roomTypeReverseMapping[value] || '';
  }

  /**
   * Handle search functionality
   */
  onSearch(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.highlightedFields.clear();

    if (this.searchTerm.length > 0) {
      const allValues = this.registrationForm.getRawValue();
      Object.keys(allValues).forEach((key) => {
        const value = String(allValues[key]).toLowerCase();
        if (value.includes(this.searchTerm)) {
          this.highlightedFields.add(key);
        }
      });
    }
  }

  /**
   * Check if a field should be highlighted
   */
  isHighlighted(fieldName: string): boolean {
    return this.highlightedFields.has(fieldName);
  }

  /**
   * Check if field is invalid for display
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(
      this.isEditMode &&
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.submitted) &&
      field.enabled
    );
  }

  /**
   * Handle phone keypress
   */
  onPhoneKeypress(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');

    if (!/\d/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if (digitsOnly.length >= 10) {
      event.preventDefault();
      return;
    }
  }

  /**
   * Save registration changes to backend API
   * Backend transaction:
   * - Updates 4 database tables: children, parentguardians, medicalcontacts, carefacilities
   */
  onSaveChanges(): void {
    if (!this.isEditMode) {
      return;
    }

    this.submitted = true;
    this.errorMessage = '';

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
      this.errorMessage = 'Please fill all required fields';
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

    // Update registration data
    if (this.registrationData) {
      this.registrationData.childInfo = {
        firstName: this.registrationForm.get('childFirstName')?.value,
        middleName: this.registrationForm.get('childMiddleName')?.value,
        lastName: this.registrationForm.get('childLastName')?.value,
        gender: this.registrationForm.get('gender')?.value,
        dateOfBirth: this.registrationForm.get('dateOfBirth')?.value,
        placeOfBirth: this.registrationForm.get('placeOfBirth')?.value,
      };

      this.registrationData.parentGuardianInfo = {
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
      };

      this.registrationData.medicalInfo = {
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
      };

      this.registrationData.careFacilityInfo = {
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
      };

      const studentId = this.authService.getUserId();
      if (!studentId) {
        this.errorMessage = 'User not logged in. Cannot save changes.';
        return;
      }

      const registrationData = this.registrationData;

      // Get childId from registration data or auth service
      const childId = registrationData?.childId || this.authService.getUserId();
      if (!childId) {
        this.errorMessage = 'Child ID not found. Cannot save changes.';
        return;
      }

      this.apiService.updateRegistration(childId, registrationData).subscribe({
        next: () => {
          this.registrationDataService.saveRegistrationData(registrationData);
          this.notificationService.success('Saved Changes Successfully!');
          this.successMessage = 'Saved Changes Successfully!';
          this.originalFormData = this.registrationForm.getRawValue();
          setTimeout(() => {
            this.disableEditMode();
            this.successMessage = '';
          }, 2000);
        },
        error: (error: any) => {
          console.error('Update registration failed:', error);
          this.errorMessage = 'Failed to save changes. Please try again later.';
          this.notificationService.error('Failed to save changes');
        },
      });
    }
  }

  /**
   * Cancel edit mode
   */
  onCancel(): void {
    if (this.originalFormData) {
      this.registrationForm.reset(this.originalFormData);
    }
    this.disableEditMode();
  }

  /**
   * Navigate to login
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
