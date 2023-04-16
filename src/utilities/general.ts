export const searchWithinTolerance = (
  haystack: number[],
  needle: number,
  tolerance: number
): number | false => {
  for (const [index, item] of haystack.entries()) {
    if (Math.abs(item - needle) <= tolerance) return index;
  }
  return false;
};

export const midpoint = (a: number, b: number): number => {
  return (a + b) / 2;
};

export const getIndexOrDefault = <T>(
  haystack: T[],
  index: number,
  otherwise: T
) => {
  return index in haystack ? haystack[index] : otherwise;
};

export const displayPercent = (percent: number, decimalPlaces: number = 0) =>
  `${(percent * 100).toFixed(decimalPlaces)}%`;

export const arraysAreEqual = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}