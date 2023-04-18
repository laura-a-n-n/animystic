import { AnimationEditor } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";
import { Graphics } from "p5";
import { WidgetCollector } from "./widget-collector";
import { SignalWidget } from "./signal-widget";

export abstract class Widget {
    p: AnimationEditor;
    drawBuffer!: Graphics;
    width!: number;
    height!: number;
    active: boolean = true;
    renderPriority: number = 0;
    creationOrder: number;
    abstract keyBindings: { [key: string]: () => any };

    constructor(name: string) {
        this.p = P5Singleton.getInstance();
        WidgetCollector.addInstance(name, this);
        this.creationOrder = WidgetCollector.getAllInstances().length;
    }
    
    abstract computeSize(): any;
    abstract drawToBuffer(): any;
    abstract handleMouse(): any;

    setRenderPriority(priority: number) {
      this.renderPriority = priority;
      WidgetCollector.updateRenderPriority();
    }

    buffer() {
        this.computeSize();
        this.createBuffer();
        this.drawToBuffer();
    }

    createBuffer() {
        this.drawBuffer = this.p.createGraphics(this.width, this.height);
    }

    keyPressed() {
        if (!this.active) return;
        const key = this.p.key;
        const modifiers = [];
        if (this.p.keyIsDown(this.p.CONTROL)) {
          modifiers.push("ctrl");
        }
        if (this.p.keyIsDown(this.p.SHIFT)) {
          modifiers.push("shift");
        }
        if (this.p.keyIsDown(this.p.ALT)) {
          modifiers.push("alt");
        }
      
        const keyCombination = [...modifiers, key].join("+");
        this.keyBindings[keyCombination.toLowerCase()]?.();
      }


    update() {
      if (!this.active) return;
    }

    draw() {
        if (!this.active) return;
    }
}
