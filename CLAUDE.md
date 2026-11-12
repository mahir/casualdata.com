# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

casualdata.com is **casualdata daily: one interactive data visualization a day**, each on its own dated page (`/YYYY-MM-DD/`), plus the finished archive of casualdata's 2007–2011 data-visualization art projects (`/work/` and the project folders, pulled off old cPanel/Apache shared hosting). New design and product work goes to daily; the archive is kept intact and only carries the shared name and mark. [PRODUCT.md](PRODUCT.md) records what the site is for and the user's binding decisions, [NEXT.md](NEXT.md) how a day is built and added, [DESIGN.md](DESIGN.md) the daily visual system, and [DESIGN-archive.md](DESIGN-archive.md) the archive's.

There is no build system, package manager, linter or test suite. Every page is static HTML.

## Hosting

GitHub Pages serves the site from the root of `main` in the **public** repo `github.com/mahir/casualdata.com`, at `casualdata.com`, which is set by the `CNAME` file. Cloudflare is both the registrar and the DNS host. Every push to `main` is a deploy.

- Keep `.nojekyll`. Without it, Pages runs Jekyll, which silently drops every folder whose name starts with `_` (`_data/`, `_work/`).
- Pages only serves files: no `.htaccess`, server-side includes or PHP. `/404.html` is the not-found page for every path, so it uses root-absolute asset paths.
- Pages caps a site at 1 GB. Videos (`*.mov`, `*.mp4`), TIFFs, `nkdvd.zip` and the two big `senseofpatterns/_data/` files are git-ignored and hosted as assets of the `media` GitHub Release instead. Link to them as `https://github.com/mahir/casualdata.com/releases/download/media/<file>`, as `newsknitter/300dpi/` does. Release asset names are flat, so every name must be unique.
- `.gitignore` also keeps out the credentials, the customer-data file and the copyrighted PDFs. Those exist only in local copies.
- The site is served over HTTPS, so browsers block any `http://` script, stylesheet or iframe as mixed content. Every published page currently loads only `https://` or local resources. Outbound links may still be `http://`, and that's fine.

## Previewing locally

```bash
python3 -m http.server 8000          # from the repo root
```

`.claude/launch.json` defines this same server on port 8731 (named `static`) for the app's preview pane, and a second one on port 8732 (named `static-alt`) for when another session already holds 8731. `http.server` sends no cache headers, so after editing CSS, force the browser to reload the stylesheet before you measure or screenshot.

Pages use relative asset paths, so serve from the repo root and open `/<project>/`.

## Layout

**Since 2026-11-06 the root is casualdata daily**, one data visualization a day: `/index.html` is its front page, each day lives in `/YYYY-MM-DD/` (`index.html`, `viz.js`, `data.js`, `card.png`), and the shared code is in `kit/` (see [NEXT.md](NEXT.md)). Every page follows the reader's clock: white by day, black by night (`kit/theme.js`, fixed by the user on 2026-11-08). **Days from 2026-11-13 on use the `cd-full` layout** (the user's decision on 2026-11-12, after finding 3 Nov's first version a small chart under too much text): one title, one sentence of dek, one line of source, and the chart fills the rest of the page; `/2026-11-03/` is the model and NEXT.md, "The layout of a day", has the rules. On 2026-11-08 the user asked for a new, much better design system and brand for daily; everything but day/night is open (see PRODUCT.md). The 2007–2011 homepage described below is now `/work/index.html`, and the archive pages' wordmarks link there. `/next/` only redirects to `/`.

### The archive (2007–2011)

The archive pages were redesigned page by page into one minimal, modern shared frame: a white page, a quiet grid of the work, black and white type, and each project's own color only as a small accent. [PRODUCT.md](PRODUCT.md) records what the site is for and the user's binding decisions (keep the text as written; one shared frame; each project keeps its logo and color; minimal, with no gallery or exhibition metaphor, after the user rejected a gallery-themed version). The homepage, `404.html`, `newsknitter/`, `valuemachine/`, `newshaper/`, `socialbits/`, `senseofpatterns/` and `extra/referandum2010/` are done; the unlinked extras would reuse the project-page parts documented in [DESIGN-archive.md](DESIGN-archive.md) (logo head, banner, record rows, justified photo rows). Photo groups open in the shared viewer `js/lightbox.js`, a `<dialog>` that needs no library, and `js/photo-rows.js` lays them out in justified rows; without the scripts the links open the image files and CSS lays out the rows.

- **The shared frame is `css/casualdata.css`.** Redesigned pages link it, and the fonts, logo and favicon, by root-absolute paths (`/css/…`, `/fonts/…`, `/img/casualdata.svg`, `/favicon.svg`), so preview from the repo root. Project accent colors live there as classes (`.nk`, `.vm`, `.ns`, `.sb`, `.sop`) that set `--accent`; several of them are too light for text on white, so use them only for underlines and rules, never as text color.
- **Fonts:** Host Grotesk for names and text, Fragment Mono for years, section labels and the footer. Both are self-hosted from `fonts/` as latin and latin-ext woff2 files (together they cover Turkish), under the SIL OFL (`fonts/OFL-*.txt`). The wordmark SVG is drawn from Archivo outlines and Archivo is not loaded as a web font; its license stays in `fonts/OFL-Archivo.txt`. The CSS fallback faces use metric overrides computed from the font files, so recompute them if a font file changes.
- **Homepage images** in `img/works/` are 3:2 WebP crops of each project's press photos; the sense of patterns crop was rendered from the A1 print PDF in `senseofpatterns/_data/`. Each file embeds its origin (`impeccable embed-prompt --read <file>`).
- **Search and answer-engine metadata is generated** by `python3 tools/seo.py` (see NEXT.md, Adding a day): the `<!-- seo -->` block in each page's `<head>`, the static home grid, and `sitemap.xml`, `robots.txt`, `feed.xml` and `llms.txt`. Share images for the archive pages and the structured-data logo are in `img/og/`. It also stamps the daily pages' stylesheet and script addresses with a content hash (`?v=…`), so run it after any change to a day, anything in `kit/`, or a page title or description.
- **`.impeccable/`** holds the design workflow's local working files (direction contract, sketches, review captures). It is git-ignored on purpose: Pages would publish anything committed there.

Each project folder keeps its own logo, photos and source files; the CSS and JS are shared from the root `css/` and `js/`.

**The 2007–2014 site code was removed on 2026-11-08** (the user's decision): each project's old `css/`, `js/` (jQuery, Thickbox, 960.gs) and UI graphics, `valuemachine/_old/`, the 2007 web photo gallery generator in `newsknitter/300dpi/`, the old web-sized photos that `images/web/` replaced, `newsknitter/preorder.php`, the WordPress install `socialbits/blog/` and the cPanel leftovers (`.htaccess*`, `.shtml` error pages, `500.php`, `default.html`, `.ftpquota`). A full copy, with the same paths, is in `~/code/casualdata-attic/` (outside the repo, never published), together with the ignored `socialbits/blog/wp-config.php` and `newsknitter/nk_preorder.txt`; git tag `pre-cleanup` is the last commit that has them. Originals that the WebP files cite as their source were kept.

| Folder | Year | Stack / notes |
|---|---|---|
| `newsknitter/` | 2007 | Redesigned on the shared frame (`index.html`). Its logo is `gfx/newsknitter.svg`, redrawn from the vector shapes in `handout/nka5v3.pdf`. The page's photos are WebP files in `images/web/` with provenance sidecars, made from the press originals in `300dpi/images/` where one matches and from the 2009 `images/*_b.jpg` files otherwise. `300dpi/index.html` is the press images page on the shared frame: its 28 photos in four labelled rows, with previews from `images/web/` and, in the viewer, downloads of the 300 dpi JPEG (`300dpi/images/`) and the TIFF (from the `media` Release). `index.htm` and `index_2.htm` were the 2007 Photoshop CS Web Photo Gallery pages and now only redirect to `index.html`. |
| `valuemachine/` | 2008 | Redesigned on the shared frame (`index.html`). The 2008 header GIF is redrawn as two SVGs: `gfx/valuemachine-title.svg` (the title in Rockwell Bold outlines, the closest installed match), used small as the page's logo, and `gfx/valuemachine-network.svg` (the drawing, at the GIF's pixel geometry with vector rings and feed icons), set small inside the project text. The banner is a crop of the interface close-up `300dpi/vm-05.jpg`. Photos are WebP files in `images/web/` made from `300dpi/`, with provenance sidecars. |
| `newshaper/` | 2009 | Redesigned on the shared frame (`index.html`), with Credits & Thanks moved to the end and the 21st Linz photo added (the user's decisions on 2026-11-05). Its logo `gfx/newshaper.svg` is the vector outlines from the project sheet `jma/newshaper_jma.pdf`, recoloured to ink. The banner is the 2009 banner's framing cut again from `300dpi/ns_istanbul_002.jpg`. Photos are WebP files in `images/web/` made from `300dpi/` (the Istanbul originals are Adobe RGB, converted to sRGB), with provenance sidecars; the viewer offers each photo's 300 dpi JPEG, and the Downloads row links the project sheet. |
| `socialbits/` | 2009 | Originally the document root of the separate domain socialbits.org, which is now parked, so the landing page links to this folder instead. Both pages are redesigned on the shared frame: `index.html` (Social Bits Istanbul, 2010) and `msdcity.html` (AMBER 2009). The six exhibition projects are shown open (the 2010 accordion is gone), each with its own photo (WebP in `images/web/`, 800px, the size on hand) and a link to its Flickr album instead of the album player; the 2010 sidebar became record rows. The logo `gfx/socialbits.svg` rebuilds the 2010 web PNG `img/socialbits500.png` (now in the attic) as vector: the squares from the logo on the booklet cover `_data/socialbits_istanbul_hi.pdf` and DTL Nobel Bold letters from the font embedded in that PDF. Downloads rows link the Istanbul booklet (`_data/socialbits_istanbul_lo.pdf` and `_hi.pdf`) and the AMBER presentation (`_data/amber_presentation/amber_pres.pdf`). The 2010 JPEGs in `img/` stay as the sources of `images/web/`. |
| `senseofpatterns/` | 2011 | Redesigned on the shared frame (`index.html`). The six posters are rendered from the A1 print PDF `_data/sop-x1-nocropmarks.pdf` (git-ignored, in the `media` Release, which the Downloads row links) into `images/web/`, in an even grid; the banner and phone banner are crops of the One Day of Taxis poster. The logo `gfx/senseofpatterns.svg` is the pink title lockup from the poster PDF; the header's subtitle is text under it. The Vimeo player stays; ShareThis is gone. The visualizing.org poster embeds were already replaced with Wayback links. |
| `extra/referandum2010/` | 2010 | Turkish article (`lang="tr"`), redesigned on the shared frame as an article (`index.html`; DESIGN-archive.md "Article"). The charts are WebP files in `images/web/` with provenance sidecars: the Evet map rendered from its vector source `_work/tr-ref-evet.ai` at 918 and 1836px, the rest converted from the 2010 files in `gfx/` (`_work/number-graphs?2.ai` is an earlier, lighter state of the Top 10 table, so the table stays the 2010 GIF). Disqus and ShareThis are gone (the user's decision on 2026-11-06; the thread's 5 comments from 2010 remain on Disqus). `_work/` also holds `toplamoy.numbers`. |
| `extra/tbmmtweets/` | — | Not linked from the root page. D3 v3.1.6 from cdnjs, jQuery pinned at 1.11.1 (what `jquery-latest` was frozen at), and Lato from Google Fonts (it replaced the defunct Adobe Edge Fonts). Loads `tbmm_slim.json`. |
| `extra/secim2011/` | 2011 | Not linked from the root page. Google Charts `geochart` page. |

Most of the size on disk (about 2.6 GB in total) is media in `newsknitter/` (about 1.7 GB), `senseofpatterns/_data/` and `socialbits/_data/`. The largest files live in the `media` Release (see Hosting). Treat them as content, not code, and don't open or change them unless the task requires it.

## Things to know before changing anything

- **Secrets and personal data live in the attic, not the repo.** `~/code/casualdata-attic/socialbits/blog/wp-config.php` holds the old blog's DB password and auth keys, and `~/code/casualdata-attic/newsknitter/nk_preorder.txt` is a log of customer preorders (name, email, country, size). Never print or quote these values, and never copy them into the repo. `.gitignore` still lists both paths as a guard.
- `socialbits/_data/books/` and `socialbits/_data/papers/` hold third-party copyrighted PDFs. Don't publish them.
- **Some external links are dead.** As of 2026-11, `socialbits.org` points to a domain-parking server and `olgusal.org` no longer resolves in DNS. The landing page therefore links social bits to the local `socialbits/` folder and leaves olgusal off.
- **Vimeo blocks this development machine's network.** Its players show "We couldn't verify the security of your connection" here, and `curl` gets a 401. That doesn't mean an embed is broken; check Vimeo players on the live site from a normal browser. The players on senseofpatterns and newshaper were confirmed to play there on 2026-11-03.
- **Third-party services on the project pages:** none on the redesigned pages; ShareThis, Disqus, Google Analytics and the socialbits Twitter widget are gone.
- The pages under `extra/` are in Turkish and the rest are in English. Keep each page's language when you edit it.
- Every page writes the user's name as "Mahir Yavuz", never "Mahir M. Yavuz" or "Mahir Mustafa Yavuz" (the user's decision on 2026-11-05; see PRODUCT.md). Addresses such as `mahirmyavuz.com` and the e-mail lines stay as they are.
