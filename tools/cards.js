// Renders each day's link-preview image, /YYYY-MM-DD/card.png (1200×630, day theme),
// with the page's own share-image code (CD.render), so the card matches the PNG a
// reader downloads. Run from the repo root with a local server on port 8000:
//   python3 -m http.server 8000 &  node tools/cards.js [YYYY-MM-DD ...]
// With no dates it renders every day in kit/days.js, drafts included.
// It also writes the home grid's pictures when cwebp is installed: thumb.webp (720×480) and
// thumb-1200.webp (1200×800) by day, thumb-night.webp and thumb-night-1200.webp by night, and for
// the newest day's large tile lead.webp and lead-night.webp (1440×960). A picture is the day's
// chart as its own page draws it on a small screen, so it keeps its numbers and labels at a size
// that reads in a tile, and has no headline, source line, logo or date, which the tile's caption
// or the page already say (see thumbs() below). With --thumbs it writes only these.
// And the Instagram image, /YYYY-MM-DD/ig.jpg (1080×1440, 3:4, day theme, JPEG because the
// Instagram API takes only JPEG; tools/instagram.js posts it). With --ig it writes only ig.jpg.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const base = process.env.CD_BASE || "http://localhost:8000";
// Instagram shows 3:4 full screen and in the profile grid. Meta's API reference still lists 4:5
// as the tallest it publishes; if it refuses 3:4, use 1080×1350 here.
const IG_W = 1080, IG_H = 1440;

// The home grid's picture is the page's own canvas, not the share image: the day page is opened
// with the bar, the title block and the foot taken away, the page margin set to nothing and the
// chart's stage fixed at a small size, so the chart lays itself out as it does on a phone: fewer
// labels, each large enough to read when the picture is a tile. Motion is reduced so the chart is
// caught in its finished state, and the page's ground is cleared, so the picture is clear wherever
// the chart itself paints nothing.
// Two sizes. A tile's picture is laid out 480×320 CSS pixels, at 2.5 device pixels each. The newest
// day's tile is about twice as wide, so its picture is laid out 720×480, at 2: more of the chart's
// detail, at the same reading size. Only the newest published day (and any draft after it) keeps
// its lead pictures; older ones are deleted at the end of a run.
const SIZES = [{ w: 480, h: 320, dpr: 2.5, lead: false }, { w: 720, h: 480, dpr: 2, lead: true }];
const thumbCss = (w, h) => `
	:root { --gut: 0px !important; }
	html, body { background: transparent !important; }
	.cd-bar, .cd-head, .cd-foot, .cd-step, .cd-toast { display: none !important; }
	.cd-stage { position: fixed !important; left: 0 !important; top: 400px !important; width: ${w}px !important; height: ${h}px !important; margin: 0 !important; }
	.cd-stage canvas { cursor: default !important; }`;

(async () => {
	const igOnly = process.argv.includes("--ig"), thumbsOnly = process.argv.includes("--thumbs");
	let dates = process.argv.slice(2).filter(a => !a.startsWith("--"));
	if (!dates.length) {
		const src = fs.readFileSync(path.join(root, "kit/days.js"), "utf8");
		dates = [...src.matchAll(/date: "(\d{4}-\d{2}-\d{2})"/g)].map(m => m[1]);
	}
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
	for (const size of SIZES) size.page = await (await browser.newContext({ viewport: { width: 800, height: 1000 }, deviceScaleFactor: size.dpr, reducedMotion: "reduce" })).newPage();
	for (const d of dates) {
		const errors = [];
		page.removeAllListeners("pageerror");
		page.on("pageerror", e => errors.push(e.message));
		const shot = async (theme, w = 1200, h = 630, type = "image/png") => {
			await page.goto(`${base}/${d}/?theme=${theme}`, { waitUntil: "networkidle" });
			await page.waitForFunction(() => window.CD && CD.exporter && CD.render);
			const b64 = await page.evaluate(async ([w, h, type]) => {
				let blob = await CD.render(w, h);
				if (type !== "image/png") {
					const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
					cv.getContext("2d").drawImage(await createImageBitmap(blob), 0, 0);
					blob = await new Promise(r => cv.toBlob(r, type, 0.92));
				}
				const buf = new Uint8Array(await blob.arrayBuffer());
				let s = ""; for (const c of buf) s += String.fromCharCode(c);
				return btoa(s);
			}, [w, h, type]);
			return Buffer.from(b64, "base64");
		};
		// the home grid's pictures: the page's own chart at a small size, in each theme
		const thumbs = async () => {
			try {
				for (const size of SIZES) for (const [theme, night] of [["light", ""], ["dark", "-night"]]) {
					const pg = size.page;
					await pg.goto(`${base}/${d}/?theme=${theme}`, { waitUntil: "networkidle" });
					await pg.waitForFunction(() => window.CD && CD.exporter);
					await pg.addStyleTag({ content: thumbCss(size.w, size.h) });
					await pg.evaluate(() => document.fonts.ready);
					await pg.waitForTimeout(1500);   // the chart redraws at its new size, and any opening motion ends
					const png = path.join(os.tmpdir(), `cd-${d}-${size.lead ? "lead" : "thumb"}${night}.png`);
					await pg.locator(".cd-stage").screenshot({ path: png, omitBackground: true });
					const q = ["-quiet", "-q", "86", "-alpha_q", "100", "-sharp_yuv", "-m", "6"];
					if (size.lead) execFileSync("cwebp", [...q, png, "-o", path.join(root, d, `lead${night}.webp`)]);
					else {
						execFileSync("cwebp", [...q, "-resize", "720", "0", png, "-o", path.join(root, d, `thumb${night}.webp`)]);
						execFileSync("cwebp", [...q, png, "-o", path.join(root, d, `thumb${night}-1200.webp`)]);
					}
				}
			} catch (e) { console.warn("thumbnails skipped (is cwebp installed?):", e.message); }
		};
		const done = f => console.log(f, errors.length ? "errors: " + errors.join("; ") : "");
		if (thumbsOnly) { await thumbs(); done(path.join(root, d, "thumb*.webp")); continue; }
		const ig = path.join(root, d, "ig.jpg");
		fs.writeFileSync(ig, await shot("light", IG_W, IG_H, "image/jpeg"));
		if (igOnly) { done(ig); continue; }
		const out = path.join(root, d, "card.png");
		fs.writeFileSync(out, await shot("light"));
		await thumbs();
		done(out);
	}
	await browser.close();
	// the lead pictures belong to the newest published day (and drafts after it) only
	const entries = fs.readFileSync(path.join(root, "kit/days.js"), "utf8").split(/\n\t\{/).slice(1)
		.map(e => ({ date: (e.match(/date: "(\d{4}-\d{2}-\d{2})"/) || [])[1], draft: /draft:\s*true/.test(e) })).filter(e => e.date);
	const newest = entries.filter(e => !e.draft).map(e => e.date).sort().pop();
	for (const e of entries) if (newest && e.date < newest) for (const f of ["lead.webp", "lead-night.webp"]) fs.rmSync(path.join(root, e.date, f), { force: true });
})();
