import { Body } from './body.js';

export class Spacecraft extends Body {
  constructor(imageSrc, game) {
    super(game);
    this.image = new Image();
    this.image.src = imageSrc;
    this.size = 20; // pixel size when drawn
    this.maxThrust = 45000; // Newtons
    this.throttle = 0; // 0..1
    this.rotateDir = 0; // -1,0,1
    this.turnRate = Math.PI / 2; // rad/s
  }

  updatePhysics(dt) {
    // rotation control
    this.alpha += this.rotateDir * this.turnRate * dt;

    // thrust force in spacecraft frame
    let Fx = 0;
    let Fy = 0;
    if (this.throttle > 0 && this.mass > 0) {
      const thrust = this.maxThrust * this.throttle;
      Fx = thrust * Math.sin(this.alpha);
      Fy = thrust * Math.cos(this.alpha);
    }

    super.updatePhysics(dt, Fx, Fy);
  }

  adjustThrust(delta) {
    this.throttle = Math.min(1, Math.max(0, this.throttle + delta));
  }

  draw(ctx) {
    const { x, y } = this.screenPosition();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.alpha - this.game.reference.alpha);
    if (this.image.complete) {
      ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

