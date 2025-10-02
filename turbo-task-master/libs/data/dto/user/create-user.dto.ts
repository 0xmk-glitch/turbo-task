import { UserRole } from "../../../../apps/api/src/app/users/entities/user.entity"

export class CreateUserDto {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
    organizationId: string;
}
