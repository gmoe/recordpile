export const ORDER_VALUES = ['ASC', 'DESC'];

export interface SortableContract<T, K extends keyof T = keyof T> {
  field: K;
  order: typeof ORDER_VALUES[number];
}
