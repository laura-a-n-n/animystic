import { appSettings } from "@/constants";
import { handleMessage } from "@/objects/message";
import { P5Singleton } from "@/utilities/p5-singleton";
import { postloadSetup } from "@/main/setup";
import { drawVersionText } from "@/utilities/version-text";
import { WidgetCollector } from "@/objects/widget/widget-collector";

export const draw = () => {
  const p = P5Singleton.getInstance();
  if (p === undefined) return;

  p.background(...appSettings.backgroundColor);
  handleMessage();
  if (p.showMessage || !p.essentialImagesLoaded) return;
  if (!p.postloadSetupFinished) postloadSetup();

  // pre-draw updates
  p.mouse.update(); // sets uiProcessed state to false
  for (const box of p.boxes) box.update(); // ensures uiProcessed state is true if dialog is open
  p.banner.update();

  // main draw functions
  p.viewport.translate(0, p.banner.height); // move viewport below banner
  if (p.files !== undefined && p.menu !== undefined && p.menu.enabled)
    p.menu.draw();
  if (p.menu !== undefined && !p.menu.enabled) WidgetCollector.draw();
  p.viewport.reset();
  p.banner.draw();

  // end-of-frame mouse update
  p.mouse.draw();

  // draw version string
  drawVersionText();
};
