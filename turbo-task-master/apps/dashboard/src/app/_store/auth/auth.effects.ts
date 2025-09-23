import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../_service/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private store = inject(Store);
  private router = inject(Router);

  // Login Effect
  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) => {
        try {
          return this.authService.login(credentials).pipe(
            map((response) => AuthActions.loginSuccess({ response })),
            catchError((error) => of(AuthActions.loginFailure({ error })))
          );
        } catch (error) {
          return of(AuthActions.loginFailure({ error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' } }));
        }
      })
    );
  });

  // Login Success Effect - Redirect to dashboard
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => {
        this.router.navigate(['/tasks']);
      })
    ),
    { dispatch: false }
  );

  // Logout Effect
  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() => {
        try {
          return this.authService.logout().pipe(
            map(() => AuthActions.logoutSuccess()),
            catchError((error) => of(AuthActions.logoutFailure({ error })))
          );
        } catch (error) {
          return of(AuthActions.logoutFailure({ error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' } }));
        }
      })
    );
  });

  // Logout Success Effect - Redirect to login
  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );

  // Check Auth Effect - Initialize auth state from storage
  checkAuth$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() => {
        try {
          return this.authService.checkAuth().pipe(
            map((authData) => {
              if (authData) {
                return AuthActions.setAuthState({
                  isAuthenticated: true,
                  user: authData.user,
                  token: authData.token
                });
              } else {
                return AuthActions.setAuthState({
                  isAuthenticated: false,
                  user: null,
                  token: null
                });
              }
            }),
            catchError(() => of(AuthActions.setAuthState({
              isAuthenticated: false,
              user: null,
              token: null
            })))
          );
        } catch (error) {
          return of(AuthActions.setAuthState({
            isAuthenticated: false,
            user: null,
            token: null
          }));
        }
      })
    );
  });

  // Refresh Token Effect
  refreshToken$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() => {
        try {
          return this.authService.refreshToken().pipe(
            map((token) => AuthActions.refreshTokenSuccess({ token })),
            catchError((error) => of(AuthActions.refreshTokenFailure({ error })))
          );
        } catch (error) {
          return of(AuthActions.refreshTokenFailure({ error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' } }));
        }
      })
    );
  });
}
