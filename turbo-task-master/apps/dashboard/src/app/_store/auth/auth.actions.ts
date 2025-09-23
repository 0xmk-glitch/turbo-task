import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, LoginResponse, AuthError } from '../../_models/auth.models';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: LoginResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: AuthError }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: AuthError }>()
);

// Token Actions
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: string }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: AuthError }>()
);

// Auth State Actions
export const checkAuth = createAction('[Auth] Check Auth');

export const setAuthState = createAction(
  '[Auth] Set Auth State',
  props<{ isAuthenticated: boolean; user: User | null; token: string | null }>()
);

export const clearError = createAction('[Auth] Clear Error');

export const setLoading = createAction(
  '[Auth] Set Loading',
  props<{ isLoading: boolean }>()
);
