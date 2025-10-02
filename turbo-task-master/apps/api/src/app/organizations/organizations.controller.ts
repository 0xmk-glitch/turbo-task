import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../../../../libs/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../../../../libs/auth/guards/roles/roles.guard';
import { Roles } from '../../../../../libs/auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // Public endpoint - no authentication required
  @Post('register')
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  // Public endpoint - get organization details by API key
  @Get('public/:apiKey')
  getByApiKey(@Param('apiKey') apiKey: string) {
    return this.organizationsService.findByApiKey(apiKey);
  }

  // Protected endpoints below
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    // NOTE: If req.user is undefined here, it means the JwtAuthGuard is not properly attaching the user to the request.
    // This usually indicates an issue with the JWT strategy or the way the guard is applied.
    // For debugging, let's log the full request headers and any error from the guard.
    if (!req.user) {
      console.error('JWT authentication failed. req.user is undefined.');
      console.error('Request headers:', req.headers);
      throw new UnauthorizedException('User not authenticated. JWT may be missing or invalid.');
    }
    
    // Users can only see their own organization unless they're admin
    const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.OWNER;
    
    if (isAdmin) {
      return this.organizationsService.findAll();
    }
    return this.organizationsService.findOne(req.user.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const orgId = id;
    // Users can only access their own organization unless they're admin
    const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.OWNER;
    
    if (!isAdmin && req.user.organizationId !== orgId) {
      throw new ForbiddenException('Access denied');
    }
    return this.organizationsService.findOne(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/users')
  getUsers(@Param('id') id: string, @Req() req) {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const orgId = id;
    // Users can only see users in their own organization unless they're admin
    const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.OWNER;
    
    if (!isAdmin && req.user.organizationId !== orgId) {
      throw new ForbiddenException('Access denied');
    }
    return this.organizationsService.getUsersInOrganization(orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/children')
  getChildren(@Param('id') id: string, @Req() req) {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    const orgId = id;
    // Users can only see children of their own organization unless they're admin
    const isAdmin = req.user.role === UserRole.ADMIN || req.user.role === UserRole.OWNER;
    
    if (!isAdmin && req.user.organizationId !== orgId) {
      throw new ForbiddenException('Access denied');
    }
    return this.organizationsService.getChildren(orgId);
  }
}
