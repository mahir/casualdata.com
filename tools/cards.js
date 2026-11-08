// Renders each day's link-preview image, /YYYY-MM-DD/card.png (1200×630, day theme),
// with the page's own share-image code (CD.render), so the card matches the PNG a
// reader downloads. Run from the repo root with a local server on port 8000:
//   python3 -m http.server 8000 &  node tools/cards.js [YYYY-MM-DD ...]
// With no dates it renders every day in kit/days.js, drafts included.
// It also renders the night version and writes the home grid's thumbnails next to the card
// (thumb.webp, thumb-1200.webp, thumb-night.webp, thumb-night-1200.webp) when cwebp is installed.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const base = process.env.CD_BASE || "http://localhost:8000";

(async () => {
	let dates = process.argv.slice(2);
	if (!dates.length) {
		const src = fs.readFileSync(path.join(root, "kit/days.js"), "utf8");
		dates = [...src.matchAll(/date: "(\d{4}-\d{2}-\d{2})"/g)].map(m => m[1]);
	}
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
	for (const d of dates) {
		const errors = [];
		page.removeAllListeners("pageerror");
		page.on("pageerror", e => errors.push(e.message));
		const shot = async theme => {
			await page.goto(`${base}/${d}/?theme=${theme}`, { waitUntil: "networkidle" });
			await page.waitForFunction(() => window.CD && CD.exporter && CD.render);
			const b64 = await page.evaluate(async () => {
				const blob = await CD.render(1200, 630);
				const buf = new Uint8Array(await blob.arrayBuffer());
				let s = ""; for (const c of buf) s += String.fromCharCode(c);
				return btoa(s);
			});
			return Buffer.from(b64, "base64");
		};
		const out = path.join(root, d, "card.png");
		fs.writeFileSync(out, await shot("light"));
		const night = path.join(os.tmpdir(), `cd-${d}-night.png`);
		fs.writeFileSync(night, await shot("dark"));
		try {
			for (const [src, name] of [[out, "thumb"], [night, "thumb-night"]]) {
				execFileSync("cwebp", ["-quiet", "-q", "82", "-resize", "720", "0", src, "-o", path.join(root, d, `${name}.webp`)]);
				execFileSync("cwebp", ["-quiet", "-q", "80", src, "-o", path.join(root, d, `${name}-1200.webp`)]);
			}
		} catch (e) { console.warn("thumbnails skipped (is cwebp installed?):", e.message); }
		console.log(out, errors.length ? "errors: " + errors.join("; ") : "");
	}
	await browser.close();
})();
