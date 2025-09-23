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

  async create(createTaskDto: any, userId: number, orgId: number) {
    const task = this.taskReposistory.create({
      ...createTaskDto,
      createdBy: userId,
      orgId: orgId,
    });
    return await this.taskReposistory.save(task);
  }

  async findAll(orgId?: number) {
    const whereClause = orgId ? { orgId } : {};
    return this.taskReposistory.find({
      where: whereClause,
      relations: ['creator', 'assignee', 'organization'],
    });
  }

  async findOne(id: number, orgId?: number) {
    const whereClause = orgId ? { id, orgId } : { id };
    const task = await this.taskReposistory.findOne({
      where: whereClause,
      relations: ['creator', 'assignee', 'organization'],
    });
    return task;
  }

  async findByOrganization(orgId: number) {
    return this.taskReposistory.find({
      where: { orgId },
      relations: ['creator', 'assignee', 'organization'],
    });
  }

  async findByUser(userId: number, orgId: number) {
    return this.taskReposistory.find({
      where: [
        { createdBy: userId, orgId },
        { assignedTo: userId, orgId },
      ],
      relations: ['creator', 'assignee', 'organization'],
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, orgId?: number) {
    const whereClause = orgId ? { id, orgId } : { id };
    await this.taskReposistory.update(whereClause, updateTaskDto);
    const updatedTask = await this.taskReposistory.findOne({ 
      where: { id },
      relations: ['creator', 'assignee', 'organization'],
    });
    return updatedTask;
  }

  async remove(id: number, orgId?: number) {
    const whereClause = orgId ? { id, orgId } : { id };
    const deleteTask = await this.taskReposistory.delete(whereClause);
    return deleteTask;
  }

  async updateStatus(id: number, status: TaskStatus, orgId: number) {
    await this.taskReposistory.update({ id, orgId }, { status });
    return this.findOne(id, orgId);
  }
}
