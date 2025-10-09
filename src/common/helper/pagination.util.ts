import { PaginationOptions, PaginatedResult } from '../types/pagination.types';

export class PaginationUtil {
  /**
   * 페이지네이션 기본 옵션 생성
   */
  static getDefaultOptions(): PaginationOptions {
    return {
      page: 1,
      limit: 20,
    };
  }

  /**
   * 페이지네이션 옵션 정규화
   */
  static normalizeOptions(options?: Partial<PaginationOptions>): PaginationOptions {
    const defaultOptions = this.getDefaultOptions();
    return {
      page: options.page || defaultOptions.page,
      limit: options.limit || defaultOptions.limit,
    };
  }

  /**
   * skip 값 계산
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * 총 페이지 수 계산
   */
  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * 페이지네이션 메타데이터 생성
   */
  static createMetadata(options: PaginationOptions, total: number) {
    return {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: this.calculateTotalPages(total, options.limit),
    };
  }

  /**
   * 페이지네이션 결과 생성
   */
  static createResult<T>(data: T[], options: PaginationOptions, total: number): PaginatedResult<T> {
    return {
      data,
      meta: this.createMetadata(options, total),
    };
  }

  /**
   * 쿼리 파라미터에서 페이지네이션 옵션 추출
   */
  static extractFromQuery(query: { page?: string; limit?: string; [key: string]: any }): PaginationOptions | undefined {
    if (!query.page && !query.limit) {
      return undefined;
    }

    return {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
    };
  }
}
