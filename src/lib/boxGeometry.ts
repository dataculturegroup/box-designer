export interface BoxParams {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  cutWidth: number;
  notchLength: number;
  boundingBox: boolean;
  tray: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  from: Point;
  to: Point;
}

export interface BoxResult {
  segments: Segment[];
  paths: Point[][];
  docSize: { w: number; h: number };
  boundingBoxSize: { w: number; h: number };
  size: { w: number; h: number; d: number };
  metadata: {
    cutWidth: number;
    thickness: number;
  };
}

function closestOdd(num: number): number {
  const rounded = Math.round(num);
  return rounded % 2 === 0 ? rounded - 1 : rounded;
}

function pointKey(x: number, y: number): string {
  return `${x.toFixed(2)},${y.toFixed(2)}`;
}

function pointsEqual(p1: Point, p2: Point): boolean {
  return pointKey(p1.x, p1.y) === pointKey(p2.x, p2.y);
}

export class BoxGenerator {
  private params: BoxParams;
  private size: { w: number; h: number; d: number } = { w: 0, h: 0, d: 0 };
  private numNotches: { w: number; h: number; d: number } = { w: 0, h: 0, d: 0 };
  private notchLength: { w: number; h: number; d: number } = { w: 0, h: 0, d: 0 };
  private margin: number = 0;
  private docSize: { w: number; h: number } = { w: 0, h: 0 };
  private boundingBoxSize: { w: number; h: number } = { w: 0, h: 0 };
  private segments: Segment[] = [];

  constructor(params: BoxParams) {
    this.params = params;
  }

  generate(): BoxResult {
    this.computeDimensions();
    
    if (this.params.boundingBox) {
      this.drawBoundingBox();
    }
    
    this.drawBack();
    this.drawLeft();
    this.drawBottom();
    this.drawRight();
    this.drawFront();
    
    if (!this.params.tray) {
      this.drawTop();
    }
    
    const paths = this.joinPaths();
    
    return {
      segments: this.segments,
      paths,
      docSize: this.docSize,
      boundingBoxSize: this.boundingBoxSize,
      size: this.size,
      metadata: {
        cutWidth: this.params.cutWidth,
        thickness: this.params.thickness
      },
    };
  }

  private computeDimensions(): void {
    const { width, height, depth, thickness, cutWidth, notchLength } = this.params;
    
    this.size = {
      w: width + cutWidth,
      h: height + cutWidth,
      d: depth + cutWidth,
    };
    
    this.numNotches = {
      w: Math.max(1, closestOdd(width / notchLength)),
      h: Math.max(1, closestOdd(height / notchLength)),
      d: Math.max(1, closestOdd(depth / notchLength)),
    };
    
    this.notchLength = {
      w: this.size.w / this.numNotches.w,
      h: this.size.h / this.numNotches.h,
      d: this.size.d / this.numNotches.d,
    };
    
    this.margin = 10.0 + cutWidth;
    
    this.size = {
      w: this.numNotches.w * this.notchLength.w,
      h: this.numNotches.h * this.notchLength.h,
      d: this.numNotches.d * this.notchLength.d,
    };
    
    const boxPiecesSize = {
      w: this.size.d * 2.0 + this.size.w,
      h: this.size.h * 2.0 + this.size.d * 2.0,
    };
    
    this.docSize = {
      w: boxPiecesSize.w + this.margin * 4,
      h: boxPiecesSize.h + this.margin * 5,
    };
    
    this.boundingBoxSize = {
      w: boxPiecesSize.w + this.margin * 2,
      h: boxPiecesSize.h + this.margin * 3,
    };
  }

  private drawBoundingBox(): void {
    const x = this.margin;
    const y = this.margin;
    const w = this.boundingBoxSize.w;
    const h = this.boundingBoxSize.h;
    
    this.addSegment(x, y, x + w, y);
    this.addSegment(x + w, y, x + w, y + h);
    this.addSegment(x + w, y + h, x, y + h);
    this.addSegment(x, y + h, x, y);
  }

  private drawTop(): void {
    const x0 = this.size.d + this.margin * 2.0;
    const y0 = this.size.h * 2.0 + this.size.d + this.margin * 4.0;
    const thickness = this.params.thickness;
    const cutWidth = this.params.cutWidth;
    
    this.drawHorizontalLine(x0, y0, this.notchLength.w, this.numNotches.w, thickness, -cutWidth / 2.0, true, true);
    this.drawHorizontalLine(x0, y0 + this.size.d - thickness, this.notchLength.w, this.numNotches.w, thickness, -cutWidth / 2.0, false, true);
    this.drawVerticalLine(x0, y0, this.notchLength.d, this.numNotches.d, thickness, -cutWidth / 2.0, true, true);
    this.drawVerticalLine(x0 + this.size.w - thickness, y0, this.notchLength.d, this.numNotches.d, thickness, -cutWidth / 2.0, false, true);
  }

  private drawBack(): void {
    const x0 = this.size.d + this.margin * 2.0;
    const y0 = this.margin;
    const thickness = this.params.thickness;
    const cutWidth = this.params.cutWidth;
    
    if (this.params.tray) {
      this.addSegment(x0, y0, x0 + this.size.w - thickness, y0);
    } else {
      this.drawHorizontalLine(x0, y0, this.notchLength.w, this.numNotches.w, thickness, cutWidth / 2.0, false, false);
    }
    
    this.drawHorizontalLine(x0, y0 + this.size.h - thickness, this.notchLength.w, this.numNotches.w, thickness, cutWidth / 2.0, true, false);
    this.drawVerticalLine(x0, y0, this.notchLength.h, this.numNotches.h, thickness, -cutWidth / 2.0, false, false);
    this.drawVerticalLine(x0 + this.size.w - thickness, y0, this.notchLength.h, this.numNotches.h, thickness, -cutWidth / 2.0, false, false);
  }

  private drawLeft(): void {
    const x0 = this.margin;
    const y0 = this.size.h + this.margin * 2.0;
    const thickness = this.params.thickness;
    const cutWidth = this.params.cutWidth;
    
    if (this.params.tray) {
      this.addSegment(x0, y0, x0 + this.size.d - thickness, y0);
    } else {
      this.drawHorizontalLine(x0, y0, this.notchLength.d, this.numNotches.d, thickness, cutWidth / 2.0, false, false);
    }
    
    this.drawHorizontalLine(x0, y0 + this.size.h - thickness, this.notchLength.d, this.numNotches.d, thickness, cutWidth / 2.0, true, false);
    this.drawVerticalLine(x0, y0, this.notchLength.h, this.numNotches.h, thickness, cutWidth / 2.0, false, false);
    this.drawVerticalLine(x0 + this.size.d - thickness, y0, this.notchLength.h, this.numNotches.h, thickness, -cutWidth / 2.0, false, false);
  }

  private drawBottom(): void {
    const x0 = this.size.d + this.margin * 2.0;
    const y0 = this.size.h + this.margin * 2.0;
    const thickness = this.params.thickness;
    const cutWidth = this.params.cutWidth;
    
    this.drawHorizontalLine(x0, y0, this.notchLength.w, this.numNotches.w, thickness, -cutWidth / 2.0, true, true);
    this.drawHorizontalLine(x0, y0 + this.size.d - thickness, this.notchLength.w, this.numNotches.w, thickness, -cutWidth / 2.0, false, true);
    this.drawVerticalLine(x0, y0, this.notchLength.d, this.numNotches.d, thickness, -cutWidth / 2.0, true, true);
    this.drawVerticalLine(x0 + this.size.w - thickness, y0, this.notchLength.d, this.numNotches.d, thickness, -cutWidth / 2.0, false, true);
  }

  private drawRight(): void {
    const x0 = this.size.d + this.size.w + this.margin * 3.0;
    const y0 = this.size.h + this.margin * 2.0;
    const thickness = this.params.thickness;
    const cutWidth = this.params.cutWidth;
    
    if (this.params.tray) {
      this.addSegment(x0, y0, x0 + this.size.d - thickness, y0);
    } else {
      this.drawHorizontalLine(x0, y0, this.notchLength.d, this.numNotches.d, thickness, cutWidth / 2.0, false, false);
    }
    
    this.drawHorizontalLine(x0, y0 + this.size.h - thickness, this.notchLength.d, this.numNotches.d, thickness, cutWidth / 2.0, true, false);
    this.drawVerticalLine(x0, y0, this.notchLength.h, this.numNotches.h, thickness, cutWidth / 2.0, false, false);
    this.drawVerticalLine(x0 + this.size.d - thickness, y0, this.notchLength.h, this.numNotches.h, thickness, -cutWidth / 2.0, false, false);
  }

  private drawFront(): void {
    const x0 = this.size.d + this.margin * 2.0;
    const y0 = this.size.h + this.size.d + this.margin * 3.0;
    const thickness = this.params.thickness;
    const cutWidth = this.params.cutWidth;
    
    this.drawHorizontalLine(x0, y0, this.notchLength.w, this.numNotches.w, thickness, cutWidth / 2.0, false, false);
    
    if (this.params.tray) {
      this.addSegment(x0, y0 + this.size.h, x0 + this.size.w - thickness, y0 + this.size.h);
    } else {
      this.drawHorizontalLine(x0, y0 + this.size.h - thickness, this.notchLength.w, this.numNotches.w, thickness, cutWidth / 2.0, true, false);
    }
    
    this.drawVerticalLine(x0, y0, this.notchLength.h, this.numNotches.h, thickness, -cutWidth / 2.0, false, false);
    this.drawVerticalLine(x0 + this.size.w - thickness, y0, this.notchLength.h, this.numNotches.h, thickness, -cutWidth / 2.0, false, false);
  }

  private drawHorizontalLine(
    x0: number,
    y0: number,
    notchWidth: number,
    notchCount: number,
    notchHeight: number,
    cutWidth: number,
    flip: boolean,
    smallside: boolean
  ): void {
    let x = x0;
    
    for (let step = 0; step < notchCount; step++) {
      const y = ((step % 2 === 0) !== flip) ? y0 : y0 + notchHeight;
      
      if (step === 0) {
        if (smallside) {
          this.addSegment(x + notchHeight, y, x + notchWidth + cutWidth, y);
        } else {
          this.addSegment(x, y, x + notchWidth + cutWidth, y);
        }
      } else if (step === notchCount - 1) {
        this.addSegment(x - cutWidth, y, x + notchWidth - notchHeight, y);
      } else if (step % 2 === 0) {
        this.addSegment(x - cutWidth, y, x + notchWidth + cutWidth, y);
      } else {
        this.addSegment(x + cutWidth, y, x + notchWidth - cutWidth, y);
      }
      
      if (step < notchCount - 1) {
        if (step % 2 === 0) {
          this.addSegment(x + notchWidth + cutWidth, y0 + notchHeight, x + notchWidth + cutWidth, y0);
        } else {
          this.addSegment(x + notchWidth - cutWidth, y0 + notchHeight, x + notchWidth - cutWidth, y0);
        }
      }
      
      x += notchWidth;
    }
  }

  private drawVerticalLine(
    x0: number,
    y0: number,
    notchWidth: number,
    notchCount: number,
    notchHeight: number,
    cutWidth: number,
    flip: boolean,
    smallside: boolean
  ): void {
    let y = y0;
    
    for (let step = 0; step < notchCount; step++) {
      const x = ((step % 2 === 0) !== flip) ? x0 : x0 + notchHeight;
      
      if (step === 0) {
        if (smallside) {
          this.addSegment(x, y + notchHeight, x, y + notchWidth + cutWidth);
        } else {
          this.addSegment(x, y, x, y + notchWidth + cutWidth);
        }
      } else if (step === notchCount - 1) {
        if (smallside) {
          this.addSegment(x, y - cutWidth, x, y + notchWidth - notchHeight);
        } else {
          this.addSegment(x, y - cutWidth, x, y + notchWidth);
        }
      } else if (step % 2 === 0) {
        this.addSegment(x, y - cutWidth, x, y + notchWidth + cutWidth);
      } else {
        this.addSegment(x, y + cutWidth, x, y + notchWidth - cutWidth);
      }
      
      if (step < notchCount - 1) {
        if (step % 2 === 0) {
          this.addSegment(x0 + notchHeight, y + notchWidth + cutWidth, x0, y + notchWidth + cutWidth);
        } else {
          this.addSegment(x0 + notchHeight, y + notchWidth - cutWidth, x0, y + notchWidth - cutWidth);
        }
      }
      
      y += notchWidth;
    }
  }

  private addSegment(x0: number, y0: number, x1: number, y1: number): void {
    this.segments.push({
      from: { x: x0, y: y0 },
      to: { x: x1, y: y1 },
    });
  }

  private joinPaths(): Point[][] {
    const paths: Point[][] = this.segments.map(s => [s.from, s.to]);
    
    let changed = true;
    while (changed) {
      changed = false;
      
      for (let i = 0; i < paths.length; i++) {
        for (let j = i + 1; j < paths.length; j++) {
          const pathI = paths[i];
          const pathJ = paths[j];
          
          if (pointsEqual(pathI[pathI.length - 1], pathJ[0])) {
            paths[i] = [...pathI, ...pathJ.slice(1)];
            paths.splice(j, 1);
            changed = true;
            break;
          } else if (pointsEqual(pathI[pathI.length - 1], pathJ[pathJ.length - 1])) {
            paths[i] = [...pathI, ...pathJ.slice(0, -1).reverse()];
            paths.splice(j, 1);
            changed = true;
            break;
          } else if (pointsEqual(pathI[0], pathJ[pathJ.length - 1])) {
            paths[i] = [...pathJ, ...pathI.slice(1)];
            paths.splice(j, 1);
            changed = true;
            break;
          } else if (pointsEqual(pathI[0], pathJ[0])) {
            paths[i] = [...pathJ.reverse(), ...pathI.slice(1)];
            paths.splice(j, 1);
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }
    
    return paths;
  }
}

export function generateBox(params: BoxParams): BoxResult {
  const generator = new BoxGenerator(params);
  return generator.generate();
}
