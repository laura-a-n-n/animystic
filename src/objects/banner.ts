import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";

export class Banner {
  p: AnimationEditor;
  width!: number;
  height!: number;
  logoWidth!: number;
  logoHeight!: number;
  mouseHoverHome: boolean = false;

  constructor() {
    this.p = P5Singleton.getInstance();
    this.computeSize();
  }

  computeSize() {
    if (this.p.images === undefined) return;
    this.width = this.p.viewport.width;
    this.height = this.p.max(
      this.p.viewport.scaleToHeight(appSettings.bannerHeight),
      this.p.images.logo.height
    );
    this.logoHeight = appSettings.logoHeightToBannerHeightRatio * this.height;
    this.logoWidth = appSettings.logoAspect * this.logoHeight;
  }

  update() {
    const mouseYGood = this.p.mouseY <= this.height;
    console.log(this.p.mouseY, this.height, mouseYGood);
    this.mouseHoverHome =
      !this.p.uiProcessed &&
      mouseYGood &&
      this.p.abs(this.p.mouseX - this.width / 2) <=
        this.p.images.logo.width / 2; // is mouse hovering logo image?

    this.p.uiProcessed = this.p.uiProcessed || this.mouseHoverHome; // is mouse hovering toolbar?

    if (this.mouseHoverHome) this.p.mouse.cursor("pointer");
  }

  draw() {
    // banner
    this.p.push();
    this.p.fill(...appSettings.headerColor);
    this.p.rect(0, 0, this.width, this.height);

    // logo image
    this.p.imageMode(this.p.CENTER);
    if (this.p.images !== undefined)
      this.p.image(
        this.p.images.logo,
        this.width / 2,
        this.height / 2,
        this.logoWidth,
        this.logoHeight
      );
    this.p.pop();
  }
}
