export class Body {
  static G = 6.67430e-11; // gravitational constant

  constructor(game) {
    this.game = game;
    this.x = 0; // position (m)
    this.y = 0;
    this.u = 0; // velocity (m/s)
    this.v = 0;
    this.alpha = 0; // orientation (rad)
    this.omega = 0; // angular velocity (rad/s)
    this.mass = 0;
    this.radius = 0; // physical radius (m)
    this.color = 'gray';
    this.name = 'body';
    this.sprite = null; // optional Image

    game.bodyList.push(this);
  }

  updatePhysics(dt, Fx = 0, Fy = 0) {
    // accumulate gravitational force from other bodies
    for (const body of this.game.bodyList) {
      if (body === this) continue;
      const dx = body.x - this.x;
      const dy = body.y - this.y;
      const r2 = dx * dx + dy * dy;
      if (r2 === 0) continue;
      const r = Math.sqrt(r2);
      const F = (Body.G * this.mass * body.mass) / r2;
      Fx += (F * dx) / r;
      Fy += (F * dy) / r;
    }

    const ax = Fx / this.mass;
    const ay = Fy / this.mass;

    const u0 = this.u;
    const v0 = this.v;

    this.u += ax * dt;
    this.v += ay * dt;
    this.x += (u0 + this.u) * 0.5 * dt;
    this.y += (v0 + this.v) * 0.5 * dt;
    this.alpha += this.omega * dt;
  }

  screenPosition() {
    // convert world coordinates to screen space relative to reference body
    const ref = this.game.reference;
    const target = this.game.cameraTarget || ref;
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const cos = Math.cos(-ref.alpha);
    const sin = Math.sin(-ref.alpha);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    const scale = this.game.scaleFactor();
    return {
      x: this.game.canvas.width / 2 + rx * scale,
      y: this.game.canvas.height / 2 + ry * scale,
    };
  }

  draw(ctx) {
    const { x, y } = this.screenPosition();
    const r = this.radius * this.game.scaleFactor();
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.featureList) {
      for (const feature of this.featureList) {
        feature.draw(ctx);
      }
    }
  }
}

