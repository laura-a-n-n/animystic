import { appSettings } from "@/constants";
import { Box } from "./box";
import { Element } from "p5";

export class UploadBox extends Box {
  yesButton: Element;
  noButton: Element;
  uploadText: Element;
  loadingSpinner: Element;

  constructor(selector: string) {
    super(selector);
    this.yesButton = this.p.select("#upload-yes") as Element;
    this.noButton = this.p.select("#upload-no") as Element;
    this.uploadText = this.p.select("#upload-text") as Element;
    this.loadingSpinner = this.p.select("#loading-spinner") as Element;
    this.yesButton.mouseClicked(this.upload.bind(this));
  }

  hide() {
    super.hide();
    this.uploadText.html(
      "Are you sure you want to upload? Be sure to save (CTRL+S) before proceeding."
    );
    this.loadingSpinner.hide();
    this.yesButton.show();
    this.noButton.show();
  }

  upload() {
    this.uploadText.html("Hacking Zarb's brain...");
    this.loadingSpinner.style("display", "inline");
    this.yesButton.hide();
    this.noButton.hide();
    // Convert the currentData array to JSON format
    const jsonData = JSON.stringify({
      filename: this.p.menu.lastSelectedFile,
    });

    // Send a POST request to the server
    fetch("/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not OK");
        }
        this.loadingSpinner.hide();
        this.uploadText.html(
          "Done! Reboot script called. Check server logs if needed."
        );
      })
      .catch((error) => {
        this.uploadText.html(
          `There was a problem sending the data:\n ${error}`
        );
      })
      .finally(() => {
        setTimeout(() => {
          this.hide();
        }, appSettings.boxCloseTimeout);
      });
  }
}
