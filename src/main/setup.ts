import { appSettings } from "@/constants";
import { AudioWidget } from "@/objects/audio-widget";
import { Gui } from "@/objects/gui";
import { Menu } from "@/objects/menu";
import { SignalWidget } from "@/objects/signal-widget";
import { Viewport } from "@/objects/viewport";
import { P5Singleton } from "@/utilities/p5-singleton";
import p5 from "p5";

export const setup = () => {
    const p = P5Singleton.getInstance();

    p.viewport = new Viewport();

    p.loaded = false;
    p.showMessage = true;
    p.message = "Loading...";
    p.imagesLoaded = 0;
    p.soundsLoaded = 0;
    p.percentLoaded = 0;
    p.maxSounds = 97; // ??
    p.maxImages = 97;

    p.createCanvas(p.viewport.width, p.viewport.height);
    p.fill(...appSettings.defaultFill);
    p.noStroke();
    p.textFont(appSettings.defaultFont)
    p.textSize(p.viewport.textSize);

    p.gui = new Gui();
    p.menu = new Menu();
    p.audioWidget = new AudioWidget();
    p.signalWidget = new SignalWidget(appSettings.angularRange);
};