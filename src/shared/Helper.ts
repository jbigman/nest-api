import type { PaginationModel } from 'mongoose-paginate-ts'
import type { UserDocument } from '../modules/user/user.model.js'

export const getPagination = <T, Y>(
  paginatedResult: PaginationModel<Y>,
  docs: T[]
): PaginationModel<T> & { docs: T[] } => {
  return {
    totalDocs: paginatedResult.totalDocs,
    limit: paginatedResult.limit,
    totalPages: paginatedResult.totalPages,
    page: paginatedResult.page,
    pagingCounter: paginatedResult.pagingCounter,
    hasPrevPage: paginatedResult.hasPrevPage,
    hasNextPage: paginatedResult.hasNextPage,
    hasMore: undefined,
    prevPage: paginatedResult.prevPage,
    nextPage: paginatedResult.nextPage,
    docs,
  }
}

export const getEmptyPagination = <I>() => {
  const docs: I[] = []
  return {
    totalDocs: 0,
    limit: 10,
    totalPages: 0,
    page: 0,
    pagingCounter: 0,
    hasPrevPage: undefined,
    hasNextPage: undefined,
    hasMore: undefined,
    prevPage: undefined,
    nextPage: undefined,
    docs,
  }
}

export const transformCollection = async <I, O>(
  collection: PaginationModel<I> | null | undefined,
  transform: (
    elem: I,
    requester: null | UserDocument,
    language?: string,
    country?: string
  ) => Promise<O | null>,
  requester: null | UserDocument,
  language?: string,
  country?: string
): Promise<PaginationModel<O>> => {
  if (!collection || collection.totalDocs === 0) {
    return getEmptyPagination()
  }

  const unresolvedPromises = collection.docs.map(async (document: any) => {
    return await transform(document, requester)
  })

  const mappedList = await Promise.all(unresolvedPromises)

  // Removes nullable
  const mappedElements = mappedList.flatMap((f) => (f ? [f] : []))
  return getPagination<O, I>(collection, mappedElements)
}
