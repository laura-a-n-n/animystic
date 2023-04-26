import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { arraysAreEqual, getIndexOrDefault } from "@/utilities/general";
import { P5Singleton } from "@/utilities/p5-singleton";
import { Widget } from "@/objects/widget/widget";
import { isInBoundingBox, isInRectangle, triangle } from "@/utilities/p5-utils";
import p5 from "p5";
import { WidgetCollector } from "./widget-collector";

export class SignalWidget extends Widget {
  name: string;
  drawBuffer!: p5.Graphics;
  currentData!: number[];
  checkpointData!: number[];
  private _clipboardSize: number = appSettings.clipboardHistoryLength;
  private _data: number[][] = [];
  private _clipboardIndex: number = 0;

  topOffset!: number;

  angularRange: number;
  rangeInverted: boolean;
  closedAngle: number;
  openAngle: number;

  signalHeight!: number;
  signalVerticalMargin!: number;
  resolution!: number;
  verticalKeyframePositions: number[] = [];
  horizontalKeyframePositions: number[] = [];
  angularArgumentDataIndices: number[] = [];
  timeArgumentDataIndices: number[] = [];
  raisedHeight!: number;
  loweredHeight!: number;
  mouseTolerance!: number;
  indicatorHeight!: number;
  createVerticalKeyframeThisFrame: boolean = false;

  selectedVerticalKeyframe: number = -1;
  selectedHorizontalKeyframe: number = -1;
  verticalKeyframeToTheRightOfMouse: number = -1;
  userDraggingKeyframe: boolean = false;
  mouseEngaged: boolean = false;

  strokeColor: readonly [number, number, number];

  keyBindings: { [key: string]: () => any } = {
    a: this.insertVerticalKeyframe.bind(this),
    d: this.deleteVerticalKeyframe.bind(this),

    "ctrl+c": this.copyCommand.bind(this),
    "ctrl+v": this.pasteCommand.bind(this),

    "ctrl+s": this.saveCommand.bind(this),
    "ctrl+u": this.uploadCommand.bind(this),

    "ctrl+y": this.redoCommand.bind(this),
    "ctrl+shift+z": this.redoCommand.bind(this),
    "ctrl+z": this.undoCommand.bind(this),

    "ctrl+r": this.resetCommand.bind(this),
  };

  constructor(
    name: string,
    angularRange: number,
    rangeInverted: boolean = false,
    strokeColor: readonly [
      number,
      number,
      number
    ] = appSettings.defaultSignalStrokeColor
  ) {
    super(name);
    this.angularRange = angularRange;
    this.rangeInverted = rangeInverted;
    [this.closedAngle, this.openAngle] = this.rangeInverted
      ? [this.angularRange, 0]
      : [0, this.angularRange];
    this.strokeColor = [...strokeColor];
    this.name = name;

    // draw list
    this.drawName();
  }

  newData(data: number[]) {
    this.bindFilename();
    this.checkpointData = data.slice();
    this.bindData(data);
    this.resetClipboard();
  }

  bindFilename() {
    const name = this.p.select("#list-filename");
    name?.html(this.p.menu.lastSelectedFile);
  }

  checkRootNode(data: number[]) {
    if (data[0] != appSettings.commands.talk) {
      console.log(
        "An attempt was made to bind to data without a root node. Restoring a default root node."
      );
      data.splice(0, 0, appSettings.commands.talk, this.closedAngle);
    }
  }

  resetCommand() {
    if (typeof this.closedAngle !== "number") return;
    const duration = 1000 * this.p.audioWidget.currentSound.duration();
    const sleep = Math.round(duration / 2);
    this.bindData([
      appSettings.commands.talk,
      this.closedAngle,
      appSettings.commands.delay,
      sleep,
      appSettings.commands.talk,
      this.openAngle,
      appSettings.commands.delay,
      sleep,
    ]);
  }

  bindData(data: number[]) {
    this.checkRootNode(data);
    this.currentData = data;
    this.p.data[this.name][this.p.menu.lastSelectedFile] = data;
    this.buffer();
  }

  resetClipboard() {
    this._clipboardIndex = 0;
    this._data = [];
    this._data.push(this.checkpointData);
  }

  clipboardAction() {
    if (
      arraysAreEqual(
        this.currentData,
        this._clipboardIndex < this._data.length
          ? this._data[this._clipboardIndex]
          : []
      )
    )
      return;

    // Update clipboard index to point to the latest data
    if (this._clipboardIndex !== this._data.length - 1)
      this._data.splice(this._clipboardIndex + 1); // Remove all entries after clipboardIndex
    this._data.push([...this.currentData]); // Push new data as the last element
    this._clipboardIndex = this._data.length - 1; // Update clipboard index to latest data index

    // Keep _data length within the clipboard size limit
    if (this._data.length > this._clipboardSize) {
      this._data.shift(); // Remove oldest entry from the clipboard
      this._clipboardIndex--;
    }
  }

  undoCommand() {
    if (this._clipboardIndex > 0 && this._clipboardIndex < this._data.length) {
      // If there is data in the clipboard
      this._clipboardIndex--; // Decrement clipboard index
      this.currentData = [...this._data[this._clipboardIndex]]; // Restore data from clipboard
      this.buffer(); // Update the buffer
    }
  }

  redoCommand() {
    if (this._clipboardIndex < this._data.length - 1 && this._data.length > 0) {
      // If there is data after the current clipboard index
      this._clipboardIndex++; // Increment clipboard index
      this.currentData = [...this._data[this._clipboardIndex]]; // Restore data from clipboard
      this.buffer(); // Update the buffer
    }
  }

  uploadCommand() {
    this.p.uploadBox.toggle();
  }

  copyCommand() {
    this.p.saveBox.text("<p>Data copied to clipboard!</p>");
    navigator.clipboard.writeText(this.currentData.toString());
  }

  async pasteCommand() {
    this.p.saveBox.text(
      "<p>Data pasted from clipboard. Be sure to save if you want to keep these changes, otherwise they will be discarded.</p>"
    );
    const clipboard = await navigator.clipboard.readText();
    const data = clipboard.split(",").map((string) => Number(string));
    this.bindData(data);
  }

  saveCommand() {
    console.log(this.currentData);
    this.initiateSave();
  }

  initiateSave() {
    this.p.saveBox.text();
    this.saveToFile();
  }

  saveToFile() {
    // Convert the currentData array to JSON format
    const jsonData = JSON.stringify({
      name: this.name,
      filename: this.p.menu.lastSelectedFile,
      data: this.currentData,
    });

    // Send a POST request to the server with the array data in the request body
    fetch("/data", {
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
      })
      .catch((error) => {
        console.error("There was a problem saving the data:", error);
      });
  }

  computeSize() {
    this.width = this.p.width;
    this.height = this.p.viewport.scaleToHeight(
      2 * appSettings.maxWaveHeightProportion
    );
    this.topOffset = (this.p.audioWidget?.height - this.height) / 2;

    this.signalHeight = appSettings.signalWaveHeightScale * this.height;
    this.signalVerticalMargin = (this.height - this.signalHeight) / 2;
    this.resolution = this.p.audioWidget.resolution / 1000.0;
    this.mouseTolerance = this.width * appSettings.mouseTolerance;
    this.indicatorHeight =
      this.height - appSettings.indicatorMargin * this.signalVerticalMargin;
  }

  createBuffer() {
    super.createBuffer();
    this.drawBuffer.fill(...this.strokeColor, 10);
    this.drawBuffer.stroke(...this.strokeColor);
    this.drawBuffer.strokeWeight(appSettings.strokeWeight);
  }

  roundData() {
    for (const [index, datum] of this.currentData.entries()) {
      if (index % 2 == 0) continue;
      this.currentData[index] = Math.max(
        Math.round(datum),
        appSettings.minimumKeyframeLength
      );
    }
    this.checkRootNode(this.currentData);
  }

  drawToBuffer(consolidate: boolean = true) {
    this.roundData(); // ensure data is integer
    if (!this.userDraggingKeyframe) this.clipboardAction(); // handle clipboard

    let badKeyframes = this.consolidateData(
      this.userDraggingKeyframe || !consolidate
    ); // always avoid duplicates?
    let badKeyframeIndicatorCoordinates: [number, number, number][] = [];

    this.drawBuffer.clear(0, 0, 0, 0);
    this.drawBuffer.rect(0, 0, this.width, this.height);

    const raisedHeight = this.signalVerticalMargin;
    const loweredHeight = raisedHeight + this.signalHeight;
    this.raisedHeight = raisedHeight;
    this.loweredHeight = loweredHeight;

    this.verticalKeyframePositions = [];
    this.horizontalKeyframePositions = [];
    this.timeArgumentDataIndices = [];
    this.angularArgumentDataIndices = [];

    let [lastX, currentX, lastHeight, currentHeight] = [
      0,
      0,
      loweredHeight,
      loweredHeight,
    ];

    for (let i = 0; i < this.currentData.length; i += 2) {
      const [command, argument] = [
        this.currentData[i],
        this.currentData[i + 1],
      ];
      switch (command) {
        case appSettings.commands.delay:
          currentX = lastX + this.resolution * argument; // move in time

          // draw horizontal line
          this.drawBuffer.line(lastX, currentHeight, currentX, currentHeight);

          lastX = currentX; // keep track of how far along we are
          this.horizontalKeyframePositions.push(currentHeight);
          this.timeArgumentDataIndices.push(i + 1);

          break;
        case appSettings.commands.talk:
          // compute how "open" the servo is
          let percentOpen = argument / this.angularRange;
          if (this.rangeInverted) percentOpen = 1 - percentOpen;

          // calculate wave height
          lastHeight = currentHeight;
          currentHeight = loweredHeight - percentOpen * this.signalHeight;

          // calculate slope and horizontal leg length
          let slope = appSettings.characters[this.name as keyof typeof appSettings.characters].angularSpeed * Math.sign(currentHeight - lastHeight) * -1; // -1 because y is down
          let horizontalLength = Math.abs(slope) * this.p.audioWidget.resolution;

          // draw triangle
          let trianglePoints = [];
          if (slope > 0) {
            trianglePoints = [
              currentX, lastHeight,
              currentX + horizontalLength, currentHeight,
              currentX + horizontalLength, lastHeight
            ];
          } else {
            trianglePoints = [
              currentX, currentHeight,
              currentX + horizontalLength, currentHeight,
              currentX, lastHeight
            ];
          }
          // this.drawBuffer.push();
          // this.drawBuffer.fill([...this.strokeColor, 50]);
          // this.drawBuffer.stroke([...this.strokeColor, 50]);
          // this.drawBuffer.triangle(...trianglePoints as [number, number, number, number, number, number]);
          // this.drawBuffer.pop();
          this.drawBuffer.line(currentX, currentHeight, currentX, lastHeight);
          
          // draw bulb to show existence of keyframe
          if (this.userDraggingKeyframe && i in badKeyframes) {
            badKeyframeIndicatorCoordinates.push([
              currentX,
              currentHeight,
              appSettings.strokeWeight,
            ]);
          } else {
            this.drawBuffer.push();
            this.drawBuffer.rectMode(this.p.CENTER);
            this.drawBuffer.square(
              currentX,
              currentHeight,
              appSettings.strokeWeight
            );
            this.drawBuffer.pop();
          }

          if (currentX > 0) this.verticalKeyframePositions.push(currentX);
          this.angularArgumentDataIndices.push(i + 1);

          break;
      }
    }

    // draw last line
    this.drawBuffer.line(currentX, currentHeight, currentX, loweredHeight);
    this.verticalKeyframePositions.push(currentX);

    // draw bad keyframe indicators
    if (!this.userDraggingKeyframe) return;
    this.drawBuffer.push();
    this.drawBuffer.rectMode(this.p.CENTER);
    this.drawBuffer.fill(...appSettings.badKeyframeColor);
    this.drawBuffer.stroke(...appSettings.badKeyframeColor);
    for (const coords of badKeyframeIndicatorCoordinates) {
      this.drawBuffer.square(...coords);
    }
    this.drawBuffer.pop();
  }

  drawName() {
    let checkbox = this.p.createElement("input");
    checkbox.attribute("type", "checkbox");
    checkbox.id(this.name);
    checkbox.attribute("checked", "true");
    checkbox.mouseClicked(() => {
      this.active = !this.active;
      console.log(this.active);
    });

    let label = this.p.createElement("label");
    label.attribute("for", this.name);
    label.html(this.name);
    label.style("color", this.p.color(...this.strokeColor));
    this.p.listBox.div.child(checkbox);
    this.p.listBox.div.child(label);
    this.p.listBox.div.child(this.p.createElement("br"));
  }

  getSelectedKeyframe() {
    const [mouseX, mouseY] = [this.p.viewport.mouseX, this.p.viewport.mouseY];
    const toleranceRadius = this.mouseTolerance / 2;
    let mouseEngaged = false;
    let verticalKeyframeToTheRightOfMouse = 0;

    for (const [
      index,
      horizontalKeyframe,
    ] of this.horizontalKeyframePositions.entries()) {
      const lastX = getIndexOrDefault(
        this.verticalKeyframePositions,
        index - 1,
        0
      );
      const currentX = this.verticalKeyframePositions[index];
      const nextHeight = getIndexOrDefault(
        this.horizontalKeyframePositions,
        index + 1,
        this.loweredHeight
      );
      const currentHeight = horizontalKeyframe;

      if (currentX <= mouseX) verticalKeyframeToTheRightOfMouse += 1;
      if (this.userDraggingKeyframe) return;

      // is user selecting a horizontal keyframe?
      if (
        isInBoundingBox(
          mouseX,
          mouseY,
          lastX + toleranceRadius,
          currentHeight - toleranceRadius,
          currentX - toleranceRadius,
          currentHeight + toleranceRadius
        )
      ) {
        this.p.mouse.cursor("ns-resize");
        this.selectedHorizontalKeyframe = index;
        if (!this.userDraggingKeyframe) this.selectedVerticalKeyframe = -1;
        mouseEngaged = true;
      }

      // is user selecting a vertical keyframe?
      else if (
        isInBoundingBox(
          mouseX,
          mouseY,
          currentX - toleranceRadius,
          nextHeight,
          currentX + toleranceRadius,
          currentHeight
        )
      ) {
        this.p.mouse.cursor("ew-resize");
        this.selectedVerticalKeyframe = index;
        this.selectedHorizontalKeyframe = -1;
        mouseEngaged = true;
      }
    }

    this.mouseEngaged = mouseEngaged;
    this.verticalKeyframeToTheRightOfMouse = verticalKeyframeToTheRightOfMouse;
  }

  getMillisecondsFromX(x: number, leftIndex: number, rightIndex: number) {
    const previousVerticalKeyframe = getIndexOrDefault(
      this.verticalKeyframePositions,
      leftIndex,
      0
    );
    const nextVerticalKeyframe = getIndexOrDefault(
      this.verticalKeyframePositions,
      rightIndex,
      this.p.audioWidget.width
    );
    const distanceBetweenKeyframes =
      nextVerticalKeyframe - previousVerticalKeyframe;
    const percentRight = this.p.constrain(
      (x - previousVerticalKeyframe) / distanceBetweenKeyframes,
      0,
      1
    );
    return (
      this.p.lerp(0, distanceBetweenKeyframes, percentRight) / this.resolution
    );
  }

  getAngleFromY() {
    const mouseY = this.p.viewport.mouseY;
    const percentOpen = this.p.constrain(
      (this.loweredHeight + this.mouseTolerance - mouseY) /
        (this.signalHeight + this.mouseTolerance),
      0,
      1
    );
    const angle = this.p.lerp(this.closedAngle, this.openAngle, percentOpen);
    return angle;
  }

  handleMouse() {
    if (this.createVerticalKeyframeThisFrame) {
      this.createVerticalKeyframeThisFrame = false;
      this.createVerticalKeyframe();
    }
    if (WidgetCollector.isWidgetFocused()) return;
    this.getSelectedKeyframe();

    if (
      !this.p.uiProcessed &&
      this.p.mouseIsPressed &&
      this.p.mouseButton == this.p.LEFT &&
      this.mouseEngaged
    ) {
      this.userDraggingKeyframe = true;
      const isVerticalKeyframe = this.selectedVerticalKeyframe >= 0;
      const argumentIndices = isVerticalKeyframe
        ? this.timeArgumentDataIndices
        : this.angularArgumentDataIndices;
      const selectedIndex = isVerticalKeyframe
        ? this.selectedVerticalKeyframe
        : this.selectedHorizontalKeyframe;
      const argumentIndex = argumentIndices[selectedIndex];

      let newArgument;

      if (isVerticalKeyframe) {
        const mouseX = this.p.viewport.mouseX;
        newArgument = this.getMillisecondsFromX(
          mouseX,
          selectedIndex - 1,
          selectedIndex + 1
        );

        const nextArgumentIndex = getIndexOrDefault(
          argumentIndices,
          selectedIndex + 1,
          -1
        );
        if (nextArgumentIndex >= 1) {
          const oldArgument = this.currentData[argumentIndex];
          this.currentData[nextArgumentIndex] -= newArgument - oldArgument;
        }
      } else newArgument = this.getAngleFromY();

      this.currentData[argumentIndex] = newArgument;
      this.drawToBuffer();
    } else if (!this.p.mouseIsPressed && this.userDraggingKeyframe) {
      this.userDraggingKeyframe = false;
      this.drawToBuffer();
    }

    this.drawIndicators();
  }

  handleRenderPriority() {
    if (this.mouseEngaged && !WidgetCollector.isWidgetFocused()) {
      this.renderPriority = 2;
      WidgetCollector.focusWidget(this);
    } else this.renderPriority = 1;
    WidgetCollector.updateRenderPriority();
  }

  insertVerticalKeyframe() {
    this.createVerticalKeyframeThisFrame = true;
  }

  createVerticalKeyframe() {
    const mouseX = this.p.viewport.mouseX;
    const newTimeArgument = this.getMillisecondsFromX(
      mouseX,
      this.verticalKeyframeToTheRightOfMouse - 1,
      this.verticalKeyframeToTheRightOfMouse
    );

    if (
      // this.verticalKeyframeToTheRightOfMouse >
      // this.angularArgumentDataIndices.length - 1 ||
      this.verticalKeyframeToTheRightOfMouse === undefined
    )
      return;

    const verticalKeyframeDataIndex =
      this.angularArgumentDataIndices[this.verticalKeyframeToTheRightOfMouse];
    const associatedHorizontalKeyframeDataIndex =
      this.timeArgumentDataIndices[this.verticalKeyframeToTheRightOfMouse];
    const oldTimeArgument =
      this.currentData[associatedHorizontalKeyframeDataIndex];
    this.currentData[associatedHorizontalKeyframeDataIndex] = newTimeArgument;
    this.currentData.splice(
      associatedHorizontalKeyframeDataIndex + 1,
      0,
      appSettings.commands.talk,
      this.getAngleFromY(),
      appSettings.commands.delay,
      oldTimeArgument - newTimeArgument
    );

    this.drawToBuffer(false);
  }

  deleteVerticalKeyframe() {
    if (
      this.selectedVerticalKeyframe >= 0 &&
      this.verticalKeyframePositions.length >= 3 &&
      this.selectedVerticalKeyframe < this.angularArgumentDataIndices.length
    ) {
      const argumentIndex =
        this.angularArgumentDataIndices[this.selectedVerticalKeyframe];
      const commandIndex = argumentIndex - 1;
      this.currentData.splice(commandIndex, 2);
      this.drawToBuffer();
    }
  }

  /**
   * consolidateData
   *
   * This function merges all consecutive time commands in currentData.
   * Also, if there are repeated talk commands separated by a single delay, we merge.
   *
   * Arguments:
   *  test: boolean -- if true, then does not actually consolidate; just returns a map with potential deletes.
   */
  consolidateData(test: boolean = false) {
    let badKeyframes: { [keyframeId: number]: boolean } = {};

    for (let i = 0; i < this.currentData.length - 2; i += 2) {
      // consecutiveness condition
      if (
        this.currentData[i] == appSettings.commands.delay &&
        this.currentData[i + 2] == appSettings.commands.delay
      ) {
        badKeyframes[i + 3] = true;
        if (test) continue;

        this.currentData[i + 1] += this.currentData[i + 3]; // merge into one
        this.currentData.splice(i + 2, 2); // delete the latter 2 items
      } else if (
        i < this.currentData.length - 5 &&
        this.currentData[i] == appSettings.commands.talk &&
        this.currentData[i + 2] == appSettings.commands.delay &&
        this.currentData[i + 4] == appSettings.commands.talk &&
        this.currentData[i + 1] == this.currentData[i + 5]
      ) {
        badKeyframes[i + 4] = true;
        if (test) continue;

        let deleteCount = 2;

        if (
          i < this.currentData.length - 7 &&
          this.currentData[i + 6] == appSettings.commands.delay
        ) {
          this.currentData[i + 3] += this.currentData[i + 7];
          deleteCount = 4;
        }
        this.currentData.splice(i + 4, deleteCount); // delete the extraneous items
      }
    }

    return badKeyframes;
  }

  drawIndicators() {
    // "free" indicator
    triangle(
      this.p,
      this.p.mouseX,
      this.indicatorHeight,
      this.p.color(...appSettings.freeIndicatorColor)
    );
    // selection indicator
    if (
      this.selectedVerticalKeyframe >= 0 &&
      this.selectedVerticalKeyframe < this.verticalKeyframePositions.length
    ) {
      triangle(
        this.p,
        this.verticalKeyframePositions[this.selectedVerticalKeyframe],
        this.indicatorHeight,
        this.p.color(...appSettings.selectionIndicatorColor)
      );
    }
  }

  keyPressed() {
    if (!this.active) return;
    if (WidgetCollector.getLastFocusedWidget() !== this) return;
    super.keyPressed();
  }

  update() {
    if (!this.active) return;
    super.update();
    this.p.viewport.translate(0, this.topOffset);
    this.handleMouse();
    this.handleRenderPriority();
    this.p.viewport.reset();
  }

  draw() {
    if (!this.active) return;
    super.draw();
    this.p.viewport.translate(0, this.topOffset);
    this.p.image(this.drawBuffer, 0, 0);
    this.p.viewport.reset();
  }
}
