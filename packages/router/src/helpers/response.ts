import type { SuccessResponse } from '@repo/shared/types';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

export const successResponseNew = <TData extends object | object[] | null>(
  params: SuccessResponse<TData>
) => {
  return params;
};

export const successResponse = <T, U>(
  data: T,
  message = 'Success',
  pagination?: U
) => ({
  status: 'success',
  message,
  data,
  pagination,
});

export const errorResponse = <T>(error: T, message = 'Error') => ({
  status: 'error',
  message,
  error,
});
