import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';
import { USStatesService } from '../services/us-states.service';

@Component({
  selector: 'app-view-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './view-students.component.html',
  styleUrl: './view-students.component.css',
})
export class ViewStudentsComponent implements OnInit {
  student: any = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  error: string = '';

  studentForm!: FormGroup;
  usStates: any[] = [];
  phoneTypeOptions: string[] = ['Mobile', 'Home', 'Work', 'Other'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private usStatesService: USStatesService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.usStates = this.usStatesService.getAllStates();
    this.initializeForm();
    this.loadStudentDetails();
  }

  /**
   * Initialize empty form
   */
  initializeForm(): void {
    this.studentForm = this.formBuilder.group({
      childFirstName: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],
      childMiddleName: [
        { value: '', disabled: true },
        this.nameValidator.bind(this),
      ],
      childLastName: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],
      gender: [{ value: '', disabled: true }, Validators.required],
      dateOfBirth: [{ value: '', disabled: true }, Validators.required],
      placeOfBirth: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],

      // Parent/Guardian
      parentFirstName: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],
      parentMiddleName: [
        { value: '', disabled: true },
        this.nameValidator.bind(this),
      ],
      parentLastName: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],
      parentEmail: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      parentAddress1: [{ value: '', disabled: true }, Validators.required],
      parentAddress2: [{ value: '', disabled: true }],
      parentCity: [{ value: '', disabled: true }, Validators.required],
      parentState: [{ value: '', disabled: true }, Validators.required],
      parentCountry: [{ value: '', disabled: true }, Validators.required],
      parentZipCode: [{ value: '', disabled: true }, Validators.required],
      parentPhoneType: [{ value: '', disabled: true }, Validators.required],
      parentPhoneNumber: [{ value: '', disabled: true }, Validators.required],
      parentAlternatePhoneType: [{ value: '', disabled: true }],
      parentAlternatePhoneNumber: [{ value: '', disabled: true }],
      parentRelationship: [{ value: '', disabled: true }, Validators.required],

      // Medical
      physicianName: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],
      medicalAddress1: [{ value: '', disabled: true }, Validators.required],
      medicalAddress2: [{ value: '', disabled: true }],
      medicalCity: [{ value: '', disabled: true }, Validators.required],
      medicalState: [{ value: '', disabled: true }, Validators.required],
      medicalCountry: [{ value: '', disabled: true }, Validators.required],
      medicalZipCode: [{ value: '', disabled: true }, Validators.required],
      medicalPhoneType: [{ value: '', disabled: true }, Validators.required],
      medicalPhoneNumber: [{ value: '', disabled: true }, Validators.required],

      // Care Facility
      emergencyContactName: [
        { value: '', disabled: true },
        [Validators.required, this.nameValidator.bind(this)],
      ],
      emergencyPhoneNumber: [
        { value: '', disabled: true },
        Validators.required,
      ],
      careFacilityAddress1: [
        { value: '', disabled: true },
        Validators.required,
      ],
      careFacilityAddress2: [{ value: '', disabled: true }],
      careFacilityCity: [{ value: '', disabled: true }, Validators.required],
      careFacilityState: [{ value: '', disabled: true }, Validators.required],
      careFacilityCountry: [{ value: '', disabled: true }, Validators.required],
      careFacilityZipCode: [{ value: '', disabled: true }, Validators.required],
      careFacilityPhoneType: [
        { value: '', disabled: true },
        Validators.required,
      ],

      // Enrollment (read-only)
      enrollmentPlanId: [{ value: '', disabled: true }],
      programType: [{ value: '', disabled: true }],
      roomType: [{ value: '', disabled: true }],
      planType: [{ value: '', disabled: true }],
      enrollmentStatus: [{ value: '', disabled: true }],
      paymentPlanId: [{ value: '', disabled: true }],
      enrollmentAmount: [{ value: '', disabled: true }],
    });
  }

  /**
   * Load student details from API
   */
  loadStudentDetails(): void {
    this.isLoading = true;
    this.error = '';

    const childId = this.route.snapshot.paramMap.get('childId');

    this.apiService.getStudentById(Number(childId)).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.student = response.data;
          this.populateForm();
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.error = 'Failed to load student details. Please try again.';
        this.isLoading = false;
        this.notificationService.error('Failed to load student details');
      },
    });
  }

  /**
   * Populate form with student data
   */
  populateForm(): void {
    if (!this.student) return;

    this.studentForm.patchValue({
      childFirstName: this.student.childInfo?.firstName || '',
      childMiddleName: this.student.childInfo?.middleName || '',
      childLastName: this.student.childInfo?.lastName || '',
      gender: this.student.childInfo?.gender || '',
      dateOfBirth: this.formatDate(this.student.childInfo?.dateOfBirth),
      placeOfBirth: this.student.childInfo?.placeOfBirth || '',

      parentFirstName: this.student.parentGuardianInfo?.firstName || '',
      parentMiddleName: this.student.parentGuardianInfo?.middleName || '',
      parentLastName: this.student.parentGuardianInfo?.lastName || '',
      parentEmail: this.student.parentGuardianInfo?.email || '',
      parentAddress1: this.student.parentGuardianInfo?.address1 || '',
      parentAddress2: this.student.parentGuardianInfo?.address2 || '',
      parentCity: this.student.parentGuardianInfo?.city || '',
      parentState: this.student.parentGuardianInfo?.state || '',
      parentCountry: this.student.parentGuardianInfo?.country || '',
      parentZipCode: this.student.parentGuardianInfo?.zipCode || '',
      parentPhoneType: this.student.parentGuardianInfo?.phoneType || '',
      parentPhoneNumber: this.student.parentGuardianInfo?.phoneNumber || '',
      parentAlternatePhoneType:
        this.student.parentGuardianInfo?.alternatePhoneType || '',
      parentAlternatePhoneNumber:
        this.student.parentGuardianInfo?.alternatePhoneNumber || '',
      parentRelationship: this.student.parentGuardianInfo?.relationship || '',

      physicianName: this.student.medicalInfo?.physicianName || '',
      medicalAddress1: this.student.medicalInfo?.address1 || '',
      medicalAddress2: this.student.medicalInfo?.address2 || '',
      medicalCity: this.student.medicalInfo?.city || '',
      medicalState: this.student.medicalInfo?.state || '',
      medicalCountry: this.student.medicalInfo?.country || '',
      medicalZipCode: this.student.medicalInfo?.zipCode || '',
      medicalPhoneType: this.student.medicalInfo?.phoneType || '',
      medicalPhoneNumber: this.student.medicalInfo?.phoneNumber || '',

      emergencyContactName:
        this.student.careFacilityInfo?.emergencyContactName || '',
      emergencyPhoneNumber:
        this.student.careFacilityInfo?.emergencyPhoneNumber || '',
      careFacilityAddress1: this.student.careFacilityInfo?.address1 || '',
      careFacilityAddress2: this.student.careFacilityInfo?.address2 || '',
      careFacilityCity: this.student.careFacilityInfo?.city || '',
      careFacilityState: this.student.careFacilityInfo?.state || '',
      careFacilityCountry: this.student.careFacilityInfo?.country || '',
      careFacilityZipCode: this.student.careFacilityInfo?.zipCode || '',
      careFacilityPhoneType: this.student.careFacilityInfo?.phoneType || '',

      programType: this.student.enrollmentProgramDetails?.programType || '',
      roomType: this.student.enrollmentProgramDetails?.roomType || '',
      planType: this.student.enrollmentProgramDetails?.planType || '',
      enrollmentStatus: this.student.enrollmentProgramDetails?.status || '',
      enrollmentPlanId:
        this.student.enrollmentProgramDetails?.enrollmentPlanId || '',
      paymentPlanId: this.student.enrollmentProgramDetails?.paymentPlanId || '',
      enrollmentAmount: this.student.enrollmentProgramDetails?.amount || '',
    });
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  /**
   * Enable edit mode
   */
  enableEditMode(): void {
    this.isEditMode = true;
    const keepDisabled = new Set([
      'enrollmentPlanId',
      'programType',
      'roomType',
      'planType',
      'enrollmentStatus',
      'paymentPlanId',
      'enrollmentAmount',
    ]);

    Object.keys(this.studentForm.controls).forEach((key) => {
      if (!key.startsWith('enrollment') && !keepDisabled.has(key)) {
        this.studentForm.get(key)?.enable();
      }
    });
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm();
    // Disable all form controls
    Object.keys(this.studentForm.controls).forEach((key) => {
      this.studentForm.get(key)?.disable();
    });
  }

  /**
   * Save changes
   */
  saveChanges(): void {
    // Trim whitespace from all string controls before validating
    this.trimAllStringControls();

    if (!this.studentForm.valid) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    const childId = this.route.snapshot.paramMap.get('childId');
    if (!childId) {
      this.notificationService.error(
        'Unable to determine student id for update'
      );
      this.isSaving = false;
      return;
    }

    const updateData = {
      childInfo: {
        firstName: this.studentForm.get('childFirstName')?.value,
        middleName: this.studentForm.get('childMiddleName')?.value,
        lastName: this.studentForm.get('childLastName')?.value,
        gender: this.studentForm.get('gender')?.value,
        dateOfBirth: this.studentForm.get('dateOfBirth')?.value,
        placeOfBirth: this.studentForm.get('placeOfBirth')?.value,
      },
      parentGuardianInfo: {
        firstName: this.studentForm.get('parentFirstName')?.value,
        middleName: this.studentForm.get('parentMiddleName')?.value,
        lastName: this.studentForm.get('parentLastName')?.value,
        email: this.studentForm.get('parentEmail')?.value,
        address1: this.studentForm.get('parentAddress1')?.value,
        address2: this.studentForm.get('parentAddress2')?.value,
        city: this.studentForm.get('parentCity')?.value,
        state: this.studentForm.get('parentState')?.value,
        country: this.studentForm.get('parentCountry')?.value,
        zipCode: this.studentForm.get('parentZipCode')?.value,
        phoneType: this.studentForm.get('parentPhoneType')?.value,
        phoneNumber: this.studentForm.get('parentPhoneNumber')?.value,
        alternatePhoneType: this.studentForm.get('parentAlternatePhoneType')
          ?.value,
        alternatePhoneNumber: this.studentForm.get('parentAlternatePhoneNumber')
          ?.value,
        relationship: this.studentForm.get('parentRelationship')?.value,
      },
      medicalInfo: {
        physicianName: this.studentForm.get('physicianName')?.value,
        address1: this.studentForm.get('medicalAddress1')?.value,
        address2: this.studentForm.get('medicalAddress2')?.value,
        city: this.studentForm.get('medicalCity')?.value,
        state: this.studentForm.get('medicalState')?.value,
        country: this.studentForm.get('medicalCountry')?.value,
        zipCode: this.studentForm.get('medicalZipCode')?.value,
        phoneType: this.studentForm.get('medicalPhoneType')?.value,
        phoneNumber: this.studentForm.get('medicalPhoneNumber')?.value,
      },
      careFacilityInfo: {
        emergencyContactName: this.studentForm.get('emergencyContactName')
          ?.value,
        emergencyPhoneNumber: this.studentForm.get('emergencyPhoneNumber')
          ?.value,
        address1: this.studentForm.get('careFacilityAddress1')?.value,
        address2: this.studentForm.get('careFacilityAddress2')?.value,
        city: this.studentForm.get('careFacilityCity')?.value,
        state: this.studentForm.get('careFacilityState')?.value,
        country: this.studentForm.get('careFacilityCountry')?.value,
        zipCode: this.studentForm.get('careFacilityZipCode')?.value,
        phoneType: this.studentForm.get('careFacilityPhoneType')?.value,
      },
    };

    this.apiService.updateStudent(Number(childId), updateData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notificationService.success(
            'Student information updated successfully'
          );
          this.isSaving = false;
          this.isEditMode = false;
          // Disable all controls after successful save so fields are read-only
          Object.keys(this.studentForm.controls).forEach((key) => {
            this.studentForm.get(key)?.disable();
          });
          this.loadStudentDetails();
        }
      },
      error: (error) => {
        console.error('Error updating student:', error);
        this.notificationService.error('Failed to update student information');
        this.isSaving = false;
      },
    });
  }

  /**
   * Go back to students list
   */
  goBack(): void {
    this.router.navigate(['/students']);
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isRequiredField(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    if (!field || !field.validator) return false;
    const validator = field.validator({} as any);
    return validator && validator['required'];
  }

  /**
   * Custom validator for name fields
   * Allows only letters, spaces, hyphens, and apostrophes
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

  // Note: Using Angular's built-in Validators.email for generic email validation
  /** Trim leading/trailing spaces for all string controls in the form */
  trimAllStringControls() {
    if (!this.studentForm) return;
    Object.keys(this.studentForm.controls).forEach((key) => {
      const control = this.studentForm.get(key);
      if (!control) return;
      const val = control.value;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        const currentErrors = control.errors ? { ...control.errors } : {};

        if (val.length > 0 && trimmed.length === 0) {
          currentErrors['onlySpaces'] = true;
          control.setErrors(currentErrors);
          return;
        }

        if (currentErrors['onlySpaces']) {
          delete currentErrors['onlySpaces'];
          const hasOther = Object.keys(currentErrors).length > 0;
          control.setErrors(hasOther ? currentErrors : null);
        }

        if (trimmed !== val) {
          control.setValue(trimmed, { emitEvent: false });
        }
      }
    });
  }

  /**
   * Custom validator for phone numbers (10 digits)
   */
  phoneValidator(control: any) {
    if (!control.value) return null;
    const digitsOnly = control.value.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return { invalidPhone: true };
    }
    return null;
  }

  /**
   * Custom validator for zip codes (5 digits)
   */
  zipCodeValidator(control: any) {
    if (!control.value) return null;
    const digitsOnly = control.value.replace(/\D/g, '');
    if (digitsOnly.length !== 5) {
      return { invalidZipCode: true };
    }
    return null;
  }

  /**
   * Sanitizes name input - removes non-letter characters
   */
  sanitizeNameInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^a-zA-Z\s'-]/g, '');
    input.value = value;
    if (this.studentForm.get(fieldName)) {
      this.studentForm.get(fieldName)?.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Sanitizes phone input - keeps only digits, limits to 10
   */
  sanitizePhoneInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/\D/g, '');
    value = value.substring(0, 10);
    input.value = value;
    if (this.studentForm.get(fieldName)) {
      this.studentForm.get(fieldName)?.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Sanitizes zip code input - keeps only digits, limits to 5
   */
  sanitizeZipInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/\D/g, '');
    value = value.substring(0, 5);
    input.value = value;
    if (this.studentForm.get(fieldName)) {
      this.studentForm.get(fieldName)?.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Gets formatted error message for a field
   */
  getFieldErrorMessage(fieldName: string): string {
    const control = this.studentForm.get(fieldName);
    if (!control || !control.errors) return '';
    const rawLabel = fieldName.replace(/([A-Z])/g, ' $1').trim();
    const label =
      rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase();

    if (control.errors['onlySpaces']) return 'Only spaces are not allowed';
    if (control.errors['required']) return `${label} is required`;
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['whitespace']) {
      if (this.isRequiredField && this.isRequiredField(fieldName))
        return `${label} is required`;
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
}
