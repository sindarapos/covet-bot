export const fuzzyMatch = (pattern: string, str: string) => {
  pattern = `.*${ pattern.split('').join('.*') }.*`;
  const re = new RegExp(pattern);
  return re.test(str);
};
