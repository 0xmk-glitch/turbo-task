import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserRole, LoginRequest, LoginResponse, AuthError } from '../_models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'turbo-task-auth';
  private readonly MOCK_USERS = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@turbotask.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      organizationId: 'org-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@turbotask.com',
      firstName: 'Manager',
      lastName: 'User',
      role: UserRole.MANAGER,
      organizationId: 'org-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      username: 'user',
      email: 'user@turbotask.com',
      firstName: 'Regular',
      lastName: 'User',
      role: UserRole.USER,
      organizationId: 'org-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '4',
      username: 'viewer',
      email: 'viewer@turbotask.com',
      firstName: 'Viewer',
      lastName: 'User',
      role: UserRole.VIEWER,
      organizationId: 'org-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  constructor() {}

  /**
   * Mock login implementation
   * In production, this would make an HTTP call to your backend
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return of(credentials).pipe(
      delay(1000), // Simulate network delay
      map(({ username, password }) => {
        // Mock validation - accept any password for demo
        const user = this.MOCK_USERS.find(u => u.username === username);
        
        if (!user) {
          const error: AuthError = {
            code: 'USER_NOT_FOUND',
            message: 'Invalid username or password'
          };
          throw error;
        }

        // Mock password validation (in production, this would be server-side)
        if (password.length < 3) {
          const error: AuthError = {
            code: 'INVALID_PASSWORD',
            message: 'Password must be at least 3 characters'
          };
          throw error;
        }

        // Generate mock JWT token
        const token = this.generateMockToken(user);
        
        const response: LoginResponse = {
          user,
          token,
          expiresIn: 3600 // 1 hour
        };

        // Store auth data in localStorage
        this.storeAuthData(response);
        
        return response;
      })
    );
  }

  /**
   * Mock logout implementation
   */
  logout(): Observable<void> {
    return of(null).pipe(
      delay(500), // Simulate network delay
      map(() => {
        this.clearAuthData();
      })
    );
  }

  /**
   * Check if user is authenticated from stored data
   */
  checkAuth(): Observable<{ user: User; token: string } | null> {
    return of(this.getStoredAuthData());
  }

  /**
   * Mock token refresh
   */
  refreshToken(): Observable<string> {
    const authData = this.getStoredAuthData();
    
    if (!authData) {
      return throwError(() => new Error('No auth data found'));
    }

    return of(authData.token).pipe(
      delay(500),
      map(() => {
        // Generate new token
        const newToken = this.generateMockToken(authData.user);
        this.updateStoredToken(newToken);
        return newToken;
      })
    );
  }

  /**
   * Generate a mock JWT token
   * In production, this would be done by the backend
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(authData: LoginResponse): void {
    const data = {
      user: authData.user,
      token: authData.token,
      expiresAt: Date.now() + (authData.expiresIn * 1000)
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Get stored authentication data
   */
  private getStoredAuthData(): { user: User; token: string } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      // Check if token is expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.clearAuthData();
        return null;
      }

      return {
        user: data.user,
        token: data.token
      };
    } catch (error) {
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Update stored token
   */
  private updateStoredToken(token: string): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        data.token = token;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error updating stored token:', error);
    }
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get current user from stored data
   */
  getCurrentUser(): User | null {
    const authData = this.getStoredAuthData();
    return authData?.user || null;
  }

  /**
   * Get current token from stored data
   */
  getCurrentToken(): string | null {
    const authData = this.getStoredAuthData();
    return authData?.token || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}
