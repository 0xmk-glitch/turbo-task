import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../apps/api/src/app/users/entities/user.entity';
import { AuthJwtPayload } from '../types/jwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: configService.get<string>('JWT_PUBLIC_KEY'),
    });
  }

  async validate(payload: AuthJwtPayload) {
    console.log('JWT Strategy - Validating RSA payload:', payload);
    
    // Validate required fields in payload
    if (!payload.userId || !payload.email || !payload.orgId || !payload.role || !payload.username) {
      console.log('JWT Strategy - Invalid payload structure:', payload);
      throw new UnauthorizedException('Invalid token payload');
    }
    
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
      relations: ['organization'],
    });

    console.log('JWT Strategy - Found user:', user);

    if (!user) {
      console.log('JWT Strategy - User not found for payload.userId:', payload.userId);
      throw new UnauthorizedException('User not found');
    }

    // Verify payload matches user data
    if (user.email !== payload.email || user.organizationId !== payload.orgId) {
      console.log('JWT Strategy - Payload data mismatch with user data');
      throw new UnauthorizedException('Token data mismatch');
    }

    console.log('JWT Strategy - Returning user:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.name,
      organizationId: user.organizationId 
    });
    
    return user;
  }
}

