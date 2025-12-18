(() => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};
  const titleEl = document.getElementById("title");
  const descEl = document.getElementById("desc");
  const outEl = document.getElementById("out");

  function set(t, d, o) {
    if (t) titleEl.textContent = t;
    if (d) descEl.textContent = d;
    if (o) outEl.textContent = o;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    set("Config belum diisi", "Isi /assets/config.js (ROOT)", "Missing SUPABASE config.");
    return;
  }

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function getSlug() {
    const m = location.pathname.match(/\/s\/([^\/?#]+)/);
    return m ? decodeURIComponent(m[1]).toLowerCase() : null;
  }

  async function run() {
    const slug = getSlug();
    if (!slug) {
      set("Not found", "Format shortlink harus /s/<slug>", location.pathname);
      return;
    }

    set("Redirect…", "Mencari shortlink…", `Slug: ${slug}`);

    const { data, error } = await client
      .from("links")
      .select("url, expires_at")
      .eq("slug", slug)
      .limit(1);

    if (error) {
      set("Error", "Query Supabase gagal.", error.message);
      return;
    }

    const row = (data || [])[0];
    if (!row) {
      set("Not found", "Slug tidak ada di database.", `Slug: ${slug}`);
      return;
    }

    if (row.expires_at) {
      const exp = new Date(row.expires_at).getTime();
      if (!Number.isNaN(exp) && Date.now() > exp) {
        set("Expired", "Link ini sudah kadaluarsa.", `Expired at: ${row.expires_at}`);
        return;
      }
    }

    set("Redirect…", "Mengalihkan sekarang.", row.url);
    setTimeout(() => (location.href = row.url), 200);
  }

  run();
})();
