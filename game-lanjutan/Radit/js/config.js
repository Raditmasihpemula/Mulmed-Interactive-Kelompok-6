// =====================
// CONFIG & CONSTANTS
// =====================
window.CONFIG = {
  canvasW: 1000,
  canvasH: 560,

  // bulan yang "di-skip" dengan motor (loop sampai Feb)
  months: [
    "Oktober 2024",
    "November 2024",
    "Desember 2024",
    "Januari 2025",
    "Februari 2025",
  ],

  // posisi event
  officeDoorX: 820,   // kalau player nyampe sini => event 1 (chat pinjam seragam)
  motorFinishX: 920,  // garis finish motor (kalau lewat => bulan naik, reset posisi)
};
