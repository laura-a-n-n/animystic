import p5 from "p5";

export function triangle(
    p: p5,
    centerX: number,
    centerY: number,
    color: p5.Color,
    size = 12
) {
    p.push();
    p.fill(color);
    p.stroke(0, 0, 0, 0);
    p.translate(centerX, centerY);
    p.triangle(
        -size / 2,
        (size / 4) * Math.sqrt(3),
        0,
        (-size / 4) * Math.sqrt(3),
        size / 2,
        (size / 4) * Math.sqrt(3)
    );
    p.pop();
}

export function safelyStopAudio(audio: p5.SoundFile) {
    try {
        audio.stop();
    } catch (error: DOMException | unknown) {
        // it's ok
    }
}

export function isInRectangle(p0: number, p1: number, x: number, y: number, w: number, h: number) {
    return isInBoundingBox(p0, p1, x, y, x + w, y + h);
}

export function isInBoundingBox(p0: number, p1: number, x0: number, y0: number, x1: number, y1: number) {
    [x0, x1] = (x0 <= x1) ? [x0, x1] : [x1, x0];
    [y0, y1] = (y0 <= y1) ? [y0, y1] : [y1, y0];
    
    return p0 >= x0 && p0 <= x1 && p1 >= y0 && p1 <= y1;
}