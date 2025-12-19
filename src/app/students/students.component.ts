import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  paginatedStudents: any[] = [];

  isLoading: boolean = false;
  error: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAllStudents();
  }

  /**
   * Load all students from API
   */
  loadAllStudents(): void {
    this.isLoading = true;
    this.error = '';

    this.apiService.getAllStudents().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.students = response.data;
          this.filteredStudents = [...this.students];
          this.totalItems = this.students.length;
          this.currentPage = 1;
          this.updatePagination();
          this.notificationService.success(
            `Loaded ${this.students.length} students`
          );
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.error = 'Failed to load students. Please try again.';
        this.isLoading = false;
        this.notificationService.error('Failed to load students');
      },
    });
  }

  /**
   * Search students by name (student name or guardian name)
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStudents = this.students.filter((student) => {
        const studentName = `${student.childInfo?.firstName || ''} ${
          student.childInfo?.lastName || ''
        }`.toLowerCase();
        const guardianName = `${student.parentGuardianInfo?.firstName || ''} ${
          student.parentGuardianInfo?.lastName || ''
        }`.toLowerCase();

        return studentName.includes(term) || guardianName.includes(term);
      });
    }

    this.totalItems = this.filteredStudents.length;
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Update pagination based on current page and items per page
   */
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStudents = this.filteredStudents.slice(startIndex, endIndex);
  }

  /**
   * Get total number of pages
   */
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Change items per page
   */
  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * Go to previous page
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * View student details
   */
  viewStudentDetails(childId: number): void {
    this.router.navigate(['/students', childId]);
  }

  /**
   * Navigate to enrollment page
   */
  enrollNewStudent(): void {
    this.router.navigate(['/registration']);
  }

  /**
   * Navigate back to login
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Get display name for pagination info
   */
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
