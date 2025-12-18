// =====================
// GAME CORE (STATE)
// =====================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudScene = document.getElementById("hudScene");
const hudMonth = document.getElementById("hudMonth");

// input
const keys = new Set();
window.addEventListener("keydown", (e) => {
  if (["ArrowLeft","ArrowRight","a","d","A","D"].includes(e.key)) e.preventDefault();
  keys.add(e.key);
}, {passive:false});
window.addEventListener("keyup", (e) => keys.delete(e.key));

const State = {
  OFFICE: "OFFICE",         // scene 1: jalan ke kantor -> event 1
  MOTOR: "MOTOR",           // scene 2: motor skip bulan (loop)
  EVENT2: "EVENT2",         // event 2: chat ambil seragam
  GAMEOVER: "GAMEOVER",
  WIN: "WIN",
};

let state = State.OFFICE;
let monthIndex = 0; // start Oktober 2024
hudMonth.textContent = CONFIG.months[monthIndex];

// player (jalan)
const player = {
  x: 80,
  y: 420, // baseline
  speed: 3.2,
};

// motor
const motor = {
  x: 120,
  y: 420,
  speed: 4.2,     // base speed
  boost: 2.3,     // kalau tahan D
};

let hasEvent1Done = false;
let hasEvent2Triggered = false;

function restart(){
  state = State.OFFICE;
  monthIndex = 0;
  hudMonth.textContent = CONFIG.months[monthIndex];
  player.x = 80;
  motor.x = 120;
  hasEvent1Done = false;
  hasEvent2Triggered = false;
  UI.hide();
}

function openEvent1Chat(){
  UI.show({
    phoneTitle: "HP • Chat Masuk",
    title: "Event 1: Adik Kelas Chat",
    desc:
`Suatu hari di kantor (magang), kamu dichat adik kelas.
Dia ingin pinjam seragam untuk lomba.

Kalau kamu menolak: game stop (gapunya MyKisah).`,
    hint: "Pilih: pinjamkan / tolak",
    chat: [
      {who:"them", text:"Kak, boleh pinjam seragam kakak buat lomba? 🙏"},
      {who:"them", text:"Nanti aku balikin kok, janji!"},
    ],
    buttons: [
      {
        label: "Pinjamkan (lanjut)",
        cls: "btnGood",
        onClick: () => {
          UI.hide();
          hasEvent1Done = true;
          state = State.MOTOR;
        }
      },
      {
        label: "Tolak (Game Over)",
        cls: "btnBad",
        onClick: () => {
          UI.hide();
          state = State.GAMEOVER;
          openGameOver("gapunya mykisah\nkalo gamau minjemin seragam");
        }
      },
      { label: "Restart", cls:"btnGhost", onClick: restart }
    ]
  });
}

function openNotifFeb(){
  UI.show({
    phoneTitle: "HP • Notifikasi",
    title: "Februari 2025: Ada Wisuda/Pelepasan",
    desc:
`Masuk bulan Februari.
Ada pemberitahuan kegiatan pelepasan/wisuda.
Kamu baru sadar: seragam yang kamu pinjamkan belum balik.

Maka kamu harus chat untuk ambil seragam lagi.`,
    hint: "Klik lanjut untuk chat adik kelas.",
    chat: [
      {who:"them", text:"[NOTIF] Info: Pelepasan/Wisuda bulan Februari."},
      {who:"me", text:"...Seragamku! Belum balik."},
    ],
    buttons: [
      {
        label: "Lanjut Chat",
        cls: "btnGood",
        onClick: () => {
          UI.hide();
          state = State.EVENT2;
          openEvent2Chat();
        }
      },
      { label: "Restart", cls:"btnGhost", onClick: restart }
    ]
  });
}

function openEvent2Chat(){
  UI.show({
    phoneTitle: "HP • Chat Malam Hari",
    title: "Event 2: Ambil Seragam (Malam Pulang Kantor)",
    desc:
`Kondisi malam hari, kamu pulang dari kantor.
Kamu butuh seragam untuk wisuda dan harus ambil kembali.

Ada 2 opsi:
1) GoSend-in (gagal, game berhenti)
2) Nyamperin/Ambil sendiri (win & tamat)`,
    hint: "Pilih cara ambil seragam.",
    chat: [
      {who:"me", text:"Hai… seragam yang dulu aku pinjemin masih ada? Aku butuh buat wisuda 😅"},
      {who:"them", text:"Aduh kak maaf! Masih ada kok. Tapi aku di rumah…"},
    ],
    buttons: [
      {
        label: "GoSend-in (Gagal)",
        cls: "btnBad",
        onClick: () => {
          UI.hide();
          state = State.GAMEOVER;
          openGameOver("gapunya mykisah\nkalo minta gosend (gagal)");
        }
      },
      {
        label: "Ambil langsung (WIN)",
        cls: "btnGood",
        onClick: () => {
          UI.hide();
          state = State.WIN;
          openWin();
        }
      },
      { label: "Restart", cls:"btnGhost", onClick: restart }
    ]
  });
}

function openGameOver(text){
  UI.show({
    phoneTitle: "MyKisah",
    title: "GAME OVER",
    desc: text,
    hint: "Coba ulangi dan pilih opsi yang benar.",
    chat: [],
    buttons: [
      { label: "Restart", cls:"btnGhost", onClick: restart }
    ]
  });
}

function openWin(){
  UI.show({
    phoneTitle: "MyKisah",
    title: "WIN • MyKisah Dimulai",
    desc:
`Kamu memilih ambil langsung.
Seragam berhasil kamu dapatkan.

"win dan jadi mykisah klo ngambil secara langsung"`,
    hint: "Tamat. Bisa restart untuk main lagi.",
    chat: [
      {who:"me", text:"Oke aku nyamperin sekarang. Share lokasi ya."},
      {who:"them", text:"Siap kak! Makasih banget…"},
    ],
    buttons: [
      { label: "Restart", cls:"btnGhost", onClick: restart }
    ]
  });
}

function updateOffice(){
  hudScene.textContent = "OFFICE";

  let dir = 0;
  if (keys.has("a") || keys.has("A") || keys.has("ArrowLeft")) dir -= 1;
  if (keys.has("d") || keys.has("D") || keys.has("ArrowRight")) dir += 1;

  player.x += dir * player.speed;
  player.x = Math.max(30, Math.min(950, player.x));

  // trigger event 1 saat dekat "pintu kantor"
  if (!hasEvent1Done && player.x >= CONFIG.officeDoorX) {
    // stop movement sementara
    openEvent1Chat();
    hasEvent1Done = true; // biar nggak kebuka berkali-kali
    // NOTE: kalau player pilih "pinjamkan", kita lanjut ke MOTOR
    // kalau "tolak", GAMEOVER
  }
}

function updateMotor(){
  hudScene.textContent = "MOTOR";

  // motor auto jalan + boost kalau tahan D
  const boost = (keys.has("d") || keys.has("D") || keys.has("ArrowRight")) ? motor.boost : 0;
  const brake = (keys.has("a") || keys.has("A") || keys.has("ArrowLeft")) ? 2.2 : 0;

  motor.x += Math.max(0.5, motor.speed + boost - brake);

  // kalau lewat finish -> bulan naik -> reset posisi
  if (motor.x >= CONFIG.motorFinishX + 30) {
    motor.x = 120;

    if (monthIndex < CONFIG.months.length - 1) {
      monthIndex++;
      hudMonth.textContent = CONFIG.months[monthIndex];
    }

    // kalau sudah sampai Feb 2025, trigger notif/event2 sekali
    if (!hasEvent2Triggered && CONFIG.months[monthIndex] === "Februari 2025") {
      hasEvent2Triggered = true;
      openNotifFeb();
    }
  }
}

function draw(){
  Render.clear(ctx, canvas.width, canvas.height);

  if (state === State.OFFICE) {
    Render.drawSceneOffice(ctx, canvas.width, canvas.height, player);
  } else if (state === State.MOTOR || state === State.EVENT2) {
    // EVENT2 secara visual tetap motor scene (sesuai sketsa: HP di motor)
    Render.drawSceneMotor(ctx, canvas.width, canvas.height, motor);
  } else if (state === State.GAMEOVER) {
    Render.drawCenteredText(ctx, canvas.width, canvas.height, "GAME OVER", "lihat dialog untuk alasan & restart");
  } else if (state === State.WIN) {
    Render.drawCenteredText(ctx, canvas.width, canvas.height, "WIN", "MyKisah dimulai karena kamu ambil langsung");
  }
}

function loop(){
  if (state === State.OFFICE) updateOffice();
  if (state === State.MOTOR) updateMotor();
  // EVENT2: input motor boleh tetap jalan atau diam; kita biarin motor scene doang

  draw();
  requestAnimationFrame(loop);
}

// start
restart();
requestAnimationFrame(loop);
