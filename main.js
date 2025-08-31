// main.js
import { MainMenu } from "./scenes/menu.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas to always be a square based on window size
function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight);
  canvas.width = size;
  canvas.height = size;

  // Center canvas with CSS fallback
  canvas.style.marginTop = `${(window.innerHeight - size) / 2}px`;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let currentScene = new MainMenu(canvas, ctx, switchScene);

function switchScene(newScene) {
  currentScene = newScene;
}

let lastTime = performance.now();
let fpsTime = lastTime;
let frames = 0;
let fps = 0;

function gameLoop() {
  const now = performance.now();
  frames++;
  if (now - fpsTime >= 1000) {
    fps = frames;
    frames = 0;
    fpsTime = now;
    console.log("FPS:", fps);
  }

  const deltaTime = (now - lastTime) / 1000; // convert to seconds
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentScene.update?.(deltaTime);
  currentScene.render?.();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  currentScene.onKeyPress?.(e);
});

document.addEventListener("keyup", (e) => {
  currentScene.onKeyRelease?.(e);
});

gameLoop();
