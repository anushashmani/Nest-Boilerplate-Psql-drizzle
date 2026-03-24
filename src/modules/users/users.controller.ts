import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get users with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated users',
    type: PaginatedResponseDto<User>,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAllPaginated(
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get('search')
  @Roles('admin')
  @ApiOperation({ summary: 'Search users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return matching users',
    type: PaginatedResponseDto<User>,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  search(@Query('q') q: string, @Query() query: PaginationQueryDto) {
    return this.usersService.search(q, query.page || 1, query.limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user data' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
