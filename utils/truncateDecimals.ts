export const truncateDecimals = (num: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.trunc(num * factor) / factor;
};