import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from '../../../../../libs/auth/types/jwtPayload';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    console.log('Validating user with email:', email);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Load user with organization
    const userWithOrg = await this.userService.findOne(user.id);
    console.log('User found:', userWithOrg);
    return userWithOrg;
  }

  async register(email: string, password: string, name: string, organizationId: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      email,
      password: hashedPassword,
      name,
      organizationId,
      role: UserRole.ADMIN, // Default role is ADMIN
    });

    return this.login(user);
  }
  
  // user object is passed to the login method
  login(user: any) {
    const payload: AuthJwtPayload = {
      userId: user.id,
      email: user.email,
      orgId: user.organizationId,
      role: user.role || UserRole.ADMIN,
      username: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || UserRole.ADMIN,
        organizationId: user.organizationId,
      },
    };
  }
}
