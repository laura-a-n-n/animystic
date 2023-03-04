import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { getIndexOrDefault } from "@/utilities/general";
import { P5Singleton } from "@/utilities/p5-singleton";
import { isInBoundingBox, isInRectangle } from "@/utilities/p5-utils";
import p5 from "p5";

export class SignalWidget {
    p: AnimationEditor;
    currentData!: number[];
    drawBuffer!: p5.Graphics;

    width!: number;
    height!: number;
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

    selectedVerticalKeyframe: number = -1;
    selectedHorizontalKeyframe: number = -1;
    verticalKeyframeToTheRightOfMouse: number = -1;
    userDraggingKeyframe: boolean = false;
    mouseEngaged: boolean = false;

    strokeColor: readonly [number, number, number];

    keyBindings: { [key: string]: () => any } = {
        a: this.insertVerticalKeyframe.bind(this),
        d: this.deleteVerticalKeyframe.bind(this),
    };

    constructor(
        angularRange: number,
        rangeInverted: boolean = false,
        strokeColor: readonly [
            number,
            number,
            number
        ] = appSettings.defaultSignalStrokeColor
    ) {
        this.p = P5Singleton.getInstance();
        this.angularRange = angularRange;
        this.rangeInverted = rangeInverted;
        [this.closedAngle, this.openAngle] = this.rangeInverted
            ? [this.angularRange, 0]
            : [0, this.angularRange];
        this.strokeColor = [...strokeColor];
    }

    buffer() {
        this.computeSize();
        this.createBuffer();
        this.drawSignal();
    }

    bindData(data: number[]) {
        this.currentData = data;
        this.buffer();
    }

    computeSize() {
        this.width = this.p.width;
        this.height = this.p.viewport.percentOfHeight(
            2 * appSettings.maxWaveHeightProportion
        );
        this.topOffset = (this.p.audioWidget?.height - this.height) / 2;

        this.signalHeight = appSettings.signalWaveHeightScale * this.height;
        this.signalVerticalMargin = (this.height - this.signalHeight) / 2;
        this.resolution = this.p.audioWidget.resolution / 1000.0;
        this.mouseTolerance = this.width * appSettings.mouseTolerance;
    }

    createBuffer() {
        this.drawBuffer = this.p.createGraphics(this.width, this.height);
        this.drawBuffer.fill(...this.strokeColor, 10);
        this.drawBuffer.stroke(...this.strokeColor);
        this.drawBuffer.strokeWeight(3);
    }

    drawSignal() {
        if (!this.userDraggingKeyframe) this.consolidateData(); // always avoid duplicates?

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
                    this.drawBuffer.line(
                        lastX,
                        currentHeight,
                        currentX,
                        currentHeight
                    );

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
                    currentHeight =
                        loweredHeight - percentOpen * this.signalHeight;

                    // draw vertical line
                    this.drawBuffer.line(
                        currentX,
                        lastHeight,
                        currentX,
                        currentHeight
                    );
                    if (currentX > 0)
                        this.verticalKeyframePositions.push(currentX);
                    this.angularArgumentDataIndices.push(i + 1);

                    break;
            }
        }

        // draw last line
        this.drawBuffer.line(currentX, currentHeight, currentX, loweredHeight);
        this.verticalKeyframePositions.push(currentX);
        console.log(this.currentData);
    }

    getSelectedKeyframe() {
        const [mouseX, mouseY] = [
            this.p.viewport.mouseX,
            this.p.viewport.mouseY,
        ];
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
                this.p.cursor("ns-resize");
                this.selectedHorizontalKeyframe = index;
                if (!this.userDraggingKeyframe)
                    this.selectedVerticalKeyframe = -1;
                this.p.mouseEngaged = mouseEngaged = true;
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
                this.p.cursor("ew-resize");
                this.selectedVerticalKeyframe = index;
                this.selectedHorizontalKeyframe = -1;
                this.p.mouseEngaged = mouseEngaged = true;
            }
        }

        this.mouseEngaged = mouseEngaged;
        this.verticalKeyframeToTheRightOfMouse =
            verticalKeyframeToTheRightOfMouse;
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
            this.p.lerp(0, distanceBetweenKeyframes, percentRight) /
            this.resolution
        );
    }

    handleMouse() {
        this.getSelectedKeyframe();

        if (
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
                console.log(
                    argumentIndices,
                    selectedIndex + 1,
                    nextArgumentIndex
                );
                if (nextArgumentIndex >= 1) {
                    const oldArgument = this.currentData[argumentIndex];
                    this.currentData[nextArgumentIndex] -=
                        newArgument - oldArgument;
                }
            } else {
                const mouseY = this.p.viewport.mouseY;
                const percentOpen = this.p.constrain(
                    (this.loweredHeight + this.mouseTolerance - mouseY) /
                        (this.signalHeight + this.mouseTolerance),
                    0,
                    1
                );
                newArgument = this.p.lerp(
                    this.closedAngle,
                    this.openAngle,
                    percentOpen
                );
            }

            this.currentData[argumentIndex] = newArgument;
        } else if (!this.p.mouseIsPressed) this.userDraggingKeyframe = false;
        this.drawSignal();
    }

    keyPressed() {
        this.keyBindings[this.p.key]?.();
    }

    insertVerticalKeyframe() {
        const mouseX = this.p.viewport.mouseX;
        const newTimeArgument = this.getMillisecondsFromX(
            mouseX,
            this.verticalKeyframeToTheRightOfMouse - 1,
            this.verticalKeyframeToTheRightOfMouse
        );
        const verticalKeyframeDataIndex =
            this.angularArgumentDataIndices[
                this.verticalKeyframeToTheRightOfMouse
            ];
        const associatedHorizontalKeyframeDataIndex =
            this.timeArgumentDataIndices[
                this.verticalKeyframeToTheRightOfMouse
            ];
        console.log(this.currentData);
        const oldTimeArgument =
            this.currentData[associatedHorizontalKeyframeDataIndex];
        this.currentData[associatedHorizontalKeyframeDataIndex] =
            newTimeArgument;
        this.currentData.splice(
            associatedHorizontalKeyframeDataIndex + 1,
            0,
            appSettings.commands.talk,
            this.angularRange / 2,
            appSettings.commands.delay,
            oldTimeArgument - newTimeArgument
        );
        console.log(
            this.currentData,
            mouseX,
            newTimeArgument,
            verticalKeyframeDataIndex,
            associatedHorizontalKeyframeDataIndex
        );
        this.drawSignal();
    }

    deleteVerticalKeyframe() {
        if (
            this.selectedVerticalKeyframe >= 0 &&
            this.verticalKeyframePositions.length >= 3
        ) {
            const argumentIndex =
                this.angularArgumentDataIndices[this.selectedVerticalKeyframe];
            const commandIndex = argumentIndex - 1;
            this.currentData.splice(commandIndex, 2);
            this.drawSignal();
        }
    }

    /**
     * consolidateData
     *
     * This function merges all consecutive time commands in currentData.
     * ~~Also, if there are repeated talk commands separated by a single delay, we merge.~~ [currently off]
     */
    consolidateData() {
        for (let i = 0; i < this.currentData.length - 2; i += 2) {
            // consecutiveness condition
            if (
                this.currentData[i] == appSettings.commands.delay &&
                this.currentData[i + 2] == appSettings.commands.delay
            ) {
                this.currentData[i + 1] += this.currentData[i + 3]; // merge into one
                this.currentData.splice(i + 2, 2); // delete the latter 2 items
            } else if (
                i < this.currentData.length - 4 &&
                this.currentData[i] == appSettings.commands.talk &&
                this.currentData[i + 2] == appSettings.commands.delay &&
                this.currentData[i + 4] == appSettings.commands.talk &&
                this.currentData[i + 1] == this.currentData[i + 5]
            ) {
                let deleteCount = 2;

                if (
                    i < this.currentData.length - 6 &&
                    this.currentData[i + 6] == appSettings.commands.delay
                ) {
                    this.currentData[i + 3] += this.currentData[i + 7];
                    deleteCount = 4;
                }
                this.currentData.splice(i + 4, deleteCount); // delete the extraneous items
            }
        }
    }

    draw() {
        this.p.viewport.translate(0, this.topOffset);
        this.handleMouse();
        this.p.image(this.drawBuffer, 0, 0);
        this.p.viewport.reset();
    }
}