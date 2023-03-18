import { appSettings } from "@/constants";
import { AudioWidget } from "@/objects/audio-widget";
import { Banner } from "@/objects/gui";
import { Menu } from "@/objects/menu";
import { Mouse } from "@/objects/mouse";
import { SignalWidget } from "@/objects/signal-widget";
import { Viewport } from "@/objects/viewport";
import { P5Singleton } from "@/utilities/p5-singleton";
import p5 from "p5";

export const setup = () => {
    const p = P5Singleton.getInstance();

    p.viewport = new Viewport();

    p.createCanvas(p.viewport.width, p.viewport.height);
    p.fill(...appSettings.defaultFill);
    p.noStroke();
    p.textFont(appSettings.defaultFont)
    p.textSize(p.viewport.textSize);

    p.banner = new Banner();
    p.menu = new Menu();
    p.audioWidget = new AudioWidget();
    p.signalWidget = new SignalWidget(appSettings.angularRange, true);
    p.mouse = new Mouse();
};