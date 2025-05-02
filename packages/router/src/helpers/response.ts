export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export const successResponse = (
  data: any,
  message = 'Success',
  pagination?: any
) => ({
  status: 'success',
  message,
  data,
  pagination,
});

export const errorResponse = (error: any, message = 'Error') => ({
  status: 'error',
  message,
  error,
});
