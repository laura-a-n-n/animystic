import fs from "fs";
import { filenameToNumber } from "../common/utils";
import { appSettings } from "./constants";

export const syncLocal = (data: number[], filename: string) => {
  const fileContents = fs.readFileSync(appSettings.dataInputPath, "utf8");
  // extract the vector from the file
  const regex = appSettings.dataRegex;
  const matches = fileContents.match(regex);

  if (matches) {
    const commands = matches.map((match) =>
      match
        .trim()
        .slice(1, -1)
        .split(",")
        .map((str) => parseInt(str.trim()))
    );

    // update the vector at the given index
    const index = filenameToNumber(filename) - 1;
    commands[index] = data;

    // construct new file contents
    const newCommands = commands.map((command) => `{ ${command.join(", ")} }`);
    const startString = appSettings.dataInputSearchString;
    const startIndex = fileContents.indexOf(startString);
    const endIndex =
      fileContents.indexOf(appSettings.dataInputStopString, startIndex) + 2;
    const newFileContents =
      fileContents.slice(0, startIndex + startString.length - 1) +
      "{\n" +
      newCommands.join(",\n") +
      "\n};\n\n" +
      fileContents.slice(endIndex);

    // write new contents to file
    fs.writeFileSync(
      appSettings.dataInputPath,
      newFileContents,
      appSettings.defaultEncoding
    );
    return true;
  } else return false;
};
