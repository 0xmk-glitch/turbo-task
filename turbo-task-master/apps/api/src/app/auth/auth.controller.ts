import { Controller, Post, Body, ValidationPipe, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OrganizationsService } from '../organizations/organizations.service';

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  name: string;
  organizationId: string;
}

export class RegisterWithOrgDto {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  organizationDescription?: string;
  parentId?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly organizationsService: OrganizationsService
  ) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    console.log('Login request with email:', loginDto.email);

    // validates user based on email and password
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    //returns user object and token as payload
    return await this.authService.login(user);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    console.log('Register request for email:', registerDto.email);

    return await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      registerDto.organizationId
    );
  }

  @Post('register-with-org')
  async registerWithOrganization(@Body(ValidationPipe) registerDto: RegisterWithOrgDto) {
    console.log('Register with organization request for email:', registerDto.email);

    // Create organization first
    const organization = await this.organizationsService.create({
      name: registerDto.organizationName,
      description: registerDto.organizationDescription,
      parentId: registerDto.parentId,
    });

    // Register user with the new organization
    return await this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
      organization.id
    );
  }
}
