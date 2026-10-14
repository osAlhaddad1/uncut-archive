/* ==========================================================
   UNCUT — data + storage
   Shows, cast and studios are fictional. Numbers are illustrative.
   ========================================================== */

const SERVICES = [
  { id: "netflix", name: "Netflix" },
  { id: "prime", name: "Prime Video" },
  { id: "disney", name: "Disney+" },
  { id: "max", name: "HBO Max" },
  { id: "videoland", name: "Videoland" },
];

const STUDIOS = {
  golden: "Golden Hour Productions",
  northlight: "Northlight Studios",
  tidewater: "Tidewater Media",
};

const EDITS = {
  "Context cut": "The words around the line that change its meaning were removed.",
  "Producer prompt": "Someone off camera asked for the line, or asked for it again.",
  Frankenbite: "Pieces of different sentences were joined into one.",
  "Reaction moved": "A reaction from another moment was placed here.",
  Reordered: "Events are shown in a different order than they happened.",
  "Music added": "Score was added to tell you how to feel.",
  "Glam and lighting": "Make-up, lighting and filters shaped how people look.",
  "Slow motion": "Footage was slowed down to make a moment feel bigger.",
};

/* raw line flag: 1 = aired, 0 = cut, 2 = moved from another moment */
const SCENE_TEMPLATES = [
  {
    key: "firepit",
    title: "I'm not here for {B}",
    edits: ["Context cut", "Producer prompt", "Music added"],
    cam: "Fire-pit, wide camera",
    aired: [
      ["{A}", "Honestly? I'm not here for {B}."],
      ["", "Cut to {B} looking away. Tense strings."],
    ],
    raw: [
      ["{C}", "Do you think {B} is getting in the way of you and {D}?", 0],
      ["{A}", "Honestly? I'm not here for {B}…", 1],
      ["{A}", "…'s approval, I'm here for me. But I love her. She's been the kindest person in here.", 0],
      ["Producer", "Can you say the first part again, just that bit?", 0],
      ["{A}", "Why? I don't want it to sound mean.", 0],
      ["{B}", "Babe, I'm literally right here, it's fine.", 0],
    ],
    note: "The aired line stops mid-sentence. The next words flip the meaning.",
  },
  {
    key: "frankenbite",
    title: "I'd never trust him",
    edits: ["Frankenbite", "Reordered"],
    cam: "Beach hut",
    aired: [["{C}", "I'd never… trust him."]],
    raw: [
      ["Producer", "Would you ever go back to {D}?", 0],
      ["{C}", "I'd never…", 1],
      ["{C}", "…say never, he's a sweetheart. Would I trust him with my phone? No. With my dog? Yeah.", 0],
      ["{C}", "Trust him? Yeah. With the important stuff, yeah.", 1],
    ],
    note: "Two fragments, recorded 40 seconds apart, were joined. She said the opposite.",
  },
  {
    key: "eyeroll",
    title: "The eye-roll",
    edits: ["Reaction moved", "Reordered", "Music added"],
    cam: "Fire-pit, close-up",
    aired: [
      ["{D}", "I've never felt like this about anyone before."],
      ["", "Close-up: {B} rolls her eyes."],
    ],
    raw: [
      ["{D}", "I've never felt like this about anyone before.", 1],
      ["{B}", "That's so sweet. I'm actually so happy for you two.", 0],
      ["", "Two hours earlier, by the pool.", 0],
      ["{B}", "A seagull just took my entire wrap. The whole thing.", 2],
    ],
    note: "The eye-roll was filmed two hours earlier, about a seagull.",
  },
  {
    key: "glam",
    title: "Just woke up like this",
    edits: ["Glam and lighting", "Slow motion", "Music added"],
    cam: "Dressing room",
    aired: [
      ["", "Slow motion: {A} and {B} walk out to the pool."],
      ["{A}", "Morning, villa!"],
    ],
    raw: [
      ["", "6:40. Four make-up artists, two ring lights.", 0],
      ["{B}", "Can we redo the lashes? I slept like two hours.", 0],
      ["{A}", "Nobody looks like this in the morning.", 0],
      ["", "8:15. The lighting crew moves the pool reflector.", 0],
      ["{A}", "Morning, villa!", 1],
      ["Producer", "Once more, a bit slower, and look at each other.", 0],
    ],
    note: "The natural morning took 95 minutes and three takes.",
  },
  {
    key: "dumped",
    title: "She didn't even care",
    edits: ["Context cut", "Reaction moved"],
    cam: "Driveway",
    aired: [
      ["{C}", "Yeah. Bye then."],
      ["", "{C} turns away. Cut to taxi."],
    ],
    raw: [
      ["{D}", "I'm gonna miss you so much.", 0],
      ["{C}", "Stop, you'll make me ugly-cry on national TV.", 0],
      ["{C}", "Look after {A} for me, yeah? Promise.", 0],
      ["{C}", "Yeah. Bye then.", 1],
      ["{C}", "Wait, one more hug.", 0],
    ],
    note: "Everything emotional around the goodbye was cut, so it looked cold.",
  },
];

const SHOWS = [
  {
    id: "villa-amour", title: "Villa Amour", service: "netflix", studio: "golden",
    tagline: "Twelve singles. One villa.", cast: ["Mia", "Jade", "Sofia", "Kai"],
    episodes: [
      { title: "Arrivals", airedMin: 47, rawHours: 212, archived: true, scenes: ["glam", "firepit"] },
      { title: "The First Recoupling", airedMin: 52, rawHours: 236, archived: true, scenes: ["eyeroll", "frankenbite"] },
      { title: "Heads Turned", airedMin: 49, rawHours: 228, archived: true, scenes: ["dumped", "firepit"] },
      { title: "Text Bomb", airedMin: 51, rawHours: 241, archived: false, scenes: ["frankenbite"] },
    ],
  },
  {
    id: "blind-hearts", title: "Blind Hearts", service: "netflix", studio: "northlight",
    tagline: "In love through a wall.", cast: ["Nora", "Ella", "Priya", "Jonah"],
    episodes: [
      { title: "The Pods", airedMin: 55, rawHours: 168, archived: true, scenes: ["frankenbite", "glam"] },
      { title: "Say It First", airedMin: 53, rawHours: 174, archived: true, scenes: ["firepit"] },
      { title: "The Reveal", airedMin: 58, rawHours: 190, archived: false, scenes: ["eyeroll"] },
    ],
  },
  {
    id: "paradise-pact", title: "Paradise Pact", service: "prime", studio: "golden",
    tagline: "Temptation arrives by boat.", cast: ["Lena", "Amara", "Chloe", "Dev"],
    episodes: [
      { title: "Welcome to Paradise", airedMin: 44, rawHours: 198, archived: true, scenes: ["glam", "eyeroll"] },
      { title: "Bonfire", airedMin: 46, rawHours: 203, archived: false, scenes: ["firepit"] },
    ],
  },
  {
    id: "too-close", title: "Too Close to Call", service: "prime", studio: "tidewater",
    tagline: "No touching allowed.", cast: ["Tess", "Nia", "Bella", "Marco"],
    episodes: [
      { title: "The Rules", airedMin: 41, rawHours: 133, archived: true, scenes: ["firepit", "glam"] },
      { title: "First Slip", airedMin: 43, rawHours: 139, archived: true, scenes: ["dumped"] },
    ],
  },
  {
    id: "second-glance", title: "Second Glance", service: "max", studio: "tidewater",
    tagline: "Exes move back in.", cast: ["Isla", "Rosa", "Yara", "Ben"],
    episodes: [
      { title: "Moving Back In", airedMin: 42, rawHours: 140, archived: true, scenes: ["dumped", "frankenbite"] },
      { title: "House Rules", airedMin: 44, rawHours: 151, archived: true, scenes: ["eyeroll"] },
      { title: "Old Habits", airedMin: 43, rawHours: 147, archived: false, scenes: ["glam"] },
    ],
  },
  {
    id: "proposal-house", title: "The Proposal House", service: "disney", studio: "northlight",
    tagline: "Not everyone says yes.", cast: ["Hana", "Zoe", "Maya", "Leo"],
    episodes: [
      { title: "The Ring Box", airedMin: 50, rawHours: 182, archived: true, scenes: ["firepit", "dumped"] },
      { title: "Meet the Parents", airedMin: 48, rawHours: 177, archived: false, scenes: ["frankenbite"] },
    ],
  },
  {
    id: "matched-mallorca", title: "Matched in Mallorca", service: "videoland", studio: "golden",
    tagline: "An algorithm picks your match.", cast: ["Lotte", "Sanne", "Fleur", "Daan"],
    episodes: [
      { title: "Algorithm Says Yes", airedMin: 45, rawHours: 160, archived: true, scenes: ["glam", "frankenbite"] },
      { title: "The Swap", airedMin: 47, rawHours: 171, archived: true, scenes: ["eyeroll", "dumped"] },
    ],
  },
];

const fill = (str, cast) => String(str).replace(/\{([ABCD])\}/g, (_, k) => cast["ABCD".indexOf(k)]);

function sceneFor(show, ei, si) {
  const ep = show.episodes[ei];
  const t = SCENE_TEMPLATES.find((s) => s.key === ep.scenes[si]);
  const c = show.cast;
  return {
    id: `${show.id}/${ei}/${si}`,
    title: fill(t.title, c),
    edits: t.edits,
    cam: t.cam,
    aired: t.aired.map(([w, x]) => [fill(w, c), fill(x, c)]),
    raw: t.raw.map(([w, x, a]) => [fill(w, c), fill(x, c), a]),
    note: fill(t.note, c),
  };
}

/* one hue family — every cover is a different light on the same red */
const COVERS = [
  ["#ff8a78", "#f0445a", "#ffd3c8"],
  ["#f0445a", "#9e1f35", "#ff9d8c"],
  ["#ffb4a6", "#f0445a", "#fff0ec"],
  ["#c42a44", "#ff6f6a", "#ffc2b6"],
  ["#ff6f6a", "#ffd3c8", "#b3223b"],
  ["#e8394f", "#ffb8a8", "#7d1730"],
  ["#ffa08f", "#d22f47", "#ffe3dc"],
];

function cover(show, shift = 0) {
  const [a, b, c] = COVERS[(SHOWS.indexOf(show) + shift) % COVERS.length];
  return `background:
    radial-gradient(70% 70% at 18% 18%, ${c} 0%, transparent 62%),
    radial-gradient(80% 80% at 88% 30%, ${b} 0%, transparent 66%),
    radial-gradient(90% 90% at 30% 105%, ${a} 0%, transparent 70%),
    linear-gradient(160deg, ${a}, ${b});`;
}

const serviceName = (id) => SERVICES.find((s) => s.id === id).name;

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmtBytes = (b) => {
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) {
    b /= 1024;
    i++;
  }
  return (i ? b.toFixed(b < 10 ? 1 : 0) : b) + " " + u[i];
};
const fmtDate = (ts) =>
  new Date(ts).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const store = {
  get(k, d) {
    try {
      return JSON.parse(localStorage.getItem("uncut:" + k)) ?? d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("uncut:" + k, JSON.stringify(v));
    } catch {
      /* storage blocked: state lives in memory for this visit */
    }
  },
};

/* ---------- IndexedDB: producer uploads keep the real file, in this browser only ---------- */
function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("uncut-archive", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("uploads")) req.result.createObjectStore("uploads", { keyPath: "id" });
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

const isArchived = (show, ei, uploads) =>
  show.episodes[ei].archived || uploads.some((u) => u.showId === show.id && u.episode === ei);

async function fingerprint(file) {
  const LIMIT = 32 * 1024 * 1024;
  const buf = await file.slice(0, LIMIT).arrayBuffer();
  const tag = new TextEncoder().encode(String(file.size));
  const all = new Uint8Array(buf.byteLength + tag.byteLength);
  all.set(new Uint8Array(buf), 0);
  all.set(tag, buf.byteLength);
  const h = await crypto.subtle.digest("SHA-256", all);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
