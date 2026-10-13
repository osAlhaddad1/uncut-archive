/* ==========================================================
   UNCUT — shared runtime: nav, reveals, icons, data, storage
   ========================================================== */

/* ---------- ultra-light line icons ---------- */
const I = (d, s = 18, w = 1.25) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const ICONS = {
  arrow: (s) => I('<path d="M7 17 17 7M8 7h9v9"/>', s),
  right: (s) => I('<path d="M5 12h14M13 6l6 6-6 6"/>', s),
  play: (s) => I('<path d="M8 5.5v13l10.5-6.5z"/>', s),
  close: (s) => I('<path d="M6 6l12 12M18 6 6 18"/>', s),
  upload: (s) => I('<path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>', s),
  film: (s) =>
    I('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>', s),
  scissors: (s) =>
    I('<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5 20 18M8 15.5 20 6"/>', s),
  eye: (s) => I('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>', s),
  shield: (s) => I('<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>', s),
  check: (s) => I('<path d="m5 12.5 4.5 4.5L19 7.5"/>', s, 2),
  link: (s) => I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', s),
  search: (s) => I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', s),
  heart: (s) => I('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>', s),
  mirror: (s) => I('<ellipse cx="12" cy="10" rx="6" ry="7.5"/><path d="M12 17.5V21M8.5 21h7M9.5 6.5c.8-.7 1.6-1 2.5-1"/>', s),
  mic: (s) => I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>', s),
  clock: (s) => I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', s),
  trash: (s) => I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', s),
  lock: (s) => I('<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>', s),
  layers: (s) => I('<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>', s),
  logout: (s) => I('<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h10"/>', s),
};

/* ---------- nav: island + morphing burger ---------- */
function mountNav(active) {
  const links = [
    ["index.html", "The idea"],
    ["watch.html", "Watch uncut"],
    ["portal.html", "Producer portal"],
  ];
  const nav = document.createElement("div");
  nav.innerHTML = `
    <nav class="nav" aria-label="Main">
      <a class="brand" href="index.html"><span class="brand-dot"></span>Uncut</a>
      <div class="nav-links">
        ${links.map(([h, t]) => `<a href="${h}" ${active === h ? 'aria-current="page"' : ""}>${t}</a>`).join("")}
      </div>
      <a class="btn sm nav-cta" href="watch.html">Open archive <span class="ico">${ICONS.arrow(14)}</span></a>
      <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </nav>
    <div class="overlay" aria-hidden="true">
      ${links.map(([h, t]) => `<a href="${h}"><span>${t}</span></a>`).join("")}
      <a href="index.html#why"><span>Why it matters</span></a>
    </div>`;
  document.body.prepend(...nav.children);
  const burger = document.querySelector(".burger");
  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.querySelectorAll(".overlay a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("menu-open"))
  );
}

/* ---------- scroll reveals (IntersectionObserver only) ---------- */
let revealObserver;
function observeReveals(root = document) {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealObserver.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }
  root.querySelectorAll(".reveal:not(.in)").forEach((el) => revealObserver.observe(el));
}

/* ---------- toast ---------- */
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.append(t);
  }
  t.innerHTML = `<span>${msg}</span><span class="ico">${ICONS.check(14)}</span>`;
  requestAnimationFrame(() => t.classList.add("on"));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("on"), 3400);
}

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmtBytes = (b) => {
  if (b < 1024) return b + " B";
  const u = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    b /= 1024;
    i++;
  } while (b >= 1024 && i < u.length - 1);
  return b.toFixed(b < 10 ? 1 : 0) + " " + u[i];
};
const fmtDate = (ts) =>
  new Date(ts).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/* ==========================================================
   DATA — fictional shows, studios and streaming services.
   Numbers are illustrative, not measured.
   ========================================================== */
const STUDIOS = {
  golden: { name: "Golden Hour Productions", short: "GH" },
  northlight: { name: "Northlight Studios", short: "NS" },
  tidewater: { name: "Tidewater Media", short: "TM" },
};

const FLAG_INFO = {
  "Producer prompt": "Someone off-camera asked for this line, or asked for it to be said again.",
  Frankenbite: "Words from different sentences were spliced together into one line.",
  "Reaction moved": "A reaction shot was taken from a different moment and placed here.",
  Reordered: "Events are shown in a different order than they happened.",
  "Context cut": "The surrounding conversation that changes the meaning was removed.",
  "Music added": "Score was added to steer how the moment feels.",
  "Glam & lighting": "Hair, make-up, lighting and filters that shaped how people look.",
  "Slow motion": "Footage was slowed down to make a moment feel bigger.",
};

/* transcript templates — {A}{B}{C}{D} become cast names per show */
const SCENE_TEMPLATES = [
  {
    key: "firepit",
    title: "Fire-pit: “I'm not here for {B}”",
    flags: ["Context cut", "Producer prompt", "Music added"],
    cam: "CAM 07 · Fire-pit wide",
    aired: [
      ["{A}", "Honestly? I'm not here for {B}."],
      ["", "[cut to {B} looking away · tense strings]"],
    ],
    raw: [
      ["{C}", "Do you think {B} is getting in the way of you and {D}?", 0],
      ["{A}", "Honestly? I'm not here for {B}…", 1],
      ["{A}", "…'s approval, I'm here for me. But I love her. She's been the kindest person in here.", 0],
      ["Producer (off-cam)", "Can you say the first part again, just that bit?", 0],
      ["{A}", "Why? I don't want it to sound mean.", 0],
      ["{B}", "(laughing) Babe, I'm literally right here, it's fine.", 0],
    ],
    note: "The aired line ends mid-sentence. In the raw footage the next words reverse the meaning, and the off-camera request to repeat the line is visible.",
  },
  {
    key: "frankenbite",
    title: "Confessional: “I'd never trust him”",
    flags: ["Frankenbite", "Reordered"],
    cam: "CAM 02 · Beach hut",
    aired: [["{C}", "I'd never… trust him."]],
    raw: [
      ["Producer (off-cam)", "Would you ever go back to {D}?", 0],
      ["{C}", "I'd never…", 1],
      ["{C}", "…say never, I think he's a sweetheart. Would I trust him with my phone? No. Would I trust him with my dog? Yeah.", 0],
      ["{C}", "Trust him? Yeah. With the important stuff, yeah.", 1],
    ],
    note: "Two fragments recorded 40 seconds apart were joined. Together they say the opposite of what she actually said.",
  },
  {
    key: "eyeroll",
    title: "Recoupling: the eye-roll",
    flags: ["Reaction moved", "Reordered", "Music added"],
    cam: "CAM 11 · Fire-pit close-up",
    aired: [
      ["{D}", "I've never felt like this about anyone before."],
      ["", "[close-up: {B} rolls her eyes · record scratch]"],
    ],
    raw: [
      ["{D}", "I've never felt like this about anyone before.", 1],
      ["{B}", "(smiling, wiping tears) That's so sweet. I'm actually so happy for you two.", 0],
      ["", "[ 2 hrs 14 min earlier, by the pool — CAM 04 ]", 0],
      ["{B}", "(eye-roll) A seagull just took my entire wrap. The whole thing.", 2],
    ],
    note: "The eye-roll in the episode was filmed over two hours earlier, about a seagull. Her real reaction at the recoupling was supportive.",
  },
  {
    key: "glam",
    title: "Morning: “just woke up like this”",
    flags: ["Glam & lighting", "Slow motion", "Music added"],
    cam: "CAM 03 · Dressing room",
    aired: [
      ["", "[slow-motion: {A} and {B} walk out to the pool, golden light]"],
      ["{A}", "Morning, villa!"],
    ],
    raw: [
      ["", "[06:40 — hair & make-up team arrives: 4 artists, 2 ring lights]", 0],
      ["{B}", "Can we do the lashes again? My eyes are so puffy, I slept like two hours.", 0],
      ["{A}", "Nobody looks like this in the morning, this is so funny.", 0],
      ["", "[08:15 — lighting crew re-rigs the pool reflector]", 0],
      ["{A}", "Morning, villa!", 1],
      ["Producer (off-cam)", "Love it — once more, a bit slower, and look at each other.", 0],
    ],
    note: "The ‘natural morning’ took around 95 minutes of hair, make-up and lighting, and three takes of the walk-out.",
  },
  {
    key: "dumped",
    title: "The dumping: “she didn't even care”",
    flags: ["Context cut", "Reaction moved"],
    cam: "CAM 09 · Driveway",
    aired: [
      ["{C}", "Yeah. Bye then."],
      ["", "[{C} turns away · cut to taxi]"],
    ],
    raw: [
      ["{D}", "I'm gonna miss you so much.", 0],
      ["{C}", "(crying) Stop, you'll make me ugly-cry on national TV.", 0],
      ["{C}", "Look after {A} for me, yeah? Promise.", 0],
      ["{C}", "Yeah. Bye then.", 1],
      ["{C}", "(walking back) Wait, one more hug.", 0],
    ],
    note: "Everything emotional before and after the goodbye was cut, so a tearful exit read as cold.",
  },
];

const SHOWS = [
  {
    id: "villa-amour",
    title: "Villa Amour",
    season: 4,
    service: "Velvet+",
    studio: "golden",
    tagline: "Twelve singles. One villa. Eight weeks of sunshine and recouplings.",
    cast: ["Mia", "Jade", "Sofia", "Kai"],
    art: ["#e7a58f", "#c06a5c", "#f7d7b4", "#5c2e2a"],
    featured: true,
    episodes: [
      { n: 1, title: "Arrivals", airedMin: 47, rawHours: 212, archived: true, scenes: ["glam", "firepit"] },
      { n: 2, title: "The First Recoupling", airedMin: 52, rawHours: 236, archived: true, scenes: ["eyeroll", "frankenbite"] },
      { n: 3, title: "Heads Turned", airedMin: 49, rawHours: 228, archived: true, scenes: ["dumped", "firepit"] },
      { n: 4, title: "Text Bomb", airedMin: 51, rawHours: 241, archived: false, scenes: ["frankenbite"] },
    ],
  },
  {
    id: "blind-hearts",
    title: "Blind Hearts",
    season: 2,
    service: "Lumen TV",
    studio: "northlight",
    tagline: "They fall in love through a wall. Then they meet.",
    cast: ["Nora", "Ella", "Priya", "Jonah"],
    art: ["#b9c4d8", "#6d7aa0", "#efe4f0", "#2b2d48"],
    episodes: [
      { n: 1, title: "The Pods", airedMin: 55, rawHours: 168, archived: true, scenes: ["frankenbite", "glam"] },
      { n: 2, title: "Say It First", airedMin: 53, rawHours: 174, archived: true, scenes: ["firepit"] },
      { n: 3, title: "The Reveal", airedMin: 58, rawHours: 190, archived: false, scenes: ["eyeroll"] },
    ],
  },
  {
    id: "paradise-pact",
    title: "Paradise Pact",
    season: 6,
    service: "Velvet+",
    studio: "golden",
    tagline: "Couples arrive together. Temptation arrives by boat.",
    cast: ["Lena", "Amara", "Chloe", "Dev"],
    art: ["#9fc7b8", "#3d7a72", "#f2e6c9", "#1d3b3a"],
    episodes: [
      { n: 1, title: "Welcome to Paradise", airedMin: 44, rawHours: 198, archived: true, scenes: ["glam", "eyeroll"] },
      { n: 2, title: "Bonfire", airedMin: 46, rawHours: 203, archived: false, scenes: ["firepit"] },
    ],
  },
  {
    id: "second-glance",
    title: "Second Glance",
    season: 1,
    service: "Streamly",
    studio: "tidewater",
    tagline: "Exes move back in together for thirty days.",
    cast: ["Isla", "Rosa", "Yara", "Ben"],
    art: ["#e6c3d1", "#a35d7d", "#fbefe6", "#4a2236"],
    episodes: [
      { n: 1, title: "Moving Back In", airedMin: 42, rawHours: 140, archived: true, scenes: ["dumped", "frankenbite"] },
      { n: 2, title: "House Rules", airedMin: 44, rawHours: 151, archived: true, scenes: ["eyeroll"] },
      { n: 3, title: "Old Habits", airedMin: 43, rawHours: 147, archived: false, scenes: ["glam"] },
    ],
  },
  {
    id: "proposal-house",
    title: "The Proposal House",
    season: 3,
    service: "Lumen TV",
    studio: "northlight",
    tagline: "Ten couples. One ring each. Not everyone says yes.",
    cast: ["Hana", "Zoe", "Maya", "Leo"],
    art: ["#e8d2a6", "#b0894a", "#fff4e0", "#4b3820"],
    episodes: [
      { n: 1, title: "The Ring Box", airedMin: 50, rawHours: 182, archived: true, scenes: ["firepit", "dumped"] },
      { n: 2, title: "Meet the Parents", airedMin: 48, rawHours: 177, archived: false, scenes: ["frankenbite"] },
    ],
  },
];

function fill(str, cast) {
  return String(str).replace(/\{([ABCD])\}/g, (_, k) => cast["ABCD".indexOf(k)]);
}

function sceneFor(show, key, idx, ep) {
  const t = SCENE_TEMPLATES.find((s) => s.key === key);
  const c = show.cast;
  const base = 7 + idx * 19 + ep.n;
  return {
    id: `${show.id}-e${ep.n}-${key}`,
    title: fill(t.title, c),
    flags: t.flags,
    cam: t.cam,
    airedAt: `${String(base).padStart(2, "0")}:${String((ep.n * 13 + idx * 7) % 60).padStart(2, "0")}`,
    rawAt: `Day ${ep.n * 2 + idx} · ${String(10 + ((idx * 5 + ep.n) % 12)).padStart(2, "0")}:${String((ep.n * 17) % 60).padStart(2, "0")}`,
    aired: t.aired.map(([w, x]) => [fill(w, c), fill(x, c)]),
    raw: t.raw.map(([w, x, a]) => [fill(w, c), fill(x, c), a]),
    note: fill(t.note, c),
  };
}

function posterArt(show) {
  const [a, b, c, d] = show.art;
  return `
    background:
      radial-gradient(circle at 72% 30%, ${c} 0 11%, transparent 11.5%),
      radial-gradient(ellipse 120% 60% at 50% 105%, ${d} 0 40%, transparent 41%),
      radial-gradient(ellipse 140% 50% at 30% 92%, ${b} 0 45%, transparent 46%),
      linear-gradient(180deg, ${a} 0%, ${b} 70%, ${d} 100%);`;
}

/* ==========================================================
   STORAGE — IndexedDB (uploads keep the actual file blob)
   Everything stays in this browser: it's a working prototype.
   ========================================================== */
const DB_NAME = "uncut-archive";
const DB_VER = 1;

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("uploads")) {
        const s = db.createObjectStore("uploads", { keyPath: "id" });
        s.createIndex("show", "showId");
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function dbAll() {
  try {
    const db = await openDB();
    return await new Promise((res, rej) => {
      const r = db.transaction("uploads").objectStore("uploads").getAll();
      r.onsuccess = () => res(r.result.sort((x, y) => y.uploadedAt - x.uploadedAt));
      r.onerror = () => rej(r.error);
    });
  } catch {
    return [];
  }
}

async function dbPut(rec) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("uploads", "readwrite");
    tx.objectStore("uploads").put(rec);
    tx.oncomplete = () => res(rec);
    tx.onerror = () => rej(tx.error);
  });
}

async function dbClear() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("uploads", "readwrite");
    tx.objectStore("uploads").clear();
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });
}

/* episode is archived if seeded as archived, or a producer uploaded footage for it */
function isArchived(show, ep, uploads) {
  return ep.archived || uploads.some((u) => u.showId === show.id && u.episode === ep.n);
}

/* SHA-256 fingerprint. Big files: hash first 32 MB + size, labelled as partial. */
async function fingerprint(file) {
  const LIMIT = 32 * 1024 * 1024;
  const partial = file.size > LIMIT;
  const buf = await file.slice(0, LIMIT).arrayBuffer();
  const sizeTag = new TextEncoder().encode(String(file.size));
  const joined = new Uint8Array(buf.byteLength + sizeTag.byteLength);
  joined.set(new Uint8Array(buf), 0);
  joined.set(sizeTag, buf.byteLength);
  const h = await crypto.subtle.digest("SHA-256", joined);
  const hex = [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hex, partial };
}
