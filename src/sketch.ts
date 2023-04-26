import p5 from "p5";
import "p5/lib/addons/p5.sound";

import { AnimationEditor as Sketch } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";
import { preloadAsync } from "@/main/preload";
import { setup } from "@/main/setup";
import { draw } from "@/main/draw";
import {
  keyPressed,
  mouseClicked,
  mouseWheel,
  windowResized,
} from "@/main/events";

const sketch = (p: p5) => {
  P5Singleton.setInstance(p as Sketch);

  p.setup = setup;
  p.draw = draw;
  p.windowResized = windowResized;
  p.keyPressed = keyPressed;
  p.mouseWheel = mouseWheel;
  p.mouseClicked = mouseClicked;
};

new p5(sketch);
