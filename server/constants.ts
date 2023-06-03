export const appSettings = {
  // server settings
  serverPort: 8080,

  // assets
  assetDirectories: {
    sound: "./assets/sound",
    contentImage: "./assets/image/zarbalatrax/content",
    specialImage: "./assets/image/zarbalatrax/special",
  },

  // data input files
  localDataInputPath: "./data/data.json",
  localDataBackupFolderPath: "./data/saves",
  dataInputPath: "./data/dist/zarbalatrax-3/zarbalatrax/ZarbData.h",
  dataInputSearchString: "const int commands[][MAX_SUBARRAY_LENGTH] PROGMEM = {",
  dataInputStopString: "};",
  dataRegex: /{\s*(([\d\w]+,?\s*)+)\s*}/g,
  commandAliases: {
    1: "DELAY",
    2: "TALK",
    3: "SQUAMBO",
  },

  // script files
  windowsScriptExecutor: "cmd.exe",
  shellExecutor: "/bin/bash",
  uploadScriptFiles: [
    ".\\data\\dist\\admin-panel\\sync.bat",
    ".\\data\\dist\\admin-panel\\upload-to-arduino.bat",
    ".\\data\\dist\\admin-panel\\local-sync.bat",
  ],
  playRemoteScript: ".\\data\\dist\\admin-panel\\play-file-cmd.bat",
  scriptDelayTime: 500, // delay prevents connections errors for Pi SSH

  defaultEncoding: "utf8",
  invalidDataMessage: "Invalid data",
  readErrorMessage: "Error reading file from disk.",
  writeErrorMessage: "Error writing file.",
  serverErrorMessage: "Server error",
  dataSaveSuccessMessage: "Data saved successfully!",
  dataLocalSaveCompleteMessage: "Received data and saved it successfully",
  jsonParseErrorMessage: "Error parsing JSON string.",
  uploadErrorMessage: "Could not upload",
} as const;
