import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { UserRole } from '../_models/auth.models';
import { selectIsAuthenticated, selectUserRole } from '../_store/auth/auth.selectors';
import * as AuthActions from '../_store/auth/auth.actions';

export interface RoleGuardData {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(route: any): Observable<boolean | UrlTree> {
    const allowedRoles = route.data?.['allowedRoles'] as UserRole[];
    const redirectTo = route.data?.['redirectTo'] || '/unauthorized';

    if (!allowedRoles || allowedRoles.length === 0) {
      console.warn('RoleGuard: No allowed roles specified');
      return of(true);
    }

    return this.checkAuthAndRole(allowedRoles).pipe(
      map(hasAccess => {
        if (hasAccess) {
          return true;
        } else {
          return this.router.createUrlTree([redirectTo]);
        }
      })
    );
  }

  private checkAuthAndRole(allowedRoles: UserRole[]): Observable<boolean> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          // Check if auth data exists in storage
          this.store.dispatch(AuthActions.checkAuth());
          return this.store.select(selectIsAuthenticated).pipe(
            take(1),
            switchMap(authResult => {
              if (!authResult) {
                return of(false);
              }
              return this.checkUserRole(allowedRoles);
            })
          );
        }
        return this.checkUserRole(allowedRoles);
      })
    );
  }

  private checkUserRole(allowedRoles: UserRole[]): Observable<boolean> {
    return this.store.select(selectUserRole).pipe(
      take(1),
      map(userRole => {
        if (!userRole) {
          return false;
        }
        return allowedRoles.includes(userRole);
      })
    );
  }
}
