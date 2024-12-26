export const paginate = (queryBuilder, page: number, pageSize: number) => {
  page = Number(page);
  pageSize = Number(pageSize);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(pageSize) || pageSize < 1) {
    pageSize = 10;
  }

  const skip = (page - 1) * pageSize;

  queryBuilder.skip(skip).take(pageSize);
};

export const buildPaginationResponse = (
  data: any[],
  total: number,
  page: number,
  pageSize: number,
  baseUrl: string,
) => {
  const lastPage = Math.ceil(total / pageSize);

  return {
    links: {
      next:
        page < lastPage
          ? `${baseUrl}?page=${page + 1}&pageSize=${pageSize}`
          : null,
      previous:
        page > 1 ? `${baseUrl}?page=${page - 1}&pageSize=${pageSize}` : null,
    },
    count: total,
    lastPage: lastPage,
    currentPage: page,
    data: data,
  };
};

export const excludeFields = <T>(
  entity: T | T[],
  fields: (keyof T)[],
): Partial<T> | Partial<T>[] => {
  if (Array.isArray(entity)) {
    return entity.map((item) => excludeFields(item, fields) as Partial<T>);
  }

  const entityCopy = { ...entity };
  fields.forEach((field) => delete entityCopy[field]);
  return entityCopy;
};
