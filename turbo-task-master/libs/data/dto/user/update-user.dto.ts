import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../../../../apps/api/src/app/users/entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    name?: string
    role?: UserRole
    organizationId?: string
}
