import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Generate API key for the organization
    const apiKey = this.generateApiKey();
    
    const organization = this.organizationRepository.create({
      ...createOrganizationDto,
      apiKey,
    });
    return await this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      where: { isActive: true },
      relations: ['users', 'tasks'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    return await this.organizationRepository.findOne({
      where: { id, isActive: true },
      relations: ['users', 'tasks'],
    });
  }

  async findByApiKey(apiKey: string): Promise<Organization> {
    return await this.organizationRepository.findOne({
      where: { apiKey, isActive: true },
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    await this.organizationRepository.update(id, updateOrganizationDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.organizationRepository.update(id, { isActive: false });
  }

  async getUsersInOrganization(orgId: string) {
    return await this.organizationRepository.findOne({
      where: { id: orgId, isActive: true },
      relations: ['users'],
    });
  }

  async getChildren(parentId: string): Promise<Organization[]> {
    return await this.organizationRepository.find({
      where: { parentId, isActive: true },
      relations: ['users', 'tasks'],
    });
  }

  private generateApiKey(): string {
    return 'org_' + crypto.randomBytes(32).toString('hex');
  }
}
