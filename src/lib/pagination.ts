export const DEFAULT_PAGE_SIZE = 20;

export type PaginationParams = {
  page: number;
  q: string;
  from: number;
  to: number;
  pageSize: number;
};

export function parsePaginationParams(
  searchParams: Record<string, string | string[] | undefined>,
  pageSize = DEFAULT_PAGE_SIZE,
): PaginationParams {
  const rawPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const rawQ = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;

  const page = Math.max(1, Number.parseInt(rawPage ?? '1', 10) || 1);
  const q = (rawQ ?? '').trim();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { page, q, from, to, pageSize };
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
