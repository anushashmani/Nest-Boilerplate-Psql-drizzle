import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../../shared/database/database.module';
import { eq, sql, type SQL, ilike, or, and } from 'drizzle-orm';
import { PgTable, PgColumn } from 'drizzle-orm/pg-core';

@Injectable()
export abstract class BaseRepository<
  TTable extends PgTable<any>,
  TSelect = TTable['_']['inferSelect'],
  TInsert = TTable['_']['inferInsert'],
> {
  constructor(
    @Inject(DRIZZLE)
    protected readonly db: NodePgDatabase<any>,
    protected readonly table: TTable,
  ) {}

  /**
   * Create a new record
   * @param data The data to insert
   * @returns The created record
   */
  async create(data: TInsert): Promise<TSelect> {
    const [result] = await (this.db
      .insert(this.table)
      .values(data as any)
      .returning() as any);
    return result as TSelect;
  }

  /**
   * Create multiple records
   * @param data Array of records to insert
   * @returns Array of created records
   */
  async createMany(data: TInsert[]): Promise<TSelect[]> {
    return (await (this.db
      .insert(this.table)
      .values(data as any)
      .returning() as any)) as unknown as TSelect[];
  }

  /**
   * Upsert a record (Insert or Update on conflict)
   * @param data The data to insert/update
   * @param target The conflict target (column or columns)
   * @returns The upserted record
   */
  async upsert(data: TInsert, target: PgColumn | PgColumn[]): Promise<TSelect> {
    const [result] = await (this.db
      .insert(this.table)
      .values(data as any)
      .onConflictDoUpdate({
        target: target as any,
        set: data as any,
      })
      .returning() as any);
    return result as TSelect;
  }

  /**
   * Find all records for this table
   * @returns Array of all records
   */
  async findAll(): Promise<TSelect[]> {
    return (await this.db.select().from(this.table as any)) as unknown as TSelect[];
  }

  /**
   * Find many records with optional filters, sorting, and pagination
   * @param params Query parameters
   * @returns Array of matching records
   */
  async findMany(params?: {
    where?: SQL;
    orderBy?: SQL | PgColumn | (SQL | PgColumn)[];
    limit?: number;
    offset?: number;
  }): Promise<TSelect[]> {
    const query = this.db.select().from(this.table as any);

    if (params?.where) {
      query.where(params.where);
    }

    if (params?.orderBy) {
      const orderByArr = Array.isArray(params.orderBy) ? params.orderBy : [params.orderBy];
      query.orderBy(...(orderByArr as any));
    }

    if (params?.limit) {
      query.limit(params.limit);
    }

    if (params?.offset) {
      query.offset(params.offset);
    }

    return (await query) as unknown as TSelect[];
  }

  /**
   * Find a single record based on a condition
   * @param where The SQL condition to filter by
   * @returns The record or null if not found
   */
  async findOne(where: SQL): Promise<TSelect | null> {
    const [result] = await (this.db
      .select()
      .from(this.table as any)
      .where(where)
      .limit(1) as any);
    return (result as TSelect) || null;
  }

  /**
   * Find a record by its ID
   * @param id The ID value (assumes the table has an 'id' column)
   * @returns The record or null if not found
   */
  async findById(id: number | string): Promise<TSelect | null> {
    const [result] = await (this.db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).id, id))
      .limit(1) as any);
    return (result as TSelect) || null;
  }

  /**
   * Update a record by its ID
   * @param id The ID of the record to update
   * @param data The partial data to update
   * @returns The updated record or null if not found
   */
  async update(id: number | string, data: Partial<TInsert>): Promise<TSelect | null> {
    const updateData = { ...data };
    
    // Convention: Auto-handle updatedAt if it exists in the schema
    if ('updatedAt' in (this.table as any) && !('updatedAt' in (data as any))) {
      (updateData as any).updatedAt = new Date();
    }

    const [result] = await (this.db
      .update(this.table)
      .set(updateData as any)
      .where(eq((this.table as any).id, id))
      .returning() as any);
    
    return (result as TSelect) || null;
  }

  /**
   * Delete a record by its ID
   * @param id The ID of the record to delete
   * @returns The deleted record or null if not found
   */
  async delete(id: number | string): Promise<TSelect | null> {
    const [result] = await (this.db
      .delete(this.table)
      .where(eq((this.table as any).id, id))
      .returning() as any);
    return (result as TSelect) || null;
  }

  /**
   * Update multiple records based on a condition
   * @param where The SQL condition
   * @param data The partial data to update
   * @returns Array of updated records
   */
  async updateMany(where: SQL, data: Partial<TInsert>): Promise<TSelect[]> {
    const updateData = { ...data };
    
    if ('updatedAt' in (this.table as any) && !('updatedAt' in (data as any))) {
      (updateData as any).updatedAt = new Date();
    }

    return (await (this.db
      .update(this.table)
      .set(updateData as any)
      .where(where)
      .returning() as any)) as unknown as TSelect[];
  }

  /**
   * Delete multiple records based on a condition
   * @param where The SQL condition
   * @returns Array of deleted records
   */
  async deleteMany(where: SQL): Promise<TSelect[]> {
    return (await (this.db
      .delete(this.table)
      .where(where)
      .returning() as any)) as unknown as TSelect[];
  }

  /**
   * Count the number of records matching a condition
   * @param where Optional SQL condition
   * @returns The count as a number
   */
  async count(where?: SQL): Promise<number> {
    const query = this.db.select({ count: sql<number>`cast(count(*) as integer)` }).from(this.table as any);
    
    if (where) {
      query.where(where);
    }
    
    const [result] = await (query as any);
    return result.count;
  }

  /**
   * Find records with pagination metadata
   * @param params Pagination and filter parameters
   * @returns Paginated data and metadata
   */
  async findPaginated(params: {
    page: number;
    limit: number;
    where?: SQL;
    orderBy?: SQL | PgColumn | (SQL | PgColumn)[];
  }): Promise<{ data: TSelect[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, where, orderBy } = params;
    const offset = (page - 1) * limit;

    const data = await this.findMany({
      where,
      orderBy,
      limit,
      offset,
    });

    const total = await this.count(where);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Search for records across multiple columns
   * @param params Search parameters
   * @returns Array of matching records
   */
  async search(params: {
    query: string;
    columns: PgColumn[];
    where?: SQL;
    orderBy?: SQL | PgColumn | (SQL | PgColumn)[];
    limit?: number;
    offset?: number;
  }): Promise<TSelect[]> {
    const { query, columns, where, orderBy, limit, offset } = params;
    
    const searchConditions = columns.map(col => ilike(col, `%${query}%`));
    const searchWhere = or(...searchConditions);
    const finalWhere = where ? and(where, searchWhere!) : searchWhere;

    return this.findMany({
      where: finalWhere,
      orderBy,
      limit,
      offset,
    });
  }

  /**
   * Search for records with pagination
   * @param params Search and pagination parameters
   * @returns Paginated search results
   */
  async searchPaginated(params: {
    query: string;
    columns: PgColumn[];
    page: number;
    limit: number;
    where?: SQL;
    orderBy?: SQL | PgColumn | (SQL | PgColumn)[];
  }): Promise<{ data: TSelect[]; total: number; page: number; limit: number; totalPages: number }> {
    const { query, columns, page, limit, where, orderBy } = params;
    
    const searchConditions = columns.map(col => ilike(col, `%${query}%`));
    const searchWhere = or(...searchConditions);
    const finalWhere = where ? and(where, searchWhere!) : searchWhere;

    return this.findPaginated({
      page,
      limit,
      where: finalWhere,
      orderBy,
    });
  }

  /**
   * Check if any record exists matching a condition
   * @param where The SQL condition
   * @returns boolean
   */
  async exists(where: SQL): Promise<boolean> {
    const result = await this.count(where);
    return result > 0;
  }

  /**
   * Execute logic within a transaction
   * @param cb Callback function with the transaction object
   * @returns The result of the callback
   */
  async transaction<T>(cb: (tx: any) => Promise<T>): Promise<T> {
    return await this.db.transaction(cb);
  }
}
