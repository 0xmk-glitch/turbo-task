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
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './../../../../../libs/data/dto/task/create-task.dto';
import { UpdateTaskDto } from '../../../../../libs/data/dto/task/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../../../libs/auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../../../../../libs/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from '../../../../../libs/auth/guards/jwt-auth/jwt-auth.guard';
import { TaskStatus } from './entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  //only Admin and Owner Can create a task
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(createTaskDto, req.user.id, req.user.organizationId);
  }

  @Get()
  findAll(@Req() req, @Query('user') userId?: string) {
    if (userId && (req.user.role === UserRole.ADMIN || req.user.role === UserRole.OWNER)) {
      return this.tasksService.findByUser(userId, req.user.organizationId);
    }
    return this.tasksService.findByOrganization(req.user.organizationId);
  }

  @Get('my-tasks')
  getMyTasks(@Req() req) {
    return this.tasksService.findByUser(req.user.id, req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(id, req.user.organizationId);
  }

  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req) {
    return this.tasksService.update(id, updateTaskDto, req.user.organizationId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus, @Req() req) {
    return this.tasksService.updateStatus(id, status, req.user.organizationId);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(id, req.user.organizationId);
  }
}
