const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SETUP AUDIO (SFX) ---
// Pastikan file-nya ada di folder assets/audio/ ya!
const sfxJump = new Audio('assets/audio/jump.mp3');
const sfxScore = new Audio('assets/audio/score.mp3');
const sfxDie = new Audio('assets/audio/die.mp3');

// Atur Volume (0.0 sampe 1.0) biar ga pecah telinga
sfxJump.volume = 0.6;
sfxScore.volume = 0.6;
sfxDie.volume = 0.8;

// Ambil elemen BGM dari HTML
const bgm = document.getElementById("bgm");
if(bgm) bgm.volume = 0.1; 

// --- SETUP VARIABLE ---
let frames = 0;
let score = 0;
let isGameOver = false;
let isGameWon = false; 
let gameStarted = false; // Penanda biar BGM nyala pas klik pertama

// 1. AMBIL DATA DARI HALAMAN SEBELUMNYA
const selectedChar = localStorage.getItem('selectedChar') || 'char1';
const difficulty = localStorage.getItem('gameDifficulty') || 'easy';

// 2. SETTING TARGET SKOR
let targetScore = 10;
if (difficulty === 'normal') targetScore = 15;
if (difficulty === 'hard') targetScore = 25;

// --- LOGIKA WARNA KARAKTER ---
const charColors = {
    'char1': 'red', 'char2': 'blue', 'char3': 'green', 'char4': 'yellow'
};

// --- OBJEK BURUNG ---
const bird = {
    x: 50, y: 150, w: 20, h: 20, velocity: 0, gravity: 0.25, jump: 4.6,
    
    draw: function() {
        ctx.fillStyle = charColors[selectedChar];
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "black"; ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    },
    
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        
        // Cek Nabrak Tanah
        if (this.y + this.h >= canvas.height) {
            this.y = canvas.height - this.h;
            gameOver();
        }
    },
    
    flap: function() {
        this.velocity = -this.jump;
        
        // --- LOGIKA SUARA ---
        sfxJump.currentTime = 0; // Reset biar bisa bunyi cepet (tek-tek-tek)
        sfxJump.play();
        
        // Nyalain BGM pas loncat pertama kali (Trik biar ga diblok browser)
        if (!gameStarted && bgm) {
            bgm.play().catch(e => console.log("Klik dulu baru lagu nyala"));
            gameStarted = true;
        }
    }
};

// --- OBJEK PIPA ---
const pipes = {
    position: [], w: 40, gap: 100, dx: 2,
    
    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            ctx.fillStyle = "#2ecc71";
            ctx.fillRect(p.x, 0, this.w, p.y); 
            ctx.fillRect(p.x, p.y + this.gap, this.w, canvas.height - p.y - this.gap);
        }
    },
    
    update: function() {
        if (frames % 120 === 0) {
            this.position.push({
                x: canvas.width,
                y: Math.random() * (canvas.height - this.gap - 100) + 50
            });
        }
        
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            p.x -= this.dx;

            // Tabrakan Logic
            if (bird.x + bird.w > p.x && bird.x < p.x + this.w && 
               (bird.y < p.y || bird.y + bird.h > p.y + this.gap)) {
                gameOver();
            }
            
            // SKOR BERTAMBAH
            if (p.x + this.w <= 0) {
                this.position.shift();
                score++;
                
                // BUNYI TING!
                sfxScore.currentTime = 0;
                sfxScore.play();
                
                // CEK MENANG
                if (score >= targetScore) {
                    gameWin();
                }
            }
        }
    }
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
    isGameOver = true;
    
    // MATIKAN BGM & MAINKAN SUARA MATI
    if(bgm) bgm.pause();
    sfxDie.play();

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER", 80, canvas.height/2);
    ctx.font = "10px sans-serif";
    ctx.fillText("Klik Layar buat Ulang", 85, canvas.height/2 + 30);
}

// --- FUNGSI MENANG ---
function gameWin() {
    isGameWon = true;
    if(bgm) bgm.pause(); // Matikan lagu pas menang
    
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f1c40f"; 
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("LEVEL CLEAR!", 50, canvas.height/2 - 20);
    
    ctx.fillStyle = "white";
    ctx.font = "12px sans-serif";
    ctx.fillText("Klik Layar buat Lanjut...", 70, canvas.height/2 + 20);
}

// --- CONTROLLER ---
window.addEventListener("click", function(e) {
    if (isGameOver) {
        location.reload(); 
    } else if (isGameWon) {
        window.location.href = 'next-level.html'; 
    } else {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && e.target.tagName !== 'SELECT') {
            bird.flap();
        }
    }
});

document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        if (isGameOver) location.reload();
        else if (isGameWon) window.location.href = 'next-level.html';
        else bird.flap();
    }
});

loop();