// 2026-11-18 — the US dollar against 29 currencies in 2026: one small panel per currency, all on the
// same two axes. Each line is the change since 2 January 2026 in how much of that currency one dollar
// buys, on every ECB fixing day to 17 November. Panels run from the largest rise to the largest fall.
// The one red thing: the Korean won, where the dollar has fallen most. Pointing in a panel reads the
// rate on that day.
(function () {
	const C = CD.colors, D = window.DOLLAR;
	const ND = D.dates.length, LAST = ND - 1;
	// units of each currency per dollar, and the change since the first day; nothing else is stored
	const cur = D.currencies.map(c => {
		const per = D.usd.map((u, i) => c.eur ? c.eur[i] / u : 1 / u);
		return { code: c.code, name: c.name, unit: c.unit, per, chg: per.map(v => v / per[0] - 1) };
	}).sort((a, b) => b.chg[LAST] - a.chg[LAST]);   // on unrounded values
	const N = cur.length;
	const UP = cur.filter(c => c.chg[LAST] > 0).length;
	const RED = N - 1, red = cur[RED];               // the largest fall
	const Y0 = -0.125, Y1 = 0.18;                    // one scale for every panel (data: −11.6% to +17.2%)

	const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const dLong = iso => `${+iso.slice(8)} ${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
	const dShort = iso => `${+iso.slice(8)} ${MON[+iso.slice(5, 7) - 1].slice(0, 3)}`;
	const dMid = iso => `${dShort(iso)} ${iso.slice(0, 4)}`;
	const pct = v => Math.abs(v) < 0.0005 ? "0.0%" : `${v < 0 ? "−" : "+"}${Math.abs(v * 100).toFixed(1)}%`;   // no sign on a change that rounds to zero
	const rate = v => v >= 100 ? Math.round(v).toLocaleString("en-US") : v >= 1 ? v.toFixed(2) : v.toFixed(4);

	const S1 = `The US dollar has fallen ${Math.abs(red.chg[LAST] * 100).toFixed(1)}% against the ${red.name} since ${dLong(D.base)}. It has risen against ${UP} of ${N} currencies.`;
	const SUB = `EACH PANEL IS ONE CURRENCY: THE CHANGE IN HOW MUCH OF IT A US DOLLAR BUYS, ${dShort(D.base).toUpperCase()} TO ${dMid(D.asOf).toUpperCase()} · ECB REFERENCE RATES`;

	// the reading: sel = panel * ND + day, or -1 for the overview
	let sel = -1;
	// the opening motion, once on load (NEXT.md, "Opening motion"): grow runs 0 to 1; the marks arrive
	// over its first four fifths, then their labels fade in. Still under reduced motion.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const moved = () => 1 - Math.pow(1 - Math.min(1, grow / 0.8), 3);
	const faded = () => Math.min(1, Math.max(0, (grow - 0.8) / 0.2));
	function readout() {
		if (sel < 0) return [S1, "Each panel is one currency, from the largest rise to the largest fall"];
		const c = cur[Math.floor(sel / ND)], d = sel % ND;
		return [`1 dollar = ${rate(c.per[d])} ${c.unit}`, `${c.name} · ${dMid(D.dates[d])} · ${pct(c.chg[d])} since ${dShort(D.base)}`];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	const over = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

	// The grid in an area: the column count whose panels come out largest and a little wider than tall.
	// block, if given, is a box no panel may touch (the title and the key under it); the panels flow
	// around it in order. spareW is the width the key needs after the last panel (0: no key in the grid).
	function fit(area, s, block, spareW, minW) {
		let best = null;
		for (let cols = 3; cols <= 12; cols++) {
			const pw = area.w / cols, extra = spareW ? Math.ceil(spareW / pw) : 0;
			if (extra > cols) continue;
			for (let rws = 1; rws <= 14; rws++) {
				const ph = area.h / rws, slots = [];
				for (let r = 0; r < rws; r++) for (let c = 0; c < cols; c++) {
					const b = { x: area.x + c * pw, y: area.y + r * ph, w: pw, h: ph };
					if (!block || !over(b, block)) slots.push(Object.assign(b, { r, c }));
				}
				if (slots.length < N) continue;
				// the key takes the free slots after the last panel, on its row
				let key = null;
				if (extra) {
					const last = slots[N - 1], tail = slots.slice(N).filter(b => b.r === last.r);
					if (tail.length < extra) continue;
					key = { x: tail[0].x, y: tail[0].y, w: Math.min(tail.length, extra + 1) * pw, h: ph };
				}
				const score = Math.min(pw / 1.35, ph) * (pw < minW ? 0.3 : 1) * (ph < 46 * s ? 0.5 : 1);
				if (!best || score > best.score) best = { cols, rws, pw, ph, slots: slots.slice(0, N), key, score };
				break;
			}
		}
		return best;
	}

	// Two frames. On the page the chart is the page: the title and dek are HTML and, on wide screens,
	// lie over the top left; the panels flow around them and the key sits under them. A shared image
	// has no title, so the drawing carries the sentence and one small line across the top instead.
	// page = { head: {x, y, w, h} | null, gut }: the title block's box inside the canvas, and the gutter.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		const gut = page ? page.gut : 0, ip = 5 * s;      // ip: a panel's inner side padding
		const edgeL = x + Math.max(0, gut - ip), edgeR = x + w - Math.max(0, gut - ip);
		let top = y + (page ? 12 * s : 0);
		const bottom = y + h - (page ? 6 * s : 0);
		ctx.font = mono; const chW = ctx.measureText("0").width;
		const keyW = 25 * chW + 2 * ip, keyH = 48 * s;     // "ABOVE: A DOLLAR BUYS MORE"
		const minW = 10 * chW + 2 * ip + 2 * s;            // "TRY +17.2%"

		// ---- a shared image: the sentence and one small line, full width
		const head = page ? page.head : null;
		if (!page) {
			const fs = Math.max(19 * s, Math.min(30 * s, w / 30));
			ctx.font = `600 ${fs}px ${C.sans}`; const lines = wrap(ctx, S1, w);
			ctx.font = mono; const sub = wrap(ctx, SUB, w);
			const sentH = lines.length * fs * 1.14;
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 10 * s + 11 * s + i * 16 * s));
			top = y + sentH + 10 * s + sub.length * 16 * s + 18 * s;
		}

		// ---- the grid: around the title block on a wide page, the key under the title; otherwise the
		// key in the free slots after the last panel
		const area = { x: edgeL, y: top, w: edgeR - edgeL, h: bottom - top };
		let G = null, K = null;
		if (head) {
			const block = { x: x, y: y, w: head.x + head.w + 22 * s - x, h: head.y + head.h + 16 * s + keyH + 4 * s - y };
			G = fit(area, s, block, 0, minW);
			if (G) K = { x: head.x, y: head.y + head.h + 16 * s, w: Math.min(head.w, 300 * s), h: keyH };
		}
		if (!G && exporting) G = fit(area, s, null, 0, minW);
		if (!G) {
			// the key after the last panel, or in a strip above the grid, whichever leaves larger panels
			const strip = keyH + 12 * s;
			const a = fit(area, s, null, keyW, minW), b = fit({ x: area.x, y: area.y + strip, w: area.w, h: area.h - strip }, s, null, 0, minW);
			if (a && (!b || a.score >= b.score)) { G = a; K = { x: a.key.x + ip, y: a.key.y + 2 * s, w: a.key.w - 2 * ip, h: keyH }; }
			else { G = b; K = { x: area.x + ip, y: area.y, w: Math.min(area.w - 2 * ip, 300 * s), h: keyH }; }
		}
		if (K && K.y + K.h > y + h + 2 * s) K = null;

		// ---- how a panel is labelled: the name and the figure on one line, the name over the figure,
		// or the code and the figure; the same for every panel
		const inner = G.pw - 2 * ip;
		ctx.font = monoB; const figW = ctx.measureText("+17.2%").width;
		ctx.font = mono;
		const nameW = Math.max(...cur.map(c => ctx.measureText(c.name.toUpperCase()).width));
		const mode = nameW + 10 * s + figW <= inner ? "line" : nameW <= inner && G.ph >= 96 * s ? "stack" : inner >= minW - 2 * ip - 2 * s ? "code" : "none";
		const big = mode !== "code" && mode !== "none" && G.ph >= 96 * s;
		const figF = big ? `600 ${15 * s}px ${C.sans}` : monoB;
		const band = mode === "stack" ? 34 * s : mode === "none" ? 4 * s : (big ? 19 : 16) * s;
		const vgap = Math.min(10 * s, G.ph * 0.07);

		const geo = cur.map((c, i) => {
			const b = G.slots[i];
			const px = b.x + ip, pw = inner, py = b.y + band + 3 * s, ph = b.h - band - 3 * s - vgap;
			return { b, px, pw, py, ph, xs: d => px + d / LAST * (pw - 3.5 * s), ys: v => py + ph - (v - Y0) / (Y1 - Y0) * ph };
		});

		// on load every line is drawn from the first day to the last, its point riding the end; the figures follow
		const upD = moved() * LAST, dN = Math.floor(upD), la = faded();
		geo.forEach((g, i) => {
			const c = cur[i], isRed = i === RED, picked = sel >= 0 && Math.floor(sel / ND) === i;
			const tx = g.xs(upD), tv = dN >= LAST ? c.chg[LAST] : c.chg[dN] + (c.chg[dN + 1] - c.chg[dN]) * (upD - dN);
			const col = isRed ? C.red : C.ink;
			// the zero line: 2 January's level
			const zy = Math.round(g.ys(0)) + 0.5;
			ctx.strokeStyle = C.ink3 || C.rule; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(g.px, zy); ctx.lineTo(g.px + g.pw, zy); ctx.stroke();
			// a faint fill between the line and zero
			ctx.beginPath(); ctx.moveTo(g.xs(0), g.ys(0));
			for (let d = 0; d <= dN; d++) ctx.lineTo(g.xs(d), g.ys(c.chg[d]));
			ctx.lineTo(tx, g.ys(tv)); ctx.lineTo(tx, g.ys(0)); ctx.closePath();
			ctx.globalAlpha = isRed ? 0.16 : 0.09; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
			// the line and its last point
			ctx.beginPath();
			for (let d = 0; d <= dN; d++) { const X = g.xs(d), Y = g.ys(c.chg[d]); d ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
			ctx.lineTo(tx, g.ys(tv));
			ctx.strokeStyle = col; ctx.lineWidth = (isRed ? 2 : 1.4) * s; ctx.stroke();
			ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tx, g.ys(tv), (isRed ? 3.4 : 2.6) * s, 0, 7); ctx.fill();
			// the label: the currency, and the change on the last day
			if (mode === "none" && !(i === 0 || isRed)) return;
			const fig = pct(c.chg[LAST]), ly = g.b.y + (big ? 14 : 12) * s;
			ctx.font = picked || isRed ? monoB : mono; ctx.fillStyle = picked || isRed ? C.ink : C.ink2; ctx.textAlign = "left";
			if (mode === "none") {   // too small for a label band: the first and the red panel only, clear of their lines
				const ty = c.chg[LAST] > 0 ? g.ys(Y0) - 2 * s : g.py + 10 * s;
				ctx.font = monoB; ctx.fillStyle = col; ctx.fillText(`${c.code} ${fig}`, g.px, ty);
				return;
			}
			ctx.fillText(mode === "code" ? c.code : c.name.toUpperCase(), g.px, ly);
			ctx.font = figF; ctx.fillStyle = col; ctx.globalAlpha = la;
			if (mode === "stack") ctx.fillText(fig, g.px, ly + 18 * s);
			else { ctx.textAlign = "right"; ctx.fillText(fig, g.px + g.pw, ly); ctx.textAlign = "left"; }
			ctx.globalAlpha = 1;
		});

		// ---- the key: what the zero line is and which way is which
		if (K) {
			ctx.font = mono; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
			const narrow = K.w < 25 * chW;
			ctx.fillText(narrow ? "ABOVE: BUYS MORE" : "ABOVE: A DOLLAR BUYS MORE", K.x, K.y + 11 * s);
			const zy = Math.round(K.y + 17 * s) + 0.5;
			ctx.strokeStyle = C.ink3 || C.rule; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(K.x, zy); ctx.lineTo(K.x + K.w, zy); ctx.stroke();
			ctx.fillText(narrow ? "BELOW: BUYS LESS" : "BELOW: A DOLLAR BUYS LESS", K.x, K.y + 30 * s);
			const a = `0 = ${dShort(D.base).toUpperCase()}`, b = `LINE ENDS ${dMid(D.asOf).toUpperCase()}`;
			ctx.fillStyle = C.ink; ctx.fillText(a, K.x, K.y + 45 * s);
			if (ctx.measureText(a + "   " + b).width <= K.w) { ctx.textAlign = "right"; ctx.fillStyle = C.ink2; ctx.fillText(b, K.x + K.w, K.y + 45 * s); ctx.textAlign = "left"; }
		}

		// ---- the reader's day: a hairline, a point and the reading beside it
		if (sel >= 0) {
			const i = Math.floor(sel / ND), d = sel % ND, g = geo[i], c = cur[i];
			const X = g.xs(d), Y = g.ys(c.chg[d]);
			ctx.strokeStyle = C.ink; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(Math.round(X) + 0.5, g.py); ctx.lineTo(Math.round(X) + 0.5, g.py + g.ph); ctx.stroke();
			ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(X, Y, 5 * s, 0, 7); ctx.fill();
			ctx.fillStyle = i === RED ? C.red : C.ink; ctx.beginPath(); ctx.arc(X, Y, 3.5 * s, 0, 7); ctx.fill();
			const [value, context] = readout();
			// keep the chip off its own panel first, then off the other panels' labels, the key and the title
			const own = { x: g.b.x, y: g.b.y, w: g.b.w, h: g.b.h };
			const avoid = [own, own, own, own];
			geo.forEach((o, k) => { if (k !== i) avoid.push({ x: o.px, y: o.b.y, w: o.pw, h: band }); });
			if (K) avoid.push(K);
			if (head) avoid.push(head, head, head, head, head, head);
			let box = { x: x + 2 * s, y: y + 2 * s, w: w - 4 * s, h: h - 4 * s };
			// small panels: the reading is wider than a panel, so it sits in the row above (or, at the
			// top, below), clear of its own panel
			if (G.pw < 150 * s) {
				const need = 84 * s, above = g.b.y - box.y;
				box = above >= need ? { x: box.x, y: Math.max(box.y, g.b.y - need), w: box.w, h: Math.min(above, need) } : { x: box.x, y: g.b.y + g.b.h, w: box.w, h: Math.max(need, box.y + box.h - g.b.y - g.b.h) };
			}
			CD.label(ctx, X, Y, value, context, s, box, X, G.pw < 150 * s ? [] : avoid);
		}
		ctx.textAlign = "left";
		return { geo, G };
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

	// ?c=KRW&d=2026-06-30: the currency and the day; ?c=KRW alone is the last day; anything else, the overview
	{
		const ci = cur.findIndex(c => c.code === (CD.state.get("c") || "").toUpperCase()), di = D.dates.indexOf(CD.state.get("d"));
		sel = ci < 0 ? -1 : ci * ND + (di < 0 ? LAST : di);
	}
	const pick = CD.selection({ initial: sel, key: "c", encode: i => cur[Math.floor(i / ND)].code, onChange: i => { sel = i; schedule(); } });
	// the link carries two values, so every pin writes both (the kit's own write, of c alone, is replaced)
	const sel2 = {
		show: i => pick.show(i), leave: () => pick.leave(),
		pin: i => { pick.pin(i); CD.state.set({ c: i < 0 ? null : cur[Math.floor(i / ND)].code, d: i < 0 || i % ND === LAST ? null : D.dates[i % ND] }); },
		get shown() { return pick.shown; }, get pinned() { return pick.pinned; }
	};
	// up and down move a currency and keep the day (registered first, so the shared handler does not
	// also step a day)
	cv.addEventListener("keydown", e => {
		const dir = { ArrowUp: -1, ArrowDown: 1 }[e.key];
		if (!dir) return;
		e.preventDefault(); e.stopImmediatePropagation();
		const from = pick.shown;
		sel2.pin(from < 0 ? (dir > 0 ? 0 : N - 1) * ND + LAST : ((Math.floor(from / ND) + dir + N) % N) * ND + from % ND);
	});
	CD.bindSelection(cv, sel2, {
		// the panel under the pointer and the nearest day in it; tapping the pinned day again, or
		// outside every panel, goes back to the overview
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const i = lay.geo.findIndex(g => mx >= g.b.x && mx < g.b.x + g.b.w && my >= g.b.y && my < g.b.y + g.b.h);
			if (i < 0) return -1;
			const g = lay.geo[i], d = Math.min(LAST, Math.max(0, Math.round((mx - g.px) / (g.pw - 3.5) * LAST)));
			const k = i * ND + d;
			return e.type === "pointerdown" && k === pick.pinned ? -1 : k;
		},
		// left and right step a day inside the currency; the first key opens the first panel on its last day
		step: (from, dir) => from < 0 ? LAST : Math.floor(from / ND) * ND + Math.min(LAST, Math.max(0, from % ND + dir))
	});
	// the opening motion ends at once when the reader picks something
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1500)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// the image is always the finished picture, even while the opening motion is still running
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6, true, null); grow = g; } };
})();
