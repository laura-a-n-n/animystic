import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";

export class Gui {
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
            this.p.viewport.percentOfHeight(appSettings.bannerHeight),
            this.p.images.logo.height
        );
        this.logoHeight =
            appSettings.logoHeightToBannerHeightRatio * this.height;
        this.logoWidth = appSettings.logoAspect * this.logoHeight;
    }

    update() {
        this.p.uiProcessed = this.p.mouseY <= this.height; // is mouse hovering toolbar?
        this.mouseHoverHome =
            this.p.uiProcessed &&
            this.p.abs(this.p.mouseX - this.width / 2) <=
                this.p.images.logo.width / 2; // is mouse hovering logo image?

        if (this.mouseHoverHome) {
            this.p.mouseEngaged = true;
            this.p.cursor("pointer");
        }
    }

    draw() {
        this.update();

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
