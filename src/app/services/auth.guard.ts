import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthenticationService } from './authentication.service';

/**
 * AuthGuard - Prevents unauthenticated users from accessing protected routes
 *
 * Checks if user is logged in before allowing access to registration component.
 * Unauthenticated users are redirected to login page.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  /**
   * Determines if user can access protected routes
   * @param route - The activated route snapshot
   * @param state - The router state snapshot
   * @returns boolean - true if user is authenticated, false otherwise (redirects to login)
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return false;
    }

    // User is authenticated
    return true;
  }
}
