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
import { ValidationService } from '../services/validation.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { USStatesService } from '../services/us-states.service';

@Component({
  selector: 'app-view-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './view-students.component.html',
  styleUrls: ['./view-students.component.css'],
})
export class ViewStudentsComponent implements OnInit {
  private destroy$ = new Subject<void>();
  student: any = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  error: string = '';

  studentForm!: FormGroup;
  usStates: any[] = [];
  phoneTypeOptions: string[] = ['Cell', 'Home', 'Work', 'Other'];
  genderOptions: string[] = ['Male', 'Female'];
  relationshipOptions: string[] = ['Father', 'Mother', 'Guardian'];
  // dropdown data
  programTypeOptions: any[] = [];
  roomTypeOptions: any[] = [];
  planTypeOptions: any[] = [];
  minDateOfBirth = new Date(2000, 0, 1);
  todayDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private usStatesService: USStatesService,
    private formBuilder: FormBuilder,
    public validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.usStates = this.usStatesService.getAllStates();
    // load dropdowns first then student details so we can map ids to names
    forkJoin({
      programs: this.apiService.getAllPrograms(),
      roomTypes: this.apiService.getAllRoomTypes(),
      plans: this.apiService.getAllPlans(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.programTypeOptions = this.filterExcludedOptions(
            res.programs || [],
            'programname'
          );
          this.roomTypeOptions = this.filterExcludedOptions(
            res.roomTypes || [],
            'roomtype'
          );
          this.planTypeOptions = this.filterExcludedOptions(
            res.plans || [],
            'plantype'
          );
          this.initializeForm();
          this.loadStudentDetails();
        },
        error: () => {
          this.initializeForm();
          this.loadStudentDetails();
        },
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
   * Initialize empty form
   */
  initializeForm(): void {
    this.studentForm = this.formBuilder.group({
      childFirstName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      childMiddleName: [
        { value: '', disabled: true },
        this.validationService.nameValidator(),
      ],
      childLastName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      gender: [{ value: '', disabled: true }, Validators.required],
      dateOfBirth: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.dateOfBirthValidator()],
      ],
      placeOfBirth: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],

      // Parent/Guardian
      parentFirstName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      parentMiddleName: [
        { value: '', disabled: true },
        this.validationService.nameValidator(),
      ],
      parentLastName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      parentEmail: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.emailValidator()],
      ],
      parentAddress1: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.addressValidator()],
      ],
      parentAddress2: [
        { value: '', disabled: true },
        this.validationService.addressValidator(),
      ],
      parentCity: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.cityValidator()],
      ],
      parentState: [{ value: '', disabled: true }, Validators.required],
      parentCountry: [{ value: '', disabled: true }, Validators.required],
      parentZipCode: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.zipCodeValidator()],
      ],
      parentPhoneType: [{ value: '', disabled: true }, Validators.required],
      parentPhoneNumber: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.phoneValidator()],
      ],
      parentAlternatePhoneType: [{ value: '', disabled: true }],
      parentAlternatePhoneNumber: [
        { value: '', disabled: true },
        this.validationService.phoneValidator(),
      ],
      parentRelationship: [{ value: '', disabled: true }, Validators.required],

      // Medical
      physicianFirstName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      physicianMiddleName: [
        { value: '', disabled: true },
        this.validationService.nameValidator(),
      ],
      physicianLastName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      medicalAddress1: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.addressValidator()],
      ],
      medicalAddress2: [
        { value: '', disabled: true },
        this.validationService.addressValidator(),
      ],
      medicalCity: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.cityValidator()],
      ],
      medicalState: [{ value: '', disabled: true }, Validators.required],
      medicalCountry: [{ value: '', disabled: true }, Validators.required],
      medicalZipCode: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.zipCodeValidator()],
      ],
      medicalPhoneType: [{ value: '', disabled: true }, Validators.required],
      medicalPhoneNumber: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.phoneValidator()],
      ],
      medicalAlternatePhoneType: [{ value: '', disabled: true }],
      medicalAlternatePhoneNumber: [
        { value: '', disabled: true },
        this.validationService.phoneValidator(),
      ],

      // Care Facility
      emergencyContactName: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.nameValidator()],
      ],
      emergencyPhoneNumber: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.phoneValidator()],
      ],
      careFacilityAddress1: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.addressValidator()],
      ],
      careFacilityAddress2: [
        { value: '', disabled: true },
        this.validationService.addressValidator(),
      ],
      careFacilityCity: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.cityValidator()],
      ],
      careFacilityState: [{ value: '', disabled: true }, Validators.required],
      careFacilityCountry: [{ value: '', disabled: true }, Validators.required],
      careFacilityZipCode: [
        { value: '', disabled: true },
        [Validators.required, this.validationService.zipCodeValidator()],
      ],
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

    this.apiService
      .getStudentById(Number(childId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    const enrollment = this.student.enrollmentProgramDetails || {};

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

      physicianFirstName: this.student.medicalInfo?.physicianFirstName || '',
      physicianMiddleName: this.student.medicalInfo?.physicianMiddleName || '',
      physicianLastName: this.student.medicalInfo?.physicianLastName || '',
      medicalAddress1: this.student.medicalInfo?.address1 || '',
      medicalAddress2: this.student.medicalInfo?.address2 || '',
      medicalCity: this.student.medicalInfo?.city || '',
      medicalState: this.student.medicalInfo?.state || '',
      medicalCountry: this.student.medicalInfo?.country || '',
      medicalZipCode: this.student.medicalInfo?.zipCode || '',
      medicalPhoneType: this.student.medicalInfo?.phoneType || '',
      medicalPhoneNumber: this.student.medicalInfo?.phoneNumber || '',
      medicalAlternatePhoneType:
        this.student.medicalInfo?.alternatePhoneType || '',
      medicalAlternatePhoneNumber:
        this.student.medicalInfo?.alternatePhoneNumber || '',

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

      programType: this.getProgramDisplay(enrollment.programType),
      roomType: this.getRoomDisplay(enrollment.roomType),
      planType: this.getPlanDisplay(enrollment.planType),
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
    // enable controls after current tick to avoid change-detection errors
    console.log('enableEditMode: about to enable controls');
    setTimeout(() => {
      Object.keys(this.studentForm.controls).forEach((key) => {
        if (!key.startsWith('enrollment') && !keepDisabled.has(key)) {
          this.studentForm.get(key)?.enable();
        }
      });
      console.log(
        'enableEditMode: controls enabled state:',
        Object.keys(this.studentForm.controls).reduce((acc: any, k) => {
          acc[k] = this.studentForm.get(k)?.disabled;
          return acc;
        }, {})
      );
    }, 0);
  }

  /**
   * Cancel editing
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm();
    // Disable all form controls on next tick to avoid change-detection errors
    setTimeout(() => {
      Object.keys(this.studentForm.controls).forEach((key) => {
        this.studentForm.get(key)?.disable();
      });
      console.log(
        'cancelEdit: controls disabled state:',
        Object.keys(this.studentForm.controls).reduce((acc: any, k) => {
          acc[k] = this.studentForm.get(k)?.disabled;
          return acc;
        }, {})
      );
    }, 0);
  }

  /**
   * Save changes
   */
  saveChanges(): void {
    // Trim whitespace and mark required fields/touched so field-level errors display
    this.trimAllStringControls();

    const requiredFields = [
      'childFirstName',
      'childLastName',
      'gender',
      'dateOfBirth',
      'placeOfBirth',
      'parentFirstName',
      'parentLastName',
      'parentEmail',
      'parentAddress1',
      'parentCity',
      'parentState',
      'parentZipCode',
      'parentPhoneType',
      'parentPhoneNumber',
      'physicianFirstName',
      'physicianLastName',
      'medicalAddress1',
      'medicalCity',
      'medicalState',
      'medicalZipCode',
      'medicalPhoneType',
      'medicalPhoneNumber',
      'emergencyContactName',
      'careFacilityAddress1',
      'careFacilityCity',
      'careFacilityState',
      'careFacilityZipCode',
      'careFacilityPhoneType',
      'emergencyPhoneNumber',
    ];

    let allFieldsValid = true;
    for (const field of requiredFields) {
      const control = this.studentForm.get(field);
      const val = control?.value;
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
      this.notificationService.error('Please fill all required fields');
      this.scrollToFirstInvalid();
      return;
    }

    // Validate phone numbers
    if (
      !this.validationService.isValidPhoneNumber(
        this.studentForm.get('parentPhoneNumber')?.value
      )
    ) {
      const control = this.studentForm.get('parentPhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.notificationService.error('Parent phone number must be 10 digits');
      this.scrollToFirstInvalid();
      return;
    }

    if (
      !this.validationService.isValidPhoneNumber(
        this.studentForm.get('medicalPhoneNumber')?.value
      )
    ) {
      const control = this.studentForm.get('medicalPhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.notificationService.error('Medical phone number must be 10 digits');
      this.scrollToFirstInvalid();
      return;
    }

    if (
      !this.validationService.isValidPhoneNumber(
        this.studentForm.get('emergencyPhoneNumber')?.value
      )
    ) {
      const control = this.studentForm.get('emergencyPhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.notificationService.error(
        'Emergency contact phone number must be 10 digits'
      );
      this.scrollToFirstInvalid();
      return;
    }

    // Validate alternate phones if provided
    const parentAltRaw = this.studentForm.get(
      'parentAlternatePhoneNumber'
    )?.value;
    const parentAlt = parentAltRaw ? String(parentAltRaw).trim() : '';
    if (parentAlt && !this.validationService.isValidPhoneNumber(parentAlt)) {
      const control = this.studentForm.get('parentAlternatePhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.notificationService.error(
        'Parent alternate phone number must be 10 digits'
      );
      this.scrollToFirstInvalid();
      return;
    }

    const medicalAltRaw = this.studentForm.get(
      'medicalAlternatePhoneNumber'
    )?.value;
    const medicalAlt = medicalAltRaw ? String(medicalAltRaw).trim() : '';
    if (medicalAlt && !this.validationService.isValidPhoneNumber(medicalAlt)) {
      const control = this.studentForm.get('medicalAlternatePhoneNumber');
      control?.setErrors({ invalidPhone: true });
      control?.markAsTouched();
      control?.markAsDirty();
      this.notificationService.error(
        'Medical alternate phone number must be 10 digits'
      );
      this.scrollToFirstInvalid();
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

    // Final form validity check: mark any invalid controls so errors display
    if (!this.studentForm.valid) {
      Object.keys(this.studentForm.controls).forEach((key) => {
        const ctrl = this.studentForm.get(key);
        if (!ctrl) return;
        if (ctrl.invalid) {
          ctrl.markAsTouched();
          ctrl.markAsDirty();
        }
      });
      this.notificationService.error(
        'Please fill the required fields before saving'
      );
      this.scrollToFirstInvalid();
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
        phoneNumber: this.validationService.formatPhoneNumber(
          this.studentForm.get('parentPhoneNumber')?.value || ''
        ),
        alternatePhoneType: this.studentForm.get('parentAlternatePhoneType')
          ?.value,
        alternatePhoneNumber: this.validationService.formatPhoneNumber(
          this.studentForm.get('parentAlternatePhoneNumber')?.value || ''
        ),
        relationship: this.studentForm.get('parentRelationship')?.value,
      },
      medicalInfo: {
        physicianFirstName: this.studentForm.get('physicianFirstName')?.value,
        physicianMiddleName: this.studentForm.get('physicianMiddleName')?.value,
        physicianLastName: this.studentForm.get('physicianLastName')?.value,
        address1: this.studentForm.get('medicalAddress1')?.value,
        address2: this.studentForm.get('medicalAddress2')?.value,
        city: this.studentForm.get('medicalCity')?.value,
        state: this.studentForm.get('medicalState')?.value,
        country: this.studentForm.get('medicalCountry')?.value,
        zipCode: this.studentForm.get('medicalZipCode')?.value,
        phoneType: this.studentForm.get('medicalPhoneType')?.value,
        phoneNumber: this.validationService.formatPhoneNumber(
          this.studentForm.get('medicalPhoneNumber')?.value || ''
        ),
        alternatePhoneType: this.studentForm.get('medicalAlternatePhoneType')
          ?.value,
        alternatePhoneNumber: this.validationService.formatPhoneNumber(
          this.studentForm.get('medicalAlternatePhoneNumber')?.value || ''
        ),
      },
      careFacilityInfo: {
        emergencyContactName: this.studentForm.get('emergencyContactName')
          ?.value,
        emergencyPhoneNumber: this.validationService.formatPhoneNumber(
          this.studentForm.get('emergencyPhoneNumber')?.value || ''
        ),
        address1: this.studentForm.get('careFacilityAddress1')?.value,
        address2: this.studentForm.get('careFacilityAddress2')?.value,
        city: this.studentForm.get('careFacilityCity')?.value,
        state: this.studentForm.get('careFacilityState')?.value,
        country: this.studentForm.get('careFacilityCountry')?.value,
        zipCode: this.studentForm.get('careFacilityZipCode')?.value,
        phoneType: this.studentForm.get('careFacilityPhoneType')?.value,
      },
    };

    console.log('Updating student with payload:', updateData);
    this.apiService
      .updateStudent(Number(childId), updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
          this.notificationService.error(
            'Failed to update student information'
          );
          this.isSaving = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  // Note: Using Angular's built-in Validators.email for generic email validation
  /** Trim leading/trailing spaces for all string controls in the form */
  /** Trim and normalize string controls using ValidationService */
  trimAllStringControls() {
    if (!this.studentForm) return;
    Object.keys(this.studentForm.controls).forEach((key) => {
      const control = this.studentForm.get(key);
      if (!control) return;
      const val = control.value;
      if (typeof val === 'string') {
        const res = this.validationService.trimStringValue(val);
        const trimmed = res.trimmed;
        const currentErrors = control.errors ? { ...control.errors } : {};

        if (res.onlySpaces) {
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

  getProgramDisplay(value: any): string {
    if (!value && value !== 0) return '';
    // if numeric id
    const found = this.programTypeOptions.find((p) => p.programid === value);
    if (found) return this.formatDropdownText(found.programname || '');
    // if string, format
    if (typeof value === 'string') return this.formatDropdownText(value);
    return '';
  }

  getRoomDisplay(value: any): string {
    if (!value && value !== 0) return '';
    const found = this.roomTypeOptions.find((r) => r.roomtypeid === value);
    if (found) return this.formatDropdownText(found.roomtype || '');
    if (typeof value === 'string') return this.formatDropdownText(value);
    return '';
  }

  getPlanDisplay(value: any): string {
    if (!value && value !== 0) return '';
    const found = this.planTypeOptions.find((s) => s.paymentplanid === value);
    if (found) return this.formatDropdownText(found.plantype || '');
    if (typeof value === 'string') return this.formatDropdownText(value);
    return '';
  }

  formatDropdownText(text: string): string {
    if (!text) return '';
    const spacedText = text.replace(/([A-Z])/g, ' $1');
    return spacedText.charAt(0).toUpperCase() + spacedText.slice(1);
  }

  // Zip code validation provided by ValidationService

  formatNameInput(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const value = this.validationService.formatNameValue(raw);
    input.value = value;
    if (this.studentForm.get(fieldName)) {
      this.studentForm.get(fieldName)?.setValue(value, { emitEvent: false });
    }
  }

  formatPhoneNumber(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const value = this.validationService.formatPhoneDigits(raw);
    input.value = value;
    if (this.studentForm.get(fieldName)) {
      this.studentForm.get(fieldName)?.setValue(value, { emitEvent: false });
    }
  }

  formatZipCode(event: any, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const value = this.validationService.formatZipDigits(raw);
    input.value = value;
    if (this.studentForm.get(fieldName)) {
      this.studentForm.get(fieldName)?.setValue(value, { emitEvent: false });
    }
  }

  // Email validator provided by ValidationService

  /**
   * Gets formatted error message for a field
   */
  getFieldErrorMessage(fieldName: string): string {
    const control = this.studentForm.get(fieldName);
    return this.validationService.getFieldErrorMessage(control, fieldName);
  }
}
