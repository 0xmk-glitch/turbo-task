import { Role } from "libs/auth/enum/role.enum"

export class CreateUserDto {
    email: string;
    name: string;
    password: string;
    role: Role;
    orgId: number;
}
