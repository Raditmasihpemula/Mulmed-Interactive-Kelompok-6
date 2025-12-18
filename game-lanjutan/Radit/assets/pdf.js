(() => {
  // pdf.js worker
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
