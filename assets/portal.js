/* ==========================================================
   Producer side — sign-in, compliance, upload pipeline
   ========================================================== */
mountNav("portal.html");

const paintIcons = (root = document) =>
  $$("[data-i]", root).forEach((el) => {
    if (!el.firstChild) el.innerHTML = ICONS[el.dataset.i](el.classList.contains("drop-ico") ? 24 : 15);
  });
paintIcons();

const SESSION_KEY = "uncut-producer";
let session = null;
let uploads = [];
let pending = [];

const WELFARE = [
  ["complete", "Footage is complete and continuous", "No cuts, trims or re-ordering inside these files."],
  ["private", "Bathrooms, medical and welfare sessions excluded", "These are never filmed for the archive."],
  ["blur", "Non-consenting bystanders are blurred", "Crew and the public who didn't sign releases."],
  ["review", "Cast offered their 48-hour review window", "Contestants could flag safety or privacy concerns first."],
];

const checkSvg = ICONS.check(12).replace('stroke="currentColor"', 'stroke="#fff"');
const checkRow = (name, value, title, sub, required) => `
  <label class="check">
    <input type="checkbox" name="${name}" value="${esc(value)}" ${required ? "required" : ""} />
    <span class="box">${checkSvg}</span>
    <span>${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ""}</span>
  </label>`;

/* ---------- session ---------- */
function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(s) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* fine — session lives in memory for this visit */
  }
}

$("#studio").innerHTML = Object.entries(STUDIOS)
  .map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`)
  .join("");

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#uname").value.trim();
  if (!name) return $("#uname").focus();
  session = { studio: $("#studio").value, name };
  saveSession(session);
  showDash();
});

$("#signout").addEventListener("click", () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
  session = null;
  showLogin();
});

function showLogin() {
  $("#dash").classList.add("hidden");
  $("#login").classList.remove("hidden");
  observeReveals($("#login"));
}

/* ---------- dashboard ---------- */
const myShows = () => SHOWS.filter((s) => s.studio === session.studio);
const myUploads = () => uploads.filter((u) => u.studio === session.studio);

function showDash() {
  const st = STUDIOS[session.studio];
  $("#login").classList.add("hidden");
  $("#dash").classList.remove("hidden");
  $("#avatar").textContent = st.short;
  $("#studioName").textContent = st.name;
  $("#userName").textContent = "Signed in as " + session.name;

  $("#showSel").innerHTML = myShows()
    .map((s) => `<option value="${s.id}">${esc(s.title)} · S${s.season}</option>`)
    .join("");
  fillEpisodes();

  $("#flags").innerHTML = Object.entries(FLAG_INFO)
    .map(([k, v]) => checkRow("flag", k, k, v, false))
    .join("");
  $("#welfare").innerHTML = WELFARE.map(([k, t, s]) => checkRow("welfare", k, t, s, true)).join("");

  renderStats();
  observeReveals($("#dash"));
}

function fillEpisodes(keep) {
  const show = SHOWS.find((s) => s.id === $("#showSel").value);
  $("#epSel").innerHTML = show.episodes
    .map((ep) => {
      const ok = isArchived(show, ep, uploads);
      return `<option value="${ep.n}">E${ep.n} · ${esc(ep.title)} — ${ok ? "archived" : "overdue"}</option>`;
    })
    .join("");
  const firstDue = show.episodes.find((ep) => !isArchived(show, ep, uploads));
  $("#epSel").value = keep || (firstDue ? firstDue.n : show.episodes[0].n);
}

$("#showSel").addEventListener("change", () => fillEpisodes());

function renderStats() {
  const shows = myShows();
  const eps = shows.flatMap((s) => s.episodes.map((ep) => ({ s, ep })));
  const done = eps.filter(({ s, ep }) => isArchived(s, ep, uploads));
  const hours = done.reduce((t, { ep }) => t + ep.rawHours, 0);
  const overdue = eps.length - done.length;
  const mine = myUploads();

  const kpi = (label, v, d, dark, delay) => `
    <div class="kpi bezel reveal" data-d="${delay}">
      <div class="core ${dark ? "dark" : ""}">
        <div class="lbl">${label}</div>
        <div class="v">${v}</div>
        <div class="d">${d}</div>
      </div>
    </div>`;

  $("#kpis").innerHTML =
    kpi("Episodes aired", eps.length, `across ${shows.length} show${shows.length > 1 ? "s" : ""}`, false, 0) +
    kpi("Archived", done.length, `${Math.round((done.length / eps.length) * 100)}% compliant`, false, 1) +
    kpi("Overdue", overdue, overdue ? "past the 72-hour deadline" : "nothing outstanding", overdue > 0, 2) +
    kpi("Raw hours on record", hours.toLocaleString(), `${mine.length} file${mine.length === 1 ? "" : "s"} uploaded by your team`, false, 3);

  $("#compliance").innerHTML = shows
    .map((s) => {
      const n = s.episodes.filter((ep) => isArchived(s, ep, uploads)).length;
      const pct = Math.round((n / s.episodes.length) * 100);
      return `
      <div class="row">
        <div class="top"><span>${esc(s.title)} · S${s.season}</span><span class="mono">${n}/${s.episodes.length}</span></div>
        <div class="meter"><span class="${pct === 100 ? "ok" : ""}" style="width:${pct}%"></span></div>
      </div>`;
    })
    .join("");

  const seeded = shows.flatMap((s) =>
    s.episodes
      .filter((ep) => ep.archived)
      .map((ep) => ({
        name: `${s.title} S${s.season}E${ep.n} — all cameras (${ep.rawHours} h)`,
        meta: `sha256 ${pseudoHash(s.id + ep.n)} · auto-ingest`,
        tag: "Verified",
      }))
  );
  const live = mine.map((u) => {
    const s = SHOWS.find((x) => x.id === u.showId);
    return {
      name: `${s.title} S${s.season}E${u.episode} — ${u.fileName}`,
      meta: `${fmtBytes(u.size)} · ${fmtDate(u.uploadedAt)} · ${u.sha256.slice(0, 12)}…`,
      tag: "New",
    };
  });
  const rows = [...live, ...seeded].slice(0, 8);
  $("#log").innerHTML = rows.length
    ? rows
        .map(
          (r) => `
      <div class="log-item">
        <div><div class="n">${esc(r.name)}</div><div class="m">${esc(r.meta)}</div></div>
        <span class="chip ${r.tag === "New" ? "rose" : "sage"}">${r.tag}</span>
      </div>`
        )
        .join("")
    : `<div class="empty">No uploads yet.</div>`;

  observeReveals($("#kpis"));
}

function pseudoHash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0") + "…";
}

/* ---------- files ---------- */
const drop = $("#drop");
["dragenter", "dragover"].forEach((t) =>
  drop.addEventListener(t, (e) => {
    e.preventDefault();
    drop.classList.add("over");
  })
);
["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("over")));
drop.addEventListener("drop", (e) => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
});
$("#file").addEventListener("change", (e) => {
  addFiles(e.target.files);
  e.target.value = "";
});

function addFiles(list) {
  pending.push(...list);
  renderFiles();
}

function renderFiles() {
  $("#files").innerHTML = pending
    .map(
      (f, i) => `
    <div class="file">
      <span class="fi">${ICONS.film(16)}</span>
      <div><div class="n">${esc(f.name)}</div><div class="m">${fmtBytes(f.size)} · ${esc(f.type || "unknown type")}</div></div>
      <button type="button" class="rm" data-rm="${i}" aria-label="Remove ${esc(f.name)}">${ICONS.close(14)}</button>
    </div>`
    )
    .join("");
  validate();
}

$("#files").addEventListener("click", (e) => {
  const b = e.target.closest("[data-rm]");
  if (!b) return;
  pending.splice(+b.dataset.rm, 1);
  renderFiles();
});

/* ---------- validation + submit ---------- */
function validate() {
  const allWelfare = $$('input[name="welfare"]').every((c) => c.checked);
  $("#submit").disabled = !(pending.length && allWelfare);
}
$("#upForm").addEventListener("change", validate);

function setProgress(p, stage) {
  $("#pbar").style.transform = `scaleX(${p})`;
  $("#ppct").textContent = Math.round(p * 100) + "%";
  if (stage) $("#pstage").textContent = stage;
}

$("#upForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  validate();
  if ($("#submit").disabled) return;

  const btn = $("#submit");
  btn.disabled = true;
  $("#progress").classList.add("on");
  const flags = $$('input[name="flag"]:checked').map((c) => c.value);
  const showId = $("#showSel").value;
  const episode = +$("#epSel").value;
  const files = pending.slice();
  const recRaw = $("#rec").value;
  const recordedAt = recRaw ? new Date(recRaw).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const base = i / files.length;
      const slice = 1 / files.length;
      setProgress(base, `Fingerprinting ${f.name}…`);
      const { hex, partial } = await fingerprint(f);
      // chunked "transfer" so producers see steady progress, then the real write
      for (let c = 1; c <= 10; c++) {
        await new Promise((r) => setTimeout(r, 70));
        setProgress(base + slice * (0.15 + 0.75 * (c / 10)), `Uploading ${f.name}…`);
      }
      setProgress(base + slice * 0.95, "Sealing record…");
      await dbPut({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        studio: session.studio,
        uploader: session.name,
        showId,
        episode,
        camera: $("#cam").value.trim(),
        recordedAt,
        notes: $("#notes").value.trim(),
        flags,
        fileName: f.name,
        size: f.size,
        type: f.type,
        sha256: hex,
        partial,
        blob: f,
        uploadedAt: Date.now(),
      });
    }
    setProgress(1, "Archived and verified");
    uploads = await dbAll();
    pending = [];
    renderFiles();
    $$('input[type="checkbox"]', $("#upForm")).forEach((c) => (c.checked = false));
    $("#notes").value = "";
    fillEpisodes(String(episode));
    renderStats();
    toast(`${files.length} file${files.length > 1 ? "s" : ""} archived · now live in the viewer archive`);
  } catch (err) {
    console.error(err);
    $("#pstage").textContent = "Upload failed — the browser may be out of storage. Try a smaller file.";
  } finally {
    setTimeout(() => $("#progress").classList.remove("on"), 1800);
    validate();
  }
});

$("#reset").addEventListener("click", async () => {
  if (!confirm("Remove all demo uploads stored in this browser?")) return;
  await dbClear();
  uploads = [];
  if (session) {
    fillEpisodes();
    renderStats();
  }
  toast("Demo data cleared");
});

/* ---------- boot ---------- */
(async () => {
  uploads = await dbAll();
  session = loadSession();
  if (session && STUDIOS[session.studio]) showDash();
  else showLogin();
})();
