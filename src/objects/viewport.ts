import { appSettings } from "@/constants";
import { P5Singleton } from "@/utilities/p5-singleton";
import p5 from "p5";

export class Viewport {
  p: p5;
  width!: number;
  height!: number;
  textSize!: number;

  translationX: number = 0;
  translationY: number = 0;
  mouseX!: number;
  mouseY!: number;

  constructor() {
    this.p = P5Singleton.getInstance();
    this.computeSize();
    this.computeTextSize();
  }

  updateMouse() {
    this.mouseX = this.p.mouseX - this.translationX;
    this.mouseY = this.p.mouseY - this.translationY;
  }

  translate(x: number, y: number = 0) {
    this.p.push();
    this.p.translate(x, y);
    this.translationX += x;
    this.translationY += y;
    this.updateMouse();
  }

  reset() {
    this.translationX = this.translationY = 0;
    this.p.pop();
  }

  computeSize() {
    return [
      (this.width = this.p.max(appSettings.minCanvasSize, this.p.windowWidth)),
      (this.height = this.p.max(
        appSettings.minCanvasSize,
        this.p.windowHeight
      )),
    ];
  }

  computeTextSize() {
    return (this.textSize = this.p.constrain(
      appSettings.textSizeRatio * this.width,
      0,
      appSettings.maxTextSize
    ));
  }

  scaleToHeight(decimal: number) {
    return this.height * decimal;
  }

  scaleToWidth(decimal: number) {
    return this.width * decimal;
  }
}
