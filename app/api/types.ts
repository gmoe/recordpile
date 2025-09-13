export interface SortableContract<T, K extends keyof T = keyof T> {
  field: K;
  order: 'ASC' | 'DESC';
}
