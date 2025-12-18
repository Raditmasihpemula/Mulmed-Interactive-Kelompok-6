(() => {
  const toEl = document.getElementById("to");
  const resultEl = document.getElementById("result");
  const copyBtn = document.getElementById("copy");
  const openTrack = document.getElementById("openTrack");

  const STORAGE_KEY = "tracker_redirect";

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) toEl.value = saved;

  function normalizeUrl(v) {
    try { return new URL(v).toString(); } catch { return null; }
  }

  function baseDir() {
    // returns ".../tracker/"
    const u = new URL(location.href);
    u.pathname = u.pathname.replace(/\/[^\/]*$/, "/");
    u.search = "";
    u.hash = "";
    return u.toString();
  }

  function buildLink() {
    const target = normalizeUrl(toEl.value.trim());
    if (!target) return null;
    return baseDir() + "track.html?to=" + encodeURIComponent(target);
  }

  function refreshUI() {
    const link = buildLink();
    if (!link) {
      resultEl.textContent = "URL belum valid. Contoh: https://example.com";
      copyBtn.disabled = true;
      openTrack.href = "./track.html";
      return;
    }
    resultEl.textContent = link;
    copyBtn.disabled = false;
    openTrack.href = link;
  }

  document.getElementById("save").addEventListener("click", () => {
    const target = normalizeUrl(toEl.value.trim());
    if (!target) {
      resultEl.textContent = "Gagal simpan: URL tidak valid.";
      copyBtn.disabled = true;
      return;
    }
    localStorage.setItem(STORAGE_KEY, target);
    refreshUI();
  });

  document.getElementById("gen").addEventListener("click", refreshUI);

  document.getElementById("clear").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    toEl.value = "";
    resultEl.textContent = "Belum ada link.";
    copyBtn.disabled = true;
    openTrack.href = "./track.html";
  });

  copyBtn.addEventListener("click", async () => {
    const link = buildLink();
    if (!link) return;
    await navigator.clipboard.writeText(link);
    const old = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = old), 900);
  });

  // Live update
  if (toEl.value.trim()) refreshUI();
  toEl.addEventListener("input", refreshUI);
})();
