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
  dataInputPath: "./data/dist/zarbalatrax-3/zarbalatrax/ZarbData.h",
  dataInputSearchString: "const std::vector<std::vector<int>> commands = {",
  dataInputStopString: "};",
  dataRegex: /{\s*((\d+,?\s*)+)\s*}/g,

  // script files
  windowsScriptExecutor: "cmd.exe",
  shellExecutor: "/bin/bash",
  uploadScriptFiles: [
    ".\\data\\dist\\admin-panel\\sync.bat",
    ".\\data\\dist\\admin-panel\\upload-to-arduino.bat",
  ],
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
