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
import { Role } from '../../../../../libs/auth/enum/role.enum';
import { RolesGuard } from '../../../../../libs/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from '../../../../../libs/auth/guards/jwt-auth/jwt-auth.guard';
import { TaskStatus } from './entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  //only Admin and Editor Can create a task
  @Roles(Role.ADMIN, Role.EDITOR)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(createTaskDto, req.user.id, req.user.orgId);
  }

  @Get()
  findAll(@Req() req, @Query('user') userId?: string) {
    if (userId && req.user.role === Role.ADMIN) {
      return this.tasksService.findByUser(+userId, req.user.orgId);
    }
    return this.tasksService.findByOrganization(req.user.orgId);
  }

  @Get('my-tasks')
  getMyTasks(@Req() req) {
    return this.tasksService.findByUser(req.user.id, req.user.orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(+id, req.user.orgId);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req) {
    return this.tasksService.update(+id, updateTaskDto, req.user.orgId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus, @Req() req) {
    return this.tasksService.updateStatus(+id, status, req.user.orgId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(+id, req.user.orgId);
  }
}
