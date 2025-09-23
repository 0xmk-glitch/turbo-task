import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  name: string;
  orgId: number;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      registerDto.orgId
    );
  }
}
