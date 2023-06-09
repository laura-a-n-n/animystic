import p5 from "p5";
import { appSettings } from "@/constants";
import { safelyStopAudio } from "@/utilities/p5-utils";
import { Widget } from "@/objects/widget/widget";
import { WidgetCollector } from "./widget-collector";
import { SignalWidget } from "./signal-widget";
import { Button } from "../button";

export class AudioWidget extends Widget {
  drawBuffer!: p5.Graphics;
  currentSound!: p5.SoundFile;

  currentTime = 0;
  currentPosition = 0;
  loading = true;
  paused = false;
  timeMarker = 0;
  private resetToMarkerFlag = false;
  private scrubFlag = false;

  resolution!: number;
  topOffset!: number;
  controlsHeight!: number;
  controlsTopOffset!: number;
  audioButtonSize!: number;

  playbackButton!: Button;
  helpButton!: Button;
  uploadButton!: Button;
  downloadButton!: Button;
  playRemoteButton!: Button;
  uiProcessed: boolean = false;

  keyBindings: { [key: string]: () => any } = {
    " ": this.toggle.bind(this),
    r: this.resetTime.bind(this),
    m: this.markTime.bind(this),
  };
  playbackImages: [p5.Image, p5.Image];

  constructor(name: string = "audioWidget") {
    super(name);
    this.playbackImages = [this.p.images.pauseButton, this.p.images.playButton];
    this.createButtons();
  }

  buffer() {
    this.computeSize();
    this.createBuffer();
    this.drawToBuffer();
  }

  createButtons() {
    this.playbackButton = new Button(
      "playback",
      this.width / 2,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.playbackImages[0]
    );
    this.helpButton = new Button(
      "help",
      this.width - this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.p.images.helpButton
    );
    this.uploadButton = new Button(
      "upload",
      this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.p.images.uploadButton
    );
    this.downloadButton = new Button(
      "download",
      (2 + appSettings.downloadButtonPadding) * this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.p.images.downloadButton
    );
    this.playRemoteButton = new Button(
      "playRemoteButton",
      (3.4 + appSettings.downloadButtonPadding) * this.audioButtonSize, //TODO: fix magic number
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.p.images.playRemoteButton
    );
  }

  computeButtonBoxes() {
    this.playbackButton.resize(
      this.width / 2,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize
    );
    this.helpButton.resize(
      this.width - this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize
    );
    this.uploadButton.resize(
      this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize
    );
    this.downloadButton.resize(
      (2 + appSettings.downloadButtonPadding) * this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize
    );
    this.playRemoteButton.resize(
      (3.4 + appSettings.downloadButtonPadding) * this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize
    );
  }

  computeSize() {
    this.width = this.p.width;
    this.height = this.p.height - this.p.banner.height;
    this.resolution = this.width / this.currentSound.duration();
    this.topOffset = this.height / 2;
    this.controlsHeight = this.p.viewport.scaleToHeight(
      appSettings.controlsHeightProportion
    );
    this.controlsTopOffset = this.height - this.controlsHeight;
    this.audioButtonSize =
      appSettings.audioButtonHeightProportion * this.controlsHeight;

    this.computeButtonBoxes();
  }

  bindSound(sound: p5.SoundFile) {
    this.currentSound = sound;
    this.buffer();
    this.resetTime(false);
    this.paused = false;
  }

  createBuffer() {
    super.createBuffer();
    this.drawBuffer.fill(...appSettings.defaultFill);
    this.drawBuffer.stroke(...appSettings.defaultFill);
  }

  drawScrubber() {
    this.p.push();
    this.p.stroke(...appSettings.scrubberColor);
    this.p.fill(...appSettings.scrubberColor);
    this.p.line(this.currentPosition, 0, this.currentPosition, this.p.height);
    this.p.stroke(...appSettings.markerColor);
    this.p.fill(...appSettings.markerColor);
    this.p.line(
      this.timeMarker * this.resolution,
      0,
      this.timeMarker * this.resolution,
      this.p.height
    );
    this.p.pop();
  }

  drawToBuffer(reset = false) {
    // compute data
    const numSamples = this.p.viewport.scaleToWidth(
      appSettings.samplingResolution
    );
    const peaks = this.currentSound.getPeaks(numSamples);
    if (reset) this.resetTime();
    this.loading = false;

    // draw
    let currentX;
    this.drawBuffer.clear(0, 0, 0, 0);
    for (const [index, element] of peaks.entries()) {
      currentX = index / appSettings.samplingResolution;
      this.drawBuffer.line(
        currentX,
        this.height * 0.5, // center
        currentX,
        this.height * (0.5 - appSettings.maxWaveHeightProportion * element) // deviation from center
      );
    }
  }

  drawControls() {
    this.p.push();
    this.p.imageMode(this.p.CENTER);
    this.p.fill(...appSettings.headerColor);
    this.p.rect(0, this.controlsTopOffset, this.width, this.controlsHeight);
    Button.drawAllButtons();
    this.p.pop();
  }

  playRemote() {
    // Convert the currentData array to JSON format
    const jsonData = JSON.stringify({
      filename: this.p.menu.lastSelectedFile,
    });
    this.p.notificationBox.text("<p>Attempting to play...</p>");

    fetch("/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    })
      .then((response) => {
        if (!response.ok) {
          console.log(
            response.text().then((text) => {
              console.log(text);
              throw new Error(text);
            })
          );
        } else this.p.notificationBox.text("<p>Played!</p>");
      })
      .catch((error) => {
        this.p.notificationBox.text(`<p>Remote play failure: ${error}</p>`);
      });
  }

  mouseClicked() {
    if (this.playbackButton.getHoverState()) this.toggle();
    else if (this.helpButton.getHoverState()) this.p.helpBox.toggle();
    else if (this.uploadButton.getHoverState()) this.p.uploadBox.toggle();
    else if (this.downloadButton.getHoverState()) {
      for (const widget of WidgetCollector.filter(SignalWidget))
        widget.initiateSave();
    } else if (this.playRemoteButton.getHoverState()) this.playRemote();
  }

  toggle() {
    if (this.currentSound.isPlaying() && !this.paused) {
      this.pause();
    } else this.paused = false;
    if (!this.resetToMarkerFlag) this.resetToMarkerFlag = true;
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
    }
  }

  resetTime(stop = true) {
    this.currentPosition = this.currentTime = this.timeMarker = 0;
    if (stop) this.pause();
  }

  markTime(argument?: number) {
    this.timeMarker = argument || this.currentTime;
  }

  scrubToPosition(x: number) {
    this.pause();
    this.scrubFlag = true;
    this.currentTime = x / this.resolution;
    this.markTime(this.currentTime);
  }

  update() {
    if (this.loading) return;
    this.playbackButton.setImage(this.playbackImages[Number(this.paused)]);
    if (this.paused && this.currentSound.isPlaying())
      safelyStopAudio(this.currentSound);
    else if (!this.paused) {
      if (this.resetToMarkerFlag) {
        this.resetToMarkerFlag = false;
        this.currentTime = this.timeMarker;
      }
      if (
        !this.p.mouseIsPressed &&
        !this.currentSound.isPlaying() &&
        this.currentTime < this.currentSound.duration()
      ) {
        this.currentSound.play(
          undefined,
          undefined,
          undefined,
          this.currentTime
        ); // resume at current time
      } else if (this.currentSound.isPlaying() && !this.scrubFlag)
        this.currentTime = this.currentSound.currentTime();
    }
    if (this.currentSound.duration() - this.currentTime < 0.1) {
      this.pause();
      this.resetTime(false);
      return;
    }
    this.handleMouse();
    this.currentPosition = this.currentTime * this.resolution;
  }

  handleMouse() {
    this.scrubFlag = false;
    this.uiProcessed = false;
    Button.resetAllButtons();

    if (this.p.uiProcessed) return;
    for (const widget of WidgetCollector.filter(SignalWidget)) {
      if (widget.mouseEngaged || widget.userDraggingKeyframe) return;
    }

    Button.updateMouse();
    this.uiProcessed = this.p.uiProcessed;

    if (this.p.uiProcessed) this.p.mouse.cursor("pointer");
    else if (this.p.mouseIsPressed && this.p.mouseButton == this.p.LEFT)
      this.scrubToPosition(this.p.mouseX);
  }

  isScrubbing() {
    return this.scrubFlag;
  }

  draw() {
    super.draw();

    this.p.push();
    this.p.image(this.drawBuffer, 0, 0);
    this.drawScrubber();
    this.p.pop();
  }
}
