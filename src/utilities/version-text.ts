import { P5Singleton } from "./p5-singleton";
import { appSettings } from "@/constants";

export const drawVersionText = () => {
  const p = P5Singleton.getInstance();

  p.push();
  p.textSize(appSettings.versionStringTextSize);
  p.fill(...appSettings.versionStringColor);
  p.text(
    appSettings.versionString,
    p.width - p.textWidth(appSettings.versionString),
    1.5 * p.textAscent()
  );
  p.pop();
};
