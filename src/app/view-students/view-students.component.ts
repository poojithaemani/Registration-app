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
      childFirstName: [{ value: '', disabled: true }, Validators.required],
      childMiddleName: [{ value: '', disabled: true }],
      childLastName: [{ value: '', disabled: true }, Validators.required],
      gender: [{ value: '', disabled: true }, Validators.required],
      dateOfBirth: [{ value: '', disabled: true }, Validators.required],
      placeOfBirth: [{ value: '', disabled: true }, Validators.required],

      // Parent/Guardian
      parentFirstName: [{ value: '', disabled: true }, Validators.required],
      parentMiddleName: [{ value: '', disabled: true }],
      parentLastName: [{ value: '', disabled: true }, Validators.required],
      parentEmail: [{ value: '', disabled: true }, Validators.required],
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
      physicianName: [{ value: '', disabled: true }, Validators.required],
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
        Validators.required,
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

      enrollmentPlanId:
        this.student.enrollmentProgramDetails?.enrollmentPlanId || '',
      enrollmentStatus: this.student.enrollmentProgramDetails?.status || '',
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
    // Enable all form controls except enrollment fields
    Object.keys(this.studentForm.controls).forEach((key) => {
      if (!key.startsWith('enrollment')) {
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
    if (!this.studentForm.valid) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    const childId = this.route.snapshot.paramMap.get('id');

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
}
