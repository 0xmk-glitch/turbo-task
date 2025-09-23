import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../../_models/auth.models';
import { authFeatureKey } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role
);

export const selectUserId = createSelector(
  selectUser,
  (user) => user?.id
);

export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email
);

export const selectUserName = createSelector(
  selectUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : null
);

export const selectLastLoginTime = createSelector(
  selectAuthState,
  (state) => state.lastLoginTime
);

// Role-based selectors
export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'admin'
);

export const selectIsManager = createSelector(
  selectUserRole,
  (role) => role === 'manager' || role === 'admin'
);

export const selectCanManageUsers = createSelector(
  selectUserRole,
  (role) => ['admin', 'manager'].includes(role || '')
);

export const selectCanManageTasks = createSelector(
  selectUserRole,
  (role) => ['admin', 'manager', 'user'].includes(role || '')
);

export const selectCanViewTasks = createSelector(
  selectUserRole,
  (role) => ['admin', 'manager', 'user', 'viewer'].includes(role || '')
);
