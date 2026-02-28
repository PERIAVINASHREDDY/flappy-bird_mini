const config = {
  gravity: 0.25,
  jump: -6,
  pipeSpeed: 2.5,
  pipeSpawnRate: 100,
  pipeGap: 180,
  pipeWidth: 70,
  bottomPadding: 50
};

let state = {
  score: 0,
  bestScore: localStorage.getItem("zoomScore") || 0,
  playing: false,
  player: { x: 50, y: 300, vy: 0, size: 120 },
  pipes: [],
  frame: 0
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

/* ================= IMAGES ================= */

const bgImg = new Image();
bgImg.src = "minibg.png";

const playerImg = new Image();
playerImg.src = "mini.png";

const topPipeImg = new Image();
topPipeImg.src = "toppipe.png";

const bottomPipeImg = new Image();
bottomPipeImg.src = "bottompipe.png";

/* ================= AUDIO ================= */

const bgm = new Audio("minibgm.mp3");
bgm.loop = true;
bgm.volume = 0.3;

const sfxWing = new Audio("sfx_wing.wav");
const sfxPoint = new Audio("sfx_point.wav");
const sfxHit = new Audio("Hit.mp4");
const sfxDie = new Audio("sfx_die.wav");

/* ================= UI ================= */

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const scoreBoard = document.getElementById("score-board");
const currentScore = document.getElementById("current-score");
const finalScore = document.getElementById("final-score");
const bestScoreEl = document.getElementById("best-score");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

/* ================= RESIZE ================= */

function resize() {
  const container = document.getElementById("game-container");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  state.player.x = canvas.width * 0.2;
}
window.addEventListener("resize", resize);
resize();

/* ================= RESET ================= */

function reset() {
  state.score = 0;
  state.pipes = [];
  state.frame = 0;
  state.player.y = canvas.height / 2;
  state.player.vy = 0;
  currentScore.textContent = 0;
}

/* ================= SPAWN PIPE ================= */

function spawnPipe() {
  const maxTop = canvas.height - config.pipeGap - 150;
  const top = Math.random() * (maxTop - 100) + 100;
  state.pipes.push({ x: canvas.width, top, passed: false });
}

/* ================= UPDATE ================= */

function update() {
  if (!state.playing) return;

  state.player.vy += config.gravity;
  state.player.y += state.player.vy;

  // Ground / ceiling collision
  if (
    state.player.y > canvas.height - config.bottomPadding ||
    state.player.y < 0
  ) gameOver();

  if (state.frame % config.pipeSpawnRate === 0) spawnPipe();

  state.pipes.forEach((pipe, index) => {
    pipe.x -= config.pipeSpeed;

    // Collision detection
    if (
      state.player.x + 20 > pipe.x &&
      state.player.x - 20 < pipe.x + config.pipeWidth &&
      (state.player.y < pipe.top ||
        state.player.y > pipe.top + config.pipeGap)
    ) gameOver();

    // Scoring
    if (!pipe.passed && state.player.x > pipe.x + config.pipeWidth) {
      pipe.passed = true;
      state.score++;
      currentScore.textContent = state.score;
      sfxPoint.currentTime = 0;
      sfxPoint.play();
    }

    if (pipe.x + config.pipeWidth < 0)
      state.pipes.splice(index, 1);
  });

  state.frame++;
}

/* ================= DRAW ================= */

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Pipes
  state.pipes.forEach(pipe => {

    // Top pipe
    const topHeight = pipe.top;
    ctx.drawImage(
      topPipeImg,
      pipe.x,
      0,
      config.pipeWidth,
      topHeight
    );

    // Bottom pipe
    const bottomY = pipe.top + config.pipeGap;
    const bottomHeight = canvas.height - bottomY;
    ctx.drawImage(
      bottomPipeImg,
      pipe.x,
      bottomY,
      config.pipeWidth,
      bottomHeight
    );
  });

  // Player
  ctx.drawImage(
    playerImg,
    state.player.x - state.player.size / 2,
    state.player.y - state.player.size / 2,
    state.player.size,
    state.player.size
  );

  requestAnimationFrame(draw);
}

/* ================= JUMP ================= */

function jump() {
  if (state.playing) {
    state.player.vy = config.jump;
    sfxWing.currentTime = 0;
    sfxWing.play();
  }
}

/* ================= START GAME ================= */

function startGame() {
  reset();
  state.playing = true;

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  scoreBoard.classList.remove("hidden");

  bgm.currentTime = 0;
  bgm.play();
}

/* ================= GAME OVER ================= */

function gameOver() {
  if (!state.playing) return;

  state.playing = false;

  bgm.pause();

  sfxHit.play();
  setTimeout(() => {
    sfxDie.play();
  }, 150);

  gameOverScreen.classList.remove("hidden");
  scoreBoard.classList.add("hidden");

  finalScore.textContent = state.score;

  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    localStorage.setItem("zoomScore", state.bestScore);
  }

  bestScoreEl.textContent = state.bestScore;
}

/* ================= CONTROLS ================= */

window.addEventListener("keydown", e => {
  if (e.code === "Space")
    state.playing ? jump() : startGame();
});

canvas.addEventListener("click", jump);
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

/* ================= START LOOP ================= */

requestAnimationFrame(draw);
setInterval(update, 1000 / 60);