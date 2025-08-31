import { SurfaceFeature } from './surfaceFeature.js';

export class Mountain extends SurfaceFeature {
  constructor(planet, height, width, middleWidth = null, theta = 0) {
    super(planet, theta);
    this.color = 'rgb(80,80,80)';
    if (middleWidth === null) middleWidth = width / 2;
    // triangular mountain profile
    this.points.push([-width / 2, -100]);
    this.points.push([-middleWidth / 2, height / 2]);
    this.points.push([0, height]);
    this.points.push([middleWidth / 2, height / 2]);
    this.points.push([width / 2, -100]);
  }
}
