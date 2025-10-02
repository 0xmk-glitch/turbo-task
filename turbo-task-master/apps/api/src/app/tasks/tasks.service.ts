import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './../../../../../libs/data/dto/task/create-task.dto';
import { UpdateTaskDto } from '../../../../../libs/data/dto/task/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskReposistory: Repository<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string, orgId: string) {
    const task = this.taskReposistory.create({
      ...createTaskDto,
      createdBy: userId,
      organizationId: orgId,
      assignedTo: createTaskDto.assignedTo ? createTaskDto.assignedTo : userId
    return await this.taskReposistory.save(task);
  }

  async findAll(orgId?: string) {
    const whereClause = orgId ? { organizationId: orgId } : {};
    return this.taskReposistory.find({
      where: whereClause,
      relations: ['creator', 'assignee', 'organization'],
    });
  }

  async findOne(id: string, orgId?: string) {
    const whereClause = orgId ? { id, organizationId: orgId } : { id };
    const task = await this.taskReposistory.findOne({
      where: whereClause,
      relations: ['creator', 'assignee', 'organization'],
    });
    return task;
  }

  async findByOrganization(orgId: string) {
    return this.taskReposistory.find({
      where: { organizationId: orgId },
      relations: ['creator', 'assignee', 'organization'],
    });
  }

  async findByUser(userId: string, orgId: string) {
    return this.taskReposistory.find({
      where: [
        { createdBy: userId, organizationId: orgId },
        { assignedTo: userId, organizationId: orgId },
      ],
      relations: ['creator', 'assignee', 'organization'],
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, orgId?: string) {
    const whereClause = orgId ? { id, organizationId: orgId } : { id };
    await this.taskReposistory.update(whereClause, updateTaskDto);
    const updatedTask = await this.taskReposistory.findOne({ 
      where: { id },
      relations: ['creator', 'assignee', 'organization'],
    });
    return updatedTask;
  }

  async remove(id: string, orgId?: string) {
    const whereClause = orgId ? { id, organizationId: orgId } : { id };
    const deleteTask = await this.taskReposistory.delete(whereClause);
    return deleteTask;
  }

  async updateStatus(id: string, status: TaskStatus, orgId: string) {
    await this.taskReposistory.update({ id, organizationId: orgId }, { status });
    return this.findOne(id, orgId);
  }
}
