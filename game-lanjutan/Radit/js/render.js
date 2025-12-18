// =====================
// RENDER (CANVAS DRAW)
// =====================
window.Render = (() => {
  function clear(ctx, w, h) {
    ctx.clearRect(0,0,w,h);
  }

  function drawSceneOffice(ctx, w, h, player) {
    // langit malam
    ctx.fillStyle = "#2c46b8";
    ctx.fillRect(0,0,w,h);

    // tanah
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, h*0.72, w, h*0.28);

    // garis putih
    ctx.fillStyle = "#eaeaea";
    ctx.fillRect(0, h*0.71, w, 4);

    // gedung kantor kanan
    const bX = 650, bY = 110, bW = 260, bH = 320;
    ctx.fillStyle = "#7f8aa8";
    ctx.strokeStyle = "#cfd7ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(bX, bY, bW, bH);
    ctx.fillRect(bX, bY, bW, bH);

    // jendela
    ctx.fillStyle = "rgba(255,255,255,.25)";
    for (let r=0;r<3;r++){
      for (let c=0;c<3;c++){
        ctx.fillRect(bX+40+c*70, bY+40+r*85, 26, 40);
      }
    }

    // tulisan hint kecil
    ctx.fillStyle = "rgba(255,180,80,.95)";
    ctx.font = "14px system-ui";
    ctx.fillText("maju ke depan →", 120, 260);
    ctx.fillText("nanti ada event pas masuk kantor", 120, 280);

    // player
    drawStickman(ctx, player.x, player.y);
  }

  function drawSceneMotor(ctx, w, h, motor) {
    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,w,h);

    // jalan
    ctx.fillStyle = "#111";
    ctx.fillRect(0, h*0.72, w, h*0.28);

    // garis jalan
    ctx.fillStyle = "#eaeaea";
    ctx.fillRect(0, h*0.71, w, 4);

    // garis finish
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(CONFIG.motorFinishX, h*0.30);
    ctx.lineTo(CONFIG.motorFinishX, h*0.95);
    ctx.stroke();

    // label
    ctx.fillStyle = "#111";
    ctx.font = "18px system-ui";
    ctx.fillText("Finish", CONFIG.motorFinishX - 28, h*0.26);

    // motor + rider
    drawMotor(ctx, motor.x, motor.y);

    // teks kecil sesuai sketsa
    ctx.fillStyle = "#111";
    ctx.font = "14px system-ui";
    ctx.fillText("naik motor → tiap lewat garis: bulan naik", 40, 60);
    ctx.fillText("posisi balik lagi ke awal, loop sampai Februari", 40, 80);
  }

  function drawStickman(ctx, x, y) {
    // kepala
    ctx.fillStyle = "#ffccaa";
    ctx.beginPath();
    ctx.arc(x, y-25, 10, 0, Math.PI*2);
    ctx.fill();

    // badan
    ctx.strokeStyle = "#ff9a40";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y-15);
    ctx.lineTo(x, y+20);
    ctx.stroke();

    // tangan
    ctx.beginPath();
    ctx.moveTo(x-14, y+0);
    ctx.lineTo(x+14, y+0);
    ctx.stroke();

    // kaki
    ctx.beginPath();
    ctx.moveTo(x, y+20);
    ctx.lineTo(x-12, y+42);
    ctx.moveTo(x, y+20);
    ctx.lineTo(x+12, y+42);
    ctx.stroke();
  }

  function drawMotor(ctx, x, y) {
    // roda
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI*2);
    ctx.arc(x+70, y, 16, 0, Math.PI*2);
    ctx.stroke();

    // bodi
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+30, y-20);
    ctx.lineTo(x+60, y-20);
    ctx.lineTo(x+70, y);
    ctx.stroke();

    // rider (stickman mini)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    // kepala
    ctx.fillStyle = "#ffccaa";
    ctx.beginPath();
    ctx.arc(x+45, y-45, 8, 0, Math.PI*2);
    ctx.fill();
    // badan
    ctx.beginPath();
    ctx.moveTo(x+45, y-38);
    ctx.lineTo(x+45, y-12);
    ctx.stroke();
    // tangan ke setang
    ctx.beginPath();
    ctx.moveTo(x+45, y-28);
    ctx.lineTo(x+62, y-20);
    ctx.stroke();
  }

  function drawCenteredText(ctx, w, h, title, subtitle) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#111";
    ctx.font = "900 28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(title, w/2, h/2 - 10);
    ctx.font = "16px system-ui";
    ctx.fillText(subtitle, w/2, h/2 + 22);
    ctx.textAlign = "left";
  }

  return { clear, drawSceneOffice, drawSceneMotor, drawCenteredText };
})();
