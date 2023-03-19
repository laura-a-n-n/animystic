import { appSettings } from "@/constants";
import { AudioWidget } from "@/objects/audio-widget";
import { Banner } from "@/objects/banner";
import { Box } from "@/objects/box/box";
import { UploadBox } from "@/objects/box/upload-box";
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
  p.textFont(appSettings.defaultFont);
  p.textSize(p.viewport.textSize);
};

export const postloadSetup = () => {
  const p = P5Singleton.getInstance();

  p.banner = new Banner();
  p.menu = new Menu();
  p.audioWidget = new AudioWidget();
  p.signalWidget = new SignalWidget(appSettings.angularRange, true);
  p.mouse = new Mouse();
  p.helpBox = new Box(appSettings.helpBoxSelector);
  p.saveBox = new Box(appSettings.saveBoxSelector);
  p.helpBox = new Box(appSettings.helpBoxSelector);
  p.uploadBox = new UploadBox(appSettings.uploadBoxSelector);
  p.boxes = [p.helpBox, p.uploadBox];

  p.postloadSetupFinished = true;
};
