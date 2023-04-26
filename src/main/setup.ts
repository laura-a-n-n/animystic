import { appSettings } from "@/constants";
import { AudioWidget } from "@/objects/widget/audio-widget";
import { Banner } from "@/objects/banner";
import { Box } from "@/objects/box/box";
import { FadingBox } from "@/objects/box/fading-box";
import { UploadBox } from "@/objects/box/upload-box";
import { Menu } from "@/objects/menu";
import { Mouse } from "@/objects/mouse";
import { SignalWidget } from "@/objects/widget/signal-widget";
import { Viewport } from "@/objects/viewport";
import { P5Singleton } from "@/utilities/p5-singleton";
import p5 from "p5";
import { WidgetCollector } from "@/objects/widget/widget-collector";
import { preloadAsync } from "./preload";

export const setup = () => {
  const p = P5Singleton.getInstance();
  preloadAsync();
  p.viewport = new Viewport();
  WidgetCollector.setInstance();

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
  p.listBox = new Box(appSettings.listBoxSelector, false);
  p.audioWidget = new AudioWidget();
  for (const [name, character] of Object.entries(appSettings.characters)) {
    new SignalWidget(name, character.angularRange, character.rangeInverted, character.strokeColor);
  }
  p.mouse = new Mouse();
  p.helpBox = new Box(appSettings.helpBoxSelector);
  p.saveBox = new FadingBox(appSettings.saveBoxSelector);
  p.helpBox = new Box(appSettings.helpBoxSelector);
  p.uploadBox = new UploadBox(appSettings.uploadBoxSelector);
  p.boxes = [p.helpBox, p.uploadBox, p.listBox];

  p.postloadSetupFinished = true;
};
