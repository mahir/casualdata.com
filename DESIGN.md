---
name: "{casualdata}"
description: "A calm index of the work: white page, black type, a quiet 3:2 grid of photographs, each project's own color only as a hover underline."
colors:
  ink: "#111111"
  index-grey: "#6B6B6B"
  paper: "#FFFFFF"
  blank: "#F4F4F4"
  newsknitter-red: "#B92025"
  value-machine-grey: "#A3A3A3"
  newshaper-black: "#111111"
  social-bits-orange: "#EE3100"
  sense-of-patterns-pink: "#F6A6AA"
typography:
  headline:
    fontFamily: "Host Grotesk, Host Grotesk fallback, Arial, sans-serif"
    fontSize: "clamp(22px, 2.4vw, 32px)"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Host Grotesk, Host Grotesk fallback, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Host Grotesk, Host Grotesk fallback, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.005em"
  subhead:
    fontFamily: "Host Grotesk, Host Grotesk fallback, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Fragment Mono, Fragment Mono fallback, Courier New, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.35
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  max-width: "1600px"
  head-top: "clamp(28px, 3.5vw, 48px)"
  main-top: "clamp(56px, 8vw, 112px)"
  grid-row-gap: "clamp(40px, 5vw, 72px)"
  grid-column-gap: "clamp(20px, 2.5vw, 40px)"
  caption-top: "14px"
  caption-gap: "16px"
  list-row: "12px"
  section-gap: "clamp(96px, 11vw, 160px)"
  foot-top: "clamp(96px, 12vw, 168px)"
  record-row-gap: "clamp(56px, 7vw, 96px)"
components:
  wordmark:
    height: "clamp(20px, 2vw, 28px)"
  work-image:
    backgroundColor: "{colors.blank}"
    width: "100%"
  work-name:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  work-year:
    textColor: "{colors.index-grey}"
    typography: "{typography.label}"
  text-list-row:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "12px 0"
  text-list-row-unlinked:
    textColor: "{colors.index-grey}"
    typography: "{typography.title}"
    padding: "12px 0"
  section-label:
    textColor: "{colors.index-grey}"
    typography: "{typography.label}"
  footer-line:
    textColor: "{colors.index-grey}"
    typography: "{typography.label}"
  notice-heading:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    width: "24ch"
  project-logo:
    height: "clamp(36px, 4vw, 56px)"
  record-label:
    textColor: "{colors.index-grey}"
    typography: "{typography.label}"
  record-body:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    width: "66ch"
  photo-row:
    height: "clamp(120px, 13vw, 200px)"
    gap: "8px"
  viewer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
---

# Design System: {casualdata}

## Overview

**Creative North Star: "The Quiet Index"**

The archive is a calm index of finished work. A white page carries a grid of photographs, each cropped to the same 3:2 frame, with the project's name on the left and its years on the right beneath it. Everything else is black type at modest sizes and one grey. The frame stays out of the work's way: the photographs supply all the color and texture the page has.

The system is deliberately small. Two families share the work: Host Grotesk sets names and sentences, and Fragment Mono sets the record's data and labels (years, the section label, the footer line), the way a receipt or a log would. The `{casualdata}` wordmark is drawn as outlines of a third face, Archivo, and is never set as live type. There are no borders, cards, panels, shadows, gradients or rounded corners. Hierarchy comes from space, grotesk against mono, weight 500 against 400, and ink against grey.

Each project is recognized by its photograph and, on pointing or focus, by a 3px underline of its name in the project's own color. On a project page the same color also marks its links on hover and focus; underlines are the only place a project color appears on the shared frame. A project page is the same frame in a longer form: the project's own logo with its year, one banner photograph, then the record as label-and-content rows, then the photographs in justified rows that open in a white full-screen viewer. The rejected gallery direction (rooms, floor plan, color walls, exhibition metaphor) is not part of this system.

**Key Characteristics:**
- White page, ink type, one grey; color comes from the photographs.
- One 3:2 frame for every work image, cropped with `object-fit: cover`.
- Name left, year right, on one baseline, under every image and in every text row.
- Host Grotesk for names and text, Fragment Mono for years, labels and the footer; Archivo only inside the wordmark outlines.
- Project color only as an underline on hover and focus: 3px under names, 2px under links in a project's record.
- Flat: no borders, shadows, radii or fills beyond the blank image placeholder.

## Colors

A black-and-white frame with one grey, and five project colors held back for a single underline.

### Primary
- **Index Ink** (#111111): all names, headings, body text and links; the focus outline; the selection background. Contrast on paper 18.9:1.

### Secondary
The project accents, each sampled from the project's own logo and bound to it by a class on the work's list item (or, on a project page, on the page): newsknitter (`.nk`), value machine (`.vm`), newshaper (`.ns`), social bits (`.sb`), sense of patterns (`.sop`).
- **Newsknitter Red** (#B92025): newsknitter's underline.
- **Value Machine Grey** (#A3A3A3): value machine's underline. 2.5:1 on white.
- **Newshaper Black** (#111111): newshaper's underline; the same value as ink.
- **Social Bits Orange** (#EE3100): social bits' underline. 4.1:1 on white.
- **Sense of Patterns Pink** (#F6A6AA): sense of patterns' underline. 1.9:1 on white.

### Neutral
- **Index Grey** (#6B6B6B): years, the extras label, the footer line, and the names of entries that have no page. 5.3:1 on paper, so it is the lightest value allowed for text.
- **Paper** (#FFFFFF): the page background; also the `theme-color` and the selection text.
- **Blank** (#F4F4F4): the placeholder fill behind a work image while it loads. Never a surface or panel color.

### Named Rules
**The Underline-Only Rule.** A project color is used only as the color of an underline on hover and focus: 3px under the project's name, 2px under a link in the project's record. Never as text color, fill, border or background: value machine (2.5:1), social bits (4.1:1) and sense of patterns (1.9:1) fail 4.5:1 text contrast on white.

**The Photographs Bring the Color Rule.** The frame stays ink, grey and white. If a surface looks colorful, the color must come from the work's own images or logo.

## Typography

**Display Font:** none as live text. The `{casualdata}` wordmark is an SVG of Archivo outlines (name at width 125, weight 800; braces at weight 300). Archivo's license stays in `fonts/OFL-Archivo.txt`.
**Text Font:** Host Grotesk (Doğukan Karapınar, Element Type; a uniwidth grotesk, so changing weight never changes width), self-hosted variable woff2, weight 300–800, latin and latin-ext files, SIL OFL (`fonts/OFL-HostGrotesk.txt`).
**Mono Font:** Fragment Mono (Wei Huang; a monospaced Helvetica built from URW's Nimbus Sans), self-hosted woff2, one weight (400), latin and latin-ext files, SIL OFL (`fonts/OFL-FragmentMono.txt`).
**Fallbacks:** "Host Grotesk fallback" (local Arial) and "Fragment Mono fallback" (local Courier New) are scaled with `size-adjust` and ascent/descent overrides to the web fonts' metrics, so text moves at most 1px when the fonts arrive. Both latin files are preloaded on every page. Together the latin and latin-ext files cover Turkish.

**Character:** A contemporary grotesk with a little warmth for names, against a narrow, Helvetica-derived mono for dates and labels: an index that reads like a well-kept log. The wordmark's wide heavy cut is the only loud moment, and it stays small.

### Hierarchy
- **Headline** (500, clamp(22px, 2.4vw, 32px), 1.2, max 24ch): the one sentence heading on a notice page such as the 404.
- **Body** (400, 17px, 1.5): running text, record entries, and prose links such as "back to all projects".
- **Title** (500, 17px, 1.35, -0.005em): project and extra names in captions and text lists.
- **Subhead** (500, 22px, 1.3, -0.01em): a heading inside running text on a project page (value machine's "Commons & Economy"), 1.5em below the paragraph before it.
- **Label** (Fragment Mono 400, 14px, 1.35, grey): years, right-aligned; section labels; on project pages the when-and-where of a dated entry, publisher and e-mail lines, file formats and sizes, and the photo viewer's count and controls; the footer line.

### Named Rules
**The Wordmark Stands Alone Rule.** Archivo and its wide heavy cut belong to the wordmark only. All live text is Host Grotesk (weights 400 and 500) or Fragment Mono (400).

**The Mono Is for the Record Rule.** Fragment Mono sets the record's data and labels: years, section labels, the footer line. Names and prose stay in Host Grotesk. The mono has one weight; `font-synthesis: none` keeps the browser from faking a bold, so never ask it for one.

**The Text As Written Rule.** Names keep their original lower-case spelling and dates keep the form the owner gave them ("2007", "2009"). Type styling never changes case.

## Layout

A centered column, max 1600px, with fluid side gutters (20px on phones to 56px on wide screens). Inside it, from the top: the wordmark (header top padding 28–48px), generous space (56–112px), the main content, then the footer line after 96–168px.

The work grid has three equal columns above 1023px, two from 600px to 1023px, and one at 599px and below. Column gap is 20–40px; row gap is 40–72px. Each cell is a full-width 3:2 image with the caption 14px beneath it.

Text lists share the work grid's columns and gap, but every row sits in the first column, so a text row is always exactly one grid column wide at every breakpoint: one third of the page on desktop, half on tablet, full width on phones. A text list that follows the grid starts one row gap below it; a new section (the extras) starts 96–160px below the previous one, with its label 8px above the list.

A project page keeps the same column and gutters. Under the head and banner, its record is a stack of rows 56–96px apart. Above 1023px each row puts its label in the first grid column and its content across the other two; at 1023px and below the label sits 12px above full-width content. Running text keeps a 66ch measure. Photo groups use the same content column.

**The Name Left, Year Right Rule.** Every entry, image caption or text row, is one flex line: name at the start, year at the end, aligned on the baseline, at least 16px apart. An empty year slot means the year is unknown; never fill it with a placeholder.

**The Generous Space Rule.** Sections are separated by space alone, never by rules, boxes or background bands.

## Elevation & Depth

The system is completely flat. There are no shadows, overlays or tonal layers; the only filled area is the blank placeholder behind an image. Depth and emphasis come from the photographs themselves and from space.

**The Flat Page Rule.** Nothing on the frame lifts, glows or casts a shadow, at rest or on hover. State is shown by an underline or an outline, not by elevation.

## Shapes

Square corners everywhere (no radius). Images are rectangular 3:2 crops, never masked or rounded. There are no borders or dividers. The only drawn lines are text underlines (1px for prose links at rest, 2px in the accent on hover inside a project's record, 3px for the accent under a name) and the focus outline. Photographs on project pages keep their own proportions and are never cropped, except the banner.

## Components

### Wordmark header
- **Form:** the `{casualdata}` SVG at the top left of the content column, 20–28px tall (clamp(20px, 2vw, 28px)), width automatic.
- **Home page:** the wordmark is the page's `h1`, not a link.
- **Every other page:** the wordmark is a link to `/` with alt text "casualdata home". A project page shows its own project logo inside the page content, not in place of this wordmark.

### Work tile
- **Structure:** a list item carrying the project's accent class, containing one link (or a plain block if there is no page) that holds the image and the caption. The whole tile is the link; it has no underline at rest.
- **Image:** 3:2, `object-fit: cover`, full column width, blank placeholder fill, explicit width and height attributes, responsive `srcset`. Images below the first row load lazily. Every shipping raster carries its provenance in a sidecar JSON.
- **Caption:** name (title role, ink) left, year (label role, mono, grey) right.
- **Hover / Focus:** the name gains a 3px underline in the project's accent, offset 0.35em, fading in over 0.2s on cubic-bezier(0.16, 1, 0.3, 1). Keyboard focus also draws the ink outline 8px outside the tile.

### Text list
- **Use:** entries without an image: projects without a page, and the extras / research list. On project pages, the same pattern fits any name-and-date list.
- **Row:** name left, year right, 12px vertical padding, title and label roles; no dividers between rows.
- **Linked row:** ink name, no underline at rest, accent underline on hover and focus like a work tile (ink when no project class is set).
- **Unlinked row:** the name is in grey so it does not read as a link; nothing reacts to the pointer.

### Section label
- A plain heading in the label role (mono, grey), sitting 8px above its list. Lower-case as written ("extras / research"). No rule, no uppercase, no tracking.

### Links and focus
- **Prose links:** inherit the text color, 1px underline offset 0.25em. Used for sentences such as "back to all projects".
- **Focus:** a 2px ink outline offset 4px on every focusable element (8px on work tiles). Selection is ink with paper text.
- **Motion:** only the underline color transitions; with reduced motion set, all transitions are off.

### Footer line
- "All data is somehow casual, 2005–today." in the label role (mono, grey), at the bottom of every page.

### Notice page
- The 404 pattern: the wordmark header, one headline sentence (max 24ch) in place of the grid, a prose link 24px below it, and the footer line.

### Project page head
- The project's own logo as the page's `h1` (an SVG where one can be drawn from the project's print files, alt text the project's name), clamp(36px, 4vw, 56px) tall. The project's year sits at the right in the label role, its baseline on the baseline of the logo's lettering (`--logo-baseline`, 0.6 of the logo height by default).
- Both are set per page on `.project-head` when the logo needs it: a long one-line title sets a smaller `--logo-h` so it fits a phone (value machine: clamp(15px, 1.35vw, 20px), `--logo-baseline: 0.988`, so its slab title stays about as tall as newsknitter's lettering). Newshaper keeps the default height with `--logo-baseline: 0.579`, the baseline of NEWSHAPER below the raised hand; its logo is the outlines from the project's 2009 project sheet PDF, recoloured to ink.

### Banner
- One photograph across the full content width, 24–40px below the head, in the proportion of the project's original banner (newsknitter: 3.4:1, rebuilt from the press original; newshaper: 3.4:1, the 2009 banner's framing cut again from the press original it was taken from). On phones a `<picture>` source may serve a taller crop of the same photograph.
- The proportion may differ per project when the crop has to end cleanly on the photo's content (value machine: about 3.7:1, the top of the interface close-up, ending between two rows of the list). A project whose original header was a drawing still leads with a photograph; the drawing moves into the text (see Drawing and sign-off).

### Record row
- A `section.row`: the section label (`h2`, label role, line height 25.5px so it sits on the first line of the content) and the content (`.row-body`, body role). Section names and order follow the project's original page; names that page set in capitals for effect are set in normal case (value machine, at the user's request). Credits & Thanks may move to the end, after the videos and photographs, when the original page put it before them (newshaper, at the user's request).
- Running text (`.prose`): 66ch measure, paragraphs 0.9em apart.
- Links in a row: ink with a 1px underline at rest; on hover and focus the underline turns the project's accent and 2px.

### Dated entries
- `.events`: when and where ("September 2007, Linz") in the label role in a 240px column, what happened in the body role beside it, 6px apart; stacked on phones.

### Publications
- `.books`: a 96px cover (72px on phones) beside the title (500, the link), the authors line, and the publisher line in the label role. Two side by side on desktop and tablet, one on phones.

### Link list
- `.link-list`: names that are links, with no underline at rest and a 3px accent underline on hover and focus, like a text-list name. Columns of at least 9.5rem: three on desktop, two on phones. A long single word gets a `<wbr>` at a natural break.

### People
- `.people`: one block per person: the name as a 500-weight link, the affiliation in the body role, the e-mail in the label role. Two side by side above 599px.

### Photo rows
- `.photos[data-gallery]`: links to the large file, each with `--ar` set to the photo's width ÷ height, holding a lazy-loaded 800px WebP with width, height and alt text, 8px apart, never cropped. The target row height is `--row` (clamp(120px, 13vw, 200px); 100px on phones).
- `/js/photo-rows.js` (loaded with `defer` wherever `.photos` appears) sets the rows: a photo joins a row while that brings the row's height closer to `--row`, and each row is sized to fill the width exactly. The last row fills the width too if that makes it at most 15% taller than the row above; otherwise it keeps the row above's height and stays visibly partial (measured from 320px to 1700px: no middle row ends short, no last row is taller than the one above, and a partial last row leaves at least a fifth of the width empty).
- Without the script, the CSS fallback justifies rows by flex-grow in proportion to `--ar`. Growth is capped at `--grow-max` (1.4; 2.4 on phones, where narrow rows need more), just above what a full row needs, so a nearly full last row still fills the width and a short one stays visibly partial at about the height of the rows above. A gallery whose own photos need more (mostly portraits) sets `--grow-max-wide` on itself after measuring every width from 600px to 1700px; value machine uses 1.6. Phones keep 2.4 regardless. Cursor zoom-in; no hover effect on the photo.
- `.figure[data-gallery]`: a single photograph across the content, linked to its large file.
- On a press images page (`newsknitter/300dpi/`), each link points at the full-size press JPEG, so without the script it opens the file to save; the viewer shows the 2000px WebP preview and offers the JPEG and TIFF (see Photo viewer). The page's `h1` is the first row's label ("Hi-res Images"), and the project logo above it links back to the project page.
- Large files are WebP, 2000px on the long side when a press original exists, otherwise the original page's size. Each carries a provenance sidecar.

### Videos
- `.videos`: the project's own video players (Vimeo iframes from the original page, with `dnt=1` added and `loading="lazy"`), each 16:9 on a blank (#F4F4F4) ground, side by side when each can be at least 22rem wide and stacked below that, with the column gutter (clamp(20px, 2.5vw, 40px)) between them, so they read as two players. Each iframe has a `title`.

### Drawing and sign-off
- `.prose > .drawing`: a small drawing from the project's original page, set between paragraphs at the size it was drawn, 2em above and below (value machine's network drawing, 195×155).
- `.prose > .sign-off`: a closing line quoted from the work, in the label role, 1.6em below the last paragraph (value machine's "THANKS FOR PURCHASING INFORMATION", as its receipts printed it).

### Files
- `.files`: name left (title role), format and size right (label role, never wrapping), like a text-list row, with the accent underline on the name on hover and focus.
- `.files-note`: one grey line in the body role, 16px under the list, for files offered elsewhere on the page (newshaper: "Open any photo above to download it as a 300 dpi JPEG.").

### Colophon
- The project's own credit line from its original page, in the body role, grey, in the content column at the end of the record.

### Photo viewer
- `/js/lightbox.js`, loaded with `defer` on any page with a `[data-gallery]`. A `<dialog>` that fills the screen in paper: the photo contained in it, and one bar beneath with the count ("3 / 10", label role, grey) at the left and previous, next and close at the right as words in the label role, with a 2px accent underline on hover and focus.
- Arrow keys and swipe step through the group and wrap; Esc or a click outside the photo closes; focus starts on close and returns to the opening link; the page stops scrolling while it is open. A photo that is still loading is hidden (opacity 0, 0.2s) rather than leaving the previous one on screen.
- No captions: the alt text stays alt text. Without the script, each link opens its image file.
- **Downloads (press images page, or a project page whose press originals are on hand):** a link may carry `data-preview` (a lighter image the viewer shows instead of the link's own file), `data-download` (a label such as "JPEG, 583 KB" that offers the link's own file) and `data-original` with `data-original-label` (a further file, such as the TIFF in the `media` Release). The viewer then lists them right after the count: "download" in grey, then each file as a link with a 1px ink underline that turns 2px and the accent on hover and focus. On a project page (newshaper), the link keeps pointing at the 2000px WebP and `data-original` alone offers the 300 dpi JPEG. On phones the downloads take their own line above the count and the controls. Sizes are decimal (1 MB = 1,000,000 bytes), KB below 1 MB, one decimal place for MB.

## Do's and Don'ts

### Do:
- **Do** link every page to `/css/casualdata.css` and build it from the same parts: wordmark header, content column, footer line.
- **Do** set the project's accent class (nk, vm, ns, sb, sop) on the element that holds its name, so the hover and focus underline picks up the project's color.
- **Do** keep each project's own logo on its page as the project's identity, inside the shared frame.
- **Do** crop every work image to 3:2 and give it width, height, alt text and a provenance sidecar.
- **Do** put name left and year right on one baseline, and leave the year empty when it is unknown.
- **Do** keep text lists one grid column wide at every breakpoint, with names of entries that have no page in grey.
- **Do** keep every text color at 4.5:1 or better on white: ink or grey only.
- **Do** keep a project page's sections, text and order as on its original page; add only what the user approved (such as a downloads list of the project's own documents).
- **Do** mark every group of photos with `data-gallery`, give each link `--ar` and each image width, height and alt text, and load `/js/lightbox.js` and `/js/photo-rows.js` on that page.

### Don't:
- **Don't** use a project accent as text color, background, border or fill; it is an underline color only.
- **Don't** set live text in Archivo or in heavy weights; the wide cut belongs to the wordmark.
- **Don't** set names or prose in the mono, and never give it a bold or an uppercase.
- **Don't** add borders, cards, panels, shadows, gradients, rounded corners or background bands.
- **Don't** add small uppercase labels above headings or decorative icons.
- **Don't** bring back the gallery metaphor: no rooms, floor plans, wall colors, hanging lines or exhibition language.
- **Don't** rewrite, re-case or shorten names, dates or the footer line.
- **Don't** show alt text as visible captions or add descriptions of the work; the archive adds no new text.
