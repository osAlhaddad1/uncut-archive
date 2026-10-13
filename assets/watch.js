/* ==========================================================
   Viewer side — archive browsing, scene compare, reflection
   ========================================================== */
mountNav("watch.html");
$$("[data-i]").forEach((el) => (el.innerHTML = ICONS[el.dataset.i](16)));

let uploads = [];
let service = "All";
let query = "";
let simTimers = [];
const objectUrls = [];

const services = ["All", ...new Set(SHOWS.map((s) => s.service))];

/* ---------- toolbar ---------- */
function renderServices() {
  $("#svc").innerHTML = services
    .map((s) => `<button role="tab" aria-selected="${s === service}" class="${s === service ? "on" : ""}" data-s="${s}">${s}</button>`)
    .join("");
}

$("#svc").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  service = b.dataset.s;
  renderServices();
  renderShows();
});

$("#q").addEventListener("input", (e) => {
  query = e.target.value.trim().toLowerCase();
  renderShows();
});

/* ---------- show grid ---------- */
function showStats(show) {
  const archived = show.episodes.filter((ep) => isArchived(show, ep, uploads)).length;
  const hours = show.episodes.reduce((t, ep) => t + (isArchived(show, ep, uploads) ? ep.rawHours : 0), 0);
  return { archived, hours };
}

function renderShows() {
  const list = SHOWS.filter(
    (s) =>
      (service === "All" || s.service === service) &&
      (!query || [s.title, s.tagline, s.service, ...s.cast].join(" ").toLowerCase().includes(query))
  );
  $("#noshows").classList.toggle("hidden", list.length > 0);
  $("#shows").innerHTML = list
    .map((s, i) => {
      const st = showStats(s);
      const wide = s.featured && service === "All" && !query;
      return `
      <button class="show bezel reveal ${wide ? "wide" : ""}" data-d="${i % 3}" data-show="${s.id}" aria-label="Open ${esc(s.title)}">
        <div class="core">
          <div class="poster" style="${posterArt(s)}"></div>
          <div class="poster-body">
            <div class="svc"><span>${esc(s.service)}</span><span>Season ${s.season}</span></div>
            <div class="poster-title">${esc(s.title)}</div>
            ${wide ? `<div class="poster-sub">${esc(s.tagline)}</div>` : ""}
            <div class="poster-stats">
              <span class="chip">${st.archived}/${s.episodes.length} episodes uncut</span>
              <span class="chip">${st.hours.toLocaleString()} h raw</span>
            </div>
          </div>
        </div>
      </button>`;
    })
    .join("");
  observeReveals($("#shows"));
}

$("#shows").addEventListener("click", (e) => {
  const b = e.target.closest("[data-show]");
  if (b) openShow(b.dataset.show);
});

/* ---------- glossary ---------- */
$("#glossary").className = "gloss";
$("#glossary").innerHTML = Object.entries(FLAG_INFO)
  .map(
    ([k, v]) => `
    <div class="gloss-item">
      <span class="chip rose">${esc(k)}</span>
      <p>${esc(v)}</p>
    </div>`
  )
  .join("");

/* ---------- show sheet ---------- */
let currentShow = null;

function openShow(id, push = true) {
  const show = SHOWS.find((s) => s.id === id);
  if (!show) return;
  currentShow = show;
  if (push) history.replaceState(null, "", "#" + id);
  const studio = STUDIOS[show.studio];

  const eps = show.episodes
    .map((ep) => {
      const ok = isArchived(show, ep, uploads);
      const pct = ((ep.airedMin / (ep.rawHours * 60)) * 100).toFixed(2);
      const scenes = ep.scenes.map((k, i) => sceneFor(show, k, i, ep));
      const ups = uploads.filter((u) => u.showId === show.id && u.episode === ep.n);
      return `
      <div class="ep bezel">
        <div class="core">
          <div class="ep-head">
            <div>
              <div class="mono" style="margin-bottom:6px">EPISODE ${ep.n} · ${ep.airedMin} MIN AIRED · ${ep.rawHours} H FILMED</div>
              <h4>${esc(ep.title)}</h4>
            </div>
            ${
              ok
                ? `<span class="chip sage">${ICONS.shield(13)} Uncut available</span>`
                : `<span class="chip rose">${ICONS.clock(13)} Footage due · 72 h rule</span>`
            }
          </div>
          <div class="mini-ratio" title="${pct}% of filmed footage aired"><span style="width:${Math.max(pct, 0.6)}%"></span></div>
          <div class="mono" style="color:var(--muted)">${pct}% aired · ${(100 - pct).toFixed(2)}% only in the archive</div>
          <div class="scenes">
            ${
              ok
                ? scenes
                    .map(
                      (sc) => `
              <button class="scene" data-scene="${sc.id}" data-ep="${ep.n}">
                <span class="tc">${sc.airedAt}</span>
                <span>
                  <span class="t">${esc(sc.title)}</span>
                  <span class="flags">${sc.flags.map((f) => `<span class="chip" title="${esc(FLAG_INFO[f])}">${esc(f)}</span>`).join("")}</span>
                </span>
                <span class="play-dot">${ICONS.play(14)}</span>
              </button>`
                    )
                    .join("")
                : `<div class="empty">${esc(studio.name)} hasn't archived this episode yet. Scene links appear as soon as the raw footage is uploaded.</div>`
            }
            ${ups
              .map(
                (u) => `
              <button class="scene" data-upload="${u.id}">
                <span class="tc">RAW</span>
                <span>
                  <span class="t">${esc(u.camera || "Raw footage")} — ${esc(u.fileName)}</span>
                  <span class="flags">
                    <span class="chip dark">Producer upload</span>
                    ${(u.flags || []).map((f) => `<span class="chip" title="${esc(FLAG_INFO[f] || "")}">${esc(f)}</span>`).join("")}
                  </span>
                </span>
                <span class="play-dot">${ICONS.play(14)}</span>
              </button>`
              )
              .join("")}
          </div>
        </div>
      </div>`;
    })
    .join("");

  $("#sheetScroll").innerHTML = `
    <div class="sheet-hero" style="${posterArt(show)}">
      <div class="poster" style="${posterArt(show)}"></div>
      <button class="close-x" id="sheetClose" aria-label="Close">${ICONS.close(18)}</button>
      <div class="poster-body" style="position:relative;padding:0;min-height:250px">
        <div class="svc"><span>${esc(show.service)} · Season ${show.season}</span></div>
        <div class="poster-title" id="sheetTitle">${esc(show.title)}</div>
        <div class="poster-sub">${esc(show.tagline)}</div>
        <div class="poster-stats"><span class="chip">Produced by ${esc(studio.name)}</span><span class="chip">Cast: ${show.cast.map(esc).join(", ")}</span></div>
      </div>
    </div>
    <div class="sheet-body">${eps}</div>`;

  $("#sheetScroll").scrollTop = 0;
  document.body.classList.add("sheet-open");
  $("#sheetClose").focus({ preventScroll: true });
}

function closeShow() {
  document.body.classList.remove("sheet-open");
  history.replaceState(null, "", location.pathname);
}

$("#sheetBack").addEventListener("click", closeShow);
$("#sheetScroll").addEventListener("click", (e) => {
  if (e.target.closest("#sheetClose")) return closeShow();
  const sc = e.target.closest("[data-scene]");
  if (sc) {
    const ep = currentShow.episodes.find((x) => x.n === +sc.dataset.ep);
    const idx = ep.scenes.findIndex((k) => sc.dataset.scene.endsWith("-" + k));
    return openScene(currentShow, ep, sceneFor(currentShow, ep.scenes[idx], idx, ep));
  }
  const up = e.target.closest("[data-upload]");
  if (up) openUpload(uploads.find((u) => u.id === up.dataset.upload));
});

/* ---------- scene viewer ---------- */
function simScreen(show, kind, lines, sc) {
  const raw = kind === "raw";
  return `
    <div class="screen-shell">
      <div class="screen">
        <div class="sim" data-sim="${kind}">
          <div class="poster" style="${posterArt(show)}${raw ? "filter:saturate(.45) brightness(.8);" : ""}"></div>
          <div class="silhouettes"><span></span><span></span></div>
          ${raw ? `<div class="cam">${esc(sc.cam)}</div>` : `<div class="cam" style="opacity:.0"></div>`}
          ${raw ? "" : `<div class="music">♪ score added</div>`}
          <div class="sub"></div>
          <div class="tcode">${raw ? sc.rawAt : "EP " + sc.ep + " · " + sc.airedAt}</div>
        </div>
      </div>
      <div class="screen-label">
        <span><b>${raw ? "Raw source" : "As aired"}</b> · ${raw ? "unedited, continuous" : "edited for broadcast"}</span>
        <span class="mono">${raw ? lines.length + " lines" : lines.length + " line" + (lines.length > 1 ? "s" : "")}</span>
      </div>
    </div>`;
}

function runSubs(root, lines) {
  const el = root.querySelector(".sub");
  const tc = root.querySelector(".tcode");
  let i = 0;
  let sec = 0;
  const base = tc.textContent;
  const show = () => {
    const [w, t] = lines[i % lines.length];
    el.style.opacity = 0;
    setTimeout(() => {
      el.innerHTML = w ? `<b>${esc(w)}:</b> ${esc(t)}` : `<i>${esc(t)}</i>`;
      el.style.opacity = 1;
    }, 250);
    i++;
  };
  show();
  simTimers.push(setInterval(show, 3200));
  simTimers.push(
    setInterval(() => {
      sec++;
      tc.textContent = `${base} +${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    }, 1000)
  );
}

function openScene(show, ep, sc) {
  sc.ep = ep.n;
  const subject = sc.raw.find(([w]) => show.cast.includes(w))?.[0] || show.cast[0];
  $("#viewerInner").innerHTML = `
    <div class="viewer-top">
      <div>
        <div class="mono" style="color:rgba(251,247,242,.5);margin-bottom:8px">${esc(show.title.toUpperCase())} · S${show.season} E${ep.n} · ${esc(ep.title.toUpperCase())}</div>
        <h3 id="viewerTitle">${esc(sc.title)}</h3>
      </div>
      <button class="close-x" id="viewerClose" aria-label="Close">${ICONS.close(18)}</button>
    </div>
    <div class="compare">
      ${simScreen(show, "aired", sc.aired, sc)}
      ${simScreen(show, "raw", sc.raw, sc)}
    </div>
    <div class="transcripts">
      <div class="tx">
        <h5>Aired transcript</h5>
        ${sc.aired.map(([w, t]) => `<p>${w ? `<span class="who">${esc(w)}</span>` : ""}${w ? esc(t) : `<i>${esc(t)}</i>`}</p>`).join("")}
      </div>
      <div class="tx">
        <h5>Raw transcript · ${esc(sc.cam)}</h5>
        ${sc.raw
          .map(
            ([w, t, a]) =>
              `<p class="${a === 0 ? "cut" : a === 2 ? "moved" : ""}">${w ? `<span class="who">${esc(w)}</span>` : ""}${w ? esc(t) : `<i>${esc(t)}</i>`}</p>`
          )
          .join("")}
      </div>
    </div>
    <div class="disclose">
      <span class="chip rose" style="padding:10px">${ICONS.scissors(18)}</span>
      <div>
        <h5>Producer's edit disclosure</h5>
        <p style="margin-bottom:12px">${esc(sc.note)}</p>
        <div style="display:grid;gap:8px">
          ${sc.flags.map((f) => `<p><b style="color:var(--cream);font-weight:500">${esc(f)}</b> — ${esc(FLAG_INFO[f])}</p>`).join("")}
        </div>
      </div>
    </div>
    <div class="reflect">
      <h5>Quick check-in</h5>
      <p>Having seen the raw footage, how do you feel about ${esc(subject)} now?</p>
      <div class="scale" data-q="feel">
        <button data-v="more">More sympathetic</button>
        <button data-v="same">About the same</button>
        <button data-v="less">Less sympathetic</button>
      </div>
      <p style="margin:18px 0 10px">Did you notice this was edited before you saw the source?</p>
      <div class="scale" data-q="noticed">
        <button data-v="yes">Yes, I suspected it</button>
        <button data-v="no">No, I believed it</button>
      </div>
      <div class="thanks" aria-live="polite"></div>
    </div>`;

  stopSims();
  document.body.classList.add("viewer-open");
  runSubs($('[data-sim="aired"]'), sc.aired);
  runSubs($('[data-sim="raw"]'), sc.raw);
  $("#viewerClose").focus({ preventScroll: true });

  const answers = {};
  $$(".scale", $("#viewerInner")).forEach((g) =>
    g.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", g).forEach((x) => x.classList.toggle("on", x === b));
      answers[g.dataset.q] = b.dataset.v;
      saveReflection(sc.id, answers);
      if (answers.feel && answers.noticed) {
        $(".thanks").textContent =
          answers.noticed === "no"
            ? "That's exactly how editing works: it's built not to be noticed. Next time a scene makes you angry at someone, check the source first."
            : "Good eye. Every scene you check makes the next edit easier to spot.";
      }
    })
  );
}

function saveReflection(id, a) {
  try {
    const all = JSON.parse(localStorage.getItem("uncut-reflections") || "{}");
    all[id] = { ...a, at: Date.now() };
    localStorage.setItem("uncut-reflections", JSON.stringify(all));
  } catch {
    /* storage unavailable — reflection still works for this view */
  }
}

function openUpload(u) {
  if (!u) return;
  const show = SHOWS.find((s) => s.id === u.showId);
  const url = u.blob ? URL.createObjectURL(u.blob) : null;
  if (url) objectUrls.push(url);
  const isVideo = u.type?.startsWith("video/");
  const isImage = u.type?.startsWith("image/");
  $("#viewerInner").innerHTML = `
    <div class="viewer-top">
      <div>
        <div class="mono" style="color:rgba(251,247,242,.5);margin-bottom:8px">${esc(show.title.toUpperCase())} · S${show.season} E${u.episode} · PRODUCER UPLOAD</div>
        <h3 id="viewerTitle">${esc(u.camera || "Raw footage")}</h3>
      </div>
      <button class="close-x" id="viewerClose" aria-label="Close">${ICONS.close(18)}</button>
    </div>
    <div class="compare solo">
      <div class="screen-shell">
        <div class="screen">
          ${
            isVideo && url
              ? `<video src="${url}" controls playsinline></video>`
              : isImage && url
              ? `<img src="${url}" alt="Uploaded still" style="width:100%;height:100%;object-fit:contain;background:#000">`
              : `<div class="sim"><div class="poster" style="${posterArt(show)}filter:saturate(.4) brightness(.6)"></div><div class="sub" style="bottom:45%">${esc(u.fileName)}<br><span class="mono">${fmtBytes(u.size)} · preview not available for this format</span></div></div>`
          }
        </div>
        <div class="screen-label">
          <span><b>${esc(u.fileName)}</b> · ${fmtBytes(u.size)} · uploaded ${fmtDate(u.uploadedAt)}</span>
          <span class="mono">${esc(STUDIOS[u.studio]?.name || "")}</span>
        </div>
      </div>
    </div>
    <div class="disclose">
      <span class="chip sage" style="padding:10px">${ICONS.shield(18)}</span>
      <div>
        <h5>Verified source</h5>
        <p>Recorded ${esc(u.recordedAt || "—")} · SHA-256 ${u.partial ? "(first 32 MB + size)" : ""}</p>
        <p class="mono" style="word-break:break-all;margin-top:6px">${esc(u.sha256)}</p>
        ${u.notes ? `<p style="margin-top:12px">${esc(u.notes)}</p>` : ""}
        ${
          (u.flags || []).length
            ? `<div style="display:grid;gap:8px;margin-top:12px">${u.flags
                .map((f) => `<p><b style="color:var(--cream);font-weight:500">${esc(f)}</b> — ${esc(FLAG_INFO[f] || "")}</p>`)
                .join("")}</div>`
            : ""
        }
      </div>
    </div>`;
  stopSims();
  document.body.classList.add("viewer-open");
  $("#viewerClose").focus({ preventScroll: true });
}

function stopSims() {
  simTimers.forEach(clearInterval);
  simTimers = [];
}

function closeViewer() {
  stopSims();
  $$("video", $("#viewer")).forEach((v) => v.pause());
  document.body.classList.remove("viewer-open");
  objectUrls.splice(0).forEach((u) => URL.revokeObjectURL(u));
}

$("#viewer").addEventListener("click", (e) => {
  if (e.target.id === "viewer" || e.target.closest("#viewerClose")) closeViewer();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (document.body.classList.contains("viewer-open")) closeViewer();
  else if (document.body.classList.contains("sheet-open")) closeShow();
  else document.body.classList.remove("menu-open");
});

/* ---------- boot ---------- */
(async () => {
  uploads = await dbAll();
  renderServices();
  renderShows();
  observeReveals();
  const hash = location.hash.slice(1);
  if (hash) openShow(hash, false);
})();
