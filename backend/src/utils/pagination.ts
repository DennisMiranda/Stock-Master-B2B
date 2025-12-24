import type { Query } from "firebase-admin/firestore";

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface PaginationMetadata {
  count: number;
  pages: number;
  page: number;
  limit: number;
}

export async function paginateQuery<T>(
  query: Query,
  params: PaginationParams
): Promise<{ data: T[]; metadata: PaginationMetadata }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const offset = (page - 1) * limit;

  // Total de documentos
  const snapshotTotal = await query.count().get();
  const total = snapshotTotal.data().count;

  // Datos paginados
  const snapshot = await query.offset(offset).limit(limit).get();

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];

  return {
    data,
    metadata: {
      count: total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}
