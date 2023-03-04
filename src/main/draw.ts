import { appSettings } from "@/constants";
import { handleMessage } from "@/objects/message";
import { P5Singleton } from "@/utilities/p5-singleton";

export const draw = () => {
    const p = P5Singleton.getInstance();
    if (p === undefined) return;

    p.background(...appSettings.backgroundColor);
    handleMessage();

    if (p.showMessage || !p.essentialImagesLoaded) return;
    p.viewport.translate(0, p.gui.height);
    if (p.files !== undefined && p.menu !== undefined && p.menu.enabled) p.menu.draw();
    if (p.menu !== undefined && !p.menu.enabled) {
        p.audioWidget.draw();
        p.signalWidget.draw();
    }
    p.viewport.reset();
    p.gui.draw();

    if (!p.mouseEngaged) p.cursor("default");
    p.mouseEngaged = false;
};
