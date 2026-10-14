/* ==========================================================
   UNCUT — app
   ========================================================== */

const state = {
  linked: store.get("linked", []),
  studio: store.get("studio", "golden"),
  takes: store.get("takes", {}),
  uploads: [],
  pending: [],
  timers: [],
  urls: [],
};

const LOGO = `<svg class="logo" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="9" r="4" fill="currentColor"/></svg>`;
const serviceIcon = (s) => `<span class="svc-ico" aria-hidden="true">${esc(s.name[0])}</span>`;

const app = $("#app");
const side = $("#side");
const main = $("#main");

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function toast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.append(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("on"));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("on"), 2800);
}

/* ---------- routing ---------- */
function route() {
  const [name = "", a, b, c] = location.hash.replace(/^#\/?/, "").split("/");
  return { name: name || (state.linked.length ? "library" : "connect"), a, b: b && +b, c: c && +c };
}

const myShows = () => SHOWS.filter((s) => state.linked.includes(s.service));
const showById = (id) => SHOWS.find((s) => s.id === id);

function render() {
  state.timers.forEach(clearInterval);
  state.timers = [];
  state.urls.splice(0).forEach((u) => URL.revokeObjectURL(u));

  const r = route();
  const open = ["connect", "producer", "about"];
  if (!open.includes(r.name) && !state.linked.length) return go("#/connect");

  app.classList.toggle("bare", r.name === "connect");
  side.classList.remove("open");
  const pages = { connect, library, show: showPage, scene: scenePage, upload: uploadPage, raw: rawPage, about, producer };
  (pages[r.name] || library)(r);
  renderSide(r);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);

/* ---------- sidebar ---------- */
function renderSide(r) {
  if (r.name === "connect") return (side.innerHTML = "");
  const link = (href, label, on, cls = "") => `<a class="link ${cls} ${on ? "on" : ""}" href="${href}">${esc(label)}</a>`;
  const top = `<a class="word" href="#/library">${LOGO}uncut</a><button class="menu-btn" id="menuBtn">Menu</button>`;

  if (r.name === "producer") {
    side.innerHTML = `${top}
      <div class="group">
        <div class="group-h">Signed in as</div>
        <select class="in" id="studioSel" aria-label="Production company">${Object.entries(STUDIOS)
          .map(([k, v]) => `<option value="${k}" ${k === state.studio ? "selected" : ""}>${esc(v)}</option>`)
          .join("")}</select>
      </div>
      <div class="group">
        <div class="group-h">Your shows</div>
        ${SHOWS.filter((s) => s.studio === state.studio)
          .map((s) => `<div class="link">${esc(s.title)}</div>`)
          .join("")}
      </div>
      <div class="side-foot group">
        ${link("#/library", "Back to watching", false)}
        <button class="link muted" id="clearDemo">Clear demo uploads</button>
      </div>`;
    $("#studioSel").addEventListener("change", (e) => {
      state.studio = e.target.value;
      store.set("studio", state.studio);
      render();
    });
    $("#clearDemo").addEventListener("click", async () => {
      if (!confirm("Remove all demo uploads stored in this browser?")) return;
      await dbClear();
      state.uploads = [];
      render();
      toast("Demo uploads cleared");
    });
  } else {
    side.innerHTML = `${top}
      <div class="group">
        ${link("#/library", "Library", r.name === "library")}
        ${link("#/about", "About", r.name === "about")}
      </div>
      <div class="group">
        <div class="group-h">Shows</div>
        ${myShows()
          .map((s) => {
            const here = r.a === s.id && ["show", "scene", "raw"].includes(r.name);
            let html = link("#/show/" + s.id, s.title, here && r.name === "show" && !Number.isInteger(r.b));
            if (here)
              html += s.episodes.map((ep, ei) => link(`#/show/${s.id}/${ei}`, ep.title, r.b === ei, "sub")).join("");
            return html;
          })
          .join("")}
      </div>
      <div class="side-foot group">${link("#/producer", "Producer mode", false)}</div>`;
  }
  $("#menuBtn").addEventListener("click", () => {
    side.classList.toggle("open");
    $("#menuBtn").textContent = side.classList.contains("open") ? "Close" : "Menu";
  });
}

/* ---------- shared ---------- */
const share = (ep) => (ep.airedMin / (ep.rawHours * 60)) * 100;

const sceneCover = (show, ei, si) => {
  const sc = sceneFor(show, ei, si);
  return `
    <a class="cov" href="#/scene/${show.id}/${ei}/${si}">
      <div class="art wide grain" style="${cover(show, si + 2)}"><p class="l">${esc(sc.title)}</p></div>
      <div class="cap"><p>${esc(show.title)}</p><p class="muted">${esc(sc.edits.join(", "))}</p></div>
    </a>`;
};

/* ==========================================================
   CONNECT (mockup)
   ========================================================== */
function connect() {
  main.innerHTML = `
    <div class="connect">
      <div class="connect-art grain">
        <p class="word" style="padding:0">${LOGO}uncut</p>
        <div>
          <h1 class="l">Reality TV is edited.<br>See what they cut.</h1>
          <p>Link your streaming apps. Every dating show you watch comes with its raw footage.</p>
        </div>
        <p>A student prototype</p>
      </div>
      <div class="connect-list">
        <h2 class="l">Link your apps</h2>
        <div class="list">
          ${SERVICES.map((s) => {
            const on = state.linked.includes(s.id);
            return `<div class="item"><span class="svc">${serviceIcon(s)}${esc(s.name)}</span>
              <button class="btn ${on ? "done" : "soft"}" data-link="${s.id}">${on ? "Linked" : "Link"}</button></div>`;
          }).join("")}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" id="openLib" ${state.linked.length ? "" : "disabled"}>Open library</button>
          <button class="btn soft" id="linkAll">Link all</button>
        </div>
        <p class="muted" style="margin-top:24px">Mockup only. Nothing is actually linked and no login is asked for.</p>
      </div>
    </div>`;

  const save = () => {
    store.set("linked", state.linked);
    $("#openLib").disabled = !state.linked.length;
  };

  const link = (btn, fast) => {
    const id = btn.dataset.link;
    if (state.linked.includes(id)) {
      state.linked = state.linked.filter((x) => x !== id);
      btn.className = "btn soft";
      btn.textContent = "Link";
      return save();
    }
    btn.className = "btn";
    btn.textContent = "Linking…";
    setTimeout(() => {
      if (!state.linked.includes(id)) state.linked.push(id);
      btn.className = "btn done";
      btn.textContent = "Linked";
      save();
    }, fast ? 350 : 900 + Math.random() * 500);
  };

  $$("[data-link]").forEach((b) => b.addEventListener("click", () => link(b)));
  $("#linkAll").addEventListener("click", () =>
    $$("[data-link]").forEach((b, i) => !state.linked.includes(b.dataset.link) && setTimeout(() => link(b, true), i * 150))
  );
  $("#openLib").addEventListener("click", () => go("#/library"));
}

/* ==========================================================
   LIBRARY
   ========================================================== */
function library() {
  const shows = myShows();
  const feat = shows[0];
  const featShare = feat.episodes.reduce((t, e) => t + share(e), 0) / feat.episodes.length;
  const names = state.linked.map(serviceName);
  const from = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names.at(-1) : names[0];

  main.innerHTML = `
    <div class="page">
      <div class="head">
        <div><h1 class="l">Library</h1><p class="muted">From ${esc(from)}</p></div>
        <a class="btn soft" href="#/connect">Link apps</a>
      </div>

      <a class="hero grain" href="#/show/${feat.id}" style="${cover(feat)}">
        <p>${esc(serviceName(feat.service))}</p>
        <h2 class="l">${esc(feat.title)}</h2>
        <p>You saw ${featShare.toFixed(2)}% of what was filmed.</p>
        <span class="btn white">Watch uncut</span>
      </a>

      <div class="sec">
        <div class="sec-h">Your shows</div>
        <div class="covers">
          ${shows
            .map(
              (s) => `
            <a class="cov" href="#/show/${s.id}">
              <div class="art grain" style="${cover(s)}"><p class="l">${esc(s.title)}</p></div>
              <div class="cap"><p class="muted">${esc(serviceName(s.service))}</p></div>
            </a>`
            )
            .join("")}
        </div>
      </div>

      <div class="sec">
        <div class="sec-h">Aired vs real</div>
        <div class="covers wide">
          ${shows.slice(0, 6).map((s) => sceneCover(s, 0, s.episodes[0].scenes.length - 1)).join("")}
        </div>
      </div>
    </div>`;
}

/* ==========================================================
   SHOW
   ========================================================== */
function showPage(r) {
  const show = showById(r.a);
  if (!show || !state.linked.includes(show.service)) return go("#/library");
  const firstOpen = show.episodes.findIndex((_, i) => isArchived(show, i, state.uploads));
  const ei = Number.isInteger(r.b) && show.episodes[r.b] ? r.b : Math.max(firstOpen, 0);
  const ep = show.episodes[ei];
  const ok = isArchived(show, ei, state.uploads);
  const ups = state.uploads.filter((u) => u.showId === show.id && u.episode === ei);

  main.innerHTML = `
    <div class="page">
      <div class="hero grain" style="${cover(show)}">
        <p>${esc(serviceName(show.service))}</p>
        <h1 class="l">${esc(show.title)}</h1>
        <p>${esc(show.tagline)}</p>
      </div>

      <div class="sec">
        <div class="sec-h">Episodes</div>
        <div class="list">
          ${show.episodes
            .map((e, i) => {
              const a = isArchived(show, i, state.uploads);
              return `<a class="item ${i === ei ? "on" : ""}" href="#/show/${show.id}/${i}">
                <span>${esc(e.title)}</span>
                <span style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
                  <span class="meta">${e.airedMin} min aired of ${e.rawHours} h filmed</span>
                  <span class="tag ${a ? "red" : ""}">${a ? "Uncut" : "Due"}</span>
                </span></a>`;
            })
            .join("")}
        </div>
      </div>

      <div class="sec">
        <div class="sec-h">${esc(ep.title)}</div>
        ${
          ok
            ? `<a class="hero grain raw-ep" href="#/raw/${show.id}/${ei}" style="${cover(show, 1)}">
              <p class="muted-w">Every camera, every hour</p>
              <h2 class="l">Watch the whole episode raw</h2>
              <p>${ep.rawHours} hours filmed. ${ep.airedMin} minutes aired.</p>
            </a>
            <div class="sec-h" style="margin-top:40px">Scenes that look nothing like real life</div>
            <div class="covers wide">
            ${ep.scenes.map((_, si) => sceneCover(show, ei, si)).join("")}
            ${ups
              .map(
                (u) => `<a class="cov" href="#/upload/${u.id}">
                <div class="art wide grain" style="${cover(show, 3)};filter:grayscale(.6)"><p class="l">Raw footage</p></div>
                <div class="cap"><p>${esc(u.camera || u.fileName)}</p><p class="muted">Uploaded by the producer</p></div></a>`
              )
              .join("")}
          </div>`
            : `<p class="muted">The producer hasn't uploaded this episode yet. They have 72 hours after it airs.</p>`
        }
      </div>
    </div>`;
}

/* ==========================================================
   SCENE
   ========================================================== */
function scenePage(r) {
  const show = showById(r.a);
  const ep = show?.episodes[r.b];
  if (!ep || ep.scenes[r.c] === undefined || !state.linked.includes(show.service)) return go("#/library");
  const sc = sceneFor(show, r.b, r.c);
  const nextHref = ep.scenes[r.c + 1] !== undefined ? `#/scene/${show.id}/${r.b}/${r.c + 1}` : null;

  /* each raw line takes time relative to its length */
  let T = 0;
  const raw = sc.raw.map(([w, t, a]) => {
    const d = Math.max(2.4, t.length * 0.055);
    const seg = { w, t, a, s: T, d };
    T += d;
    return seg;
  });
  let A = 0;
  const aired = [...raw.filter((x) => x.a === 1), ...raw.filter((x) => x.a === 2)].map((x) => {
    const seg = { ...x, s: A };
    A += x.d;
    return seg;
  });
  const seg = (x, kind) =>
    `<div class="seg ${kind}" style="left:${(x.s / T) * 100}%;width:calc(${(x.d / T) * 100}% - 2px)" title="${esc((x.w ? x.w + ": " : "") + x.t)}"></div>`;

  const take = state.takes[sc.id] || {};
  const choice = (q, v, label) => `<button class="choice ${take[q] === v ? "on" : ""}" data-q="${q}" data-v="${v}">${label}</button>`;

  main.innerHTML = `
    <div class="page">
      <div class="head">
        <div><p class="muted">${esc(show.title)} · ${esc(ep.title)}</p><h1 class="l">${esc(sc.title)}</h1></div>
        <a class="btn soft" href="${nextHref || `#/show/${show.id}/${r.b}`}">${nextHref ? "Next scene" : "Back to episode"}</a>
      </div>

      <div class="compare" id="screens">
        <div>
          <div class="screen grain" id="airedScreen"><div class="fill" style="${cover(show)}"></div><div class="sub" id="airedSub"></div></div>
          <div class="screen-cap"><span>As aired</span><span class="muted">${esc(serviceName(show.service))}</span></div>
        </div>
        <div>
          <div class="screen raw grain"><div class="fill" style="${cover(show)}"></div><div class="corner"><span class="dot"></span>Raw</div><div class="sub" id="rawSub"></div></div>
          <div class="screen-cap"><span>Raw footage</span><span class="muted">${esc(sc.cam)}</span></div>
        </div>
      </div>

      <div class="player">
        <button class="play" id="play">Pause</button>
        <div class="track" id="track"><span id="prog" style="width:0"></span></div>
        <span class="time" id="clock"></span>
      </div>

      <div class="sec">
        <div class="sec-h">Timeline</div>
        <div class="lanes">
          <div class="lane-row"><span class="muted">Filmed</span><div class="lane">${raw.map((x) => seg(x, ["cut", "kept", "moved"][x.a])).join("")}<div class="head-line" id="h1"></div></div></div>
          <div class="lane-row"><span class="muted">Aired</span><div class="lane">${aired.map((x) => seg(x, x.a === 2 ? "moved" : "kept")).join("")}<div class="head-line" id="h2"></div></div></div>
        </div>
        <div class="key">
          <span><i style="background:var(--red)"></i>Aired</span>
          <span><i style="background:repeating-linear-gradient(-45deg,#fde6e6 0 3px,#f8cfcf 3px 6px)"></i>Cut</span>
        </div>
      </div>

      <div class="sec cols">
        <div>
          <div class="sec-h">What changed</div>
          <p>${esc(sc.note)}</p>
          <div class="list" style="margin-top:16px">
            ${sc.edits.map((e) => `<div class="item" style="display:block"><p>${esc(e)}</p><p class="muted">${esc(EDITS[e])}</p></div>`).join("")}
          </div>
        </div>
        <div>
          <div class="sec-h">Everything that was said</div>
          <div class="lines">
            ${sc.raw
              .map(
                ([w, t, a]) => `<div class="line ${["cut", "", "moved"][a]}">
                ${w ? `<span class="who">${esc(w)}</span> ${esc(t)}` : `<span class="muted">${esc(t)}</span>`}
                ${a === 0 ? `<span class="why">cut</span>` : a === 2 ? `<span class="why">moved</span>` : ""}</div>`
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="sec">
        <div class="sec-h">Your take</div>
        <p>Did the aired version look real to you?</p>
        <div class="choices">${choice("saw", "no", "Yes, totally")}${choice("saw", "yes", "Not really")}</div>
        <p>Does your own dating life feel more normal now?</p>
        <div class="choices">${choice("feel", "more", "Yes")}${choice("feel", "same", "A bit")}${choice("feel", "less", "No")}</div>
        <p class="red" id="takeMsg">${takeMsg(take)}</p>
      </div>
    </div>`;

  $$("[data-q]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = (state.takes[sc.id] = { ...state.takes[sc.id], [b.dataset.q]: b.dataset.v });
      store.set("takes", state.takes);
      $$(`[data-q="${b.dataset.q}"]`).forEach((x) => x.classList.toggle("on", x === b));
      $("#takeMsg").textContent = takeMsg(t);
    })
  );

  /* playback simulation */
  let t = 0;
  let playing = true;
  let lastR, lastA;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const sub = (w, x) => (w ? `${esc(w)}: ${esc(x)}` : `<span style="opacity:.8">${esc(x)}</span>`);
  const paint = () => {
    const rl = raw.find((x) => t >= x.s && t < x.s + x.d);
    if (rl !== lastR) {
      $("#rawSub").innerHTML = rl ? sub(rl.w, rl.t) : "";
      lastR = rl;
    }
    const ai = t >= A ? -1 : Math.min(sc.aired.length - 1, Math.floor((t / A) * sc.aired.length));
    if (ai !== lastA) {
      $("#airedSub").innerHTML = ai < 0 ? `<span style="opacity:.8">The aired scene is over</span>` : sub(...sc.aired[ai]);
      $("#airedScreen .fill").style.opacity = ai < 0 ? 0.35 : 1;
      lastA = ai;
    }
    $("#prog").style.width = (t / T) * 100 + "%";
    $("#h1").style.left = (t / T) * 100 + "%";
    $("#h2").style.left = (Math.min(t, A) / T) * 100 + "%";
    $("#clock").textContent = `${fmt(t)} / ${fmt(T)}`;
  };
  paint();
  state.timers.push(
    setInterval(() => {
      if (!playing) return;
      t = (t + 0.1) % T;
      paint();
    }, 100)
  );
  $("#play").addEventListener("click", () => {
    playing = !playing;
    $("#play").textContent = playing ? "Pause" : "Play";
    $("#screens").classList.toggle("paused", !playing);
  });
  $("#track").addEventListener("click", (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    t = ((e.clientX - b.left) / b.width) * T;
    paint();
  });
}

function takeMsg(t) {
  if (!t.feel || !t.saw) return "";
  return t.saw === "no"
    ? "It's made to look real. Real life is slower and more boring, and that's normal."
    : "Good eye. Real relationships don't come with a soundtrack.";
}

/* ==========================================================
   WHOLE EPISODE, RAW
   ========================================================== */
function rawPage(r) {
  const show = showById(r.a);
  const ei = r.b;
  const ep = show?.episodes[ei];
  if (!ep || !isArchived(show, ei, state.uploads) || !state.linked.includes(show.service)) return go("#/library");
  const cams = Object.keys(CAMERAS);
  const DAY = 24 * 60; // minutes
  const START = 8 * 60;
  /* where the aired scenes were filmed, spread across the day */
  const marks = ep.scenes
    .map((_, si) => ({ si, m: (START + 90 + si * 420 + ei * 37) % DAY, sc: sceneFor(show, ei, si) }))
    .sort((a, b) => a.m - b.m);
  let cam = 0;
  let m = START;
  let line = 0;
  let playing = true;
  let fast = false;
  const clock = (x) => `${String(Math.floor(x / 60) % 24).padStart(2, "0")}:${String(Math.floor(x % 60)).padStart(2, "0")}`;

  main.innerHTML = `
    <div class="page">
      <div class="head">
        <div><p class="muted">${esc(show.title)} · ${esc(ep.title)}</p><h1 class="l">The whole episode, raw</h1></div>
        <a class="btn soft" href="#/show/${show.id}/${ei}">Back to episode</a>
      </div>

      <div class="screen raw grain" id="rawScreen">
        <div class="fill" style="${cover(show)}"></div>
        <div class="corner"><span class="dot"></span><span id="camName"></span></div>
        <div class="corner right" id="dayTime"></div>
        <div class="sub" id="rawLine"></div>
      </div>

      <div class="choices" id="cams" style="margin-top:16px">
        ${cams.map((c, i) => `<button class="choice ${i === 0 ? "on" : ""}" data-cam="${i}">${esc(c)}</button>`).join("")}
      </div>

      <div class="player" style="margin-top:8px">
        <button class="play" id="play">Pause</button>
        <div class="track ticks" id="track"><span id="prog" style="width:0"></span>
          ${marks.map((x) => `<i style="left:${(x.m / DAY) * 100}%" title="${esc(x.sc.title)}"></i>`).join("")}
        </div>
        <span class="time" id="clock"></span>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        <button class="btn soft" id="fast">Fast forward</button>
        <button class="btn soft" id="skip">Skip an hour</button>
      </div>

      <div class="sec">
        <div class="sec-h">Where the aired scenes came from</div>
        <div class="list">
          ${marks
            .map((x) => `<a class="item" href="#/scene/${show.id}/${ei}/${x.si}"><span>${esc(x.sc.title)}</span><span class="meta">${clock(x.m)} · ${esc(x.sc.cam)}</span></a>`)
            .join("")}
        </div>
        <p class="muted" style="margin-top:16px">Everything else looks like what you just watched. Most of a day in the villa is waiting.</p>
      </div>
    </div>`;

  const paint = () => {
    const pool = CAMERAS[cams[cam]];
    const [w, x] = pool[line % pool.length];
    $("#camName").textContent = cams[cam];
    $("#dayTime").textContent = `Day ${ei * 2 + 1 + Math.floor(m / DAY)} · ${clock(m % DAY)}`;
    $("#rawLine").innerHTML = w
      ? `${esc(fill(w, show.cast))}: ${esc(fill(x, show.cast))}`
      : `<span style="opacity:.8">${esc(fill(x, show.cast))}</span>`;
    $("#prog").style.width = ((m % DAY) / DAY) * 100 + "%";
    $("#clock").textContent = `${clock(m % DAY)} / 24:00`;
  };
  paint();
  let ticks = 0;
  state.timers.push(
    setInterval(() => {
      if (!playing) return;
      m += fast ? 2 : 0.1;
      if (++ticks % (fast ? 8 : 30) === 0) line++;
      paint();
    }, 100)
  );

  $("#cams").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cam]");
    if (!b) return;
    cam = +b.dataset.cam;
    line = 0;
    $$("[data-cam]").forEach((x) => x.classList.toggle("on", x === b));
    paint();
  });
  $("#play").addEventListener("click", () => {
    playing = !playing;
    $("#play").textContent = playing ? "Pause" : "Play";
    $("#rawScreen").classList.toggle("paused", !playing);
  });
  $("#fast").addEventListener("click", () => {
    fast = !fast;
    $("#fast").textContent = fast ? "Normal speed" : "Fast forward";
  });
  $("#skip").addEventListener("click", () => {
    m += 60;
    line++;
    paint();
  });
  $("#track").addEventListener("click", (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    m = Math.floor(m / DAY) * DAY + ((e.clientX - b.left) / b.width) * DAY;
    line++;
    paint();
  });
}

/* ==========================================================
   UPLOADED FOOTAGE
   ========================================================== */
function uploadPage(r) {
  const u = state.uploads.find((x) => x.id === r.a);
  if (!u) return go("#/library");
  const show = showById(u.showId);
  const url = u.blob ? URL.createObjectURL(u.blob) : null;
  if (url) state.urls.push(url);
  const media = u.type?.startsWith("video/")
    ? `<video src="${url}" controls playsinline></video>`
    : u.type?.startsWith("image/")
    ? `<img src="${url}" alt="Uploaded still">`
    : `<div class="fill" style="${cover(show)};filter:grayscale(.7) brightness(.6)"></div><div class="sub">No preview for this file type</div>`;
  const row = (k, v) => `<div class="item"><span class="muted">${k}</span><span style="text-align:right;min-width:0">${v}</span></div>`;

  main.innerHTML = `
    <div class="page">
      <div class="head">
        <div><p class="muted">${esc(show.title)} · ${esc(show.episodes[u.episode].title)}</p><h1 class="l">Raw footage</h1></div>
        <a class="btn soft" href="#/show/${show.id}/${u.episode}">Back to episode</a>
      </div>
      <div class="screen grain">${media}</div>
      <div class="sec list">
        ${row("File", esc(u.fileName))}
        ${row("Camera", esc(u.camera || "Not given"))}
        ${row("Size", fmtBytes(u.size))}
        ${row("Uploaded", fmtDate(u.uploadedAt))}
        ${row("Producer", esc(STUDIOS[u.studio]))}
        ${u.edits?.length ? row("Edits disclosed", esc(u.edits.join(", "))) : ""}
        ${u.note ? row("Note", esc(u.note)) : ""}
        ${row("Fingerprint", `<span class="mono muted">${esc(u.sha256)}</span>`)}
      </div>
    </div>`;
}

/* ==========================================================
   ABOUT
   ========================================================== */
function about() {
  main.innerHTML = `
    <div class="page">
      <div class="head"><div><h1 class="l">About Uncut</h1></div></div>
      <div class="prose">
        <p>Reality dating shows film for hundreds of hours to make one episode. What you see is a story built in the edit, but it's sold as real.</p>
        <p>That matters. We compare our own looks and relationships to what we see, and heavy viewing slowly shapes what feels normal. When an edit is unfair, a real person gets the hate.</p>
        <p>Uncut is an intervention for viewers aged 18 to 30. Producers must archive all the footage they film, unedited, within 72 hours of airing. You can open it from the app you already use, next to every scene.</p>
        <p class="muted">Shows, cast and studios are fictional. The app links are a mockup. Files uploaded in producer mode stay in your own browser.</p>
        <p class="muted">Festinger (1954) · Gerbner (1976) · Ferris et al. (2007) · Horton and Wohl (1956) · McGuire (1961)</p>
      </div>
    </div>`;
}

/* ==========================================================
   PRODUCER MODE
   ========================================================== */
const WELFARE = [
  "The footage is complete and unedited",
  "Bathrooms and welfare sessions are left out",
  "People who didn't consent are blurred",
  "The cast had 48 hours to review it",
];

function producer() {
  const shows = SHOWS.filter((s) => s.studio === state.studio);
  main.innerHTML = `
    <div class="page">
      <div class="head"><div><h1 class="l">Upload footage</h1><p class="muted">Every camera, unedited, within 72 hours of airing.</p></div></div>

      <label class="drop" id="drop">
        <input type="file" id="file" multiple accept="video/*,image/*,audio/*,.mxf,.mov,.mp4,.srt,.vtt" aria-label="Choose footage files" />
        <div><p>Drop raw footage here</p><p class="muted">or click to choose files</p></div>
      </label>
      <div class="list" id="files" style="border-top:0"></div>

      <div class="sec form">
        <label class="field"><span>Show</span><select class="in" id="upShow">${shows.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join("")}</select></label>
        <label class="field"><span>Episode</span><select class="in" id="upEp"></select></label>
        <label class="field"><span>Camera</span><input class="in" id="upCam" placeholder="Fire-pit, wide camera" maxlength="60" /></label>
        <label class="field"><span>Recorded</span><input class="in" id="upRec" type="datetime-local" /></label>
      </div>

      <div class="sec">
        <div class="sec-h">What did the aired version change?</div>
        <div class="checks">${Object.keys(EDITS).map((k) => `<label class="check"><input type="checkbox" name="edit" value="${esc(k)}" />${esc(k)}</label>`).join("")}</div>
        <label class="field" style="margin-top:16px"><span>Note for viewers</span><textarea class="in" id="upNote" maxlength="400"></textarea></label>
      </div>

      <div class="sec">
        <div class="sec-h">Before you upload</div>
        <div class="checks">${WELFARE.map((t) => `<label class="check"><input type="checkbox" name="welfare" />${esc(t)}</label>`).join("")}</div>
        <div style="display:flex;gap:16px;align-items:center;margin-top:24px;flex-wrap:wrap">
          <button class="btn" id="upBtn" disabled>Upload</button>
          <div id="upProg" style="flex:1;min-width:200px;display:none"><div class="bar"><span id="upBar" style="width:0"></span></div><p class="muted" id="upStage" style="margin-top:6px"></p></div>
        </div>
      </div>

      <div class="sec">
        <div class="sec-h">Your shows</div>
        <div class="list" id="compliance"></div>
      </div>

      <div class="sec">
        <div class="sec-h">Upload history</div>
        <div class="list" id="history"></div>
      </div>
    </div>`;

  $("#upShow").addEventListener("change", () => fillEpisodes());
  fillEpisodes();
  $$("input[type=checkbox]", main).forEach((c) => c.addEventListener("change", validate));
  $("#upBtn").addEventListener("click", upload);

  const drop = $("#drop");
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => (e.preventDefault(), drop.classList.add("over"))));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("over")));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  });
  $("#file").addEventListener("change", (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  });
  renderFiles();
  renderStatus();
}

function fillEpisodes(keep) {
  const show = showById($("#upShow").value);
  $("#upEp").innerHTML = show.episodes
    .map((ep, i) => `<option value="${i}">${esc(ep.title)}${isArchived(show, i, state.uploads) ? "" : " (due)"}</option>`)
    .join("");
  const due = show.episodes.findIndex((_, i) => !isArchived(show, i, state.uploads));
  $("#upEp").value = keep ?? (due >= 0 ? due : 0);
}

function addFiles(list) {
  state.pending.push(...list);
  renderFiles();
}

function renderFiles() {
  $("#files").innerHTML = state.pending
    .map((f, i) => `<div class="item"><span>${esc(f.name)}</span><span style="display:flex;gap:16px"><span class="meta">${fmtBytes(f.size)}</span><button class="text-btn" data-rm="${i}">Remove</button></span></div>`)
    .join("");
  $$("[data-rm]").forEach((b) =>
    b.addEventListener("click", () => {
      state.pending.splice(+b.dataset.rm, 1);
      renderFiles();
    })
  );
  validate();
}

function validate() {
  const btn = $("#upBtn");
  if (btn) btn.disabled = !(state.pending.length && $$('input[name="welfare"]').every((c) => c.checked));
}

function renderStatus() {
  const shows = SHOWS.filter((s) => s.studio === state.studio);
  $("#compliance").innerHTML = shows
    .map((s) => {
      const n = s.episodes.filter((_, i) => isArchived(s, i, state.uploads)).length;
      const done = n === s.episodes.length;
      return `<div class="item"><span>${esc(s.title)}</span><span style="display:flex;gap:16px;align-items:center">
        <span class="meta">${n} of ${s.episodes.length} archived</span><span class="tag ${done ? "red" : ""}">${done ? "Complete" : "Overdue"}</span></span></div>`;
    })
    .join("");
  const mine = state.uploads.filter((u) => u.studio === state.studio);
  $("#history").innerHTML = mine.length
    ? mine
        .map((u) => `<a class="item" href="#/upload/${u.id}"><span>${esc(u.fileName)}</span><span class="meta">${esc(showById(u.showId).title)} · ${fmtDate(u.uploadedAt)}</span></a>`)
        .join("")
    : `<div class="item"><span class="muted">Nothing uploaded yet</span></div>`;
}

async function upload() {
  $("#upBtn").disabled = true;
  const files = state.pending.slice();
  const episode = +$("#upEp").value;
  const rec = $("#upRec").value;
  const meta = {
    studio: state.studio,
    showId: $("#upShow").value,
    episode,
    camera: $("#upCam").value.trim(),
    recordedAt: rec ? new Date(rec).toLocaleString() : "",
    note: $("#upNote").value.trim(),
    edits: $$('input[name="edit"]:checked').map((c) => c.value),
  };
  const prog = (p, s) => {
    $("#upBar").style.width = p * 100 + "%";
    $("#upStage").textContent = s;
  };
  $("#upProg").style.display = "block";
  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const base = i / files.length;
      const step = 1 / files.length;
      prog(base, "Checking " + f.name);
      const sha256 = await fingerprint(f);
      for (let c = 1; c <= 10; c++) {
        await new Promise((r) => setTimeout(r, 60));
        prog(base + step * (c / 10) * 0.95, "Uploading " + f.name);
      }
      await dbPut({
        ...meta,
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        fileName: f.name,
        size: f.size,
        type: f.type,
        sha256,
        blob: f,
        uploadedAt: Date.now(),
      });
    }
    prog(1, "Archived");
    state.uploads = await dbAll();
    state.pending = [];
    $$('input[type="checkbox"]', main).forEach((c) => (c.checked = false));
    $("#upNote").value = "";
    renderFiles();
    renderStatus();
    fillEpisodes(episode);
    toast("Archived. Viewers can see it now.");
  } catch (err) {
    console.error(err);
    prog(0, "Upload failed. The browser may be out of space.");
  } finally {
    validate();
  }
}

/* ---------- start ---------- */
(async () => {
  state.uploads = await dbAll();
  render();
})();
