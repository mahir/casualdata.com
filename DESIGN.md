---
name: casualdata daily
description: One interactive data visualization a day, on a page that turns from white to black with the reader's clock.
colors:
  paper: "#FFFFFF"
  ink: "#121212"
  ink-2: "#5A5853"
  ink-3: "#8E8B84"
  rule: "#E6E4DF"
  red: "#E8341C"
  paper-night: "#0E0E0E"
  ink-night: "#EDEBE6"
  ink-2-night: "#A8A59E"
  ink-3-night: "#66635E"
  rule-night: "#2A2927"
  red-night: "#FF5A3D"
  brace-night: "#77746E"
typography:
  display:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "clamp(28px, min(4.4vw, 6.6vh), 72px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "clamp(20px, 1.9vw, 26px)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.22
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Ioskeley Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.02em"
  chart-label:
    fontFamily: "Ioskeley Mono, ui-monospace, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 400
  reading-value:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 600
  wordmark:
    fontFamily: "Host Grotesk"
    fontWeight: 800
    letterSpacing: "-0.05em"
rounded:
  none: "0"
  round: "50%"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 2.4vw, 36px)"
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "48px"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  button-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  button-phone:
    padding: "8px 10px"
    height: "44px"
    width: "44px"
  stepper-arrow:
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "34px"
  stepper-arrow-hover:
    backgroundColor: "{colors.rule}"
  reading-chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.reading-value}"
    rounded: "{rounded.none}"
    padding: "8px"
  day-tile:
    backgroundColor: "{colors.rule}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
  day-nav-phone:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "52px"
  share-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "min(420px, 100vw)"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
---

# Design System: casualdata daily

## Overview

**Creative North Star: "One Red Dot"**

casualdata daily is a sheet of paper that turns over with the day. By the reader's own clock it is white from 07:00 to 18:59 and black otherwise, and on either ground everything is ink and a short ladder of warm greys, except one thing: the single point in each chart that matters, drawn in red. The home page says it outright ("One screen, one idea, one red dot."), and the `{•}` symbol is the same idea drawn as a mark. The red is rare on purpose, so a reader finds the point in seconds and recognizes casualdata from a shared image alone.

The frame is flat, ruled and quiet: a 1px ink rule under the top bar, a grotesk title set light and large, a two-sentence dek saying how to read the chart, and then the chart takes the rest of the screen. Short labels are uppercase mono, so dates, counts, axes and buttons read as one register of small facts. Charts carry their own words: the reading sits inside the drawing in an ink chip beside the point, and every exported image carries the date and casualdata.com at its foot.

This file documents the daily frame (`kit/`). The 2007–2014 archive pages (`/work/` and the project folders, on `css/casualdata.css`) follow [DESIGN-archive.md](DESIGN-archive.md), not this file.

**Key Characteristics:**
- Two grounds, chosen by the reader's local hour; every token has a day and a night value and every drawing works on both.
- One accent, red, tuned per ground; everything else is ink and greys between page and ink.
- Host Grotesk for names and sentences, Ioskeley Mono uppercase for short labels.
- Flat: 1px rules, square chart surfaces, pill buttons, no shadows.
- One screen per day when it fits; the chart has a floor height and the page scrolls rather than squeeze it.

## Colors

A white or black page, ink, three warm greys, and one red per ground. The two theme sets swap in full on `:root[data-theme="dark"]`; canvas drawings read the same tokens through `CD.colors` and redraw when the theme turns.

### Primary
- **Signal Red** (red, day): the one point that matters in each chart (the red line, the red dot, the red arrow, the red people), the dot in the `{•}` symbol, and large labels. At 4.3:1 on white it is below body-text contrast, so it is never used for running text.
- **Night Signal Red** (red-night): the same role on the black page, lifted to stay as loud there (6.2:1).

### Neutral
- **Day Paper / Night Paper** (paper, paper-night): the page, the share panel, the phone bottom bar, and the text inside ink chips and solid buttons.
- **Ink / Night Ink** (ink, ink-night): titles, body, the top-bar and footer rules, button outlines, the reading chip's ground, and the chart marks the reader has selected.
- **Graphite** (ink-2, ink-2-night): secondary text (deks, the intro's second sentence, labels, sources) and unselected chart marks; 7.2:1 by day and 8.1:1 by night.
- **Stone** (ink-3, ink-3-night): axis ticks, quiet chart marks, link underlines in the foot and the disabled stepper arrow. About 3.3:1 on either page: enough for marks, not for text.
- **Hairline** (rule, rule-night): row dividers in lists, the highlight band behind a hovered chart row, the arrow hover disc and the empty image well of a tile.
- **Brace Grey, night** (brace-night): the braces of the wordmark and symbol on the black page only. On white the braces use Stone.

### Named Rules
**The One Red Rule.** Each chart has exactly one red idea: one line, one arrow, one row, one group of people, one "you". Everything else in the drawing is ink, Graphite, Stone or Hairline. If a second thing wants to be red, it is not the point.

**The Marks Not Text Rule.** Red fills marks, dots and underlines and sets large labels; it is never the color of a sentence, a source line or small mono text.

**The Both Grounds Rule.** No color is written into a page or drawing as a literal; use the tokens (CSS variables or `CD.colors`) so the drawing turns with the page at 07:00 and 19:00. The one exception is a tone that depicts the subject itself and must not turn: the 4 Nov daylight map paints night and day in the night and day ink values whatever the theme.

## Typography

**Display Font:** Host Grotesk (with Arial, sans-serif), self-hosted, variable 300–800
**Body Font:** Host Grotesk
**Label/Mono Font:** Ioskeley Mono (with ui-monospace, SF Mono, Menlo, monospace), 400 and 700

**Character:** A plain contemporary grotesk set light at large sizes, against a narrow mono used only in capitals for short facts. The grotesk speaks in sentences; the mono speaks in dates and numbers.

### Hierarchy
- **Display** (400, fluid to 72px, line-height 1, tracking -0.025em): the day title and the lead tile's title on home (which runs to 46px); balanced, at most about 18–20ch.
- **Headline** (500, fluid 20–26px, 1.25): the home intro line, its second sentence in Graphite.
- **Title** (500, 19px, 1.28): tile titles on home; share-panel rows use 600 at 17px.
- **Body** (400, 16px, 1.4–1.45): deks and the home footer text, at most 44–60ch; the day dek steps down to 14px on phones.
- **Label** (Ioskeley Mono 400, 12px, 0.02em, uppercase; buttons and panel headings 0.04em): dates, counts, the top-bar date, buttons, the toast. Source footers use the mono at 12.5px but keep sentence case, because sources are sentences.
- **Chart label** (Ioskeley Mono 400, 11.5px, uppercase): axes, row tags, counts drawn in canvas.
- **Reading value** (Host Grotesk 600, 17px): the number in the reading chip, over an 11px mono context line.

### Named Rules
**The 800 Belongs to the Wordmark Rule.** Weight 800 and -0.05em tracking are the logo's alone. Page titles stay at 400, and nothing in the frame goes above 600.

**The Capitals Are for Facts Rule.** Uppercase mono is for short labels (dates, counts, buttons, axis names). Sentences, including source lines, keep their own case.

## Layout

The day page is a single-column grid of five rows: top bar, head, stage, foot, and on phones the bottom bar. The stage takes the height left over (`1fr`) but never less than its floor, `--stage-min` (clamp 240px, 40dvh, 420px); below that the page scrolls instead of squeezing the chart. The head is two columns (title about 1.6 : dek 1, dek aligned right and bottom) on wide screens and one column at 720px and below.

Horizontal rhythm is one fluid gutter (clamp 16px, 2.4vw, 36px) used for every edge: bar, head, stage margin, foot, home grid and panel. Vertical padding in the head and intro is set in `vh` clamps so the day fits one screen on laptops.

Home is a grid of every day, newest first: three columns above 960px with the newest tile spanning two columns and two rows, two columns from 960px (the lead spans two columns, one row), one column at 600px and below. Column gap clamps 16–28px, row gap 28–48px; the footer sits 56–112px below the grid.

Breakpoints: 960px and 600px for the home grid, 720px for the phone frame (bottom bar, icon-only buttons, 44px targets), 400px for swapping the wordmark for the `{•}` symbol.

**The One Column Head Rule.** Under 1024px the head is one column: the dek goes under the title at up to 60ch, never into a narrow column beside it.

**The Room to Read Rule.** Space is grouped, not spread evenly: tight inside a group (title and dek 12px apart), generous between groups. The page margin is `clamp(20px, 4.4vw, 72px)`; the head takes `clamp(22px, 5.5vh, 64px)` above and `clamp(26px, 6vh, 64px)` below; the source line sits `clamp(16px, 3.4vh, 34px)` under the chart. The generous intervals follow the screen height, so a short screen gives up air before chart; phones keep the head at 18/20px. Inside a chart the same holds: direction labels sit in their own band above the plot (about 46px), the scale in a band below (about 36px), a row heading 14px under its rule, annotations above the plot rather than on it.

**The Floor Not Squeeze Rule.** A chart is never shorter than `--stage-min`. When the screen cannot fit it, the page scrolls and the phone bottom bar stays sticky in thumb reach.

## Elevation & Depth

Flat. There are no shadows anywhere in the frame. Separation is done with 1px rules: ink for structural edges (under the top bar, above the phone bottom bar and home footer, the share panel's left edge, the top of the share list) and Hairline for dividers inside a group. The only overlay is the share panel, a full-height sheet from the right over a 60% black backdrop.

**The Ruled Not Raised Rule.** Depth is a line, never a shadow. A surface that needs to stand apart gets an ink rule on its edge.

## Shapes

Two shapes only. Things the reader reads (the chart stage, tiles, the reading chip, the share panel) are square-cornered. Things the reader presses (buttons, the toast) are full pills, and round things (the stepper arrow's hover disc, the red dots) are circles. Tile images keep the 1200:630 link-card proportion inside a 1px Hairline inset outline.

## Components

### Buttons
Quiet, small and outlined: they read as labels until touched.
- **Shape:** full pill (999px), 1px ink outline.
- **Default:** transparent, ink text in the uppercase mono label (12px, 0.04em), 7px × 14px, optional 12px line icon drawn as inline SVG.
- **Hover:** fills ink with paper text. **Solid** (Share) is the inverse: ink fill at rest, outline on hover.
- **Focus:** 2px ink outline, 3px offset (site-wide).
- **Phone (≤720px):** the text label hides, leaving the icon in a 44px minimum target.

### Reading chip (signature)
The chart's reading, drawn in canvas beside the point it describes (`CD.label`): a square ink block with the value in Host Grotesk 600 over a mono uppercase context line in paper, 8px padding, 12px from the point. It flips left near the right edge, wraps its context at " · " breaks, and is mirrored to screen readers by a polite live region.

### Day tile (home)
- **Two shapes only.** The newest day takes a full row: its image across two thirds at the left, and beside it, as one block at the top of the column (12px apart), the date (its label starts with a small red dot and "Latest"), the title in Display and the dek, over a Hairline rule. Every earlier day is the same tile in one even grid, newest first: four across on wide screens, three under 1200px, two under 960px (where the newest day stacks its caption under the image), one under 600px. A part-filled last row is left as it is: it is where the collection has got to.
- **Corner Style:** square.
- **Image:** the day's own share render in the reader's theme (`thumb.webp` / `thumb-night.webp`, 720 and 1200px), cropped to its chart at 1200:548 so the image's foot (logo, date, address) does not repeat the caption, on a Hairline well.
- **Under it:** the date in the mono label, then the title (500, 18px).
- **Hover / Focus:** the title takes a 2px red underline at a 4px offset; keyboard focus outlines the image in ink.

### Navigation
- **Top bar:** one height on every page, 64px (57px on phones) including its rule, with everything centred in it so no control can stretch it; the logo (20px tall), the date in the mono label (ink weight for the date, Graphite for the subject), and the actions on the right, over a 1px ink rule. On home the right side is a plain mono text link to the archive, never a button, so nothing outranks the days.
- **Day stepper (desktop):** typographic ‹ and › in Host Grotesk 22px either side of the date, each in a 34px circular target that takes a Hairline disc on hover; a missing neighbour shows as a Stone arrow that is not a link; on the newest published day the missing › is announced as "The next day comes tomorrow".
- **Phone bottom bar (≤720px):** previous day · All days · Share · next day, cells at least 52px tall, mono 13px uppercase, a Hairline divider before All days, sticky to the bottom over the paper with the safe-area inset. Share moves here from the top bar as the one solid pill (44px). On the newest day the next cell reads "Tomorrow" in Graphite.

### The reader's selection
Every day handles its reading the same way, through `CD.selection` and `CD.bindSelection` in `kit/cd.js`: pointing previews a reading, a click, tap or key pins it, and only the pinned reading goes into the link (`CD.state`, which keeps `?theme` and `?drafts`); leaving the chart returns to the pinned reading. Keys are the same on every day: arrows step, Escape and Home return to the overview. The chosen mark gets an ink ring. The reading chip (`CD.label`) takes an `avoid` list (headings, other marks) and sits in the first clear place right of, left of, above or below the point.

### Share panel
A full-height dialog sliding from the right edge (up to 420px) over a 35% black backdrop, so the view being shared stays visible; paper ground with an ink left rule, the logo and a Close button at top, a mono heading in Graphite, a line naming the reading the link and image carry, then a ruled list: each row a short mono key (link, send, 4:5, 16:9) and a 600 17px action, red underline on hover. It opens with focus on Copy link. Exported images are the drawing plus one foot line, the same on every image: the `{casualdata}` wordmark (30 units tall) and the date in Graphite mono at left, `casualdata.com/YYYY-MM-DD` in ink at right, in the reader's theme.

### Logo
`{casualdata}`: Host Grotesk 800 letters at -0.05em between weight-300 braces in grey; `{•}`: weight-600 grey braces around one red dot. Two files per mark, one per ground, built from the font by `.impeccable/brand/build/build.py`. The logo never changes and never carries the date; the date sits beside it in the top bar.

### Toast
An ink pill with paper mono label text, centred 24px from the bottom, rising 20px and fading in over 0.2s; still under reduced motion.

## Do's and Don'ts

### Do:
- **Do** read every color from the tokens (`var(--…)` in CSS, `CD.colors` in canvas) and redraw on the `cd-theme` event.
- **Do** give each chart exactly one red idea and draw everything else in ink, Graphite, Stone and Hairline.
- **Do** put the chart's point in words inside the drawing, with `CD.label` beside the point.
- **Do** keep short labels in uppercase Ioskeley Mono at 11.5–12px and sentences in Host Grotesk in their own case.
- **Do** give phone controls 44px minimum targets and keep previous day, All days, Share and next day in the bottom bar.
- **Do** wire every chart through `CD.selection` / `CD.bindSelection`, so preview, pin, keys and the link behave the same on every day.
- **Do** let the page scroll before the stage drops below `--stage-min`.
- **Do** separate surfaces with 1px rules: ink for structure, Hairline inside a group.

### Don't:
- **Don't** set running text, sources or small labels in red; red is for marks, dots, underlines and large labels.
- **Don't** use weight 800 or -0.05em tracking anywhere but the wordmark.
- **Don't** put the date or any daily variation inside the logo.
- **Don't** add shadows, gradients or rounded cards; surfaces are flat and square, and only buttons are pills.
- **Don't** hard-code a hex or rgba for chrome, accent or grey in a day's `viz.js`; a literal color will not turn with the page (subject tones that must stay fixed, like the daylight map's night and day, are the exception).
