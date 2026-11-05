# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A hand-written static archive of casualdata.com: the portfolio of data-visualization art projects from 2007 to 2014. It was pulled off old cPanel/Apache shared hosting. The current goal is to fix, clean up and modernize it.

There is no build system, package manager, linter or test suite. Every page is static HTML except `newsknitter/preorder.php` and the WordPress install in `socialbits/blog/`.

## Hosting

GitHub Pages serves the site from the root of `main` in the **public** repo `github.com/mahir/casualdata.com`, at `casualdata.com`, which is set by the `CNAME` file. Cloudflare is both the registrar and the DNS host. Every push to `main` is a deploy.

- Keep `.nojekyll`. Without it, Pages runs Jekyll, which silently drops every folder whose name starts with `_` (`_data/`, `_old/`, `_work/`).
- Pages only serves files. `.htaccess`, `.shtml` includes and PHP (`preorder.php`, `socialbits/blog/`) don't run there. `/404.html` is the not-found page for every path, so it uses root-absolute asset paths.
- Pages caps a site at 1 GB. Videos (`*.mov`, `*.mp4`), TIFFs, `nkdvd.zip` and the two big `senseofpatterns/_data/` files are git-ignored and hosted as assets of the `media` GitHub Release instead. Link to them as `https://github.com/mahir/casualdata.com/releases/download/media/<file>`, as `newsknitter/300dpi/` does. Release asset names are flat, so every name must be unique.
- `.gitignore` also keeps out the credentials, the customer-data file and the copyrighted PDFs. Those exist only in local copies.
- The site is served over HTTPS, so browsers block any `http://` script, stylesheet or iframe as mixed content. Every published page currently loads only `https://` or local resources. Outbound links may still be `http://`, and that's fine.

## Previewing locally

```bash
python3 -m http.server 8000          # static pages, from the repo root
php -S localhost:8000                # only if you need preorder.php to execute
```

`.claude/launch.json` defines this same server on port 8731 (named `static`) for the app's preview pane. `http.server` sends no cache headers, so after editing CSS, force the browser to reload the stylesheet before you measure or screenshot.

Pages use relative asset paths, so serve from the repo root and open `/<project>/`. The `.shtml` error pages run `/cgi-sys/fourohfour.cgi` through server-side includes, and that script exists only on cPanel hosts, so these pages do nothing locally.

## Layout

The site is being redesigned page by page into one minimal, modern shared frame: a white page, a quiet grid of the work, black and white type, and each project's own color only as a small accent. [PRODUCT.md](PRODUCT.md) records what the site is for and the user's binding decisions (keep the text as written; one shared frame; each project keeps its logo and color; minimal, with no gallery or exhibition metaphor, after the user rejected a gallery-themed version). The homepage, `404.html`, `newsknitter/` and `valuemachine/` are done; the other project pages follow in homepage order and reuse the project-page parts documented in [DESIGN.md](DESIGN.md) (logo head, banner, record rows, justified photo rows). Photo groups open in the shared viewer `js/lightbox.js`, a `<dialog>` that needs no library, and `js/photo-rows.js` lays them out in justified rows; without the scripts the links open the image files and CSS lays out the rows.

- **The shared frame is `css/casualdata.css`.** Redesigned pages link it, and the fonts, logo and favicon, by root-absolute paths (`/css/…`, `/fonts/…`, `/img/casualdata.svg`, `/favicon.svg`), so preview from the repo root. Project accent colors live there as classes (`.nk`, `.vm`, `.ns`, `.sb`, `.sop`) that set `--accent`; several of them are too light for text on white, so use them only for underlines and rules, never as text color.
- **Fonts:** Host Grotesk for names and text, Fragment Mono for years, section labels and the footer. Both are self-hosted from `fonts/` as latin and latin-ext woff2 files (together they cover Turkish), under the SIL OFL (`fonts/OFL-*.txt`). The wordmark SVG is drawn from Archivo outlines and Archivo is not loaded as a web font; its license stays in `fonts/OFL-Archivo.txt`. The CSS fallback faces use metric overrides computed from the font files, so recompute them if a font file changes.
- **Homepage images** in `img/works/` are 3:2 WebP crops of each project's press photos; the sense of patterns crop was rendered from the A1 print PDF in `senseofpatterns/_data/`. Each file embeds its origin (`impeccable embed-prompt --read <file>`).
- **`.impeccable/`** holds the design workflow's local working files (direction contract, sketches, review captures). It is git-ignored on purpose: Pages would publish anything committed there.

Each top-level folder is a **self-contained microsite** with its own copies of CSS, JS, graphics and images. Until a project page is redesigned, nothing is shared with it, so a fix in one project's `js/` or `css/` does not reach the others.

| Folder | Year | Stack / notes |
|---|---|---|
| `newsknitter/` | 2007 | Redesigned on the shared frame (`index.html`). Its logo is `gfx/newsknitter.svg`, redrawn from the vector shapes in `handout/nka5v3.pdf`. The page's photos are WebP files in `images/web/` with provenance sidecars, made from the press originals in `300dpi/images/` where one matches and from the 2009 `images/*_b.jpg` files otherwise. The old XHTML assets (`css/`, `js/` jQuery 1.1.4 and Thickbox, the share icons, `gfx/nk.gif`, `gfx/banner.jpg`) are now used only by `preorder.php`, which nothing links to, since PHP can't run on Pages and preorders are closed. `300dpi/index.html` is the press images page on the shared frame: its 28 photos in four labelled rows, with previews from `images/web/` and, in the viewer, downloads of the 300 dpi JPEG (`300dpi/images/`) and the TIFF (from the `media` Release). `index.htm` and `index_2.htm` were the 2007 Photoshop CS Web Photo Gallery pages and now only redirect to `index.html`; the rest of that generator's files (`thumbnails/`, `photos.xml`, `photos.js`, `UserSelections.txt`, the GIFs and `galleryStyle.css` in `images/`) are no longer used by any page. |
| `valuemachine/` | 2008 | Redesigned on the shared frame (`index.html`). The 2008 header GIF is redrawn as two SVGs: `gfx/valuemachine-title.svg` (the title in Rockwell Bold outlines, the closest installed match), used small as the page's logo, and `gfx/valuemachine-network.svg` (the drawing, at the GIF's pixel geometry with vector rings and feed icons), set small inside the project text. The banner is a crop of the interface close-up `300dpi/vm-05.jpg`. Photos are WebP files in `images/web/` made from `300dpi/`, with provenance sidecars. The old `css/`, `js/` (jQuery 1.1.4, Thickbox) and `gfx/` files are no longer used by any page; `_old/` is an earlier copy of the site with its own `css/` and `gfx/`. |
| `newshaper/` | 2009 | Same pattern. `js/_jquery.js` (v1.3.2) is an unused alternative to `js/jquery.js` (v1.1.4). |
| `socialbits/` | 2009 | Originally the document root of the separate domain socialbits.org, which is now parked, so the landing page links to this folder instead. Its pages use only relative paths, so they work from the subfolder. Uses the 960.gs grid, the local `js/jquery_002.js` (jQuery 1.4) and jQuery plugins. The project slideshows are Flickr album embeds, which `embedr.flickr.com/assets/client-code.js` turns into players. `blog/` is WordPress 4.4.2 (see below). |
| `senseofpatterns/` | 2011 | 960.gs grid (the full framework is vendored in `css/`, including `min/` and RTL variants), Google Fonts, ShareThis and a Vimeo player. The poster embeds from visualizing.org (now shut down) were replaced with links to Wayback Machine copies. |
| `extra/referandum2010/` | 2010 | Turkish-language page with static result graphics, 960.gs and Disqus. `_work/` holds source design files (`.ai`, `.numbers`). |
| `extra/tbmmtweets/` | — | Not linked from the root page. D3 v3.1.6 from cdnjs, jQuery pinned at 1.11.1 (what `jquery-latest` was frozen at), and Lato from Google Fonts (it replaced the defunct Adobe Edge Fonts). Loads `tbmm_slim.json`. |
| `extra/secim2011/` | 2011 | Not linked from the root page. Google Charts `geochart` page. |

Most of the size on disk (about 2.6 GB in total) is media in `newsknitter/` (about 1.7 GB), `senseofpatterns/_data/` and `socialbits/_data/`. The largest files live in the `media` Release (see Hosting). Treat them as content, not code, and don't open or change them unless the task requires it.

## Things to know before changing anything

- **Secrets and personal data are on disk.** `socialbits/blog/wp-config.php` contains the live DB password and auth keys in plain text. `newsknitter/nk_preorder.txt` is a tab-separated log of customer preorders (name, email, country, size). Never print or quote these values, and never copy them into other files. `.gitignore` keeps both files out of the repo.
- **`preorder.php` writes unsanitized `$_POST` data straight into `nk_preorder.txt`.** That file sits in the web root, so it was publicly downloadable.
- `socialbits/_data/books/` and `socialbits/_data/papers/` hold third-party copyrighted PDFs. Don't publish them.
- **`socialbits/blog/` is WordPress 4.4.2 that was upgraded in place.** It still contains leftover files from the 2.x era (`wp-app.php`, `wp-register.php`, `wp-admin/gears-manifest.php`, `*.dev.css`). Its database is not here, so it can't run locally.
- **Some external links are dead.** As of 2026-11, `socialbits.org` points to a domain-parking server and `olgusal.org` no longer resolves in DNS. The landing page therefore links social bits to the local `socialbits/` folder and leaves olgusal off.
- **Vimeo blocks this development machine's network.** Its players show "We couldn't verify the security of your connection" here, and `curl` gets a 401. That doesn't mean an embed is broken; check Vimeo players on the live site from a normal browser. The players on senseofpatterns and newshaper were confirmed to play there on 2026-11-03.
- **Third-party services on the project pages:** ShareThis, a third-party tracker, still loads over HTTPS on senseofpatterns and referandum2010. Some pages also have dead Digg, del.icio.us and StumbleUpon share links. The old Google Analytics snippets and the socialbits Twitter widget were removed because those services are gone.
- **Some referenced files were never pulled from the old host:** `extra/referandum2010/gfx/bg.jpg` (the page background) and `valuemachine/_old/js/`. Those requests return 404.
- **Hosting leftovers, not part of the site:**
  - backup copies of `.htaccess` made by cPanel or the PHP upgrader (`.htaccess.cpmh3129`, `.ea4bak`, `.phpupgrader`)
  - `.ftpquota`
  - empty `default.html` files
  - `img/500.php` and `newsknitter/500.php`, cPanel error-page wrappers that use short `<?` tags
  - `.DS_Store` files

  `socialbits/.htaccess` is the stock WordPress root rewrite. It sends unknown paths to `/index.php`, but no such file exists at the socialbits root.
- The pages under `extra/` are in Turkish and the rest are in English. Keep each page's language when you edit it.
