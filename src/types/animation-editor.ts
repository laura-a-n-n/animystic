import { AudioWidget } from "@/objects/audio-widget";
import { Banner } from "@/objects/banner";
import { HelpBox } from "@/objects/help-box";
import { Menu } from "@/objects/menu";
import { Mouse } from "@/objects/mouse";
import { SignalWidget } from "@/objects/signal-widget";
import { Viewport } from "@/objects/viewport";
import p5 from "p5";

export type AnimationEditor = p5 & {
  viewport: Viewport;
  mouse: Mouse;
  menu: Menu;
  banner: Banner;
  files: { [assetType: string]: string[] };
  audioWidget: AudioWidget;
  signalWidget: SignalWidget;
  helpBox: HelpBox;

  data: { [key: string]: { [filename: string]: number[] } };
  sounds: { [name: string]: p5.SoundFile };
  images: { [name: string]: p5.Image };
  loaded: boolean;
  inputImageNames: string[];
  homeButtonImage: p5.Element;
  uiProcessed: boolean;
  showMessage: boolean;
  message: string;
  imagesLoaded: number;
  soundsLoaded: number;
  percentLoaded: number;
  maxSounds: number;
  maxImages: number;
  essentialImagesLoaded: boolean;
  postloadSetupFinished: boolean;
};
