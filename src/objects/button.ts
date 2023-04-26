import { AnimationEditor } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";
import { isInRectangle } from "@/utilities/p5-utils";
import p5 from "p5";

export class Button {
  private static p: AnimationEditor;
  private readonly name: string;
  private size: number;
  private box: [number, number, number, number];
  private hover: boolean;
  private image: p5.Image;
  private static instances: { [name: string]: Button } = {};

  constructor(
    name: string,
    x: number,
    y: number,
    size: number,
    image: p5.Image
  ) {
    Button.p = P5Singleton.getInstance();
    this.box = [x, y, size, size];
    this.size = size;
    this.hover = false;
    this.image = image;
    this.name = name;
    Button.instances[name] = this;
  }

  public resize(x: number, y: number, size: number): void {
    this.size = size;
    this.box = [x, y, size, size];
  }

  public draw(): void {
    Button.p.image(this.image, ...this.box);
  }

  public isMouseOver(): boolean {
    const mouseCoords: [number, number] = [
      Button.p.mouseX + this.size / 2,
      Button.p.viewport.mouseY + this.size / 2,
    ];
    const isHovering = isInRectangle(...mouseCoords, ...this.box);
    if (isHovering !== this.hover) {
      this.hover = isHovering;
      return true; // state has changed
    }
    return false; // state has not changed
  }

  static updateMouse() {
    const hoverState = Button.getAllButtons().forEach((button) =>
      button.isMouseOver()
    );
    Button.p.uiProcessed =
      Button.p.uiProcessed ||
      Object.values(Button.instances).some((button) => button.hover);
    return hoverState;
  }

  public getName(): string {
    return this.name;
  }

  public getHoverState(): boolean {
    return this.hover;
  }

  public getSize(): number {
    return this.size;
  }

  public getImage(): p5.Image {
    return this.image;
  }

  public setImage(image: p5.Image) {
    this.image = image;
  }

  public static getAllButtons(): ReadonlyArray<Button> {
    return Object.values(Button.instances);
  }

  public static getButtonByName(name: string): Button | undefined {
    return Button.instances[name];
  }

  public static resetAllButtons(): void {
    Button.getAllButtons().forEach((button) => (button.hover = false));
  }

  public static destroyAllButtons(): void {
    Button.instances = {};
  }

  public static drawAllButtons(): void {
    Button.getAllButtons().forEach((button) => button.draw());
  }
}
