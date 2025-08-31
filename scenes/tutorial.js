import { MainMenu } from './menu.js';
import { OrbitGame } from './orbitGame.js';

export class TutorialView {
  constructor(canvas, ctx, switchScene, previousView = null) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.switchScene = switchScene;
    this.previousView = previousView;
    this.lines = [
      'How to Play',
      '',
      'Goal: land the spacecraft gently on the Moon.',
      '',
      '## Arrow Keys',
      '- LEFT/RIGHT: Rotate craft',
      '- UP: Increase thrust (Shift for +10%)',
      '- DOWN: Decrease thrust (Shift for -10%)',
      '',
      '## NumPad',
      '- 1: Control main craft',
      '- 2: Control lander',
      '- 0: Dock or undock',
      '',
      '## Zoom & View',
      '- Mouse wheel or +/-: Zoom in/out',
      '- SPACE: Toggle camera focus',
      '',
      'Press T in game for this help',
      'ESC: return, ENTER: restart'
    ];
  }

  update() {}

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.textAlign = 'center';

    ctx.font = '28px Courier New';
    ctx.fillStyle = 'yellow';
    ctx.fillText('Lander Challenge', this.canvas.width / 2, 100);
    ctx.font = '20px Courier New';
    ctx.fillStyle = 'white';
    ctx.fillText('enGits Lander Challenge', this.canvas.width / 2, 130);

    let y = 180;
    this.lines.forEach(line => {
      ctx.fillStyle = line.startsWith('##') ? 'yellow' : 'white';
      ctx.fillText(line.replace('## ', ''), this.canvas.width / 2, y);
      y += 26;
    });
  }

  onKeyPress(e) {
    if (e.code === 'Escape') {
      if (this.previousView) {
        this.previousView.paused = false; // Resume the game
        this.switchScene(this.previousView);
      } else {
        this.switchScene(new MainMenu(this.canvas, this.ctx, this.switchScene));
      }
    } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      this.switchScene(new OrbitGame(this.canvas, this.ctx, this.switchScene, 1));
    }
  }
}
