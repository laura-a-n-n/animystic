import { AnimationEditor as Sketch } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";

export class Mouse {
    p: Sketch;
    engaged: boolean = false;

    constructor() {
        this.p = P5Singleton.getInstance();
    }

    cursor(cursorType: string) {
        this.engaged = true;
        this.p.cursor(cursorType);
        return true;
    }

    update() {
        this.p.uiProcessed = false;
    }

    draw() {
        if (!this.engaged) this.p.cursor("default");
        this.engaged = false;
    }
}