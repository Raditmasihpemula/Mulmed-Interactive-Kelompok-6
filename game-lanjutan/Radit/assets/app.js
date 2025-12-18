(() => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    alert("config.js belum diisi (SUPABASE_URL / SUPABASE_ANON_KEY).");
    return;
  }
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ---------- Tabs ----------
  const tabs = document.querySelectorAll(".tab");
  const tabShort = document.getElementById("tab-short");
  const tabPdf = document.getElementById("tab-pdf");

  tabs.forEach(btn => btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const t = btn.dataset.tab;
    tabShort.classList.toggle("hidden", t !== "short");
    tabPdf.classList.toggle("hidden", t !== "pdf");
  }));

  // ---------- Shortlink ----------
  const longUrlEl = document.getElementById("longUrl");
  const customSlugEl = document.getElementById("customSlug");
  const expiresAtEl = document.getElementById("expiresAt");
  const createBtn = document.getElementById("createBtn");
  const checkBtn = document.getElementById("checkBtn");
  const shortOut = document.getElementById("shortOut");
  const copyBtn = document.getElementById("copyBtn");
  const openBtn = document.getElementById("openBtn");

  function normalizeUrl(v) {
    try { return new URL(v).toString(); } catch { return null; }
  }
  function isValidSlug(slug) {
    return /^[a-z0-9-]{3,32}$/.test(slug);
  }
  function randSlug(len = 7) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let s = "";
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  // IMPORTANT: build base for github.io (origin + /repo)
  function siteBase() {
    if (location.hostname.endsWith("github.io")) {
      const parts = location.pathname.split("/").filter(Boolean);
      const repo = parts[0] || "";
      return location.origin + (repo ? `/${repo}` : "");
    }
    return location.origin;
  }

  function makeShortUrl(slug) {
    return `${siteBase()}/s/${slug}`;
  }

  async function slugExists(slug) {
    const { data, error } = await client
      .from("links")
      .select("slug")
      .eq("slug", slug)
      .limit(1);
    if (error) throw error;
    return (data || []).length > 0;
  }

  async function pickUniqueSlug() {
    for (let i = 0; i < 10; i++) {
      const s = randSlug(7);
      if (!(await slugExists(s))) return s;
    }
    return `${randSlug(6)}-${randSlug(3)}`;
  }

  async function handleCheck() {
    const slug = (customSlugEl.value || "").trim().toLowerCase();
    if (!isValidSlug(slug)) {
      shortOut.textContent = "Slug tidak valid. Pakai a-z 0-9 - (3–32).";
      return;
    }
    shortOut.textContent = "Mengecek...";
    const exists = await slugExists(slug);
    shortOut.textContent = exists ? "Slug sudah dipakai." : "Slug tersedia ✅";
  }

  async function handleCreate() {
    const url = normalizeUrl(longUrlEl.value.trim());
    if (!url) { shortOut.textContent = "URL tujuan tidak valid."; return; }

    let slug = (customSlugEl.value || "").trim().toLowerCase();
    if (slug && !isValidSlug(slug)) {
      shortOut.textContent = "Custom slug tidak valid. Pakai a-z 0-9 - (3–32).";
      return;
    }

    createBtn.disabled = true;
    checkBtn.disabled = true;
    shortOut.textContent = "Membuat shortlink...";

    try {
      if (!slug) slug = await pickUniqueSlug();
      else if (await slugExists(slug)) {
        shortOut.textContent = "Slug sudah dipakai. Ganti slug atau kosongkan.";
        return;
      }

      let expires_at = null;
      const rawExp = (expiresAtEl.value || "").trim();
      if (rawExp) {
        const d = new Date(rawExp);
        if (Number.isNaN(d.getTime())) {
          shortOut.textContent = "Expired time tidak valid.";
          return;
        }
        expires_at = d.toISOString();
      }

      const { error } = await client.from("links").insert({ slug, url, expires_at });
      if (error) throw error;

      const shortUrl = makeShortUrl(slug);
      shortOut.textContent = shortUrl;
      copyBtn.disabled = false;
      openBtn.href = shortUrl;
    } catch (e) {
      shortOut.textContent = "Error: " + (e?.message || String(e));
    } finally {
      createBtn.disabled = false;
      checkBtn.disabled = false;
    }
  }

  copyBtn.addEventListener("click", async () => {
    const txt = shortOut.textContent.trim();
    if (!txt || txt === "Belum ada link.") return;
    await navigator.clipboard.writeText(txt);
    const old = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = old, 900);
  });

  openBtn.addEventListener("click", (e) => {
    if (!openBtn.href || openBtn.href.endsWith("#")) e.preventDefault();
  });

  checkBtn.addEventListener("click", handleCheck);
  createBtn.addEventListener("click", handleCreate);

  // ---------- PDF Resizer / Compressor ----------
  // IMPORTANT: pdf.js UMD exposes global "pdfjsLib"
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const pdfFile = document.getElementById("pdfFile");
  const scale = document.getElementById("scale");
  const quality = document.getElementById("quality");
  const scaleVal = document.getElementById("scaleVal");
  const qualityVal = document.getElementById("qualityVal");
  const compressBtn = document.getElementById("compressBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const pdfProgress = document.getElementById("pdfProgress");

  let outputBytes = null;

  scale.addEventListener("input", () => (scaleVal.textContent = scale.value));
  quality.addEventListener("input", () => (qualityVal.textContent = quality.value));

  function setProgress(t) { pdfProgress.textContent = t; }

  async function canvasToJpegBytes(canvas, q) {
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", q));
    return new Uint8Array(await blob.arrayBuffer());
  }

  compressBtn.addEventListener("click", async () => {
    const f = pdfFile.files?.[0];
    if (!f) { setProgress("Pilih file PDF dulu."); return; }

    compressBtn.disabled = true;
    downloadBtn.disabled = true;
    outputBytes = null;

    try {
      setProgress("Membaca PDF...");
      const srcBytes = new Uint8Array(await f.arrayBuffer());

      const pdf = await pdfjsLib.getDocument({ data: srcBytes }).promise;
      const out = await PDFLib.PDFDocument.create();

      const renderScale = parseFloat(scale.value);
      const jpgQ = parseFloat(quality.value);

      const total = pdf.numPages;
      for (let i = 1; i <= total; i++) {
        setProgress(`Render page ${i}/${total}...`);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });
        const viewport1 = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { alpha: false });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        setProgress(`Encode JPEG page ${i}/${total}...`);
        const jpgBytes = await canvasToJpegBytes(canvas, jpgQ);

        const jpg = await out.embedJpg(jpgBytes);

        const outPage = out.addPage([viewport1.width, viewport1.height]);
        outPage.drawImage(jpg, { x: 0, y: 0, width: viewport1.width, height: viewport1.height });
      }

      setProgress("Menyusun PDF output...");
      outputBytes = await out.save();

      setProgress("Selesai ✅ (hasil siap di-download)");
      downloadBtn.disabled = false;
    } catch (e) {
      setProgress("Error: " + (e?.message || String(e)));
    } finally {
      compressBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (!outputBytes) return;
    const blob = new Blob([outputBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
})();
