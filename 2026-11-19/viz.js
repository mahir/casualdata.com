// 2026-11-19 — World Toilet Day: the share of people with no toilet to use (open defecation) in 2000
// and in 2024. One row per country where it is still 10 in every 100 or more, highest first, and one
// grey row for India, under a hairline: a hollow dot for 2000 joined to a solid dot for 2024, on one axis from 0 to 100.
// The one red thing: Niger, the highest. Picking a row reads its countryside and its towns and cities.
(function () {
	const C = CD.colors, D = window.TOILETS;
	const rows = D.countries.concat([D.reference]);          // the last row is the reference, India
	const NC = D.countries.length, N = rows.length, REF = N - 1, RED = 0, red = rows[RED];
	const SHORT = { CAF: "Central African Rep.", STP: "São Tomé & Príncipe", PNG: "Papua New Guinea", SLB: "Solomon Islands" };
	const pair = v => v[0] === null ? `${v[1]}` : `${v[0]} → ${v[1]}`;
	const S1 = `In ${red.name}, ${red.t[1]} of every 100 people have no toilet to use. No country has a higher share.`;

	// the reading: sel = a row, or -1 for the overview
	let sel = -1;
	// the opening motion, once on load (NEXT.md, "Opening motion"): grow runs 0 to 1. Still under reduced motion.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const context = r => r.t[0] === null
		? `countryside ${r.rural[1]} in 2024 · towns and cities ${r.urban[1]} · no figures for 2000`
		: `countryside ${pair(r.rural)} · towns and cities ${pair(r.urban)}`;
	function readout() {
		if (sel < 0) return [S1, "Share of people with no toilet to use, 2000 and 2024"];
		const r = rows[sel];
		return [`${r.name}, ${r.t[0] === null ? `${r.t[1]} in 2024` : `${r.t[0]} in 2000, ${r.t[1]} in 2024`}`, context(r)];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}

	// Two frames. On the page the chart is the page: the title and dek are HTML and, on wide screens,
	// lie over the top left, so the rows take the room to their right and the key sits under them.
	// A shared image has no title, so the drawing carries the sentence and one small line instead.
	// page = { head: {x, y, w, h} | null, gut }: the title block's box inside the canvas, and the gutter.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineCap = "round";
		const gut = page ? page.gut : 0, head = page ? page.head : null;
		let left = x + gut, right = x + w - gut, top = y + (page ? 10 * s : 0);
		const bottom = y + h - (page ? 4 * s : 0);
		const dotKey = (kx, ky, solid, col) => {
			ctx.beginPath(); ctx.arc(kx, ky, 4.5 * s, 0, 7);
			if (solid) { ctx.fillStyle = col; ctx.fill(); } else { ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5 * s; ctx.stroke(); }
		};
		const key = (kx, ky) => {       // hollow dot "2000", solid dot "2024"; ky is the text baseline
			ctx.font = mono; ctx.fillStyle = C.ink;
			dotKey(kx + 5 * s, ky - 4 * s, false, C.ink); ctx.fillStyle = C.ink; ctx.fillText("2000", kx + 15 * s, ky);
			const kw = ctx.measureText("2000").width;
			dotKey(kx + 15 * s + kw + 20 * s, ky - 4 * s, true, C.ink); ctx.fillStyle = C.ink; ctx.fillText("2024", kx + 15 * s + kw + 30 * s, ky);
		};

		const subOf = k => `SHARE OF PEOPLE WITH NO TOILET TO USE (OPEN DEFECATION), 2000 AND 2024 · ${k < NC ? `THE ${k} HIGHEST COUNTRIES` : `THE ${NC} COUNTRIES AT 10 IN 100 OR MORE`}, AND INDIA · WHO/UNICEF ESTIMATES`;
		// ---- how many rows: all of them when each can be 18 px tall or more; otherwise the highest
		// that fit, and India (a small picture, a wide image)
		const axisH = 24 * s, gapRef = 10 * s, keyH = head ? 0 : 24 * s;
		const minRow = (exporting ? (w > h * 1.3 ? 21 : 20) : 18) * s;       // 20 lets all 27 fit a 4:5 image
		let sentH = 0, lines = [], fs = 0, subN = 1;
		if (!page) {
			fs = Math.max(19 * s, Math.min(30 * s, w / 30));
			ctx.font = `600 ${fs}px ${C.sans}`; lines = wrap(ctx, S1, w);
			ctx.font = mono; subN = wrap(ctx, subOf(NC), w).length;       // the small line, on as many lines as its longest form takes
			sentH = lines.length * fs * 1.14 + 10 * s + subN * 16 * s + 16 * s;
		}
		const avail = bottom - top - sentH - keyH - axisH - gapRef;
		let n = Math.max(3, Math.min(NC, Math.floor(avail / minRow) - 1));
		if (exporting && w > h * 1.3) n = Math.min(n, 12);
		const rowH = Math.min(avail / (n + 1), 40 * s);
		const shown = rows.slice(0, n).map((r, i) => ({ r, i })).concat([{ r: rows[REF], i: REF }]);

		// ---- a shared image: the sentence and one small line, full width
		if (!page) {
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			wrap(ctx, subOf(n), w).slice(0, subN).forEach((l, i) => ctx.fillText(l, x, y + lines.length * fs * 1.14 + 10 * s + 11 * s + i * 16 * s));
			top += sentH;
		}

		// ---- three columns: the name, the plot on one axis from 0 to 100, the two numbers
		if (head) { key(head.x, head.y + head.h + 26 * s); left = Math.max(left, head.x + head.w + 34 * s); }
		else { key(left, top + 13 * s); top += keyH; }
		ctx.font = mono;
		const narrow = right - left < 560 * s;
		const nameOf = r => narrow && SHORT[r.code] ? SHORT[r.code] : r.name;
		ctx.font = monoB; const nameW = Math.max(...shown.map(o => ctx.measureText(nameOf(o.r)).width), ctx.measureText("OF EVERY 100").width);
		ctx.font = mono; const numW = ctx.measureText("88 → 88").width;
		const colGap = (narrow ? 12 : 18) * s;
		const x0 = left + nameW + colGap, x1 = right - numW - colGap;
		const X = v => x0 + (x1 - x0) * v / 100;
		const rad = Math.min(5 * s, rowH * 0.3);
		const rowY = k => top + k * rowH + (k === shown.length - 1 ? gapRef : 0);       // the top of row k
		const plotBottom = rowY(shown.length - 1) + rowH;

		// the axis: a hairline at each tick, the numbers under the last row
		ctx.strokeStyle = C.rule; ctx.lineWidth = px1;
		for (const t of [0, 25, 50, 75, 100]) {
			const gx = Math.round(X(t)) + 0.5;
			ctx.beginPath(); ctx.moveTo(gx, top); ctx.lineTo(gx, plotBottom + 4 * s); ctx.stroke();
			ctx.font = mono; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.fillText(String(t), gx, plotBottom + 18 * s);
		}
		ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
		ctx.fillText(nameW >= ctx.measureText("OF EVERY 100 PEOPLE").width ? "OF EVERY 100 PEOPLE" : "OF EVERY 100", left, plotBottom + 18 * s);
		// a hairline in the gap above India: it is the comparison, not the next row of the ranking
		const refY = Math.round(rowY(shown.length - 1) - gapRef / 2) + 0.5;
		ctx.strokeStyle = C.rule; ctx.lineWidth = px1;
		ctx.beginPath(); ctx.moveTo(left, refY); ctx.lineTo(right, refY); ctx.stroke();

		// the rows
		const geo = [];
		shown.forEach((o, k) => {
			const r = o.r, y0 = rowY(k), cy = y0 + rowH / 2, isRed = o.i === RED, isRef = o.i === REF;
			const col = isRed ? C.red : isRef ? C.ink2 : C.ink;
			// on load each solid dot slides from the 2000 figure to the 2024 one, the top rows first
			const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, grow * 1.5 - (k / shown.length) * 0.5)), 3);
			const now = r.t[0] === null ? r.t[1] : r.t[0] + (r.t[1] - r.t[0]) * e;
			geo.push({ i: o.i, y0, y1: y0 + rowH, cy, px: X(r.t[1]) });
			if (o.i === sel) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = C.rule; ctx.fillRect(left - 4 * s, y0, right - left + 8 * s, rowH); ctx.restore(); }
			ctx.textBaseline = "middle";
			ctx.font = isRed ? monoB : mono; ctx.fillStyle = col; ctx.textAlign = "left";
			ctx.fillText(nameOf(r), left, cy + 0.5 * s);
			// the numbers, set against the right edge: "81 → 66", or "63" alone under the second number
			ctx.textAlign = "right";
			ctx.fillText(r.t[0] === null ? String(r.t[1]) : `${r.t[0]} → ${String(r.t[1]).padStart(2, " ")}`, right, cy + 0.5 * s);
			ctx.textAlign = "left";
			if (r.t[0] !== null) {
				ctx.strokeStyle = col; ctx.lineWidth = (isRed ? 2.2 : 1.5) * s;
				ctx.beginPath(); ctx.moveTo(X(r.t[0]), cy); ctx.lineTo(X(now), cy); ctx.stroke();
				ctx.beginPath(); ctx.arc(X(r.t[0]), cy, rad, 0, 7); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5 * s; ctx.stroke();
			}
			ctx.beginPath(); ctx.arc(X(now), cy, rad, 0, 7); ctx.fillStyle = col; ctx.fill();
			// the red mark carries its own number, in every image
			if (isRed) { ctx.font = `700 ${13 * s}px ${C.mono}`; ctx.fillStyle = C.red; ctx.textAlign = "right"; ctx.fillText(String(r.t[1]), X(now) - rad - 6 * s, cy + 0.5 * s); }
			ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		});

		// the reading, beside the row it describes
		const g = geo.find(q => q.i === sel);
		if (g) {
			// the chip sits under its row (over it for the last rows), never on the row, the key or the title
			const r = rows[sel], need = 64 * s, under = plotBottom + axisH - g.y1 >= need + 4 * s;
			const box = under ? { x: left, y: g.y1 + 3 * s, w: right - left, h: need + 40 * s } : { x: left, y: g.y0 - 3 * s - need - 40 * s, w: right - left, h: need + 40 * s };
			CD.label(ctx, g.px, under ? box.y : box.y + box.h, r.name, context(r), s, box, g.px);
		}
		return { geo, left, right };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	const headEl = document.querySelector(".cd-head"), textEl = document.querySelector(".cd-head .cd-text");
	let lay = null, W = 0, Hh = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== Hh) { W = r.width; Hh = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		lay = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage), gut: parseFloat(getComputedStyle(headEl).paddingLeft) || 0 });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(textEl);
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?c=NER: the country's ISO code; anything else, the overview
	sel = rows.findIndex(r => r.code === (CD.state.get("c") || "").toUpperCase());
	const pick = CD.selection({ initial: sel, key: "c", encode: i => rows[i].code, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the row under the pointer; tapping the pinned row again, or outside every row, goes back
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			if (mx < lay.left - 6 || mx > lay.right + 6) return -1;
			const g = lay.geo.find(q => my >= q.y0 && my < q.y1);
			if (!g) return -1;
			return e.type === "pointerdown" && g.i === pick.pinned ? -1 : g.i;
		},
		// arrows step through the rows that are drawn, top to bottom, and wrap
		step: (from, dir) => {
			const ids = lay ? lay.geo.map(q => q.i) : rows.map((_, i) => i), at = ids.indexOf(from);
			return at < 0 ? ids[dir > 0 ? 0 : ids.length - 1] : ids[(at + dir + ids.length) % ids.length];
		}
	});
	// the opening motion ends at once when the reader picks something
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1400)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// the image is always the finished picture, even while the opening motion is still running
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * (w > h * 1.3 ? 2 : 1.6), true, null); grow = g; } };
})();
