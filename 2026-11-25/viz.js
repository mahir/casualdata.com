// 2026-11-25 — of every 100 women murdered in 2025, how many were killed by a partner or a relative,
// and of every 100 men. Six pairs of 10×10 dot squares: the World pair large, the five regions as rows
// of small pairs, sorted by the women's share. Red is the one accent: women killed by a partner or a
// relative. Picking a pair reads its estimated count, band and rate in a fixed band that never
// covers the squares.
(function () {
	const C = CD.colors, D = window.FEMICIDE, rows = D.rows, N = rows.length;
	const fmt = n => n.toLocaleString("en-US");
	const SENTENCE = `Worldwide, ${rows[0].women} of every 100 women murdered in ${D.year} were killed by a partner or a relative. For men, it was ${rows[0].men}`;
	const SMALL = `Share of women and of men murdered in ${D.year} who were killed by a partner or a relative · Estimates · UNODC and UN Women`;

	let sel = -1;
	// the opening motion, once on load: the World women's red dots are counted in over the first four
	// fifths, then the big numbers fade in. Still under reduced motion and once the reader picks.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const moved = () => 1 - Math.pow(1 - Math.min(1, grow / 0.8), 3);
	const faded = () => Math.min(1, Math.max(0, (grow - 0.8) / 0.2));

	function reading(i) {
		const r = rows[i < 0 ? 0 : i];
		const head = `${r.name === "World" ? "Worldwide" : r.name}: ${fmt(r.count)} women and girls`;
		const ctx = [`killed by a partner or a relative in ${D.year}`, `estimate ${fmt(r.low)} to ${fmt(r.high)}`, `${r.rate} per 100,000 women and girls`];
		if (r.slug === "world") ctx.push(`about ${D.perDay} a day`, `of about ${fmt(D.allWomen)} women and girls murdered`);
		if (r.partner) ctx.push(`${r.partner} of every 100 of them by a partner, the rest by a relative`);
		return [head, ctx.join(" · ")];
	}
	const readout = () => sel < 0 ? [SENTENCE, SMALL] : reading(sel);

	// lines broken at sep; any piece still wider than w is broken again between words
	function wrap(ctx, text, w, sep = " ") {
		if (sep !== " ") return text.split(sep).reduce((out, part) => {
			const t = out.length ? out[out.length - 1] + sep + part : part;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(...wrap(ctx, part, w));
			return out;
		}, []);
		const out = [];
		for (const word of text.split(sep)) {
			const t = out.length ? out[out.length - 1] + sep + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}

	// one 10×10 square of dots, filled row by row from the top left: n dots in color, the rest pale
	function square(ctx, ox, oy, c, n, color, q) {
		const d = c * 0.76, round = d >= 4;
		const snap = v => Math.round(v / q) * q;
		for (const [from, to, col] of [[0, n, color], [n, 100, C.rule]]) {
			if (to <= from) continue;
			ctx.fillStyle = col; ctx.beginPath();
			for (let k = from; k < to; k++) {
				const cx = snap(ox + (k % 10) * c), cy = snap(oy + Math.floor(k / 10) * c);
				if (round) { ctx.moveTo(cx + d, cy + d / 2); ctx.arc(cx + d / 2, cy + d / 2, d / 2, 0, 6.2832); } else ctx.rect(cx, cy, Math.max(q, snap(d)), Math.max(q, snap(d)));
			}
			ctx.fill();
		}
	}

	// the World pair: a big number and two small lines over each square. Returns its height for cell c.
	const bigFs = (c, s) => Math.max(30 * s, Math.min(64 * s, c * 2.6));
	const bigH = (c, s) => bigFs(c, s) + 8 * s + 2 * 15 * s + 10 * s + 10 * c;
	const bigGap = (c, s) => Math.max(26 * s, c * 2.4);
	function drawBig(ctx, X, Y, c, s, q) {
		const r = rows[0], fs = bigFs(c, s), G = bigGap(c, s), sq = Y + fs + 8 * s + 30 * s + 10 * s;
		const red = Math.round(r.women * (grow >= 1 ? 1 : moved()));
		[[r.women, red, C.red, "women"], [r.men, r.men, C.ink2, "men"]].forEach(([v, n, col, who], k) => {
			const x0 = X + k * (10 * c + G);
			ctx.globalAlpha = faded(); ctx.fillStyle = k ? C.ink : C.red; ctx.font = `600 ${fs}px ${C.sans}`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
			ctx.fillText(String(v), x0 - fs * 0.05, Y + fs * 0.82);
			ctx.globalAlpha = 1; ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
			ctx.fillText(`OF EVERY 100 ${who.toUpperCase()}`, x0, Y + fs + 8 * s + 11 * s);
			ctx.fillText(`MURDERED IN ${D.year}`, x0, Y + fs + 8 * s + 26 * s);
			square(ctx, x0, sq, c, n, col, q);
		});
		return { x0: X, y0: Y, x1: X + 20 * c + G, y1: sq + 10 * c };
	}

	// a region row: its name, then the women's square and number, the men's square and number
	const numW = s => 30 * s;
	function regionW(ctx, c, s, nameW) { return nameW + 20 * c + 2 * (8 * s + numW(s)) + 18 * s; }
	function drawRegion(ctx, i, X, Y, c, s, q, nameW) {
		const r = rows[i];
		ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink; ctx.font = `600 ${15 * s}px ${C.sans}`;
		ctx.fillText(r.name, X, Y + 5 * c);
		const fs = 17 * s; ctx.textBaseline = "alphabetic"; ctx.font = `600 ${fs}px ${C.sans}`;
		const xw = X + nameW, xm = xw + 10 * c + 8 * s + numW(s) + 18 * s;
		square(ctx, xw, Y, c, r.women, C.red, q);
		ctx.fillStyle = C.red; ctx.fillText(String(r.women), xw + 10 * c + 7 * s, Y + fs * 0.8);
		square(ctx, xm, Y, c, r.men, C.ink2, q);
		ctx.fillStyle = C.ink; ctx.fillText(String(r.men), xm + 10 * c + 7 * s, Y + fs * 0.8);
		return { x0: X, y0: Y, x1: xm + 10 * c + 8 * s + numW(s), y1: Y + 10 * c, xw, xm };
	}

	// the reading band: a value line and its context, wrapped; a fixed place, never over the squares
	const bandH = s => 17 * s + 8 * s + 3 * 15 * s + 6 * s;
	function drawBand(ctx, X, Y, w, s, i) {
		const [v, cx] = reading(i);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillStyle = i < 0 ? C.ink : C.ink;
		ctx.fillText(v, X, Y + 15 * s);
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
		const ls = wrap(ctx, cx.toUpperCase(), w, " · ");
		ls.forEach((l, k) => ctx.fillText(l, X, Y + 17 * s + 8 * s + 10 * s + k * 15 * s));
		return 17 * s + 8 * s + ls.length * 15 * s + 6 * s;
	}

	function outline(ctx, b, s) {
		ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5 * s;
		ctx.strokeRect(b.x0 - 8 * s, b.y0 - 8 * s, b.x1 - b.x0 + 16 * s, b.y1 - b.y0 + 16 * s);
	}

	// Two frames. On the page the chart is the page: on wide screens the title lies over the top left,
	// the reading band sits under it, and the World pair and the five regions take the room to its
	// right. On phones the World pair runs across the top, the band under it, the regions below. A
	// shared image has no title, so it carries the sentence, one small line and the World pair.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1 / 2;
		const head = page ? page.head : null, gut = page ? (head ? page.gut : Math.max(16 * s, page.gut)) : 0;
		const hit = [];
		ctx.font = `600 ${15 * s}px ${C.sans}`;
		const nameW = Math.max(...rows.slice(1).map(r => ctx.measureText(r.name).width)) + 14 * s;

		if (!page) {
			const wide = w > h * 1.3, cw = wide ? w * 0.42 : w;
			const fs = wide ? Math.min(34 * s, w / 26) : Math.max(19 * s, Math.min(30 * s, w / 20));
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			const lines = wrap(ctx, SENTENCE, cw);
			lines.forEach((l, i) => { ctx.fillStyle = C.ink; ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.16); });
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
			const sm = wrap(ctx, SMALL.toUpperCase(), cw, " · ");
			const sy = y + lines.length * fs * 1.16 + 14 * s;
			sm.forEach((l, i) => ctx.fillText(l, x, sy + 11 * s + i * 16 * s));
			const used = lines.length * fs * 1.16 + 14 * s + sm.length * 16 * s + 30 * s;
			const ax = wide ? x + cw + 50 * s : x, ay = wide ? y : y + used, aw = wide ? w - cw - 50 * s : w, ah = wide ? h : h - used;
			let c = Math.min(aw / 22.6, (ah - 100 * s) / 12.4);
			for (let k = 0; k < 20 && (20 * c + bigGap(c, s) > aw || bigH(c, s) > ah); k++) c *= 0.95;
			const bw = 20 * c + bigGap(c, s), bh = bigH(c, s);
			drawBig(ctx, ax + (aw - bw) / 2, ay + Math.max(0, (ah - bh) / 2), c, s, q);
			return null;
		}

		if (head) {
			// the band under the title; the World pair and the regions to its right
			const bx = head.x, by = head.y + head.h + 30 * s;
			if (by + bandH(s) < y + h) drawBand(ctx, bx, by, head.w, s, sel);
			const ax = head.x + head.w + 56 * s, aw = x + w - gut - ax, ay = y + 24 * s, ah = h - 48 * s;
			// split: World about 55%, the regions the rest; the regions' cell is at most 45% of the World's
			let c = 12 * s, cr = 5 * s;
			for (let k = 0; k < 60; k++) {
				const tc = c * 1.03, tcr = Math.min(tc * 0.45, (ah - 30 * s - 4 * 24 * s) / 50);
				if (20 * tc + bigGap(tc, s) + 56 * s + regionW(ctx, tcr, s, nameW) > aw || bigH(tc, s) > ah) break;
				c = tc; cr = tcr;
			}
			const bw = 20 * c + bigGap(c, s), rw = regionW(ctx, cr, s, nameW);
			const spare = Math.max(0, aw - bw - 56 * s - rw), X0 = ax + spare / 2;
			const bh = bigH(c, s);
			const rowH = 10 * cr, gapR = Math.min(28 * s, Math.max(14 * s, (ah - 30 * s - 5 * rowH) / 5));
			const total = 30 * s + 5 * rowH + 4 * gapR, H = Math.max(bh, total), top = ay + Math.max(0, (ah - H) / 2);
			const Y0 = top + H - bh, ry0 = top + H - total;
			hit.push({ i: 0, ...drawBig(ctx, X0, Y0, c, s, q) });
			// the regions: column heads, then five rows, set against the World squares' height
			const RX = X0 + bw + 56 * s;
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			ctx.fillText("WOMEN", RX + nameW, ry0 + 12 * s);
			ctx.fillText("MEN", RX + nameW + 10 * cr + 8 * s + numW(s) + 18 * s, ry0 + 12 * s);
			for (let i = 1; i < N; i++) hit.push({ i, ...drawRegion(ctx, i, RX, ry0 + 30 * s + (i - 1) * (rowH + gapR), cr, s, q, nameW) });
		} else {
			// a column: World across the top, the band, then the regions
			const ax = x + gut, aw = w - 2 * gut;
			let c = Math.min((aw - 26 * s) / 20, 22 * s);
			while (c > 4 * s && 20 * c + bigGap(c, s) > aw) c *= 0.97;
			const bw = 20 * c + bigGap(c, s), X0 = ax + Math.max(0, (aw - bw) / 2);
			let Y = y + 14 * s;
			hit.push({ i: 0, ...drawBig(ctx, X0, Y, c, s, q) });
			Y += bigH(c, s) + 24 * s;
			// the band keeps the height of its longest reading, so the rows never move
			const bwid = Math.max(bw, Math.min(aw, 460 * s));
			ctx.font = `400 ${11.5 * s}px ${C.mono}`;
			const most = Math.max(...rows.map((r, i) => wrap(ctx, reading(i)[1].toUpperCase(), bwid, " · ").length));
			drawBand(ctx, X0, Y, bwid, s, sel);
			Y += 17 * s + 8 * s + most * 15 * s + 22 * s;
			hit[0].y1 = Y - 30 * s;                // the band belongs to the World pair: a tap on it reads the world
			const room = y + h - 10 * s - Y;
			let cr = Math.min(c * 0.5, (aw - nameW - 2 * (8 * s + numW(s)) - 18 * s) / 20);
			cr = Math.max(3 * s, Math.min(cr, (room - 22 * s - 4 * 14 * s) / 50));
			const rw = regionW(ctx, cr, s, nameW), RX = ax + Math.max(0, (aw - rw) / 2);
			const gapR = Math.max(14 * s, Math.min(24 * s, (room - 22 * s - 50 * cr) / 4));
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			ctx.fillText("WOMEN", RX + nameW, Y + 12 * s);
			ctx.fillText("MEN", RX + nameW + 10 * cr + 8 * s + numW(s) + 18 * s, Y + 12 * s);
			for (let i = 1; i < N; i++) hit.push({ i, ...drawRegion(ctx, i, RX, Y + 22 * s + (i - 1) * (10 * cr + gapR), cr, s, q, nameW) });
		}
		if (sel >= 0) { const b = hit.find(o => o.i === sel); if (b) outline(ctx, b, s); }
		return { hit };
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
	Promise.all([`400 12px ${C.mono}`, `600 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?r=africa: a region (world, africa, oceania, asia, europe, americas)
	sel = rows.findIndex(r => r.slug === (CD.state.get("r") || "").toLowerCase());
	const pick = CD.selection({ initial: sel, key: "r", encode: i => rows[i].slug, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// a pair picks its region; the pinned one again, or anywhere else, goes back
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = lay.hit.find(o => mx >= o.x0 - 10 && mx <= o.x1 + 10 && my >= o.y0 - 10 && my <= o.y1 + 10);
			const i = b ? b.i : -1;
			return e.type === "pointerdown" && i === pick.pinned ? -1 : i;
		},
		// arrows step through World and the five regions, and wrap
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1500)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// the image is always the finished picture
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow, sv = sel; grow = 1; sel = -1; draw(c, x, y, w, h, u * (w > h * 1.3 ? 2 : 1.6), true, null); grow = g; sel = sv; } };
})();
