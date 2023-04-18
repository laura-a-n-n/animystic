export function filenameToNumber(filename: string): number {
  const basename = filename.split(".")[0]; // Get the part before the file extension
  const num = Number(basename); // Convert to number
  return isNaN(num) ? -1 : num; // Return -1 if not a number
}
