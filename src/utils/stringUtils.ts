import { SnakeToCamelCase } from '../Record';

export const summaryFormatter = (list: string[], limit = 3, separator = ', '): string => {
  if (list.length <= limit) {
    return list.join(separator);
  }

  const firstItems = list.slice(0, limit);
  return `${firstItems.join(separator)} and ${list.length - limit} more`;
};

export const snakeToCamelCase = <T extends string>(value: T): SnakeToCamelCase<T> => {
  const parts = value.split('_');
  return parts.reduce((accumulator, part, i) => {
    let result = part;
    if (i > 0) {
      result = part[0].toUpperCase() + part.slice(1);
    }
    return `${accumulator}${result}`;
  }, '') as SnakeToCamelCase<T>;
};
