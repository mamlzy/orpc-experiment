import type { Pagination } from '@repo/shared/types';

export const createPagination = ({
  page,
  limit,
  totalCount,
}: {
  page: number;
  limit: number;
  totalCount: number;
}): Pagination => {
  const pageCount = Math.ceil(totalCount / limit);

  const isFirstPage = page === 1;
  const isLastPage = page === pageCount;
  const currentPage = page;
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < pageCount ? page + 1 : null;

  return {
    isFirstPage,
    isLastPage,
    currentPage,
    previousPage,
    nextPage,
    totalCount,
    pageCount,
  };
};
