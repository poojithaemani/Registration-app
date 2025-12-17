import { Injectable } from '@angular/core';

/**
 * NotificationService - Simple logging-based notifications
 * No UI component overhead - components handle display logic
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  /**
   * Log success message
   */
  success(message: string): void {
    console.log('✓ Success:', message);
  }

  /**
   * Log error message
   */
  error(message: string): void {
    console.error('✗ Error:', message);
  }

  /**
   * Log warning message
   */
  warning(message: string): void {
    console.warn('⚠ Warning:', message);
  }

  /**
   * Log info message
   */
  info(message: string): void {
    console.info('ℹ Info:', message);
  }
}
