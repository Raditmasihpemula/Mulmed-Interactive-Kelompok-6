const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- VARIABLE GAME ---
let frames = 0;
let score = 0;
let isGameOver = false;

// Ambil karakter yang dipilih dari LocalStorage
const selectedChar = localStorage.getItem('selectedChar') || 'char1';

// Tentukan warna berdasarkan pilihan (Nanti diganti Gambar)
const charColors = {
    'char1': 'red',
    'char2': 'blue',
    'char3': 'green',
    'char4': 'yellow'
};

// --- OBJEK BURUNG (PLAYER) ---
const bird = {
    x: 50,
    y: 150,
    w: 20,
    h: 20,
    velocity: 0,
    gravity: 0.25,
    jump: 4.6,
    
    draw: function() {
        // Gambar kotak dulu (nanti ganti drawImage buat foto muka)
        ctx.fillStyle = charColors[selectedChar];
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Garis outline biar kayak pixel
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    },
    
    update: function() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Cek nabrak tanah
        if (this.y + this.h >= canvas.height) {
            this.y = canvas.height - this.h;
            gameOver();
        }
    },
    
    flap: function() {
        this.velocity = -this.jump;
    }
};

// --- OBJEK PIPA ---
const pipes = {
    position: [],
    w: 40,
    h: 150, // tinggi pipa dasar
    gap: 100,
    dx: 2, // kecepatan gerak pipa
    
    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            
            ctx.fillStyle = "#2ecc71"; // Warna Pipa Hijau
            
            // Pipa Atas
            ctx.fillRect(p.x, 0, this.w, p.y);
            ctx.strokeRect(p.x, 0, this.w, p.y);
            
            // Pipa Bawah
            ctx.fillRect(p.x, p.y + this.gap, this.w, canvas.height - p.y - this.gap);
            ctx.strokeRect(p.x, p.y + this.gap, this.w, canvas.height - p.y - this.gap);
        }
    },
    
    update: function() {
        // Tambah pipa baru tiap 100 frame
        if (frames % 120 === 0) {
            this.position.push({
                x: canvas.width,
                y: Math.random() * (canvas.height - this.gap - 100) + 50
            });
        }
        
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            p.x -= this.dx; // Geser ke kiri

            // Deteksi Tabrakan
            // 1. Tabrak Pipa Atas
            if (bird.x + bird.w > p.x && bird.x < p.x + this.w && bird.y < p.y) {
                gameOver();
            }
            // 2. Tabrak Pipa Bawah
            if (bird.x + bird.w > p.x && bird.x < p.x + this.w && bird.y + bird.h > p.y + this.gap) {
                gameOver();
            }
            
            // Hapus pipa yang lewat layar & Tambah Skor
            if (p.x + this.w <= 0) {
                this.position.shift();
                score++;
                // Nanti tambahin suara 'ting' disini
            }
        }
    }
};

// --- FUNGSI UTAMA ---
function draw() {
    // Bersihin layar (Warna Langit)
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    bird.draw();
    pipes.draw();
    
    // Tulis Skor
    ctx.fillStyle = "white";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText(score, 10, 30);
    ctx.strokeText(score, 10, 30);
}

function update() {
    if (isGameOver) return;
    bird.update();
    pipes.update();
}

function loop() {
    update();
    draw();
    frames++;
    if (!isGameOver) requestAnimationFrame(loop);
}

function gameOver() {
    isGameOver = true;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER", 60, canvas.height/2);
    ctx.font = "10px 'Press Start 2P'";
    ctx.fillText("Klik buat ulang", 90, canvas.height/2 + 30);
}

// --- KONTROL ---
// Klik Mouse atau Spasi buat lompat
canvas.addEventListener("click", function() {
    if (isGameOver) {
        location.reload(); // Restart game
    } else {
        bird.flap();
    }
});

document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        if (isGameOver) location.reload();
        else bird.flap();
    }
});

// Mulai Game
loop();