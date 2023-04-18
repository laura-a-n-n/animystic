import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { P5Singleton } from "@/utilities/p5-singleton";
import { isInRectangle, safelyStopAudio } from "@/utilities/p5-utils";
import { Widget } from "@/objects/widget/widget";
import p5 from "p5";
import { WidgetCollector } from "./widget-collector";
import { SignalWidget } from "./signal-widget";

export class AudioWidget extends Widget {
  drawBuffer!: p5.Graphics;
  currentSound!: p5.SoundFile;

  currentTime = 0;
  currentPosition = 0;
  loading = true;
  paused = false;

  resolution!: number;
  topOffset!: number;
  controlsHeight!: number;
  controlsTopOffset!: number;
  audioButtonSize!: number;

  // TODO: make this better...
  playbackButtonBox!: [number, number, number, number];
  playbackButtonHover!: boolean;
  helpButtonBox!: [number, number, number, number];
  helpButtonHover!: boolean;
  uploadButtonBox!: [number, number, number, number];
  uploadButtonHover!: boolean;
  downloadButtonBox!: [number, number, number, number];
  downloadButtonHover!: boolean;
  uiProcessed: boolean = false;

  keyBindings: { [key: string]: () => any } = {
    " ": this.toggle.bind(this),
    r: this.resetTime.bind(this),
  };
  currentPlaybackImage: p5.Image;
  playbackImages: [p5.Image, p5.Image];

  constructor(name: string = "audioWidget") {
    super(name);
    this.currentPlaybackImage = this.p.images.pauseButton;
    this.playbackImages = [this.p.images.pauseButton, this.p.images.playButton];
  }

  buffer() {
    this.computeSize();
    this.createBuffer();
    this.drawToBuffer();
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
    this.playbackButtonBox = [
      this.width / 2,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.audioButtonSize,
    ];
    this.helpButtonBox = [
      this.width - this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.audioButtonSize,
    ];
    this.uploadButtonBox = [
      this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.audioButtonSize,
    ];
    this.downloadButtonBox = [
      (2 + appSettings.downloadButtonPadding) * this.audioButtonSize,
      this.controlsTopOffset + this.controlsHeight / 2,
      this.audioButtonSize,
      this.audioButtonSize,
    ];
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
    this.p.image(this.currentPlaybackImage, ...this.playbackButtonBox);
    this.p.image(this.p.images.helpButton, ...this.helpButtonBox);
    this.p.image(this.p.images.uploadButton, ...this.uploadButtonBox);
    this.p.image(this.p.images.downloadButton, ...this.downloadButtonBox);
    this.p.pop();
  }

  mouseClicked() {
    if (this.playbackButtonHover) this.toggle();
    else if (this.helpButtonHover) this.p.helpBox.toggle();
    else if (this.uploadButtonHover) this.p.uploadBox.toggle();
    else if (this.downloadButtonHover) {
      for (const widget of WidgetCollector.filter(SignalWidget))
        widget.initiateSave();
    }
  }

  toggle() {
    if (this.currentSound.isPlaying() && !this.paused) {
      safelyStopAudio(this.currentSound);
    } else
      this.currentSound.play(undefined, undefined, undefined, this.currentTime);

    this.paused = !this.paused;
  }

  pause() {
    if (!this.paused) {
      safelyStopAudio(this.currentSound);
      this.paused = true;
    }
  }

  resetTime(stop = true) {
    this.currentPosition = this.currentTime = 0;
    if (stop) safelyStopAudio(this.currentSound);
  }

  scrubToPosition(x: number) {
    if (this.currentSound.isPlaying()) safelyStopAudio(this.currentSound);
    this.currentTime = x / this.resolution;
  }

  update() {
    if (this.loading) return;
    this.currentPlaybackImage = this.playbackImages[Number(this.paused)];
    if (!this.paused) {
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
        );
      } else
        this.currentTime = this.currentSound.isPlaying()
          ? this.currentSound.currentTime()
          : 0;
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
    this.uiProcessed = this.playbackButtonHover = this.helpButtonHover = false;

    if (this.p.uiProcessed) return;
    for (const widget of WidgetCollector.filter(SignalWidget)) {
      if (widget.mouseEngaged || widget.userDraggingKeyframe) return;
    }
    const mouseCoords: [number, number] = [
      this.p.mouseX + this.audioButtonSize / 2,
      this.p.viewport.mouseY + this.audioButtonSize / 2,
    ];

    // playback button
    this.playbackButtonHover = isInRectangle(
      ...mouseCoords,
      ...this.playbackButtonBox
    );

    // help button
    if (!this.playbackButtonHover)
      this.helpButtonHover = isInRectangle(
        ...mouseCoords,
        ...this.helpButtonBox
      );

    // upload button
    if (!this.helpButtonHover && !this.playbackButtonHover)
      this.uploadButtonHover = isInRectangle(
        ...mouseCoords,
        ...this.uploadButtonBox
      );

    // upload button
    if (
      !this.helpButtonHover &&
      !this.playbackButtonHover &&
      !this.uploadButtonHover
    )
      this.downloadButtonHover = isInRectangle(
        ...mouseCoords,
        ...this.downloadButtonBox
      );

    this.p.uiProcessed =
      this.p.uiProcessed ||
      this.playbackButtonHover ||
      this.helpButtonHover ||
      this.uploadButtonHover ||
      this.downloadButtonHover;
    this.uiProcessed = this.p.uiProcessed;

    if (this.p.uiProcessed) this.p.mouse.cursor("pointer");
    else if (this.p.mouseIsPressed && this.p.mouseButton == this.p.LEFT)
      this.scrubToPosition(this.p.mouseX);
  }

  draw() {
    super.draw();

    this.p.push();
    this.p.image(this.drawBuffer, 0, 0);
    this.drawScrubber();
    this.drawControls();
    this.p.pop();
  }
}