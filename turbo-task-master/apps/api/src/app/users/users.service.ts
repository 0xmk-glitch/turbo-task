import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../../../../libs/data/dto/user/create-user.dto';
import { UpdateUserDto } from '../../../../../libs/data/dto/user/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);

    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return updatedUser;
  }

  async remove(id: string) {
    const deleteUser = await this.userRepository.delete(id);
    return deleteUser;
  }

  async findByOrganization(orgId: string) {
    return await this.userRepository.find({
      where: { organizationId: orgId, isActive: true },
    });
  }
}
