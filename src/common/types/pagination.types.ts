export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IPaginatedRepository<T> {
  findAllWithPagination(options?: PaginationOptions): Promise<PaginatedResult<T>>;
}
