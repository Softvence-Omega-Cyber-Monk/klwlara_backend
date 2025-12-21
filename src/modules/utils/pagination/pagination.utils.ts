import { PrismaClient } from 'generated/prisma';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface QueryArgs {
  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
}

export async function paginate<T>(
  prisma: PrismaClient,
  model: keyof PrismaClient & string,
  query: QueryArgs = {},
  options: { page: number; limit: number } = { page: 1, limit: 10 },
): Promise<PaginatedResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    (prisma[model] as any).findMany({
      ...query,
      skip,
      take: limit,
    }),
    (prisma[model] as any).count({ where: query.where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
