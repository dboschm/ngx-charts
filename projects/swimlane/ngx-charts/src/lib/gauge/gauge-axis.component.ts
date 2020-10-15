import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { line } from 'd3-shape';

@Component({
  selector: 'g[ngx-charts-gauge-axis]',
  template: `
    <svg:g [attr.transform]="rotate">
      <svg:g *ngFor="let tick of ticks.big" class="gauge-tick gauge-tick-large">
        <svg:path [attr.d]="tick.line" />
      </svg:g>
      <svg:g *ngFor="let tick of ticks.big" class="gauge-tick gauge-tick-large">
        <svg:text
          [style.textAnchor]="tick.textAnchor"
          [attr.transform]="tick.textTransform"
          alignment-baseline="central"
        >
          {{ tick.text }}
        </svg:text>
      </svg:g>
      <svg:g *ngFor="let tick of ticks.small" class="gauge-tick gauge-tick-small">
        <svg:path [attr.d]="tick.line" />
      </svg:g>
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeAxisComponent implements OnChanges {
  @Input() bigSegments: any;
  @Input() smallSegments: any;
  @Input() tickValues: number[];
  @Input() min: any;
  @Input() max: any;
  @Input() angleSpan: number;
  @Input() startAngle: number;
  @Input() radius: any;
  @Input() valueScale: any;
  @Input() tickFormatting: any;
  @Input() tickLength: number = 10;
  @Input() axisGap: number = 10;
  ticks: any;
  rotationAngle: number;
  rotate: string = '';

  ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  update(): void {
    this.rotationAngle = -90 + this.startAngle;
    this.rotate = `rotate(${this.rotationAngle})`;
    if (this.tickValues?.length > 0) {
      this.ticks = this.getCustomTicks();
    } else {
      this.ticks = this.getTicks();
    }
  }

  getTicks(): any {
    const bigTickSegment = this.angleSpan / this.bigSegments;
    const smallTickSegment = bigTickSegment / this.smallSegments;
    const ticks = {
      big: [],
      small: []
    };

    const startDistance = this.radius + this.axisGap;
    const textDist = startDistance + this.tickLength + this.axisGap;

    for (let i = 0; i <= this.bigSegments; i++) {
      const angleDeg = i * bigTickSegment;
      const angle = (angleDeg * Math.PI) / 180;

      const textAnchor = this.getTextAnchor(angleDeg);

      let skip = false;
      if (i === 0 && this.angleSpan === 360) {
        skip = true;
      }

      if (!skip) {
        let text = Number.parseFloat(this.valueScale.invert(angleDeg).toString()).toLocaleString();
        if (this.tickFormatting) {
          text = this.tickFormatting(text);
        }
        ticks.big.push({
          line: this.getTickPath(startDistance, this.tickLength, angle),
          textAnchor,
          text,
          textTransform: `
            translate(${textDist * Math.cos(angle)}, ${textDist * Math.sin(angle)}) rotate(${-this.rotationAngle})
          `
        });
      }

      if (i === this.bigSegments) {
        continue;
      }

      for (let j = 1; j <= this.smallSegments; j++) {
        const smallAngleDeg = angleDeg + j * smallTickSegment;
        const smallAngle = (smallAngleDeg * Math.PI) / 180;

        ticks.small.push({
          line: this.getTickPath(startDistance, this.tickLength / 2, smallAngle)
        });
      }
    }

    return ticks;
  }

  getCustomTicks(): any {
    const startDistance = this.radius + this.axisGap;
    const textDist = startDistance + this.tickLength + this.axisGap;
    const ticks = {
      big: [],
      small: []
    };

    for (let i = 0; i < this.tickValues.length; i++) {

      const angleDeg = this.valueScale(this.tickValues[i]);
      const angle = (angleDeg * Math.PI) / 180;
      const textAnchor = this.getTextAnchor(angleDeg);
      let text = Number.parseFloat(this.valueScale.invert(angleDeg).toString()).toLocaleString();

      if (this.tickFormatting) {
        text = this.tickFormatting(text);
      }
      ticks.big.push({
        line: this.getTickPath(startDistance, this.tickLength, angle),
        textAnchor,
        text,
        textTransform: `
            translate(${textDist * Math.cos(angle)}, ${textDist * Math.sin(angle)}) rotate(${-this.rotationAngle})
          `
      });
    }
    console.log(ticks);

    return ticks;
  }

  getTextAnchor(angle) {
    // [0, 45] = 'middle';
    // [46, 135] = 'start';
    // [136, 225] = 'middle';
    // [226, 315] = 'end';

    angle = (this.startAngle + angle) % 360;
    let textAnchor = 'middle';
    if (angle > 45 && angle <= 135) {
      textAnchor = 'start';
    } else if (angle > 225 && angle <= 315) {
      textAnchor = 'end';
    }
    return textAnchor;
  }

  getTickPath(startDistance, tickLength, angle): any {
    const y1 = startDistance * Math.sin(angle);
    const y2 = (startDistance + tickLength) * Math.sin(angle);
    const x1 = startDistance * Math.cos(angle);
    const x2 = (startDistance + tickLength) * Math.cos(angle);

    const points = [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ];
    const lineGenerator = line<any>()
      .x(d => d.x)
      .y(d => d.y);
    return lineGenerator(points);
  }
}
