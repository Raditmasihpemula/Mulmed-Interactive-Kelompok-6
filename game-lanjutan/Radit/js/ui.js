// =====================
// UI / DIALOG MANAGER
// =====================
window.UI = (() => {
  const overlay = document.getElementById("overlay");
  const dlgTitle = document.getElementById("dlgTitle");
  const dlgDesc = document.getElementById("dlgDesc");
  const dlgButtons = document.getElementById("dlgButtons");
  const dlgHint = document.getElementById("dlgHint");
  const dlgPhoneTitle = document.getElementById("dlgPhoneTitle");
  const dlgPhoneBody = document.getElementById("dlgPhoneBody");

  function hide() {
    overlay.classList.add("hidden");
    dlgButtons.innerHTML = "";
    dlgPhoneBody.innerHTML = "";
  }

  function show({ phoneTitle="HP", title, desc, hint="", chat=[] , buttons=[] }) {
    dlgPhoneTitle.textContent = phoneTitle;
    dlgTitle.textContent = title;
    dlgDesc.textContent = desc;
    dlgHint.textContent = hint;

    dlgButtons.innerHTML = "";
    dlgPhoneBody.innerHTML = "";

    // chat array: {who:"me"|"them", text:"..."}
    for (const c of chat) {
      const div = document.createElement("div");
      div.className = c.who === "me" ? "chatMe" : "chatThem";
      div.textContent = c.text;
      dlgPhoneBody.appendChild(div);
    }

    // buttons: {label, cls, onClick}
    for (const b of buttons) {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      if (b.cls) btn.classList.add(b.cls);
      btn.addEventListener("click", b.onClick);
      dlgButtons.appendChild(btn);
    }

    overlay.classList.remove("hidden");
  }

  return { show, hide };
})();
