import { createReducer, on } from '@ngrx/store';
import { AuthState, UserRole } from '../../_models/auth.models';
import * as AuthActions from './auth.actions';

export const authFeatureKey = 'auth';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
  lastLoginTime: null
};

export const authReducer = createReducer(
  initialAuthState,

  // Login Actions
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: response.user,
    token: response.token,
    error: null,
    lastLoginTime: new Date()
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    error: error.message,
    lastLoginTime: null
  })),

  // Logout Actions
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    error: null,
    lastLoginTime: null
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error.message
  })),

  // Token Actions
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.refreshTokenSuccess, (state, { token }) => ({
    ...state,
    token,
    isLoading: false,
    error: null
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    error: error.message
  })),

  // Auth State Actions
  on(AuthActions.setAuthState, (state, { isAuthenticated, user, token }) => ({
    ...state,
    isAuthenticated,
    user,
    token,
    error: null
  })),

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null
  })),

  on(AuthActions.setLoading, (state, { isLoading }) => ({
    ...state,
    isLoading
  }))
);
