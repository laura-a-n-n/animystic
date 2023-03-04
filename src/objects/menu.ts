import { appSettings } from "@/constants";
import { AnimationEditor } from "@/types/animation-editor";
import { lookupFiletype } from "@/utilities/file-helpers";
import { P5Singleton } from "@/utilities/p5-singleton";
import { isInRectangle } from "@/utilities/p5-utils";

export class Menu {
    p: AnimationEditor;
    enabled: boolean = true;
    lastSelectedFile: string = "";

    rows: number = 0;
    cols: number = 0;
    scrollOffset: number = 0;
    trueTopOffset: number = 0;
    trueLeftOffset!: number;

    width!: number;
    height!: number;
    horizontalMargin!: number;
    padding!: number;
    cellSize!: number;
    cellPadding!: number;
    textSize!: number;
    trueCellSize!: number;

    constructor() {
        this.p = P5Singleton.getInstance();
        this.computeSize();
    }

    computeSize() {
        this.width = this.p.viewport.percentOfWidth(
            1 - 2 * appSettings.horizontalMargin
        );
        this.height = this.p.viewport.height;
        this.cellSize = this.p.viewport.percentOfWidth(appSettings.cellSize);
        this.cellPadding = this.p.viewport.percentOfWidth(
            appSettings.cellPadding
        );
        this.trueCellSize = this.cellSize + this.cellPadding;
        this.textSize = appSettings.menuTextSizeRatio * this.cellSize;
        this.horizontalMargin = this.p.viewport.percentOfWidth(
            appSettings.horizontalMargin
        );
        this.rows = this.p.ceil(this.height / this.trueCellSize);
        this.cols = this.p.floor(this.width / this.trueCellSize);
        this.padding = (this.width - this.cols * this.trueCellSize) / 2;
        this.trueLeftOffset = this.padding + this.horizontalMargin;
    }

    scroll(value: number) {
        this.scrollOffset += value;
        this.scrollOffset = this.p.constrain(
            this.scrollOffset,
            0,
            (this.p.floor(this.p.maxSounds / this.cols) - 1) * this.trueCellSize
        );
    }

    text(imageName: string, x: number, y: number) {
        this.p.push();
        this.p.fill(255);
        this.p.noStroke();
        this.p.textAlign(this.p.CENTER);
        this.p.translate(
            x + this.trueCellSize / 2,
            y + this.trueCellSize - this.p.textAscent()
        );
        this.p.textSize(this.textSize);
        this.p.text(imageName, 0, 0);
        this.p.textSize(this.textSize / 2);
        this.p.text(
            lookupFiletype(Number(imageName.substring(0, imageName.indexOf(".")))),
            0,
            appSettings.filenameTextScale * this.p.textAscent()
        );
        this.p.pop();
    }

    getGridIndex(i: number, j: number) {
        return (
            (i + this.p.floor(this.scrollOffset / this.trueCellSize)) *
                this.cols +
            j
        );
    }

    image(index: number, i: number, j: number): [string, string, number, number] {
        // calculate the x position of the item
        const x = this.trueLeftOffset + j * this.trueCellSize;
        const y = -this.trueTopOffset + i * this.trueCellSize; // calculate the y position of the item

        // every sound is linked to the images via filename
        const soundName = this.p.files.sound[index];
        const associatedImageName = soundName.replace(
            ".wav",
            ".png"
        );

        this.p.push();
        // try to get image and display if existing, otherwise display "missing" image
        let image =
            this.p.images[associatedImageName] || this.p.images.missingImage;
        this.p.image(
            image,
            x + this.cellPadding / 2,
            y + this.cellPadding / 4,
            this.cellSize,
            this.cellSize
        );
        this.p.pop();

        return [soundName, associatedImageName, x, y];
    }

    drawItems() {
        this.trueTopOffset = this.scrollOffset % this.trueCellSize; // this accounts for the scroll

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                // calculate index of current item
                const index = this.getGridIndex(i, j);
                if (index >= this.p.maxSounds) return;

                const [soundName, associatedImageName, x, y] = this.image(index, i, j);

                // background
                this.p.push();
                // is the current tile highlighted by the user? draw ui feedback
                if (
                    isInRectangle(
                        this.p.viewport.mouseX,
                        this.p.viewport.mouseY,
                        x,
                        y,
                        this.trueCellSize,
                        this.trueCellSize
                    )
                ) {
                    this.p.fill(...appSettings.menuHoverColor);

                    // expose the last hovered filename
                    this.lastSelectedFile = soundName;
                } else this.p.fill(...appSettings.menuTileColor);

                // draw background
                this.p.stroke(0, 0);
                this.p.rect(
                    x,
                    y,
                    this.trueCellSize,
                    this.trueCellSize,
                    appSettings.menuBorderRadius
                );
                this.p.pop();

                this.text(associatedImageName, x, y);
            }
        }
    }

    draw() {
        this.p.push();
        this.p.textSize(this.textSize);

        this.p.push();
        this.p.stroke(...appSettings.contentColor);
        this.p.fill(...appSettings.contentColor);
        this.p.rect(this.horizontalMargin, 0, this.width, this.height);
        this.p.pop();

        this.drawItems();

        this.p.pop();
    }
}
