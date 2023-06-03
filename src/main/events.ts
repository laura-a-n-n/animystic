import { SignalWidget } from "@/objects/widget/signal-widget";
import { WidgetCollector } from "@/objects/widget/widget-collector";
import { P5Singleton } from "@/utilities/p5-singleton";

export const windowResized = () => {
  const p = P5Singleton.getInstance();
  if (p === undefined) return;
  const [width, height] = p.viewport?.computeSize();
  p.resizeCanvas(width, height);
  p.textSize(p.viewport.computeTextSize());
  p.banner?.computeSize();
  p.menu?.computeSize();
  WidgetCollector.windowResized();
};

export const keyPressed = (event: KeyboardEvent) => {
  event.preventDefault();
  const p = P5Singleton.getInstance();
  if (!p.menu?.enabled) WidgetCollector.keyPressed();
  if (p.key === "/") p.saveCanvas("animystic-screenshot.png");
};

export const mouseClicked = () => {
  const p = P5Singleton.getInstance();
  if (!p.postloadSetupFinished) return;
  if (p.uiProcessed) {
    if (p.banner?.mouseHoverHome) {
      // user wants to go home
      p.audioWidget?.currentSound?.stop();
      p.menu.enabled = true;
      p.listBox?.hide();
      return;
    } else if (p.audioWidget?.uiProcessed) {
      p.audioWidget.mouseClicked();
      return;
    }
    for (const box of p.boxes) {
      if (box === p.listBox) continue;
      if (!box.isMouseOver) box.hide();
    }
  }

  if (p.menu.enabled && p.menu.lastSelectedFile !== "") {
    p.menu.enabled = false;
    p.audioWidget.bindSound(p.sounds[p.menu.lastSelectedFile]);
    p.listBox.toggle();
    for (const signalWidget of WidgetCollector.filter(SignalWidget))
      signalWidget.newData(p.data[signalWidget.name][p.menu.lastSelectedFile]);
  }
};

export const mouseWheel = (event: WheelEvent) =>
  P5Singleton.getInstance().menu?.scroll(event.deltaY);
