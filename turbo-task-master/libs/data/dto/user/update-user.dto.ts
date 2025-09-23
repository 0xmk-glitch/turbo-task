import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Role } from 'libs/auth/enum/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    name: string
    role:Role
    orgId:number
}
