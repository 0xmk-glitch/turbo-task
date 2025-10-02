import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../apps/api/src/app/users/entities/user.entity';

export const ROLES_KEY = "roles"
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);