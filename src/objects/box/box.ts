import { AnimationEditor } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";
import { Element } from "p5";

export class Box {
  p: AnimationEditor;
  div!: Element;
  size!: number;

  protected mouseOver: boolean = false;

  constructor(selector: string, closable = true) {
    this.p = P5Singleton.getInstance();
    this.div = this.p.select(selector) as Element;
    this.div.mouseOver(() => {
      this.mouseOver = true;
    });
    this.div.mouseOut(() => {
      this.mouseOver = false;
    });
    if (closable)
      this.p
        .select(`${selector} input, ${selector} .close-button`)
        ?.mouseClicked(this.div.hide.bind(this.div));
  }

  get hidden() {
    return this.div.style("display") == "none";
  }

  get isMouseOver() {
    return this.mouseOver;
  }

  hide() {
    this.div.hide();
  }

  toggle() {
    if (this.hidden) this.div.show();
    else this.div.hide();
  }

  update() {
    this.p.uiProcessed = this.p.uiProcessed || (!this.hidden && this.mouseOver);
  }
}
