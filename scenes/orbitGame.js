import { GameOver } from './gameOver.js';
import { TutorialView } from './tutorial.js';
import { Body } from '../core/body.js';
import { Spacecraft } from '../core/spacecraft.js';

export class OrbitGame {
  constructor(canvas, ctx, switchScene, level = 1) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.switchScene = switchScene;

    // Game state
    this.level = level;
    this.paused = false;
    this.gameRunning = true;
    this.simTime = 0;
    this.sim_dt = 0.1; // simulation step in seconds
    this.timeFactor = 1.0;
    this.accumulator = 0;

    // Star background
    this.stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      alpha: Math.random(),
      speed: 0.005 + Math.random() * 0.01
    }));

    // Game entities
    this.bodyList = [];
    this.spriteList = [];
    this.showCrashed = false;

    // Moon body
    this.planet = new Body(this);
    this.planet.radius = 1737400; // meters
    this.planet.mass = 7.34767309e22; // kg
    this.planet.name = 'Moon';
    this.planet.color = 'gray';
    this.planet.scaleFactor = 0.25 * Math.min(canvas.width, canvas.height) / this.planet.radius;
    this.reference = this.planet;

    // Spacecraft
    this.spacecraft = new Spacecraft('assets/craft_01.png', this);
    this.spacecraft.mass = 15000;
    this.spacecraft.y = this.planet.radius + 300000; // 300 km altitude
    this.spacecraft.u = Math.sqrt(Body.G * this.planet.mass / this.spacecraft.y);
    this.spacecraft.color = 'white';

    // Level setup placeholders
    if (this.level === 2) this.setLevel2();
    if (this.level === 3) this.setLevel3();

    this.handleWheel = (e) => {
      e.preventDefault();
      const zoom = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom(zoom);
    };
    canvas.addEventListener('wheel', this.handleWheel);
  }

  scaleFactor() {
    return this.reference.scaleFactor;
  }

  setLevel2() {}
  setLevel3() {}

  zoom(factor) {
    this.reference.scaleFactor *= factor;
    this.reference.scaleFactor = Math.max(1e-7, Math.min(1, this.reference.scaleFactor));
  }

  update(deltaTime) {
    if (this.paused || !this.gameRunning) return;

    // Twinkle stars
    this.stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed *= -1;
        star.alpha = Math.max(0, Math.min(1, star.alpha));
      }
    });

    // Physics steps
    this.accumulator += deltaTime * this.timeFactor;
    while (this.accumulator >= this.sim_dt) {
      for (const body of this.bodyList) {
        body.updatePhysics(this.sim_dt);
      }
      this.accumulator -= this.sim_dt;
      this.simTime += this.sim_dt;
    }

    // crash detection
    const r = Math.sqrt(this.spacecraft.x ** 2 + this.spacecraft.y ** 2);
    if (r <= this.planet.radius && this.gameRunning) {
      this.gameRunning = false;
      this.triggerGameOver();
    }
  }

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    this.stars.forEach(star => {
      ctx.beginPath();
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = 'white';
      ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw bodies
    for (const body of this.bodyList) {
      body.draw(ctx);
    }

    // HUD
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textAlign = 'left';
    ctx.font = '14px Courier New';
    ctx.fillStyle = 'gray';
    let xOffset = canvas.width - 200;
    let yOffset = 30;
    const lineHeight = 20;
    ctx.fillText(`Scale: ${this.reference.scaleFactor.toExponential(2)}`, xOffset, yOffset);
    yOffset += lineHeight;
    ctx.fillText(`Time Factor: ${this.timeFactor.toFixed(2)}`, xOffset, yOffset);
    yOffset += lineHeight;
    ctx.fillText(`Time: ${this.simTime.toFixed(2)}s`, xOffset, yOffset);
    yOffset += lineHeight;
    ctx.fillText(`Reference: ${this.reference.name}`, xOffset, yOffset);
    yOffset += lineHeight;
    ctx.fillText(`Level: ${this.level}`, xOffset, yOffset);
    yOffset += lineHeight;
    ctx.fillText(`Thrust: ${(this.spacecraft.throttle * 100).toFixed(1)}%`, xOffset, yOffset);
    ctx.restore();

    // Instructions
    ctx.fillStyle = 'white';
    ctx.font = '16px Courier New';
    ctx.fillText('Arrow keys to fly. +/- or wheel to zoom. T for Tutorial, ESC to Quit', xOffset, canvas.height - yOffset);

    if (this.showCrashed) {
      ctx.font = '40px Courier New';
      ctx.fillStyle = 'red';
      ctx.fillText('CRASHED!', canvas.width / 2, canvas.height / 2);
    }
  }

  onKeyPress(e) {
    switch (e.code) {
      case 'ArrowLeft':
        this.spacecraft.rotateDir = -1;
        break;
      case 'ArrowRight':
        this.spacecraft.rotateDir = 1;
        break;
      case 'ArrowUp':
        this.spacecraft.adjustThrust(e.shiftKey ? 0.1 : 0.01);
        break;
      case 'ArrowDown':
        this.spacecraft.adjustThrust(e.shiftKey ? -0.1 : -0.01);
        break;
      case 'KeyT':
        this.paused = true;
        this.switchScene(new TutorialView(this.canvas, this.ctx, this.switchScene, this));
        break;
      case 'Escape':
        this.gameRunning = false;
        this.triggerGameOver();
        break;
      case 'Equal':
      case 'NumpadAdd':
        if (e.shiftKey) this.timeFactor *= 1.1;
        else this.zoom(1.1);
        break;
      case 'Minus':
      case 'NumpadSubtract':
        if (e.shiftKey) this.timeFactor = Math.max(0.1, this.timeFactor / 1.1);
        else this.zoom(1 / 1.1);
        break;
    }
  }

  onKeyRelease(e) {
    switch (e.code) {
      case 'ArrowLeft':
        if (this.spacecraft.rotateDir < 0) this.spacecraft.rotateDir = 0;
        break;
      case 'ArrowRight':
        if (this.spacecraft.rotateDir > 0) this.spacecraft.rotateDir = 0;
        break;
    }
  }

  triggerGameOver() {
    this.showCrashed = true;
    setTimeout(() => {
      this.switchScene(new GameOver(this.canvas, this.ctx, this.switchScene));
    }, 2000);
  }
}
