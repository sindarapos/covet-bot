export const summaryFormatter = (list: string[], limit = 3, separator = ', '): string => {
  if (list.length <= limit) {
    return list.join(separator);
  }

  const firstItems = list.slice(0, limit);
  return `${firstItems.join(separator)} and ${list.length - limit} more`;
};
