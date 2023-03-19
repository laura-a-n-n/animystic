import { Box } from "./box";
import { Element } from "p5";

export class UploadBox extends Box {
  yesButton: Element;
  noButton: Element;
  uploadText: Element;

  constructor(selector: string) {
    super(selector);
    this.yesButton = this.p.select("#upload-yes") as Element;
    this.noButton = this.p.select("#upload-no") as Element;
    this.uploadText = this.p.select("#upload-text") as Element;
    this.yesButton.mouseClicked(this.upload.bind(this));
  }

  upload() {
    this.uploadText.html("Hacking Zarb's brain...");
  }
}
