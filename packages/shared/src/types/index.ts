export type Pagination = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

export type SuccessResponse<T extends object | object[] | null> = {
  data: T;
  message: string;
} & (T extends object[] ? { pagination?: Pagination } : {});
