import { appSettings } from "@/constants";
import { Box } from "./box";

export class FadingBox extends Box {
    protected defaultText: string;
    private _text!: string;
    private isToggling = false;

    constructor(selector: string) {
        super(selector);
        this.defaultText = this.div.html();
    }

    text(text?: string) {
        if (text === undefined) this._text = this.defaultText;
        else this._text = text;
        this.div.html(this._text);
        this.toggle();
    }

    toggle() {
        if (this.isToggling) return; // debounce - ignore this call if already toggling
        this.isToggling = true;
        setTimeout(() => {
            super.toggle();
            this.isToggling = false;
        }, appSettings.boxCloseTimeout);
        super.toggle();
    }
}