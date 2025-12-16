import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    userid: number;
    email: string;
    roleid: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;
  private isBrowser: boolean;

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    const storedUser = this.isBrowser
      ? JSON.parse(localStorage.getItem('currentUser') || 'null')
      : null;

    this.currentUserSubject = new BehaviorSubject<any>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable((observer) => {
      this.apiService.login(credentials).subscribe(
        (response: LoginResponse) => {
          if (response.success && this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }

          observer.next(response);
          observer.complete();
        },
        (error: any) => {
          console.error('Login error:', error);
          observer.error(error);
        }
      );
    });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getUserRoleId(): number {
    return this.currentUserValue?.roleid || 0;
  }

  getUserEmail(): string {
    return this.currentUserValue?.email || '';
  }

  getUserId(): number {
    return this.currentUserValue?.userid || 0;
  }
}
