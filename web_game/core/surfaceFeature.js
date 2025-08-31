export class SurfaceFeature {
  constructor(planet, theta = 0) {
    this.planet = planet;
    this.theta = theta; // angle along surface
    this.color = 'red';
    this.points = [];
    planet.featureList = planet.featureList || [];
    planet.featureList.push(this);
  }

  draw(ctx) {
    // very simple projection of points to screen space
    if (!this.points.length) return;
    const ref = this.planet.game.reference;
    const scale = this.planet.game.scaleFactor();
    const pts = [];
    const alpha = this.planet.alpha + this.theta;
    for (const [px, py] of this.points) {
      const x1 = px * Math.cos(alpha) - (py + this.planet.radius) * Math.sin(alpha);
      const y1 = px * Math.sin(alpha) + (py + this.planet.radius) * Math.cos(alpha);
      const dx = x1 + this.planet.x - ref.x;
      const dy = y1 + this.planet.y - ref.y;
      const cos = Math.cos(-ref.alpha);
      const sin = Math.sin(-ref.alpha);
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      pts.push([
        this.planet.game.canvas.width / 2 + rx * scale,
        this.planet.game.canvas.height / 2 + ry * scale,
      ]);
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
