const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SETUP AUDIO (SFX) ---
const sfxJump = new Audio("assets/audio/jump.mp3");
const sfxScore = new Audio("assets/audio/score.mp3");
const sfxDie = new Audio("assets/audio/die.mp3");

sfxJump.volume = 0.6;
sfxScore.volume = 0.6;
sfxDie.volume = 0.8;

const bgm = document.getElementById("bgm");
if (bgm) bgm.volume = 0.1;

// --- SETUP VARIABLE ---
let frames = 0;
let score = 0;
let isGameOver = false;
let isGameWon = false;
let gameStarted = false;

// 1. AMBIL DATA DARI HALAMAN SEBELUMNYA
const selectedChar = localStorage.getItem("selectedChar") || "char1";
const difficulty = localStorage.getItem("gameDifficulty") || "easy";

// 2. SETTING TARGET SKOR
let targetScore = 10;
if (difficulty === "normal") targetScore = 15;
if (difficulty === "hard") targetScore = 25;

// --- LOGIKA WARNA KARAKTER (fallback kalau gambar gagal load) ---
const charColors = {
  char1: "red",
  char2: "blue",
  char3: "green",
  char4: "yellow",
};

// --- SPRITE KARAKTER (PNG) ---
const charSprites = {
  char1: "assets/img/char1.png",
  char2: "assets/img/char2.png",
  char3: "assets/img/char3.png",
  char4: "assets/img/char4.png",
};

const birdImg = new Image();
birdImg.src = charSprites[selectedChar];

// biar pixel art nggak blur
ctx.imageSmoothingEnabled = false;

// --- OBJEK BURUNG ---
const bird = {
  x: 50,
  y: 150,
  w: 42,
  h: 42,
  velocity: 0,
  gravity: 0.25,
  jump: 4.6,

  draw: function () {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // fallback: kalau sprite belum keload / gagal
    if (!birdImg.complete || birdImg.naturalWidth === 0) {
      ctx.fillStyle = charColors[selectedChar];
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);
      ctx.restore();
      return;
    }

    ctx.drawImage(birdImg, this.x, this.y, this.w, this.h);
    ctx.restore();
  },

  update: function () {
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Cek Nabrak Tanah
    if (this.y + this.h >= canvas.height) {
      this.y = canvas.height - this.h;
      gameOver();
    }

    // (opsional) Cek nabrak atas layar
    if (this.y <= 0) {
      this.y = 0;
      this.velocity = 0;
    }
  },

  flap: function () {
    this.velocity = -this.jump;

    // --- LOGIKA SUARA ---
    sfxJump.currentTime = 0;
    sfxJump.play();

    if (!gameStarted && bgm) {
      bgm.play().catch(() => console.log("Tap layar buat nyalain musik"));
      gameStarted = true;
    }
  },
};

// --- OBJEK PIPA ---
const pipes = {
  position: [],
  w: 40,
  gap: 100,
  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(p.x, 0, this.w, p.y);
      ctx.fillRect(p.x, p.y + this.gap, this.w, canvas.height - p.y - this.gap);
    }
  },

  update: function () {
    if (frames % 120 === 0) {
      this.position.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - this.gap - 100) + 50,
      });
    }

    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      p.x -= this.dx;

      // Tabrakan Logic
      if (
        bird.x + bird.w > p.x &&
        bird.x < p.x + this.w &&
        (bird.y < p.y || bird.y + bird.h > p.y + this.gap)
      ) {
        gameOver();
      }

      // SKOR BERTAMBAH
      if (p.x + this.w <= 0) {
        this.position.shift();
        score++;

        sfxScore.currentTime = 0;
        sfxScore.play();

        if (score >= targetScore) {
          gameWin();
        }
      }
    }
  },
};

// --- LOOP UTAMA ---
function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bird.draw();
  pipes.draw();

  ctx.fillStyle = "white";
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillText(`Score: ${score}/${targetScore}`, 10, 30);
}

function update() {
  if (isGameOver || isGameWon) return;
  bird.update();
  pipes.update();
}

function loop() {
  update();
  draw();
  frames++;
  if (!isGameOver && !isGameWon) requestAnimationFrame(loop);
}

// --- FUNGSI KALAH ---
function gameOver() {
  if (isGameOver) return; // biar ga kepanggil berkali-kali
  isGameOver = true;

  if (bgm) bgm.pause();
  sfxDie.currentTime = 0;
  sfxDie.play();

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillText("GAME OVER", 70, canvas.height / 2);
  ctx.font = "10px sans-serif";
  ctx.fillText("Tap Layar buat Ulang", 80, canvas.height / 2 + 30);
}

// --- FUNGSI MENANG ---
function gameWin() {
  if (isGameWon) return;
  isGameWon = true;

  if (bgm) bgm.pause();

  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f1c40f";
  ctx.font = "20px 'Press Start 2P'";
  ctx.fillText("LEVEL CLEAR!", 35, canvas.height / 2 - 20);

  ctx.fillStyle = "white";
  ctx.font = "12px sans-serif";
  ctx.fillText("Tap Layar buat Lanjut...", 55, canvas.height / 2 + 20);
}

// --- CONTROLLER (KHUSUS MOBILE & PC) ---
function handleInput(e) {
  // jangan sampe nge-tap tombol UI
  if (e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.tagName === "SELECT") {
    return;
  }

  // HP: matiin scroll/zoom default
  if (e.type === "touchstart") e.preventDefault();

  if (isGameOver) {
    location.reload();
  } else if (isGameWon) {
    window.location.href = "next-level.html";
  } else {
    bird.flap();
  }
}

window.addEventListener("click", handleInput);
window.addEventListener("touchstart", handleInput, { passive: false });

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (isGameOver) location.reload();
    else if (isGameWon) window.location.href = "next-level.html";
    else bird.flap();
  }
});

loop();
