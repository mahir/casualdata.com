# casualdata daily: the next version

This branch (`daily`) turns casualdata.com into a site that publishes one interactive data visualization a day. The 2007–2014 work stays in place and is reached from the menu. Everything new lives in new paths, so this branch does not touch the archive redesign on `main`.

## Brand: a black page, light ink, one red dot

- **Name `{casual: data}`.** The name written as a key–value pair: "casual" is the key, "data" the value. The braces and the top dot of the colon are grey, the words are light, and the lower dot of the colon is red. `kit/wordmark.svg` (for the dark page) and `kit/wordmark-light.svg` are outlines of Host Grotesk 800, with braces at weight 600 and tracking at −0.05 em.
- **Symbol `{●}`.** An object holding one value, the day's one thing: the 2005 `{casualdata}` braces with the dot in place of the letters. `kit/mark.svg` is the symbol and `kit/favicon.svg` the symbol on a black square. It stands in for the name where space is tight: the top bar under 400 px wide, the favicon, stamps.
- The logo files are built by `python3 .impeccable/brand/build/build.py fonts/host-grotesk-latin.woff2 kit` (needs fontTools and brotli). That script lives only in local copies, since `.impeccable/` is not published.
- **Day and night.** The page is white from 07:00 to 18:59 by the reader's own clock and black otherwise. `kit/theme.js` runs in `<head>` before the stylesheet, sets `data-theme` on `<html>`, checks again every minute and sends a `cd-theme` event so canvases redraw. `?theme=light` or `?theme=dark` forces one. Every page loads it.
- **Three colors.** Day: page `#FFFFFF`, ink `#121212`. Night: page `#0E0E0E`, ink `#EDEBE6`. Red `#FF3D1F` in both. Data is drawn in grey tones between page and ink. Canvas code reads the colors from `CD.colors`, which follows the CSS tokens. The wordmark has a file per theme (`.wm-d` and `.wm-l` images, CSS shows one).
- **The one red thing.** Each visualization uses red for exactly one idea: the point that matters (today, the reader's selection, the outlier). Red is never used for text.
- **Type.** Host Grotesk 800 for titles and big numbers. IoskeleyMono (an Iosevka build, OFL-1.1, `fonts/OFL-IoskeleyMono.txt`) in caps for numbers, dates, axes and labels. Its regular and bold are subset to latin and latin-ext (Turkish included) as `fonts/ioskeley-mono-*.woff2`, about 22 KB each, from the v2.2.0 web release. Fragment Mono stays in `fonts/` for the archive pages.
- **The date is the identity.** Days are never numbered. Each carries its date (`Thu 5 Nov 2026`) in the top bar and on its shared image.

## How a day works

- URL: `casualdata.com/YYYY-MM-DD/`, a folder named for the day's date at the root. The query string holds the reader's selection (for example `?d=200&lat=-34`), so a shared link opens the same view.
- One screen: `body.cd-day` is a 100dvh grid made of a bar, a head (title, dek and live readout), the stage (a canvas) and a footer (source). Nothing scrolls.
- Share sheet (`kit/cd.js`): copy the link, the native share sheet (with the image attached where supported), and PNG downloads at 1080×1350 (4:5) and 1600×900 (16:9). The image holds only the visualization, the date and casualdata.com. The day's code supplies `CD.exporter = { draw(ctx, x, y, w, h, scale) }` and the kit adds the date line.
- **The image has no title, so the chart states the point.** Every piece writes its one takeaway into the drawing (a count like "30 of 31 moved left", or a fact on the red mark), so the shared image makes sense on its own.
- **The exporter always draws the finished frame.** A piece that animates on load sets its animation value to 1 while `CD.exporter.draw` runs and restores it after, so a reader who shares in the first second, or from a background tab, never gets a half-drawn image.
- **Text in the chart is at least 11.5 px** (`11.5 * s`) in IoskeleyMono; chips use 11 px for their context line.
- Register each day in `kit/days.js`. The menu and the front page read that list.
- **Drafts.** A day with `draft: true` in `kit/days.js` is left out of the menu and the front page, and its top bar says "Draft". Its URL still works, and adding `?drafts` to any page lists every draft. Remove the flag to publish it.
- **Data is frozen into the day.** Each day's numbers live in its own `data.js`, with sources and timestamps in comments, so the page never depends on another site. `.impeccable/tools/build_data.py` (local only) turned the research files for 6–8 Nov into those `data.js` files.

## Adding a day

1. Copy the latest day's folder to a folder named for the new date (for example `2026-11-06/`) and change `data-day`, the title, dek, meta tags and `data-source`.
2. Write `viz.js`: draw into the stage canvas, make the drawing function reusable for export, and keep the reader's state in the URL.
3. Add the day to `kit/days.js`.

## Launched

The daily front page is `/index.html`. The 2007–2014 homepage moved to `/work/`, and the archive pages' wordmarks link there. `/next/` only redirects to `/`.

## Still to do

- Generate a static `card.png` for each day so link previews have an image (`og:image`). This needs a headless-browser render script. No preview image is set yet.
- Decide where the data for each day comes from and record its source on the page.
