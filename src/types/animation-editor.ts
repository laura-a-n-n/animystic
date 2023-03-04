import { AudioWidget } from "@/objects/audio-widget";
import { Gui } from "@/objects/gui";
import { Menu } from "@/objects/menu";
import { SignalWidget } from "@/objects/signal-widget";
import { Viewport } from "@/objects/viewport";
import p5 from "p5";

export type AnimationEditor = p5 & {
    viewport: Viewport;
    loaded: boolean;
    menu: Menu;
    gui: Gui;
    files: { [assetType: string]: string[] };
    audioWidget: AudioWidget;
    signalWidget: SignalWidget;

    data: { [key: string]: { [filename: string]: number[] } };
    sounds: { [name: string]: p5.SoundFile };
    images: { [name: string]: p5.Image };
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
    mouseEngaged: boolean;
};
