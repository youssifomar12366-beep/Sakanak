export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};
