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
 * EditRegistrationComponent displays and allows editing of registered student information
 * Features:
 * - Read-only display mode showing all registered data
 * - Edit mode allowing modification of all fields except enrollment program details
 * - Toggle between view and edit modes
 * - Save changes back to service or cancel modifications
 * - Enrollment Program Details remain permanently read-only for data integrity
 */
@Component({
  selector: 'app-edit-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-registration.component.html',
  styleUrl: './edit-registration.component.css',
})
export class EditRegistrationComponent implements OnInit {
  registrationForm!: FormGroup; // Reactive form for registration data
  registrationData: RegistrationData | null = null; // Stores loaded registration data
  isEditMode = false; // Tracks whether form is in edit or view mode
  submitted = false; // Tracks if form has been submitted for validation display
  errorMessage = ''; // Stores form-level error messages
  usStates: USState[] = []; // List of US states for dropdown selection

  // Dropdown options for form fields
  phoneTypeOptions = ['Cell', 'Home', 'Work', 'Other'];
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

  /**
   * Angular lifecycle hook - initializes component
   * Loads registration data from service and builds form
   */
  ngOnInit(): void {
    this.loadRegistrationData();
    this.initializeForm();
  }

  /**
   * Retrieves registration data from service
   * Redirects to login if no data is found (user accessed page directly)
   */
  loadRegistrationData(): void {
    this.registrationData = this.registrationDataService.getRegistrationData();
    if (!this.registrationData) {
      this.router.navigate(['/login']);
    }
  }

  initializeForm(): void {
    if (!this.registrationData) {
      this.router.navigate(['/login']);
      return;
    }

    const data = this.registrationData;

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
        { value: data.parentGuardianInfo.country, disabled: true },
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
      medicalCountry: [{ value: data.medicalInfo.country, disabled: true }],
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
      careFacilityName: [
        { value: data.careFacilityInfo.name, disabled: !this.isEditMode },
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
        { value: data.careFacilityInfo.country, disabled: true },
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
      careFacilityPhoneNumber: [
        {
          value: data.careFacilityInfo.phoneNumber,
          disabled: !this.isEditMode,
        },
        Validators.required,
      ],

      // Enrollment Program Details (Read-only)
      programType: [
        { value: data.enrollmentProgramDetails.programType, disabled: true },
      ],
      roomType: [
        { value: data.enrollmentProgramDetails.roomType, disabled: true },
      ],
      enrollmentDate: [
        { value: data.enrollmentProgramDetails.enrollmentDate, disabled: true },
      ],
    });
  }

  /**
   * Enables edit mode for the registration form
   * Activates all form fields except Enrollment Program Details (which remain read-only)
   * Resets submitted flag and error messages
   */
  enableEditMode(): void {
    this.isEditMode = true;
    this.submitted = false;
    this.errorMessage = '';

    // Enable all fields except Enrollment Program Details
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
      'careFacilityName',
      'careFacilityAddress1',
      'careFacilityAddress2',
      'careFacilityState',
      'careFacilityCity',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'careFacilityPhoneNumber',
    ];

    fieldsToEnable.forEach((fieldName) => {
      const control = this.registrationForm.get(fieldName);
      if (control) {
        control.enable();
      }
    });
  }

  /**
   * Disables edit mode and returns form to read-only display
   * Disables all editable fields while keeping Enrollment Program Details disabled
   * Resets form validation state
   */
  disableEditMode(): void {
    this.isEditMode = false;
    this.submitted = false;
    this.errorMessage = '';

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
      'careFacilityName',
      'careFacilityAddress1',
      'careFacilityAddress2',
      'careFacilityState',
      'careFacilityCity',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'careFacilityPhoneNumber',
    ];

    fieldsToDisable.forEach((fieldName) => {
      const control = this.registrationForm.get(fieldName);
      if (control) {
        control.disable();
      }
    });
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

  /**
   * Handles saving changes to registration data
   * Validates all required fields and phone numbers
   * Formats phone numbers and collects updated data
   * Saves to service, disables edit mode, and shows success message
   */
  onSaveChanges(): void {
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
        this.registrationForm.get('careFacilityPhoneNumber')?.value
      )
    ) {
      this.errorMessage = 'Care facility phone number must be 10 digits';
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
        alternatePhoneNumber: this.registrationForm.get(
          'parentAlternatePhoneNumber'
        )?.value,
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
        alternatePhoneNumber: this.registrationForm.get(
          'medicalAlternatePhoneNumber'
        )?.value,
      };

      this.registrationData.careFacilityInfo = {
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
      };

      this.registrationDataService.saveRegistrationData(this.registrationData);
      this.disableEditMode();
      this.errorMessage = 'Changes saved successfully!';
    }
  }

  /**
   * Handles cancel action - reverts form to last saved state
   * Resets form data and disables edit mode
   */
  onCancel(): void {
    this.disableEditMode();
    this.initializeForm();
  }

  /**
   * Checks if a form field should display error messages
   * Shows errors when field is invalid, enabled, and has been touched/dirty/submitted
   * Differs from registration component by also checking field.enabled
   * @param {string} fieldName - The name of the form field to check
   * @returns {boolean} True if field has validation errors that should be displayed
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.submitted) &&
      field.enabled
    );
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
