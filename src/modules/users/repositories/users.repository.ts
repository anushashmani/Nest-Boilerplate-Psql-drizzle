import { Injectable, Inject } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import * as schema from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../../shared/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersRepository extends BaseRepository<typeof schema.users> {
  constructor(
    @Inject(DRIZZLE)
    protected readonly db: NodePgDatabase<any>,
  ) {
    super(db, schema.users);
  }

  async findByEmail(email: string) {
    return this.findOne(eq(schema.users.email, email));
  }

  async findById(id: number) {
    return super.findById(id);
  }

  async findAll() {
    return super.findAll();
  }

  async create(data: schema.NewUser) {
    return super.create(data);
  }

  async update(id: number, data: Partial<schema.NewUser>) {
    return super.update(id, data);
  }

  async delete(id: number) {
    return super.delete(id);
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    where?: any;
    orderBy?: any;
  }) {
    return super.findPaginated(params);
  }

  async searchPaginated(params: {
    query: string;
    columns: any[];
    page: number;
    limit: number;
    where?: any;
    orderBy?: any;
  }) {
    return super.searchPaginated(params);
  }
}
