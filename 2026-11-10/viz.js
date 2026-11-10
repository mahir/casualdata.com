// 2026-11-10 — CO2 in the air in the month each UN climate summit opened, Berlin 1995 to Antalya 2026.
// One column per summit in its year's slot (2020 is empty), rising from 280 ppm, the level before
// industry. The one red thing: Antalya, the summit that opened this week. Picking a summit turns its
// column ink and darkens what every later column has added above its level.
(function () {
	const C = CD.colors, cops = window.COPS, BASE = window.CO2_BASE;
	const N = cops.length, last = cops[N - 1];
	const yearOf = c => +c.opened.slice(0, 4);
	const Y0 = yearOf(cops[0]), SLOTS = yearOf(last) - Y0 + 1;
	const MAX = Math.max(...cops.map(c => c.ppm));
	const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
	const Mon = m => MON[m - 1][0] + MON[m - 1].slice(1).toLowerCase();
	const f1 = v => v.toFixed(1);
	// the claim, checked against the data every time the page loads
	const ups = cops.filter((c, i) => i && c.ppm > cops[i - 1].ppm).length;
	const allUp = ups === N - 1;
	const SENT = allUp ? [`${N} summits.`, "CO₂ was higher at every one."] : [`${N} summits.`, `CO₂ was higher at ${ups} of them.`];
	const NOTE = "ONE COLUMN PER UN CLIMATE SUMMIT: CO2 AT MAUNA LOA IN THE MONTH IT OPENED, SEASONAL CYCLE REMOVED";

	let sel = -1;
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;

	function readout() {
		if (sel < 0) return [`CO₂ was higher at ${allUp ? "every one" : ups} of ${N} climate summits`,
			`${f1(cops[0].ppm)} ppm at ${cops[0].city} ${Y0} · ${f1(last.ppm)} ppm at ${last.city} ${yearOf(last)} (${Mon(last.m)}, the latest month)`];
		const c = cops[sel], p = cops[sel - 1];
		const when = `${Mon(+c.opened.slice(5, 7))} ${yearOf(c)}`;
		const step = !p ? "the first summit" : `+${f1(c.ppm - p.ppm)} since ${p.city}${yearOf(c) - yearOf(p) > 1 ? ", two years before" : ""}`;
		if (sel === N - 1) return [`${c.city} · ${f1(c.ppm)} ppm`, `COP${c.n} · ${when} · ${Mon(c.m)} value, the latest month · ${step}`];
		// Antalya's value is not November's yet, so the reading says which month it runs to
		return [`+${f1(last.ppm - c.ppm)} ppm since ${c.city}`, `${last.latest ? `to ${Mon(last.m)} ${last.y} · ` : ""}COP${c.n} · ${when} · ${f1(c.ppm)} ppm · ${step}`];
	}

	// sans text with a real subscript in CO₂ (the font has no ₂). Returns the width; draws unless dry.
	function co2(ctx, str, x, y, size, dry) {
		const parts = str.split("₂");
		let cx = x;
		parts.forEach((p, i) => {
			ctx.font = `600 ${size}px ${C.sans}`;
			if (!dry) ctx.fillText(p, cx, y);
			cx += ctx.measureText(p).width;
			if (i < parts.length - 1) {
				ctx.font = `600 ${size * 0.62}px ${C.sans}`;
				if (!dry) ctx.fillText("2", cx + size * 0.02, y + size * 0.16);
				cx += ctx.measureText("2").width + size * 0.04;
			}
		});
		return cx - x;
	}
	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

	function draw(ctx, x, y, w, h, s) {
		const mono = `400 ${11.5 * s}px ${C.mono}`;
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

		// the takeaway, written into the drawing
		let lines = [SENT.join(" ")], fs = 34 * s;
		if (co2(ctx, lines[0], 0, 0, fs, true) > w) { lines = SENT; fs = 28 * s; }
		const widest = Math.max(...lines.map(l => co2(ctx, l, 0, 0, fs, true)));
		if (widest > w) fs *= w / widest;
		ctx.fillStyle = C.ink;
		lines.forEach((l, i) => co2(ctx, l, x, y + fs * 0.86 + i * fs * 1.14, fs));
		let hy = y + lines.length * fs * 1.14 + 6 * s;
		ctx.font = mono; ctx.fillStyle = C.ink2;
		const note = wrap(ctx, NOTE, w);
		note.forEach((l, i) => ctx.fillText(l, x, hy + 12 * s + i * 16 * s));
		hy += note.length * 16 * s;

		// the plot: a band for the two end labels and the reading, the columns, the baseline, two rows of labels
		const BOT = 42 * s, base = y + h - BOT, top = hy + 10 * s;
		const band = Math.min(86 * s, (base - top) * 0.42);
		const colH = Math.max(10, base - top - band);
		const slot = w / SLOTS, cw = Math.max(2 * s, slot * 0.74);
		const cx = c => x + (yearOf(c) - Y0) * slot + (slot - cw) / 2;
		const yOf = v => base - (v - BASE) / (MAX - BASE) * colH;
		const done = grow === 1;
		const level = sel >= 0 && done ? yOf(cops[sel].ppm) : null;

		cops.forEach((c, i) => {
			const e = Math.min(1, Math.max(0, grow * 1.6 - (i / N) * 0.6)), k = 1 - Math.pow(1 - e, 3);
			const t = base - (base - yOf(c.ppm)) * k, px = cx(c);
			ctx.fillStyle = i === N - 1 ? C.red : i === sel && done ? C.ink : C.ink3;
			ctx.fillRect(px, t, cw, base - t);
			// what this summit's air holds above the picked one's level
			if (level !== null && i > sel && i < N - 1) { ctx.fillStyle = C.ink2; ctx.fillRect(px, t, cw, level - t); }
		});
		if (level !== null && sel < N - 1) {
			ctx.fillStyle = C.paper;
			ctx.fillRect(cx(cops[sel]) + cw, level - Math.max(1, s) / 2, cx(last) + cw - cx(cops[sel]) - cw, Math.max(1, s));
		}
		ctx.fillStyle = C.ink; ctx.fillRect(x, base, w, Math.max(1, s));

		// under the baseline: a few years and cities, as many as fit
		ctx.font = mono;
		// with their years when all of them fit, else by name alone
		const byCity = name => cops.find(c => c.city === name);
		const mid = c => cx(c) + cw / 2;
		const wanted = [
			{ full: String(Y0), at: cx(cops[0]), align: "left", col: C.ink2, must: true },
			{ full: String(yearOf(last)), at: cx(last) + cw, align: "right", col: C.ink, must: true },
			...["Paris", "Copenhagen", "Kyoto"].map(n => byCity(n)).filter(Boolean).map(c => ({ full: `${c.city.toUpperCase()} ${yearOf(c)}`, short: c.city.toUpperCase(), at: mid(c), align: "center", col: C.ink2, tick: true })),
			{ full: "NO SUMMIT IN 2020", short: "2020", at: x + (2020 - Y0 + 0.5) * slot, align: "center", col: C.ink2 }
		];
		const layout = short => {
			const placed = [];
			for (const l of wanted) {
				const t = short && l.short ? l.short : l.full, tw = ctx.measureText(t).width;
				const lx = Math.min(Math.max(l.align === "left" ? l.at : l.align === "right" ? l.at - tw : l.at - tw / 2, x), x + w - tw);
				if (placed.some(p => lx < p.x + p.tw + 8 * s && p.x < lx + tw + 8 * s)) continue;
				placed.push({ l, t, x: lx, tw });
			}
			return placed;
		};
		let labels = layout(false);
		if (labels.length < wanted.length) { const alt = layout(true); if (alt.length > labels.length) labels = alt; }
		for (const p of labels) {
			if (p.l.tick) { ctx.fillStyle = C.ink3; ctx.fillRect(p.l.at - Math.max(1, s) / 2, base + 2 * s, Math.max(1, s), 4 * s); }
			ctx.fillStyle = p.l.col; ctx.fillText(p.t, p.x, base + 19 * s);
		}
		ctx.fillStyle = C.ink2;
		const baseNote = [`COLUMNS RISE FROM ${BASE} PPM, THE LEVEL BEFORE INDUSTRY`, `FROM ${BASE} PPM, BEFORE INDUSTRY`].find(t => ctx.measureText(t).width <= w);
		if (baseNote) ctx.fillText(baseNote, x, base + 36 * s);

		if (!done) return { x, w, slot, top: hy };

		// the reading: an ink chip flagged up and to the left of the picked column, over the empty corner
		let chip = null, value, context;
		if (sel >= 0) {
			[value, context] = readout();
			ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			// the context wraps at its " · " breaks, as CD.label wraps it
			const rows = [];
			for (const p of context.toUpperCase().split(" · ")) {
				const t = rows.length ? rows[rows.length - 1] + " · " + p : p;
				if (rows.length && ctx.measureText(t).width + 16 * s > w) rows.push(p); else if (rows.length) rows[rows.length - 1] = t; else rows.push(p);
			}
			const tw = Math.max(...rows.map(r => ctx.measureText(r).width));
			const cwid = Math.min(w, Math.max(vw, tw) + 16 * s), chh = (49 + 15 * (rows.length - 1)) * s;
			const px = Math.max(x, cx(cops[sel]) + cw - cwid);
			const over = cops.filter(c => cx(c) < px + cwid && cx(c) + cw > px);
			const py = Math.max(hy + 4 * s, Math.min(...over.map(c => yOf(c.ppm))) - 10 * s - chh);
			chip = { x: px, y: py, w: cwid, h: chh };
		}

		// the two end labels; either one steps aside when the reading needs its place
		const bigA = 30 * s, bigB = 20 * s;
		ctx.font = `600 ${bigA}px ${C.sans}`;
		const aNum = `${Math.round(last.ppm)} PPM`, aw = ctx.measureText(aNum).width;
		ctx.font = mono;
		const aTop = `${last.city.toUpperCase()} ${yearOf(last)}`, aSub = last.latest ? `${MON[last.m - 1]} ${last.y}, LATEST MONTH` : "";
		const aW = Math.max(aw, ctx.measureText(aTop).width, ctx.measureText(aSub).width), aH = 14 * s + bigA + (aSub ? 16 * s : 0);
		const aBox = { x: x + w - aW, y: yOf(last.ppm) - 8 * s - aH, w: aW, h: aH };
		if (!chip || !hit(chip, aBox)) {
			ctx.textAlign = "right";
			ctx.fillStyle = C.ink; ctx.font = mono; ctx.fillText(aTop, x + w, aBox.y + 11 * s);
			ctx.fillStyle = C.red; ctx.font = `600 ${bigA}px ${C.sans}`; ctx.fillText(aNum, x + w, aBox.y + 14 * s + bigA * 0.82);
			if (aSub) { ctx.fillStyle = C.ink2; ctx.font = mono; ctx.fillText(aSub, x + w, aBox.y + aH - 3 * s); }
			ctx.textAlign = "left";
		}
		const first = cops[0];
		ctx.font = `600 ${bigB}px ${C.sans}`;
		const bNum = `${Math.round(first.ppm)} PPM`, bTop = `${first.city.toUpperCase()} ${Y0}`;
		let bW = ctx.measureText(bNum).width; ctx.font = mono; bW = Math.max(bW, ctx.measureText(bTop).width);
		const bH = 14 * s + bigB, bx = cx(first);
		const under = cops.filter(c => cx(c) < bx + bW + 4 * s);
		const bBox = { x: bx, y: Math.min(...under.map(c => yOf(c.ppm))) - 8 * s - bH, w: bW, h: bH };
		if (!chip || !hit(chip, bBox)) {
			ctx.fillStyle = C.ink2; ctx.font = mono; ctx.fillText(bTop, bx, bBox.y + 11 * s);
			ctx.fillStyle = C.ink; ctx.font = `600 ${bigB}px ${C.sans}`; ctx.fillText(bNum, bx, bBox.y + 14 * s + bigB * 0.82);
			const gap = yOf(first.ppm) - (bBox.y + bH);
			if (gap > 10 * s) { ctx.fillStyle = C.ink3; ctx.fillRect(bx + cw / 2 - Math.max(1, s) / 2, bBox.y + bH + 4 * s, Math.max(1, s), gap - 7 * s); }
		}
		if (chip) CD.label(ctx, chip.x - 12 * s, chip.y - 1e4, value, context, s, { x: chip.x, y: chip.y, w: chip.w + 1, h: chip.h + 60 * s });
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		return { x, w, slot, top: hy };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	let geo = null, W = 0, H = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== H) { W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		geo = draw(ctx, 0, 0, W, H, 1);
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 1300)); grow = k; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	const s0 = cops.findIndex(c => String(c.n) === CD.state.get("cop"));
	if (s0 >= 0) sel = s0;
	const pick = CD.selection({ initial: sel, key: "cop", encode: i => cops[i].n, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// anywhere under the sentence picks the nearest summit, so a thumb can drag along the years;
		// the sentence itself is the way back to the overview
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			if (my < geo.top) return -1;
			let best = -1, bd = Infinity;
			cops.forEach((c, i) => { const d = Math.abs(geo.x + (yearOf(c) - Y0 + 0.5) * geo.slot - mx); if (d < bd) { bd = d; best = i; } });
			return best;
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	// the image is always the finished picture, even while the columns are still rising
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6); grow = g; } };
})();
