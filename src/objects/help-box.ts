import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { displayPercent } from "@/utilities/general";
import { P5Singleton } from "@/utilities/p5-singleton";
import { Element } from "p5";

export class HelpBox {
  p: AnimationEditor;
  div!: Element;
  size!: number;

  private mouseOver: boolean = false;

  constructor() {
    this.p = P5Singleton.getInstance();
    this.computeSize();
    this.div = this.p.select("#help") as Element;
    this.div.mouseOver(() => {
      this.mouseOver = true;
    });
    this.div.mouseOut(() => {
      this.mouseOver = false;
    });
    this.div.hide();
    this.p.select(".help input")?.mouseClicked(() => { this.div.hide(); })
  }

  get hidden() {
    return this.div.style("display") == "none";
  }

  get isMouseOver() {
    return this.mouseOver;
  }

  computeSize() {
    // none
  }

  hide() {
    this.div.hide();
  }

  toggle() {
    if (this.hidden) this.div.show();
    else this.div.hide();
  }

  update() {
    this.p.uiProcessed = this.p.uiProcessed || !this.hidden;
  }
}
