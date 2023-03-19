export const appSettings = {
    // server settings
    serverPort: 8080,

    // assets
    assetDirectories: {
        sound: "./assets/sound",
        contentImage: "./assets/image/zarbalatrax/content",
        specialImage: "./assets/image/zarbalatrax/special",
    },

    // data input file
    dataInputPath: "./data/dist/zarbalatrax-3/zarbalatrax/data.h",

    // batch files
    uploadBatchFiles: [
        "./data/dist/admin-panel/upload-to-arduino.bat",
        "./data/dist/admin-panel/reboot.bat"
    ]
} as const;
