import { appSettings } from "@/constants";

export async function getFilesAsync(): Promise<{
  [assetType: string]: string[];
}> {
  const response = await fetch("/files");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export function lookupFiletype(id: number) {
  let i = 0;
  while (
    id >= appSettings.filetypeIdLookup[i + 1] &&
    i < appSettings.filetypeIdLookup.length - 1
  )
    i += 1;

  return appSettings.filetypes[i];
}

export function filenameToNumber(filename: string): number {
  const basename = filename.split(".")[0]; // Get the part before the file extension
  const num = Number(basename); // Convert to number
  return isNaN(num) ? -1 : num; // Return -1 if not a number
}
