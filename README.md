# Daily Ahadith — website

A simple, fast, no-database website: one Hadith a day from Mufti Mohammad
Ahsan Alim's "Mustanid Ahadith" WhatsApp broadcast, in Urdu, English, Arabic,
Persian and Pashto.

**Live site:** https://daily-ahadith-kz4awo6m4-pioneer1823-8290.vercel.app
(a custom domain can be added later in Vercel's dashboard under Domains)

It's plain HTML/CSS/JS — no build step, no server-side code, no framework.
This repo is connected to Vercel: every push to `main` redeploys the live
site automatically within about 30 seconds.

## What's in here

```
index.html         Homepage — today's lesson, "how it works", archive preview
archive.html        Every lesson published so far, with a search box
about.html           About Mufti Ahsan Alim
style.css            All styling (colors, fonts, layout, RTL handling)
i18n.js              Language switching + shared header/footer/lang-bar
app.js               Page-specific rendering (reads hadiths.json)
hadiths.json          THE CONTENT — every lesson lives here as one JSON entry per day
ui-strings.json       Site chrome text (nav, buttons, headings) in all 5 languages
add_lesson.py         Run this daily to add a new lesson (see below)
robots.txt, sitemap.xml   SEO basics — edit the domain in both once you have a custom one
```

(Everything is kept flat/one folder deep rather than in subfolders — this is
what let the very first deploy go up as a plain drag-and-drop before Git was
connected, and there's no reason to complicate it now that Git is in place.)

## Your daily workflow (moving a lesson from WhatsApp)

1. Make sure you have this repo cloned on your own computer:
   ```
   git clone https://github.com/pioneer1823/daily-ahadith.git
   cd daily-ahadith
   ```
   (You only do this once.)

2. Each day, run:
   ```
   python3 add_lesson.py
   ```
   It asks for:
   - the date (defaults to today)
   - the **Arabic** hadith text (always required)
   - the **Urdu** title, translation and source — usually a copy-paste from
     the WhatsApp group
   - English versions of the same three (optional — skip with Enter if
     you don't have time that day)

3. Push it live:
   ```
   git add hadiths.json
   git commit -m "Add lesson for YYYY-MM-DD"
   git push
   ```
   Vercel picks up the push and the live site updates within ~30 seconds —
   no manual upload, no dashboard visit needed.

**About Arabic/Persian/Pashto translations:** writing a fresh translation
into all five languages every single day isn't realistic long-term. So the
site falls back gracefully: if a lesson has no Arabic/Persian/Pashto
translation yet, a visitor in that language sees the Urdu text with a small
"translation coming soon" badge instead of a blank page. You can add `ar`,
`fa`, `ps` keys to any entry in `hadiths.json` later whenever you have time
or a translator — nothing else needs to change.

## Testing changes locally before pushing

From this folder, run:
```
python3 -m http.server 8000
```
then open `http://localhost:8000/index.html` in a browser.

## One-time setup this session already did

- Created the `pioneer1823/daily-ahadith` GitHub repository
- Uploaded all files to it
- Connected it to Vercel as the `daily-ahadith` project, with auto-deploy on
  push to `main`

## Small things worth doing once you have a moment (optional)

- Add a real favicon (currently there isn't one) — a small square logo
  saved as `favicon.ico` in this folder, referenced with
  `<link rel="icon" href="favicon.ico">` in each page's `<head>`.
- Buy/point a real domain, then add it in Vercel → Project → Domains, and
  update `robots.txt` / `sitemap.xml` with it.
- Submit `sitemap.xml` to Google Search Console once the domain is live.

## What this does NOT include (and doesn't need to, yet)

- No login/admin panel — you edit `hadiths.json` via `add_lesson.py` and a
  normal `git push`. This is intentional: simplest thing that works for one
  person posting once a day.
- No automatic translation — see the fallback note above.
