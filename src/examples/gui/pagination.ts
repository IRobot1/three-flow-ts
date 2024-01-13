
export interface Pagination {
  moveTo(index: number): void
  moveFirst(): void
  moveLast(): void
  movePrevious(): void
  movePreviousPage(): void
  moveNext(): void
  moveNextPage(): void
}
