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
