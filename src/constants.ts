export const appSettings = {
  versionString: "animystic version: 0.0.1 alpha",
  versionStringColor: [255, 128],
  versionStringTextSize: 8,

  defaultFill: [255],
  defaultFont: "Georgia",

  // file settings
  dataEndpoint: "data/dist.h",
  imagesPath: "assets/image",
  mainImagesPath: "assets/image/zarbalatrax/content",
  specialImagesPath: "assets/image/zarbalatrax/special",
  soundsPath: "assets/sound",
  logo: "sound-transparent.png",
  missingImage: "thonk.png",
  playButton: "play-circle.png",
  pauseButton: "pause-circle.png",
  helpButton: "question-circle.png",
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
    "Music",
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
  controlsHeightProportion: 1 / 16,
  audioButtonHeightProportion: 2 / 3,

  // audio widget appearance
  scrubberColor: [255, 0, 0],

  // signal widget settings
  signalWaveHeightScale: 0.4,
  angularRange: 50,
  mouseTolerance: 0.008,

  // signal widget appearance
  strokeWeight: 3,
  indicatorMargin: 0.9,
  defaultSignalStrokeColor: [255, 0, 255],
  badKeyframeColor: [0, 0, 255],
  freeIndicatorColor: [255, 0, 0],
  selectionIndicatorColor: [0, 0, 255],

  // command settings for servo widget
  commands: {
    delay: 1,
    talk: 2,
  },

  // help box settings
  helpBoxSelector: "#help",

  // upload box settings
  uploadBoxSelector: "#upload",
  uploadCloseTimeout: 1000,
} as const;
