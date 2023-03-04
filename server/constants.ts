export const appSettings = {
    // server settings
    serverPort: 8080,

    // assets
    assetDirectories: {
        sound: "./assets/sound",
        contentImage: "./assets/image/zarbalatrax/content",
        specialImage: "./assets/image/zarbalatrax/special",
    },

    // ssh settings (temporary, probably)
    hostname: "raspberrypi.local",
    username: "zarbalatrax"
} as const;
