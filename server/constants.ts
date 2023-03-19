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

  // batch files
  uploadBatchFiles: [
    ".\\data\\dist\\admin-panel\\upload-to-arduino.bat",
    ".\\data\\dist\\admin-panel\\reboot.bat",
  ],
} as const;
