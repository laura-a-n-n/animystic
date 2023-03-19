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
