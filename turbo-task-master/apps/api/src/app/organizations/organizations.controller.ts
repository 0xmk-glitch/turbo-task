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
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../../../../libs/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../../../../libs/auth/guards/roles/roles.guard';
import { Roles } from '../../../../../libs/auth/decorators/roles.decorator';
import { Role } from '../../../../../libs/auth/enum/role.enum';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  findAll(@Req() req) {
    // Users can only see their own organization unless they're admin
    if (req.user.role === Role.ADMIN) {
      return this.organizationsService.findAll();
    }
    return this.organizationsService.findOne(req.user.orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const orgId = parseInt(id);
    // Users can only access their own organization unless they're admin
    if (req.user.role !== Role.ADMIN && req.user.orgId !== orgId) {
      throw new Error('Access denied');
    }
    return this.organizationsService.findOne(orgId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(+id, updateOrganizationDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(+id);
  }

  @Get(':id/users')
  getUsers(@Param('id') id: string, @Req() req) {
    const orgId = parseInt(id);
    // Users can only see users in their own organization unless they're admin
    if (req.user.role !== Role.ADMIN && req.user.orgId !== orgId) {
      throw new Error('Access denied');
    }
    return this.organizationsService.getUsersInOrganization(orgId);
  }
}
