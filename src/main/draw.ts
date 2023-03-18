import { appSettings } from "@/constants";
import { handleMessage } from "@/objects/message";
import { P5Singleton } from "@/utilities/p5-singleton";

export const draw = () => {
    const p = P5Singleton.getInstance();
    if (p === undefined) return;

    p.background(...appSettings.backgroundColor);
    handleMessage();
    if (p.showMessage || !p.essentialImagesLoaded) return;

    // pre-draw updates
    p.mouse.update();
    p.banner.update();

    // main draw functions
    p.viewport.translate(0, p.banner.height); // move viewport below banner
    if (p.files !== undefined && p.menu !== undefined && p.menu.enabled) p.menu.draw();
    if (p.menu !== undefined && !p.menu.enabled) {
        p.audioWidget.draw();
        p.signalWidget.draw();
    }
    p.viewport.reset();

    // call banner draw functions
    p.banner.draw();
    p.mouse.draw();
};
