import { P5Singleton } from "@/utilities/p5-singleton";

export const windowResized = () => {
  const p = P5Singleton.getInstance();
  const [width, height] = p.viewport.computeSize();
  p.resizeCanvas(width, height);
  p.textSize(p.viewport.computeTextSize());
  p.banner.computeSize();
  p.menu.computeSize();
  p.audioWidget?.buffer();
  p.signalWidget?.buffer();
  p.helpBox?.computeSize();
};

export const keyPressed = () => {
  const p = P5Singleton.getInstance();
  if (!p.menu.enabled) {
    p.audioWidget.keyPressed();
    p.signalWidget.keyPressed();
  }
};

export const mouseClicked = () => {
  const p = P5Singleton.getInstance();
  if (p.uiProcessed) {
    if (p.banner.mouseHoverHome) {
      // user wants to go home
      p.audioWidget.currentSound?.stop();
      p.menu.enabled = true;
      return;
    } else if (p.audioWidget.uiProcessed) {
      p.audioWidget.mouseClicked();
      return;
    }
    if (!p.helpBox.isMouseOver) p.helpBox.hide();
  }

  if (p.menu.enabled && p.menu.lastSelectedFile !== "") {
    p.menu.enabled = false;
    p.audioWidget.bindSound(p.sounds[p.menu.lastSelectedFile]);
    p.signalWidget.bindData(p.data.zarbalatrax[p.menu.lastSelectedFile]);
  }
};

export const mouseWheel = (event: WheelEvent) =>
  P5Singleton.getInstance().menu?.scroll(event.deltaY);
