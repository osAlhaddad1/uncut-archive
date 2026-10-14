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
  Montage: "Hours squeezed into seconds, so life looks non-stop exciting.",
  Restaged: "The moment was set up, then filmed again until it looked right.",
  "Producer prompt": "Someone off camera told them what to say or do.",
  "Context cut": "What happened before and after was removed.",
  "Glam and lighting": "Make-up, tanning, lighting and filters shaped how people look.",
  "Slow motion": "Footage was slowed down to make a moment feel bigger.",
  "Music added": "Score was added to tell you how to feel.",
  Reordered: "Things are shown in a different order than they happened.",
};

/* raw line flag: 1 = aired, 0 = never aired */
const SCENE_TEMPLATES = [
  {
    key: "breakfast",
    title: "Breakfast in paradise",
    edits: ["Montage", "Slow motion", "Producer prompt"],
    cam: "Kitchen",
    aired: [
      ["", "Slow motion: {A} feeds {D} a strawberry. Soft guitar."],
      ["{D}", "This is the life."],
    ],
    raw: [
      ["Director", "Rolling. Terrace, take one.", 0],
      ["", "9:12. {A} and {D} sit down. Both pick up their phones.", 0],
      ["Crew", "Can someone move that juice? It's blocking her face.", 0],
      ["", "Eleven minutes of scrolling. Nobody talks.", 0],
      ["Director", "Guys, a bit of eye contact? Anything?", 0],
      ["Crew", "Sun's moving. We're losing the light.", 0],
      ["Producer", "Can we get the strawberry thing? Just once.", 0],
      ["", "{A} feeds {D} a strawberry.", 1],
      ["Director", "Cut. Lovely. Back to your phones, we'll record his line later.", 0],
    ],
    note: "Twenty minutes of two people on their phones became fifteen seconds of romance. His line was recorded afterwards.",
  },
  {
    key: "glam",
    title: "Just woke up like this",
    edits: ["Glam and lighting", "Slow motion", "Restaged"],
    cam: "Dressing room",
    aired: [
      ["", "Slow motion: {A} and {B} walk out to the pool in golden light."],
      ["{A}", "Morning, villa!"],
    ],
    raw: [
      ["", "6:40. Four make-up artists, two ring lights, a tan top-up.", 0],
      ["{B}", "My skin is breaking out from all this make-up.", 0],
      ["{A}", "Nobody actually looks like this in the morning.", 0],
      ["Crew", "Stand a bit more to the left, the light is better there.", 0],
      ["{A}", "Morning, villa!", 1],
      ["Producer", "Once more, slower, and look at each other.", 0],
    ],
    note: "The natural morning took 95 minutes of make-up and lighting, and three takes.",
  },
  {
    key: "date",
    title: "A surprise rooftop date",
    edits: ["Restaged", "Producer prompt", "Music added"],
    cam: "Rooftop",
    aired: [
      ["{C}", "I can't believe you planned all this."],
      ["{D}", "Only the best for you."],
    ],
    raw: [
      ["", "The crew set up the table, candles and fairy lights two hours earlier.", 0],
      ["Producer", "{C}, act surprised when you walk in. Go again from the door.", 0],
      ["{C}", "I can't believe you planned all this.", 1],
      ["{D}", "I didn't, they told me where to stand.", 0],
      ["Producer", "Lovely. {D}, say something romantic.", 0],
      ["{D}", "Only the best for you.", 1],
      ["{C}", "Can we talk about something normal? I miss my dog.", 0],
    ],
    note: "The surprise was planned by the crew and filmed in four takes.",
  },
  {
    key: "kiss",
    title: "First kiss under the fireworks",
    edits: ["Restaged", "Slow motion", "Music added"],
    cam: "Beach",
    aired: [
      ["", "Fireworks. {A} and {D} kiss. Swelling strings."],
      ["{A}", "I've waited all summer for that."],
    ],
    raw: [
      ["Producer", "Fireworks in thirty seconds. Kiss on the first bang.", 0],
      ["{A}", "That's so much pressure.", 0],
      ["", "Fireworks. {A} and {D} kiss.", 1],
      ["Crew", "The drone missed it. Again in ten minutes?", 0],
      ["{D}", "Again? Okay. Weird, but okay.", 0],
      ["{A}", "I've waited all summer for that.", 1],
      ["{A}", "Was that the line you wanted?", 0],
    ],
    note: "The kiss was timed to a cue and done twice for the drone.",
  },
  {
    key: "fight",
    title: "The big fight",
    edits: ["Producer prompt", "Context cut", "Music added"],
    cam: "Fire-pit",
    aired: [
      ["{B}", "You've been fake since day one!"],
      ["{C}", "Say that to my face."],
    ],
    raw: [
      ["Producer", "{B}, remember what she said yesterday? Go tell her how it felt.", 0],
      ["{B}", "Honestly, I'm not that bothered anymore.", 0],
      ["Producer", "It would really help the episode.", 0],
      ["{B}", "You've been fake since day one!", 1],
      ["{C}", "Say that to my face.", 1],
      ["{B}", "Sorry, I can't do this with a straight face.", 0],
      ["", "They hug, then go and make toast.", 0],
    ],
    note: "A producer pushed for the fight. Right after, they laughed and hugged.",
  },
  {
    key: "afternoon",
    title: "Pool party",
    edits: ["Montage", "Music added", "Reordered"],
    cam: "Pool",
    aired: [
      ["", "Montage: splashing, dancing, cocktails. Upbeat pop."],
      ["{C}", "Best day ever!"],
    ],
    raw: [
      ["", "2:00 to 5:00. Everyone is asleep on sun loungers.", 0],
      ["{A}", "What day is it?", 0],
      ["{B}", "Tuesday? Maybe Wednesday.", 0],
      ["{C}", "I'm so bored I counted the tiles in the pool.", 0],
      ["Producer", "Ten minutes of energy, please. Music's going on.", 0],
      ["{C}", "Best day ever!", 1],
      ["", "Music off. Everyone lies back down.", 0],
    ],
    note: "Three hours of napping became one minute of party.",
  },
];

/* what the cameras see most of the time — for the full raw episode */
const CAMERAS = {
  Kitchen: [
    ["{A}", "Has anyone seen the oat milk?"],
    ["", "{D} makes toast. Nobody talks for six minutes."],
    ["{B}", "Who keeps leaving cups in the sink?"],
    ["", "{C} waits for the kettle."],
  ],
  Bedroom: [
    ["", "{B} naps."],
    ["{A}", "I miss my own bed so much."],
    ["", "Silence. Someone snores."],
    ["{C}", "Do you think they'll let us call home this week?"],
  ],
  Pool: [
    ["", "Everyone lies on sun loungers."],
    ["{D}", "Pass the sun cream?"],
    ["Producer", "Can you two sit on the swing for a bit?"],
    ["{A}", "It's too hot to flirt."],
  ],
  "Fire-pit": [
    ["", "Empty. The crew changes batteries."],
    ["{C}", "What are we doing tonight? Same as last night?"],
    ["{B}", "I'm so tired of talking about feelings."],
    ["", "{D} picks at his nails."],
  ],
  Garden: [
    ["{D}", "Forty push-ups. Is that content?"],
    ["", "{A} reads the same magazine again."],
    ["{B}", "I just want a normal chat about TV."],
    ["", "A fly. Everyone watches the fly."],
  ],
};

const SHOWS = [
  {
    id: "villa-amour", title: "Villa Amour", service: "netflix", studio: "golden",
    tagline: "Twelve singles. One villa.", cast: ["Mia", "Jade", "Sofia", "Kai"],
    episodes: [
      { title: "Arrivals", airedMin: 47, rawHours: 212, archived: true, scenes: ["glam", "breakfast"] },
      { title: "The First Recoupling", airedMin: 52, rawHours: 236, archived: true, scenes: ["afternoon", "fight"] },
      { title: "Heads Turned", airedMin: 49, rawHours: 228, archived: true, scenes: ["date", "kiss"] },
      { title: "Text Bomb", airedMin: 51, rawHours: 241, archived: false, scenes: ["breakfast"] },
    ],
  },
  {
    id: "blind-hearts", title: "Blind Hearts", service: "netflix", studio: "northlight",
    tagline: "In love through a wall.", cast: ["Nora", "Ella", "Priya", "Jonah"],
    episodes: [
      { title: "The Pods", airedMin: 55, rawHours: 168, archived: true, scenes: ["breakfast", "glam"] },
      { title: "Say It First", airedMin: 53, rawHours: 174, archived: true, scenes: ["date"] },
      { title: "The Reveal", airedMin: 58, rawHours: 190, archived: false, scenes: ["kiss"] },
    ],
  },
  {
    id: "paradise-pact", title: "Paradise Pact", service: "prime", studio: "golden",
    tagline: "Temptation arrives by boat.", cast: ["Lena", "Amara", "Chloe", "Dev"],
    episodes: [
      { title: "Welcome to Paradise", airedMin: 44, rawHours: 198, archived: true, scenes: ["glam", "afternoon"] },
      { title: "Bonfire", airedMin: 46, rawHours: 203, archived: false, scenes: ["fight"] },
    ],
  },
  {
    id: "too-close", title: "Too Close to Call", service: "prime", studio: "tidewater",
    tagline: "No touching allowed.", cast: ["Tess", "Nia", "Bella", "Marco"],
    episodes: [
      { title: "The Rules", airedMin: 41, rawHours: 133, archived: true, scenes: ["afternoon", "date"] },
      { title: "First Slip", airedMin: 43, rawHours: 139, archived: true, scenes: ["kiss"] },
    ],
  },
  {
    id: "second-glance", title: "Second Glance", service: "max", studio: "tidewater",
    tagline: "Exes move back in.", cast: ["Isla", "Rosa", "Yara", "Ben"],
    episodes: [
      { title: "Moving Back In", airedMin: 42, rawHours: 140, archived: true, scenes: ["breakfast", "fight"] },
      { title: "House Rules", airedMin: 44, rawHours: 151, archived: true, scenes: ["glam"] },
      { title: "Old Habits", airedMin: 43, rawHours: 147, archived: false, scenes: ["date"] },
    ],
  },
  {
    id: "proposal-house", title: "The Proposal House", service: "disney", studio: "northlight",
    tagline: "Not everyone says yes.", cast: ["Hana", "Zoe", "Maya", "Leo"],
    episodes: [
      { title: "The Ring Box", airedMin: 50, rawHours: 182, archived: true, scenes: ["date", "kiss"] },
      { title: "Meet the Parents", airedMin: 48, rawHours: 177, archived: false, scenes: ["fight"] },
    ],
  },
  {
    id: "matched-mallorca", title: "Matched in Mallorca", service: "videoland", studio: "golden",
    tagline: "An algorithm picks your match.", cast: ["Lotte", "Sanne", "Fleur", "Daan"],
    episodes: [
      { title: "Algorithm Says Yes", airedMin: 45, rawHours: 160, archived: true, scenes: ["glam", "breakfast"] },
      { title: "The Swap", airedMin: 47, rawHours: 171, archived: true, scenes: ["afternoon", "kiss"] },
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

/* real clips (AI-generated stand-ins), keyed by scene id: show/episode/scene */
const VIDEOS = {
  "villa-amour/0/1": { aired: "media/breakfast-aired.mp4", raw: "media/breakfast-raw.mp4" },
};

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
