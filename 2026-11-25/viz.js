// 2026-11-25 — women and girls murdered in 2025, one dot for every 100 of them. Red: killed by a
// partner or a relative, in one block per region, largest first. Grey: killed by anyone else (the
// brief gives that part only for the world). Picking a block reads it in plain words: its count and
// one sentence, nothing in small print. The page's dek is the key; a shared image draws its own.
(function () {
	const C = CD.colors, D = window.FEMICIDE, world = D.rows[0];
	const fmt = n => n.toLocaleString("en-US");
	const PER = 100;
	const others = { slug: "others", name: "Someone else", count: D.allWomen - world.count, other: true };
	const blocks = [...D.rows.slice(1).sort((a, b) => b.count - a.count), others].map(b => ({ ...b, n: Math.round(b.count / PER) }));
	const TOTAL = blocks.reduce((a, b) => a + b.n, 0), NB = blocks.length;
	const SENTENCE = `In ${D.year}, partners and relatives killed about ${fmt(world.count)} women and girls, ${D.perDay} a day`;
	const UNIT = `Each dot: ${PER} women and girls murdered in ${D.year}`;

	let sel = -1;
	// the opening motion, once on load: the dots are counted in, Africa's first and the grey last, over
	// the first four fifths; the labels fade in after. Still under reduced motion and once the reader picks.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const moved = () => 1 - Math.pow(1 - Math.min(1, grow / 0.8), 2);
	const faded = () => Math.min(1, Math.max(0, (grow - 0.7) / 0.3));

	// a reading is the block's count and one sentence a person would say: shares in words, not figures
	const place = b => b.slug === "americas" ? "the Americas" : b.name;
	const share = v => v >= 72 ? "Three in four women" : v > 52 ? "More than half of the women" : "About half of the women";
	function reading(i) {
		const b = blocks[i];
		if (b.other) return [`Someone else: ${fmt(b.count)}`, `Four in ten women and girls murdered in ${D.year} were killed by someone other than a partner or a relative.`];
		return [`${b.name}: ${fmt(b.count)}`, `${share(b.women)} murdered in ${place(b)} were killed by a partner or a relative.`];
	}
	const readout = () => sel < 0 ? [SENTENCE] : reading(sel);

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

	// The field: a unit line, then one block per row of the list. Labels sit in a column at the left
	// when there is room (side), or on a line above each block. fit() picks the number of columns
	// that gives the largest dots in the room.
	const nameFs = s => 15 * s;
	function labelW(ctx, s) {
		ctx.font = `600 ${nameFs(s)}px ${C.sans}`;
		const nw = Math.max(...blocks.map(b => ctx.measureText(b.name).width));
		const cw = Math.max(...blocks.map(b => ctx.measureText(fmt(b.count)).width));
		return { nw, cw, w: nw + 14 * s + cw + 22 * s };
	}
	const gapOf = (c, s) => Math.max(8 * s, c * 0.7);
	function heightOf(cols, c, s, side, unit) {
		const g = gapOf(c, s), lh = side ? 0 : 24 * s, minH = side ? 18 * s : 0;
		let H = unit ? 30 * s : 0;                               // the unit line, shared images only
		blocks.forEach((b, k) => { H += lh + Math.max(Math.ceil(b.n / cols) * c, minH) + (k < NB - 1 ? g : 0); });
		return H + 16 * s;                                       // the extra gap before the grey block
	}
	function fit(ctx, aw, ah, s, cmax, unit = false) {
		const L = labelW(ctx, s);
		let best = null;
		// labels at the side or above each block, whichever leaves the larger dots (the side wins a tie)
		for (const side of [true, false]) {
			const lw = side ? L.w : 0;
			if (side && aw - lw < 120 * s) continue;
			for (let cols = 10; cols <= 90; cols++) {
				let c = Math.min(cmax, (aw - lw) / cols);
				for (let k = 0; k < 80 && heightOf(cols, c, s, side, unit) > ah; k++) c *= 0.97;
				if (!best || c > best.c * (side === best.side ? 1.001 : 1.08)) best = { cols, c, side, lw, L, unit };
			}
		}
		best.w = best.lw + best.cols * best.c - best.c * 0.24;
		best.h = heightOf(best.cols, best.c, s, best.side, unit);
		return best;
	}

	function field(ctx, X, Y, F, s, q, pick) {
		const { cols, c, side, lw, L } = F, d = c * 0.76, round = d >= 4, g = gapOf(c, s);
		const snap = v => Math.round(v / q) * q;
		const arrived = grow >= 1 ? TOTAL : Math.round(TOTAL * moved()), fa = faded();
		const hits = [];
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
		const unit = [UNIT, `Each dot: ${PER} women and girls`, `1 dot = ${PER}`].map(t => t.toUpperCase()).find(t => ctx.measureText(t).width <= F.w - lw) || `1 DOT = ${PER}`;
		if (F.unit) { ctx.globalAlpha = fa; ctx.fillText(unit, X + lw, Y + 12 * s); ctx.globalAlpha = 1; }
		let y = Y + (F.unit ? 30 * s : 0), done = 0;
		blocks.forEach((b, i) => {
			if (b.other) y += 16 * s;
			const dim = pick >= 0 && pick !== i ? 0.2 : 1, col = b.other ? C.ink3 : C.red;
			const top = y;
			// the label: the name in ink, the count in the block's color
			ctx.globalAlpha = fa * dim; ctx.font = `600 ${nameFs(s)}px ${C.sans}`; ctx.textBaseline = "middle";
			const ly = side ? y + Math.min(c, 18 * s) / 2 : y + 9 * s;
			ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(b.name, X, ly);
			ctx.fillStyle = b.other ? C.ink2 : C.red;
			if (side) { ctx.textAlign = "right"; ctx.fillText(fmt(b.count), X + lw - 22 * s, ly); }
			else ctx.fillText(fmt(b.count), X + ctx.measureText(b.name + "  ").width + 4 * s, ly);
			ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			if (!side) y += 24 * s;
			// the dots, row by row from the top left
			const n = Math.max(0, Math.min(b.n, arrived - done));
			ctx.globalAlpha = dim; ctx.fillStyle = col; ctx.beginPath();
			for (let k = 0; k < n; k++) {
				const cx = snap(X + lw + (k % cols) * c), cy = snap(y + Math.floor(k / cols) * c);
				if (round) { ctx.moveTo(cx + d, cy + d / 2); ctx.arc(cx + d / 2, cy + d / 2, d / 2, 0, 6.2832); }
				else ctx.rect(cx, cy, Math.max(q, snap(d)), Math.max(q, snap(d)));
			}
			ctx.fill(); ctx.globalAlpha = 1;
			done += b.n;
			const bh = Math.max(Math.ceil(b.n / cols) * c, side ? 18 * s : 0);
			hits.push({ i, x0: X, y0: top - g / 2, x1: X + F.w, y1: y + bh + g / 2 });
			y += bh + g;
		});
		return hits;
	}

	// the reading: the count, then its sentence in plain type, wrapped to w. Returns its height.
	function readingH(ctx, i, w, s) {
		ctx.font = `400 ${15 * s}px ${C.sans}`;
		return 22 * s + wrap(ctx, reading(i)[1], w).length * 21 * s;
	}
	function drawReading(ctx, X, Y, w, s, i, onInk) {
		const [v, t] = reading(i);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillStyle = onInk ? C.paper : C.ink;
		ctx.fillText(v, X, Y + 15 * s);
		ctx.font = `400 ${15 * s}px ${C.sans}`; ctx.fillStyle = onInk ? C.paper : C.ink2;
		wrap(ctx, t, w).forEach((l, k) => ctx.fillText(l, X, Y + 22 * s + 15 * s + k * 21 * s));
	}

	// On the page the chart is the page: on wide screens the title lies over the top left, a picked
	// block's reading sits under it, and the field takes the room to its right. On phones the field
	// runs down the stage. A shared image has no title or dek, so it carries the sentence and the key.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1 / 2;
		if (!page) {
			const wide = w > h * 1.3, cw = wide ? w * 0.4 : w;
			const fs = wide ? Math.min(34 * s, w / 24) : Math.max(19 * s, Math.min(30 * s, w / 20));
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			const lines = wrap(ctx, SENTENCE, cw);
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.16));
			const used = lines.length * fs * 1.16 + 34 * s;
			const ax = wide ? x + cw + 50 * s : x, ay = wide ? y : y + used, aw = wide ? w - cw - 50 * s : w, ah = wide ? h : h - used;
			const F = fit(ctx, aw, ah, s, 40 * s, true);
			field(ctx, ax + (aw - F.w) / 2, ay + (wide ? (ah - F.h) / 2 : 0), F, s, q, -1);
			return null;
		}
		const head = page.head, gut = head ? page.gut : Math.max(16 * s, page.gut);
		let hits;
		if (head) {
			const bx = head.x, by = head.y + head.h + 30 * s;
			if (sel >= 0 && by + readingH(ctx, sel, head.w, s) < y + h) drawReading(ctx, bx, by, head.w, s, sel);
			const ax = head.x + head.w + 56 * s, aw = x + w - gut - ax, ay = y + 24 * s, ah = h - 48 * s;
			const F = fit(ctx, aw, ah, s, 30 * s);
			hits = field(ctx, ax + Math.max(0, (aw - F.w) / 2), ay + Math.max(0, (ah - F.h) / 2), F, s, q, sel);
		} else {
			// no title box (phones, the home grid's pictures): the field alone, and a picked block's reading
			// in an ink card just under that block, where the finger is
			// in a column, room is kept under the dots for the card of the last block, so a card never
			// covers another block
			const ax = x + gut, aw = w - 2 * gut, pad = 12 * s, cw = Math.min(aw, 420 * s), tall = w <= h * 1.2;
			const room = tall ? Math.max(...blocks.map((b, i) => readingH(ctx, i, cw - 2 * pad, s))) + 2 * pad + 16 * s : 0;
			const ah = h - 28 * s - room;
			const F = fit(ctx, aw, ah, s, 22 * s);
			const X0 = ax + Math.max(0, (aw - F.w) / 2), Y0 = y + 14 * s + Math.max(0, w > h * 1.2 ? (ah - F.h) / 2 : 0);
			hits = field(ctx, X0, Y0, F, s, q, sel);
			if (sel >= 0) {
				const b = hits[sel], g = gapOf(F.c, s);
				const ch = readingH(ctx, sel, cw - 2 * pad, s) + 2 * pad;
				let cy = b.y1 - g / 2 + 8 * s;
				if (cy + ch > y + h) cy = b.y0 + g / 2 - 8 * s - ch;
				ctx.fillStyle = C.ink; ctx.fillRect(X0, cy, cw, ch);
				drawReading(ctx, X0 + pad, cy + pad, cw - 2 * pad, s, sel, true);
			}
		}
		return { hit: hits };
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
	Promise.all([`400 12px ${C.mono}`, `600 17px ${C.sans}`, `400 15px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?r=africa: a block (africa, asia, americas, europe, oceania, others); world or nothing is the overview
	sel = blocks.findIndex(b => b.slug === (CD.state.get("r") || "").toLowerCase());
	const pick = CD.selection({ initial: sel, key: "r", encode: i => blocks[i].slug, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// a block (its label or its dots) picks it; the pinned one again, or anywhere else, goes back
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = lay.hit.find(o => mx >= o.x0 - 10 && mx <= o.x1 + 10 && my >= o.y0 && my <= o.y1);
			const i = b ? b.i : -1;
			return e.type === "pointerdown" && i === pick.pinned ? -1 : i;
		},
		// arrows step through the blocks, and wrap
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : NB - 1) : (from + dir + NB) % NB
	});
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1500)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// the image is always the finished picture
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow, sv = sel; grow = 1; sel = -1; draw(c, x, y, w, h, u * (w > h * 1.3 ? 2 : 1.6), true, null); grow = g; sel = sv; } };
})();
