import { type SuccessResponse } from '@repo/shared/types';

export const getNextPageParamFn = (
  lastPage: SuccessResponse<any[]>,
  allPages: SuccessResponse<any[]>[],
  lastPageParam: number
) => {
  if (lastPage.data.length === 0) return undefined;

  const lastPageData = lastPage.data;
  const lastPagePagination = lastPage.pagination;

  if (lastPageData.length === lastPagePagination?.totalCount) return undefined;

  return lastPageParam + 1;
};
