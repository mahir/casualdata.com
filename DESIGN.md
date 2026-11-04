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
---

# Design System: {casualdata}

## Overview

**Creative North Star: "The Quiet Index"**

The archive is a calm index of finished work. A white page carries a grid of photographs, each cropped to the same 3:2 frame, with the project's name on the left and its years on the right beneath it. Everything else is black type at modest sizes and one grey. The frame stays out of the work's way: the photographs supply all the color and texture the page has.

The system is deliberately small. Two families share the work: Host Grotesk sets names and sentences, and Fragment Mono sets the record's data and labels (years, the section label, the footer line), the way a receipt or a log would. The `{casualdata}` wordmark is drawn as outlines of a third face, Archivo, and is never set as live type. There are no borders, cards, panels, shadows, gradients or rounded corners. Hierarchy comes from space, grotesk against mono, weight 500 against 400, and ink against grey.

Each project is recognized by its photograph and, on pointing or focus, by a 3px underline of its name in the project's own color. That underline is the only place a project color appears on the shared frame. The project pages that follow inherit this frame and keep their own logos inside it. The rejected gallery direction (rooms, floor plan, color walls, exhibition metaphor) is not part of this system.

**Key Characteristics:**
- White page, ink type, one grey; color comes from the photographs.
- One 3:2 frame for every work image, cropped with `object-fit: cover`.
- Name left, year right, on one baseline, under every image and in every text row.
- Host Grotesk for names and text, Fragment Mono for years, labels and the footer; Archivo only inside the wordmark outlines.
- Project color only as a 3px name underline on hover and focus.
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
**The Underline-Only Rule.** A project color is used only as the color of the 3px underline under that project's name on hover and focus. Never as text color, fill, border or background: value machine (2.5:1), social bits (4.1:1) and sense of patterns (1.9:1) fail 4.5:1 text contrast on white.

**The Photographs Bring the Color Rule.** The frame stays ink, grey and white. If a surface looks colorful, the color must come from the work's own images or logo.

## Typography

**Display Font:** none as live text. The `{casualdata}` wordmark is an SVG of Archivo outlines (name at width 125, weight 800; braces at weight 300). Archivo's license stays in `fonts/OFL-Archivo.txt`.
**Text Font:** Host Grotesk (Doğukan Karapınar, Element Type; a uniwidth grotesk, so changing weight never changes width), self-hosted variable woff2, weight 300–800, latin and latin-ext files, SIL OFL (`fonts/OFL-HostGrotesk.txt`).
**Mono Font:** Fragment Mono (Wei Huang; a monospaced Helvetica built from URW's Nimbus Sans), self-hosted woff2, one weight (400), latin and latin-ext files, SIL OFL (`fonts/OFL-FragmentMono.txt`).
**Fallbacks:** "Host Grotesk fallback" (local Arial) and "Fragment Mono fallback" (local Courier New) are scaled with `size-adjust` and ascent/descent overrides to the web fonts' metrics, so text moves at most 1px when the fonts arrive. Both latin files are preloaded on every page. Together the latin and latin-ext files cover Turkish.

**Character:** A contemporary grotesk with a little warmth for names, against a narrow, Helvetica-derived mono for dates and labels: an index that reads like a well-kept log. The wordmark's wide heavy cut is the only loud moment, and it stays small.

### Hierarchy
- **Headline** (500, clamp(22px, 2.4vw, 32px), 1.2, max 24ch): the one sentence heading on a notice page such as the 404.
- **Body** (400, 17px, 1.5): running text and prose links such as "back to all projects".
- **Title** (500, 17px, 1.35, -0.005em): project and extra names in captions and text lists.
- **Label** (Fragment Mono 400, 14px, 1.35, grey): years, right-aligned; the section label; the footer line.

### Named Rules
**The Wordmark Stands Alone Rule.** Archivo and its wide heavy cut belong to the wordmark only. All live text is Host Grotesk (weights 400 and 500) or Fragment Mono (400).

**The Mono Is for the Record Rule.** Fragment Mono sets the record's data and labels: years, section labels, the footer line. Names and prose stay in Host Grotesk. The mono has one weight; `font-synthesis: none` keeps the browser from faking a bold, so never ask it for one.

**The Text As Written Rule.** Names keep their original lower-case spelling and dates keep the form the owner gave them ("2007", "2009"). Type styling never changes case.

## Layout

A centered column, max 1600px, with fluid side gutters (20px on phones to 56px on wide screens). Inside it, from the top: the wordmark (header top padding 28–48px), generous space (56–112px), the main content, then the footer line after 96–168px.

The work grid has three equal columns above 1023px, two from 600px to 1023px, and one at 599px and below. Column gap is 20–40px; row gap is 40–72px. Each cell is a full-width 3:2 image with the caption 14px beneath it.

Text lists share the work grid's columns and gap, but every row sits in the first column, so a text row is always exactly one grid column wide at every breakpoint: one third of the page on desktop, half on tablet, full width on phones. A text list that follows the grid starts one row gap below it; a new section (the extras) starts 96–160px below the previous one, with its label 8px above the list.

**The Name Left, Year Right Rule.** Every entry, image caption or text row, is one flex line: name at the start, year at the end, aligned on the baseline, at least 16px apart. An empty year slot means the year is unknown; never fill it with a placeholder.

**The Generous Space Rule.** Sections are separated by space alone, never by rules, boxes or background bands.

## Elevation & Depth

The system is completely flat. There are no shadows, overlays or tonal layers; the only filled area is the blank placeholder behind an image. Depth and emphasis come from the photographs themselves and from space.

**The Flat Page Rule.** Nothing on the frame lifts, glows or casts a shadow, at rest or on hover. State is shown by an underline or an outline, not by elevation.

## Shapes

Square corners everywhere (no radius). Images are rectangular 3:2 crops, never masked or rounded. There are no borders or dividers. The only drawn lines are text underlines (1px for prose links, 3px for the accent under a name) and the focus outline.

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

## Do's and Don'ts

### Do:
- **Do** link every page to `/css/casualdata.css` and build it from the same parts: wordmark header, content column, footer line.
- **Do** set the project's accent class (nk, vm, ns, sb, sop) on the element that holds its name, so the hover and focus underline picks up the project's color.
- **Do** keep each project's own logo on its page as the project's identity, inside the shared frame.
- **Do** crop every work image to 3:2 and give it width, height, alt text and a provenance sidecar.
- **Do** put name left and year right on one baseline, and leave the year empty when it is unknown.
- **Do** keep text lists one grid column wide at every breakpoint, with names of entries that have no page in grey.
- **Do** keep every text color at 4.5:1 or better on white: ink or grey only.

### Don't:
- **Don't** use a project accent as text color, background, border or fill; it is an underline color only.
- **Don't** set live text in Archivo or in heavy weights; the wide cut belongs to the wordmark.
- **Don't** set names or prose in the mono, and never give it a bold or an uppercase.
- **Don't** add borders, cards, panels, shadows, gradients, rounded corners or background bands.
- **Don't** add small uppercase labels above headings or decorative icons.
- **Don't** bring back the gallery metaphor: no rooms, floor plans, wall colors, hanging lines or exhibition language.
- **Don't** rewrite, re-case or shorten names, dates or the footer line.
