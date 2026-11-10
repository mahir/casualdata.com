# casualdata daily: the next version

This branch (`daily`) turns casualdata.com into a site that publishes one interactive data visualization a day. The 2007–2011 work stays in place and is linked from the home page. Everything new lives in new paths, so this branch does not touch the archive redesign on `main`.

## Brand (decided 8 Nov 2026; see PRODUCT.md)

- **Logo `{casualdata}`, icon `{•}`.** The whole name between braces, the same every day; it never carries a date. The letters are Host Grotesk 800 at −0.05 em tracking, the braces Host Grotesk 300 in grey. The icon is the braces (weight 600) around one red dot, used where the name does not fit: the favicon and the top bar under 400 px. Files in `kit/`: `wordmark.svg` and `mark.svg` for the black page, `wordmark-light.svg` and `mark-light.svg` for the white one, `favicon.svg`. They are built by `python3 .impeccable/brand/build/build.py fonts/host-grotesk-latin.woff2 kit` (needs fontTools and brotli; the script lives only in local copies, since `.impeccable/` is not published).
- **Day and night.** The page is white from 07:00 to 18:59 by the reader's own clock and black otherwise. `kit/theme.js` runs in `<head>` before the stylesheet, sets `data-theme` on `<html>`, checks again every minute and sends a `cd-theme` event so canvases redraw. `?theme=light` or `?theme=dark` forces one. Every page loads it.
- **Colors.** Day: page `#FFFFFF`, ink `#121212`, red `#E8341C`. Night: page `#0E0E0E`, ink `#EDEBE6`, red `#FF5A3D`. Data is drawn in grey tones between page and ink. Canvas code reads the colors from `CD.colors`, which follows the CSS tokens.
- **The one red thing.** Each visualization uses red for exactly one idea: the point that matters (today, the reader's selection, the outlier). Red marks and large labels only, never running text. **On a chart about political parties the accent is green instead** (`CD.colors.green`: `#0E9F6E` by day, `#3DDC97` by night), because readers take red for Republican; the parties stay in ink and greys (the user's decision on 9 Nov 2026).
- **Type.** Host Grotesk for titles and text. IoskeleyMono (an Iosevka build, OFL-1.1, `fonts/OFL-IoskeleyMono.txt`) in caps for numbers, dates, axes and labels, subset to latin and latin-ext as `fonts/ioskeley-mono-*.woff2`. Fragment Mono stays in `fonts/` for the archive pages.
- **The date is the identity of a day,** never a number: it sits in the top bar beside the logo and on every shared image.

## Navigation (8 Nov 2026)

- **Home (`/`) is every day as a grid,** newest first: the newest leads at twice the size with its intro, the rest follow as tiles of their link-preview image, date and title. Drafts are left out unless the URL has `?drafts`. Each tile shows the day's preview in the reader's theme: `thumb.webp` and `thumb-1200.webp` by day, `thumb-night.webp` and `thumb-night-1200.webp` by night, with the first two tiles loaded at once and the rest lazily.
- **On a day page,** the top bar holds the logo (home), the date between ‹ and › (previous and next day, built by `kit/cd.js` from `kit/days.js`), All days (home) and Share. On phones (720 px and under) the arrows move to a bar at the bottom: previous day · All days · next day, each at least 44 px tall. A draft steps through drafts too.
- There is no menu panel any more; the archive is linked from the home page's top bar and footer.

## How a day works

- URL: `casualdata.com/YYYY-MM-DD/`, a folder named for the day's date at the root. The query string holds the reader's selection (for example `?d=200&lat=-34`), so a shared link opens the same view.
- One screen: `body.cd-day` is a 100dvh grid made of a bar, a head (title, dek and live readout), the stage (a canvas) and a footer (source). The stage keeps a minimum height (`--stage-min`); when the screen is too short for it (large text, a phone on its side) the page scrolls, and the phone bottom bar stays pinned.
- The canvas is `role="application"` with `aria-roledescription="interactive chart"`, and its `aria-label` says what it shows and which keys move the reading.
- Share sheet (`kit/cd.js`): copy the link, the native share sheet (with the image attached where supported), and PNG downloads at 1080×1350 (4:5) and 1600×900 (16:9). The image holds only the visualization and one foot line: the `{casualdata}` wordmark at the left and the date at the right. The day's code supplies `CD.exporter = { draw(ctx, x, y, w, h, scale) }` and the kit adds the date line.
- **The image has no title, so the chart states the point.** Every piece writes its one takeaway into the drawing (a count like "30 of 31 moved left", or a fact on the red mark), so the shared image makes sense on its own.
- **The exporter always draws the finished frame.** A piece that animates on load sets its animation value to 1 while `CD.exporter.draw` runs and restores it after, so a reader who shares in the first second, or from a background tab, never gets a half-drawn image.
- **Text in the chart is at least 11.5 px** (`11.5 * s`) in IoskeleyMono; chips use 11 px for their context line.
- Register each day in `kit/days.js`. The home grid and the day stepper read that list.
- **Drafts.** A day with `draft: true` in `kit/days.js` is left out of the home grid and the stepper, and its top bar says "Draft". Its URL still works, and adding `?drafts` to any page lists every draft. Remove the flag to publish it.
- **Data is frozen into the day.** Each day's numbers live in its own `data.js`, with sources and timestamps in comments, so the page never depends on another site. `.impeccable/tools/build_data.py` (local only) turned the research files for 6–8 Nov into those `data.js` files.

## Adding a day

1. Copy the latest day's folder to a folder named for the new date (for example `2026-11-06/`) and change `data-day`, the title, dek, meta tags and `data-source`.
2. Write `viz.js`: draw into the stage canvas, make the drawing function reusable for export, and wire the reader's reading through `CD.selection` and `CD.bindSelection` (`kit/cd.js`): pointing previews, a click, tap or arrow key pins, Escape and Home go back to the overview, and only the pinned reading goes into the link. Add `readout` to `CD.exporter` so the share panel can name what is shared.
3. Add the day to `kit/days.js`.
4. Render its images with `node tools/cards.js YYYY-MM-DD` (a local server on port 8000 must be running). It writes `/YYYY-MM-DD/card.png`, 1200×630 in the day theme, through the same `CD.render` the share sheet uses (the page's `og:image` tags point at it), and, when `cwebp` is installed, the home grid's four thumbnails from a day and a night render. Render them again whenever the day's data changes.
5. Run `python3 tools/seo.py`. It rewrites the `<!-- seo -->` block in every page's `<head>` (canonical link, the Open Graph and Twitter tags a page doesn't set by hand, JSON-LD: Organization, Article and Dataset for a day, CreativeWork for an archive project), writes the home grid as static HTML so crawlers that run no JavaScript find every day, and regenerates `sitemap.xml`, `robots.txt`, `feed.xml` (RSS) and `llms.txt`. A day's Dataset lists the source URLs it finds in `data.js`, so keep them there. It also stamps each daily page's stylesheet and script addresses with a hash of the file (`/kit/cd.css?v=d523b8f7`), because Pages lets browsers keep a file for ten minutes and a new page with an old stylesheet looks broken; so run it after any change to `kit/` or to a day's `viz.js` or `data.js`, not only after adding a day. `kit/days.js` is stamped on the home page only, since it changes daily and day pages only read their neighbours from it. Drafts get `noindex` and stay out of the sitemap, feed and home grid. Don't edit inside the `<!-- seo -->` blocks or the four site files by hand: the script overwrites them.

## Launched

The daily front page is `/index.html`. The 2007–2011 homepage moved to `/work/`, and the archive pages' wordmarks link there. `/next/` only redirects to `/`.

## Still to do

- Decide where the data for each day comes from and record its source on the page.
