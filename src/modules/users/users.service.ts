import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './repositories/users.repository';
import { users } from '../../database/schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersRepository.create(createUserDto);

    const { password, ...result } = user as any;
    return result;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);

    if (user) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async findAll() {
    const users = await this.usersRepository.findAll();
    return users.map((user) => {
      const { password, ...result } = user as any;
      return result;
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const result = await this.usersRepository.findPaginated({ page, limit });
    return {
      ...result,
      data: result.data.map((user) => {
        const { password, ...userWithoutPassword } = user as any;
        return userWithoutPassword;
      }),
    };
  }

  async search(query: string, page: number, limit: number) {
    // const { users } = require('../../../database/schema');
    const result = await this.usersRepository.searchPaginated({
      query,
      columns: [users.name, users.email],
      page,
      limit,
    });
    return {
      ...result,
      data: result.data.map((user) => {
        const { password, ...userWithoutPassword } = user as any;
        return userWithoutPassword;
      }),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.update(id, updateUserDto);

    if (user) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }

  async remove(id: number) {
    const user = await this.usersRepository.delete(id);
    if (user) {
      const { password, ...result } = user as any;
      return result;
    }
    return null;
  }
}
