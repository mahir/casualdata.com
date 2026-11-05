# casualdata daily: the next version

This branch (`daily`) turns casualdata.com into a site that publishes one interactive data visualization a day. The 2007–2014 work stays in place and is reached from the menu. Everything new lives in new paths, so this branch does not touch the archive redesign on `main`.

## Brand: a black page, light ink, one red dot

- **Name `{casual: data}`.** The name written as a key–value pair: "casual" is the key, "data" the value. The braces and the top dot of the colon are grey, the words are light, and the lower dot of the colon is red. `kit/wordmark.svg` (for the dark page) and `kit/wordmark-light.svg` are outlines of Host Grotesk 800, with braces at weight 600 and tracking at −0.05 em.
- **Symbol `{●}`.** An object holding one value, the day's one thing: the 2005 `{casualdata}` braces with the dot in place of the letters. `kit/mark.svg` is the symbol and `kit/favicon.svg` the symbol on a black square. It stands in for the name where space is tight: the top bar under 400 px wide, the favicon, stamps.
- The logo files are built by `python3 .impeccable/brand/build/build.py fonts/host-grotesk-latin.woff2 kit` (needs fontTools and brotli). That script lives only in local copies, since `.impeccable/` is not published.
- **Three colors.** Page `#0E0E0E`, ink `#EDEBE6`, red `#FF3D1F`. Data is drawn in grey tones between page and ink.
- **The one red thing.** Each visualization uses red for exactly one idea: the point that matters (today, the reader's selection, the outlier). Red is never used for text.
- **Type.** Host Grotesk 800 for titles and big numbers. IoskeleyMono (an Iosevka build, OFL-1.1, `fonts/OFL-IoskeleyMono.txt`) in caps for numbers, dates, axes and labels. Its regular and bold are subset to latin and latin-ext (Turkish included) as `fonts/ioskeley-mono-*.woff2`, about 22 KB each, from the v2.2.0 web release. Fragment Mono stays in `fonts/` for the archive pages.
- **The ticket.** Every day carries a number and a date (`No.001 · Thu 5 Nov 2026`) in the top bar, and the same frame appears in every exported image.

## How a day works

- URL: `casualdata.com/NNN/`, a three-digit folder at the root. The query string holds the reader's selection (for example `?d=200&lat=-34`), so a shared link opens the same view.
- One screen: `body.cd-day` is a 100dvh grid made of a bar, a head (title, dek and live readout), the stage (a canvas) and a footer (source). Nothing scrolls.
- Share sheet (`kit/cd.js`): copy the link, the native share sheet (with the image attached where supported), and PNG downloads at 1080×1350 (4:5) and 1600×900 (16:9). The kit draws the branded frame, and the day's code only supplies `CD.exporter = { draw(ctx, x, y, w, h, scale), readout() }`.
- Register each day in `kit/days.js`. The menu and the front page read that list.

## Adding a day

1. Copy `001/` to `002/` and change `data-day`, the title, dek, meta tags and `data-source`.
2. Write `viz.js`: draw into the stage canvas, make the drawing function reusable for export, and keep the reader's state in the URL.
3. Add the day to `kit/days.js`.

## Before launch (not done yet)

- Move the current homepage to `/work/` and serve `next/index.html` at `/`. Then change the links in the menu and front page that point to `/next/` and to `/`.
- Generate a static `card.png` for each day so link previews have an image (`og:image`). This needs a headless-browser render script. No preview image is set yet.
- Decide where the data for each day comes from and record its source on the page.
