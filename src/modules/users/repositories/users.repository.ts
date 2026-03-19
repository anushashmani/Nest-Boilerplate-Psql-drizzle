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
}
