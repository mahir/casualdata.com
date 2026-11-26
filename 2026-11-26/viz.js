// 2026-11-26 — the highest water each month at San Francisco's tide gauge since August 1897, one dot
// per month in twelve calendar-month columns, height = feet above mean higher high water (the usual
// high tide). Grey dots; the last ten years (2016 on) a darker grey; 24 November 2026 in red with a
// hairline at its height across every column, and the four months above that line labelled.
// Picking a dot reads it: its height and one plain sentence. Only the pinned month goes in the URL.
(function () {
	const C = CD.colors, D = window.TIDE;
	const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const NOW = { y: 2026, m: 11, v: D.now.value, j: 0.15, now: true };
	const pts = D.months.map(([y, m, v, j]) => ({ y, m, v, j })).concat([NOW]);
	// ranked from the highest down, for the arrow keys; the rank of each month within its column
	const ranked = pts.map((p, i) => i).sort((a, b) => pts[b].v - pts[a].v || pts[a].y - pts[b].y);
	pts.forEach(p => {
		const col = pts.filter(q => q.m === p.m);
		p.n = col.length; p.below = col.filter(q => q.v < p.v).length;
		p.rankAll = pts.filter(q => q.v > p.v).length + 1;
	});
	const NI = pts.length - 1;
	// dots that share a height in a column (most of the old record is in tenths of a foot) are spread
	// evenly across the column, oldest at the left; a lone dot keeps its small sideways offset
	const groups = {};
	pts.forEach(p => { if (!p.now) (groups[p.m + ":" + Math.round(p.v * 50)] ||= []).push(p); });
	Object.values(groups).forEach(g => { if (g.length > 2) { g.sort((a, b) => a.y - b.y); g.forEach((p, k) => { p.j = -1 + 2 * (k + 0.5) / g.length; }); } });
	const LO = -0.75, HI = 3.0;
	const ABOVE = pts.filter(p => p.v > NOW.v);
	const fmtV = v => v.toFixed(2);
	const lastDay = +D.now.lastData.slice(8, 10);
	const SENTENCE = `San Francisco’s tide gauge read ${fmtV(NOW.v)} feet above the usual high tide on 24 November 2026, the highest November since 1897. Only four months went higher.`;
	const SMALL = `Highest water each month, August 1897 to 2026. November 2026 is preliminary, to ${lastDay} Nov. NOAA Tides and Currents.`;

	let sel = -1;
	// the opening motion, once on load: each dot rises from the floor of its column to its height, the
	// oldest years first, over the first four fifths; the line and labels fade in after.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const ease = t => 1 - Math.pow(1 - t, 3);
	const riseOf = p => grow >= 1 ? 1 : ease(Math.min(1, Math.max(0, (grow / 0.8) * 1.6 - ((p.y - 1897) / 130) * 0.6)));
	const faded = () => Math.min(1, Math.max(0, (grow - 0.7) / 0.3));

	// a reading: the month and its height, then one sentence a person would say
	const when = p => p.now ? "24 November 2026" : `${MON[p.m - 1]} ${p.y}`;
	function reading(i) {
		const p = pts[i];
		const head = `${when(p)}: ${fmtV(p.v)} ft`;
		let t;
		if (p.now) t = "Higher than any November on record. Only four months since 1897 went higher.";
		else if (p.rankAll === 1) t = "The highest water of any month on record.";
		else if (p.below === p.n - 1) t = `The highest of the ${p.n} ${MON[p.m - 1]}s on record.`;
		else if (p.below === 0) t = `The lowest of the ${p.n} ${MON[p.m - 1]}s on record.`;
		else t = `Higher than ${p.below} of the other ${p.n - 1} ${MON[p.m - 1]}s on record.`;
		return [head, t];
	}
	const readout = () => sel < 0 ? [SENTENCE] : reading(sel);

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}

	// the plot: twelve columns in the box (X, Y, W, H). Returns the dots' places for picking.
	function plot(ctx, X, Y, W, H, s, q, pick, key) {
		const snap = v => Math.round(v / q) * q;
		ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		const axW = ctx.measureText("+3 FT").width + 8 * s;
		const monH = 26 * s;
		const px = X + axW, pw = W - axW, ph = H - monH;
		const cw = pw / 12;
		const yOf = v => Y + ph - (v - LO) / (HI - LO) * ph;
		const r = Math.max(1.5 * s, Math.min(3.4 * s, cw * 0.065));
		const fa = faded();
		// grid: a line per foot; 0 is the usual high tide
		ctx.textBaseline = "middle"; ctx.textAlign = "right";
		for (let f = 0; f <= 3; f++) {
			const y = snap(yOf(f)) + q / 2;
			ctx.strokeStyle = C.rule; ctx.lineWidth = f === 0 ? 1.4 * q * 2 : q * 2; ctx.globalAlpha = 1;
			ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(X + W, y); ctx.stroke();
			ctx.fillStyle = C.ink2; ctx.font = `400 ${11.5 * s}px ${C.mono}`;
			ctx.fillText(f === 0 ? "0" : f === 3 ? `+${f} FT` : `+${f}`, px - 8 * s, y);
		}
		// the words for 0, inside the plot over the summer columns, where the dots sit lowest
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = C.ink2;
		ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		// month names under the columns
		ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = C.ink2;
		ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		const short = cw >= 40 * s;
		MON.forEach((m, k) => ctx.fillText(short ? m.slice(0, 3).toUpperCase() : m[0], px + cw * (k + 0.5), Y + ph + 19 * s));
		// the dots: older grey, since 2016 darker, then the red one
		const xy = pts.map(p => [px + cw * (p.m - 0.5) + p.j * cw * 0.34, yOf(LO + (p.v - LO) * riseOf(p))]);
		const dim = pick >= 0 ? 0.35 : 1;
		for (const [test, col] of [[p => !p.now && p.y < 2016, C.ink3], [p => !p.now && p.y >= 2016, C.ink]]) {
			ctx.fillStyle = col; ctx.globalAlpha = dim * (col === C.ink ? 0.8 : 1); ctx.beginPath();
			pts.forEach((p, i) => { if (test(p)) { const [x, y] = xy[i]; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832); } });
			ctx.fill();
		}
		ctx.globalAlpha = 1;
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		const zl = cw * 12 > 520 * s ? "0 = THE USUAL HIGH TIDE" : "0 = USUAL HIGH TIDE", zw = ctx.measureText(zl).width;
		const zx = px + cw * 5 + (cw * 2 - zw) / 2, zy = snap(yOf(0)) + 17 * s;
		ctx.fillStyle = C.paper; ctx.fillRect(zx - 5 * s, zy - 12 * s, zw + 10 * s, 17 * s);
		ctx.fillStyle = C.ink2; ctx.fillText(zl, zx, zy);
		// the hairline at 24 November's height, across all twelve columns
		const ny = yOf(NOW.v);
		ctx.globalAlpha = fa; ctx.strokeStyle = C.red; ctx.lineWidth = Math.max(q, s); ctx.setLineDash([3 * s, 3 * s]);
		ctx.beginPath(); ctx.moveTo(px, snap(ny) + q / 2); ctx.lineTo(X + W, snap(ny) + q / 2); ctx.stroke(); ctx.setLineDash([]);
		// the four months above it, each with its month and year
		ctx.font = `500 ${12.5 * s}px ${C.sans}`; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink;
		const placed = [];
		ABOVE.forEach(p => {
			const i = pts.indexOf(p), [x, y] = xy[i];
			const t = `${MON[p.m - 1].slice(0, 3)} ${p.y}`, tw = ctx.measureText(t).width;
			let lx = p.j > 0 ? x + r + 5 * s : x - r - 5 * s - tw;
			if (lx < px) lx = x + r + 5 * s;
			if (lx + tw > X + W) lx = x - r - 5 * s - tw;
			let ly = Math.min(y, ny - 15 * s);
			// on a collision move up, never down onto the red line
			for (let moved = true; moved;) {
				moved = false;
				for (const o of placed) if (Math.abs(o.y - ly) < 15 * s && lx < o.x1 && lx + tw > o.x0) { ly = o.y - 15 * s; moved = true; }
			}
			ctx.textAlign = "left"; ctx.fillText(t, lx, ly);
			placed.push({ x0: lx, x1: lx + tw, y: ly });
		});
		ctx.globalAlpha = 1;
		// the red dot, with its number and date
		const [nx, nyy] = xy[NI];
		ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(nx, nyy, r * 1.9 + 1.5 * s, 0, 6.2832); ctx.fill();
		ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(nx, nyy, r * 1.9, 0, 6.2832); ctx.fill();
		ctx.globalAlpha = fa;
		ctx.font = `600 ${15 * s}px ${C.sans}`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "right"; ctx.fillStyle = C.red;
		const lab1 = `${fmtV(NOW.v)} ft`, lab2 = "24 Nov 2026";
		const lx = nx - r * 1.9 - 7 * s;
		ctx.fillText(lab1, lx, nyy - 3 * s);
		ctx.font = `500 ${12.5 * s}px ${C.sans}`; ctx.fillText(lab2, lx, nyy + 13 * s);
		ctx.globalAlpha = 1;
		// a picked dot: ringed
		if (pick >= 0) {
			const [x, y] = xy[pick];
			ctx.strokeStyle = C.ink; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(x, y, r * 1.9 + 3 * s, 0, 6.2832); ctx.stroke();
		}
		// the key: three words for the three kinds of dot
		if (key) {
			ctx.globalAlpha = fa; ctx.font = `400 ${13 * s}px ${C.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
			let kx = key.x, ky = key.y;
			for (const [col, t, a] of [[C.ink3, "each month since 1897", 1], [C.ink, "since 2016", 0.8], [C.red, "24 Nov 2026", 1]]) {
				const w = 2 * r + 6 * s + ctx.measureText(t).width + 16 * s;
				if (kx + w > key.x + key.w && kx > key.x) { kx = key.x; ky += 20 * s; }
				ctx.globalAlpha = fa * a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(kx + r * 1.3, ky, r * 1.3, 0, 6.2832); ctx.fill();
				ctx.globalAlpha = fa; ctx.fillStyle = C.ink2; ctx.fillText(t, kx + r * 2.6 + 6 * s, ky);
				kx += w;
			}
			ctx.globalAlpha = 1;
		}
		return { xy, r, px, pw, Y, ph, X, W };
	}

	function readingH(ctx, i, w, s) {
		ctx.font = `400 ${15 * s}px ${C.sans}`;
		return 22 * s + wrap(ctx, reading(i)[1], w).length * 21 * s;
	}
	function drawReading(ctx, X, Y, w, s, i, onInk) {
		const [v, t] = reading(i);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillStyle = onInk ? C.paper : (pts[i].now ? C.red : C.ink);
		ctx.fillText(v, X, Y + 15 * s);
		ctx.font = `400 ${15 * s}px ${C.sans}`; ctx.fillStyle = onInk ? C.paper : C.ink2;
		wrap(ctx, t, w).forEach((l, k) => ctx.fillText(l, X, Y + 22 * s + 15 * s + k * 21 * s));
	}

	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1 / 2;
		if (!page) {
			// a shared image: the sentence, the small line, then the plot with its key
			const wide = w > h * 1.3, cw = wide ? w * 0.36 : w;
			const fs = wide ? Math.min(30 * s, w / 26) : Math.max(19 * s, Math.min(28 * s, w / 22));
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			const lines = wrap(ctx, SENTENCE, cw);
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.18));
			let used = lines.length * fs * 1.18 + 12 * s;
			ctx.font = `400 ${11.5 * s}px ${C.sans}`; ctx.fillStyle = C.ink2;
			const sm = wrap(ctx, SMALL, cw);
			sm.forEach((l, i) => ctx.fillText(l, x, y + used + 12 * s + i * 16 * s));
			used += sm.length * 16 * s + 24 * s;
			if (wide) {
				plot(ctx, x + cw + 40 * s, y, w - cw - 40 * s, h, s, q, -1, null);
				// the key under the sentence
				plotKeyOnly(ctx, x, y + used + 6 * s, cw, s);
			} else {
				plotKeyOnly(ctx, x, y + used, w, s);
				plot(ctx, x, y + used + 34 * s, w, h - used - 34 * s, s, q, -1, null);
			}
			return null;
		}
		const head = page.head, gut = head ? page.gut : Math.max(16 * s, page.gut);
		let L, cardBox = null;
		if (head) {
			const ax = head.x + head.w + 48 * s, aw = x + w - gut - ax;
			L = plot(ctx, ax, y + 24 * s, aw, h - 44 * s, s, q, sel, null);
			plotKeyOnly(ctx, head.x, head.y + head.h + 28 * s, head.w, s);
		} else {
			ctx.font = `400 ${13 * s}px ${C.sans}`;
			const keyH = ctx.measureText("each month since 1897 since 2016 24 Nov 2026").width + 90 * s > w - 2 * gut ? 52 * s : 32 * s;
			L = plot(ctx, x + gut - 2 * s, y + 12 * s + keyH, w - 2 * gut + 2 * s, h - 24 * s - keyH, s, q, sel, { x: x + gut, y: y + 16 * s, w: w - 2 * gut });
		}
		// the picked month's reading in an ink card beside its dot
		if (sel >= 0) {
			const [dx, dy] = L.xy[sel], pad = 12 * s;
			const cw = Math.min(280 * s, w - 2 * gut);
			const ch = readingH(ctx, sel, cw - 2 * pad, s) + 2 * pad;
			let cx = dx + 16 * s;
			if (cx + cw > x + w - gut) cx = dx - 16 * s - cw;
			if (cx < x + (head ? head.x + head.w + 48 * s : gut)) cx = Math.max(x + gut, Math.min(x + w - gut - cw, dx - cw / 2));
			let cy = dy - ch / 2;
			if (cx <= dx && cx + cw >= dx) cy = dy > y + h / 2 ? dy - ch - 18 * s : dy + 18 * s;
			cy = Math.max(y + 4 * s, Math.min(y + h - ch - 4 * s, cy));
			ctx.fillStyle = C.ink; ctx.fillRect(cx, cy, cw, ch);
			drawReading(ctx, cx + pad, cy + pad, cw - 2 * pad, s, sel, true);
			cardBox = { cx, cy, cw, ch };
		}
		return { L, cardBox };
	}

	// the key alone, at (X, Y), wrapped to w
	function plotKeyOnly(ctx, X, Y, w, s) {
		const r = 3.4 * s, fa = faded();
		ctx.font = `400 ${13 * s}px ${C.sans}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
		let kx = X, ky = Y;
		for (const [col, t, a] of [[C.ink3, "each month since 1897", 1], [C.ink, "since 2016", 0.8], [C.red, "24 Nov 2026", 1]]) {
			const tw = 2 * r + 6 * s + ctx.measureText(t).width;
			if (kx + tw > X + w && kx > X) { kx = X; ky += 20 * s; }
			ctx.globalAlpha = fa * a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(kx + r, ky, r, 0, 6.2832); ctx.fill();
			ctx.globalAlpha = fa; ctx.fillStyle = C.ink2; ctx.fillText(t, kx + 2 * r + 6 * s, ky);
			kx += tw + 16 * s;
		}
		ctx.globalAlpha = 1;
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
		lay = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage), gut: parseFloat(getComputedStyle(headEl).paddingLeft) || 0, dpr });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(textEl);
	Promise.all([`400 12px ${C.mono}`, `600 17px ${C.sans}`, `500 12px ${C.sans}`, `400 15px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?m=1983-01: a month; nothing is the overview
	const code = p => `${p.y}-${String(p.m).padStart(2, "0")}`;
	sel = pts.findIndex(p => code(p) === (CD.state.get("m") || ""));
	const pick = CD.selection({ initial: sel, key: "m", encode: i => code(pts[i]), onChange: i => { sel = i; if (i >= 0) grow = 1; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the nearest dot within reach of the pointer; the pinned one again, or empty space, goes back
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const reach = e.pointerType === "touch" ? 22 : 12;
			let best = -1, bd = reach * reach;
			lay.L.xy.forEach(([x, y], i) => { const d = (x - mx) ** 2 + (y - my) ** 2; if (d < bd || (i === NI && d < bd * 2)) { bd = d; best = i; } });
			return e.type === "pointerdown" && best === pick.pinned ? -1 : best;
		},
		// arrows step through the months from the highest down, and wrap
		step: (from, dir) => {
			const k = from < 0 ? (dir > 0 ? -1 : 0) : ranked.indexOf(from);
			return ranked[(k + dir + ranked.length) % ranked.length];
		}
	});
	if (sel >= 0) grow = 1;
	if (grow < 1) {
		const t0 = performance.now() + 250;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1500)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow, sv = sel; grow = 1; sel = -1; draw(c, x, y, w, h, u * (w > h * 1.3 ? 1.6 : 1.5), true, null); grow = g; sel = sv; } };
})();
