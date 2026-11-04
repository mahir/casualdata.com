# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curators, press and researchers looking up casualdata's past projects. They want to see what the work was, when and where it was shown, and who made it.

## Product Purpose

casualdata.com is the archive of casualdata's finished data-visualization art projects, 2007–2014. Nothing new gets added. Success means every project is easy to find, reads well on any screen, and keeps its record intact: description, exhibitions, credits, images and video.

Projects, in the order the homepage lists them: newsknitter (2007), value machine (2008), newshaper (2009), social bits (2009), sense of patterns (2011). olgusal (2014–) has no page and its domain is gone, so it is left off the homepage for now (the user's decision on 2026-11-04). Extras / research: referandum (2010). tbmmtweets and secim2011 (`extra/tbmmtweets/`, `extra/secim2011/`) stay in the repo but are not linked from the homepage (the user's decision on 2026-11-04).

## Positioning

Each project turns a stream of everyday, "casual" data (news feeds, blog conversations, tweets, taxi GPS traces, commuter locations, election results) into a made object or exhibited piece: knitted sweaters, an interactive printer installation, a tabletop interface, wearables, printed posters, maps.

## Operating Context

Every page must work on desktop and phone screens, since a visitor may arrive at the homepage or directly on one project page. Images open larger on click (Thickbox today), videos play from Vimeo, socialbits' slideshows are Flickr album embeds, and large press images and videos download from the repo's `media` GitHub Release.

## Capabilities and Constraints

- Static HTML and CSS served by GitHub Pages from the root of `main`; no build step, and every push deploys. PHP, `.htaccess` and server-side includes don't run.
- Each project folder is a self-contained microsite with its own assets.
- Keep each page's language: the pages under `extra/` are Turkish, the rest English.

## Brand Commitments

- The name is written `{casualdata}`. The logo is `img/casualdata.svg`, redrawn in 2026 at the user's request as a high-resolution wordmark (the original was a 102×15 PNG).
- Footer line: "All data is somehow casual, 2005–today." (the end year was "2014" until the user changed it on 2026-11-04)
- Every page shares one casualdata layout and type system. Inside it, each project keeps its own logo and signature color.
- Minimal and modern: a white page, a quiet image grid, mostly black and white, each project's color only as a small accent. No gallery or exhibition metaphor (the user's decision on 2026-11-03, after seeing a gallery-themed build).
- The text is a historical record: keep it as written, fixing only typos and broken links.

## Evidence on Hand

Project logos, photographs, exhibition and production images, press images (`*/300dpi/`), posters, Vimeo videos, Flickr albums, the ISEA 2009 paper (`newsknitter/Wearable_Information_ISEA2009.pdf`), and the exhibition and press lists already on each page. There are no testimonials, metrics or new descriptions; don't invent any.

## Product Principles

1. The work leads; the frame stays out of its way.
2. The record is the product: dates, venues, credits and text survive every change.
3. Each project stays recognizable by its own logo and color.
4. Static files only, so the archive keeps working without maintenance.

## Accessibility & Inclusion

Text contrast at least 4.5:1 (WCAG AA). The homepage link colors were darkened to meet it.
