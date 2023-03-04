export const appSettings = {
    defaultFill: [255],
    defaultFont: "Georgia",

    // file settings
    imagesPath: "assets/image",
    mainImagesPath: "assets/image/zarbalatrax/content",
    specialImagesPath: "assets/image/zarbalatrax/special",
    soundsPath: "assets/sound",
    logo: "sound-transparent.png",
    missingImage: "thonk.png",
    filetypeIdLookup: [1, 14, 31, 44, 60, 71, 84, 97, 100, 101],
    filetypes: [
        "★ Fortune",
        "★★ Fortune",
        "★ Story",
        "★★ Story",
        "★★★ Sound Design",
        "Idle",
        "Introduction",
        '"In a past life..."',
        "★★★GOD MODE★★★",
        "Music"
    ],

    // menu and gui settings
    bannerHeight: 0.15,
    logoHeightToBannerHeightRatio: 0.75,
    logoAspect: 512 / 107,
    textSizeRatio: 64 / 1024,
    filenameTextScale: 1.5, 
    menuTextSizeRatio: 0.2,
    maxTextSize: 64,
    minCanvasSize: 128,
    horizontalMargin: 0.05,
    verticalMargin: 0.015,
    cellSize: 0.08,
    cellPadding: 0.05,

    // menu colors
    backgroundColor: [31.4, 32.2, 34.9],
    headerColor: [24, 25, 28],
    contentColor: [55, 57, 62],
    menuHoverColor: [255, 255, 255, 50],
    menuTileColor: [0, 40],
    menuBorderRadius: 0,

    // loading settings
    defaultLoadingMessage: "Loading...",
    soundLoadingWeight: 0.9,
    imageLoadingWeight: 0.1,

    // audio widget settings
    samplingResolution: 64,
    maxWaveHeightProportion: 1 / 3,
    innerPadding: 0.05,
    
    // signal widget settings
    signalWaveHeightScale: 0.4,
    angularRange: 55,
    mouseTolerance: 0.008,

    // signal widget colors
    defaultSignalStrokeColor: [255, 0, 255],

    // command settings for servo widget
    commands: {
        delay: 1,
        talk: 2
    }
} as const;