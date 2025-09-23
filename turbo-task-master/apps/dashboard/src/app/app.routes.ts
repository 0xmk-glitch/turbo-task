import { Routes } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { RoleGuard } from './_guards/role.guard';
import { UserRole } from './_models/auth.models';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  
  // Login route (public)
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Turbo Task Manager'
  },
  
  // Tasks route (protected)
  {
    path: 'tasks',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    title: 'Tasks - Turbo Task Manager'
  },
  
  // Admin routes (admin only) - Placeholder for future implementation
  {
    path: 'admin',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: [UserRole.ADMIN] },
    title: 'Admin - Turbo Task Manager'
  },
  
  // Manager routes (manager and admin) - Placeholder for future implementation
  {
    path: 'management',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { allowedRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    title: 'Management - Turbo Task Manager'
  },
  
  // Profile route (authenticated users)
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
    title: 'Profile - Turbo Task Manager'
  },
  
  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Unauthorized - Turbo Task Manager'
  },
  
  // 404 page
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Turbo Task Manager'
  }
];