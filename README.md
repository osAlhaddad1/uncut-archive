# Uncut — see what the edit left out

A media-psychology intervention concept: producers of reality dating shows must upload the **full, unedited
footage** of every episode to a public archive, and that archive is reachable from inside the streaming services
that air the show.

Target audience: women aged 18–30, the core audience of reality dating formats.

## The prototype

| Page | What it does |
| --- | --- |
| `index.html` | The idea: the aired-vs-filmed ratio, the psychology behind it (social comparison, cultivation, parasocial interaction, inoculation) and how the rules work. |
| `watch.html` | Viewer archive. Browse shows, open an episode, and compare any aired scene with its raw source: side-by-side screens, transcripts with cut lines highlighted, the producer's edit disclosure, and a short reflection. |
| `portal.html` | Producer portal. Sign in as a production company, see compliance per show, and upload raw footage with SHA-256 fingerprinting, edit disclosures and a cast-welfare checklist. |

Uploads are real files stored in your own browser (IndexedDB). They appear in the viewer archive straight away
but never leave your device. Shows, cast, studios and streaming services are fictional; figures are illustrative.

## Run locally

It's a static site with no build step:

```bash
python -m http.server 5173
```

Then open http://localhost:5173.
