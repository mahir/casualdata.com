// 2026-11-20 — the world's nuclear warheads at the beginning of 2026: one dot each, on a grid 110
// dots wide, cut into nine blocks by the country that holds them. Three full-width bands (Russia,
// the United States, China) are the one red thing; the other six sit side by side in a band 11
// dots high underneath. A switch keeps the dots where they are and fades the ones outside the view
// (all warheads, in military stockpiles, deployed). Picking a block reads that country.
(function () {
	const C = CD.colors, D = window.WARHEADS;
	const rows = D.countries, N = rows.length, COLS = 110, BH = 11;
	const VIEWS = [
		{ id: "all", f: "total", long: "All warheads", short: "All warheads", tail: "nuclear warheads in the world" },
		{ id: "stockpile", f: "stockpile", long: "In military stockpiles", short: "In stockpiles", tail: "nuclear warheads in military stockpiles" },
		{ id: "deployed", f: "deployed", long: "Deployed", short: "Deployed", tail: "deployed nuclear warheads" }
	];
	const fmt = n => n.toLocaleString("en-US");
	const SHORT = { "United Kingdom": "UK", "North Korea": "N. Korea" };

	// the grid, in dots: where each block starts, how wide and high it is, how it fills
	const blocks = [];
	let gy = 0;
	for (let i = 0; i < 3; i++) {                    // bands: row by row, left to right
		const gh = Math.ceil(rows[i].total / COLS);
		blocks.push({ row: true, gx: 0, gy, gw: COLS, gh, n: rows[i].total });
		gy += gh + (i < 2 ? 1 : 2);
	}
	let gx = 0;
	for (let i = 3; i < N; i++) {                    // the six: column by column, top to bottom
		const gw = Math.ceil(rows[i].total / BH);
		blocks.push({ row: false, gx, gy, gw, gh: BH, n: rows[i].total });
		gx += gw + 1;
	}
	const ROWS = gy + BH;                            // 117

	// the reading: vi = the view, sel = a country, or -1 for the overview
	let vi = Math.max(0, VIEWS.findIndex(v => v.id === CD.state.get("v"))), sel = -1;
	const key = v => v.f === "total" ? "total" : v.f;
	const sentence = () => `Russia, the United States and China hold ${D.per100[key(VIEWS[vi])]} of every 100 ${VIEWS[vi].tail}`;
	const small = () => (vi === 0 ? `Each dot is one of an estimated ${fmt(D.totals.total)} warheads at the start of 2026, including retired ones waiting to be dismantled`
		: `Solid dots: the ${vi === 1 ? fmt(D.totals.stockpile) + " in military stockpiles" : "about " + fmt(D.totals.deployed) + " deployed"}, of an estimated ${fmt(D.totals.total)} warheads at the start of 2026`)
		+ " · Federation of American Scientists";
	const context = r => `${fmt(r.stockpile)} in military stockpiles · ${fmt(r.deployed)} deployed · ${r.share.toFixed(1)}% of all warheads`;
	function readout() {
		if (sel < 0) return [sentence(), vi === 0 ? `Each dot is one of an estimated ${fmt(D.totals.total)} warheads` : `View: ${VIEWS[vi].long.toLowerCase()}, ${vi === 2 ? "about " : ""}${fmt(D.totals[VIEWS[vi].f])} of ${fmt(D.totals.total)}`];
		const r = rows[sel];
		return [`${r.name}, ${fmt(r.total)} warheads`, context(r)];
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
	// lie over the top left, so the square takes the room to their right and the list of the nine and
	// the switch sit under them. A shared image has no title, so the drawing carries the sentence and
	// one small line instead. page = { head, gut, dpr }.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1, snap = v => Math.round(v / q) * q;       // one device pixel
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(q, s);
		const view = VIEWS[vi], f = view.f, head = page ? page.head : null;
		const gut = !page ? 0 : head ? page.gut : 6 * s;       // without the title beside it, the chart runs edge to edge
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		let rx = x + gut, ry = y + (page ? 8 * s : 0), rw = w - 2 * gut, rh = h - (page ? 14 * s : 0);
		const hit = { buttons: [], list: [] };

		// ---- a shared image: the sentence and one small line; beside the square when the image is wide
		if (!page) {
			const wide = w > h * 1.3, cw = wide ? w * 0.38 : w;
			const fs = wide ? Math.min(34 * s, w / 30) : Math.max(19 * s, Math.min(30 * s, w / 21));
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink;
			const lines = wrap(ctx, sentence(), cw);
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			const sm = wrap(ctx, small().toUpperCase(), cw);
			sm.forEach((l, i) => ctx.fillText(l, x, y + lines.length * fs * 1.14 + 12 * s + 11 * s + i * 16 * s));
			const sentH = lines.length * fs * 1.14 + 12 * s + sm.length * 16 * s + 18 * s;
			if (wide) { rx = x + cw + 34 * s; rw = w - cw - 34 * s; } else { ry += sentH; rh -= sentH; }
		}

		// ---- the page: the nine countries and the switch under the title (wide screens), or the
		// switch under the square (phones and tablets; a small picture has none)
		let sw = null;
		if (head) {
			rx = head.x + head.w + 40 * s; rw = x + w - gut - rx;
			let ly = head.y + head.h + 24 * s;
			const btnH = 34 * s, room = y + h - 12 * s - ly;
			const rowH = Math.min(25 * s, (room - btnH - 34 * s) / N);
			if (rowH >= 17 * s) {
				rows.forEach((r, i) => {
					const y0 = ly + i * rowH + (i >= 3 ? 14 * s : 0), cy = y0 + rowH / 2;
					if (i === sel) { ctx.fillStyle = C.rule; ctx.globalAlpha = 0.55; ctx.fillRect(head.x - 6 * s, y0, head.w + 12 * s, rowH); ctx.globalAlpha = 1; }
					ctx.textBaseline = "middle"; ctx.font = i < 3 ? monoB : mono; ctx.fillStyle = i < 3 ? C.red : C.ink;
					ctx.textAlign = "left"; ctx.fillText(r.name, head.x, cy + 0.5 * s);
					ctx.textAlign = "right"; ctx.fillText(fmt(r[f]), head.x + head.w, cy + 0.5 * s);
					hit.list.push({ i, x0: head.x - 6 * s, x1: head.x + head.w + 6 * s, y0, y1: y0 + rowH });
				});
				// the six are set apart from the three: a gap and a hairline
				const hy = Math.round(ly + 3 * rowH + 7 * s) + 0.5;
				ctx.strokeStyle = C.rule; ctx.lineWidth = px1; ctx.beginPath(); ctx.moveTo(head.x, hy); ctx.lineTo(head.x + head.w, hy); ctx.stroke();
				ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
				ly += N * rowH + 14 * s + 20 * s;
			}
			if (ly + btnH <= y + h - 4 * s) sw = { x: head.x, y: ly, w: head.w, h: btnH };
		} else if (page && h >= 400 * s) {
			const btnH = 40 * s;
			sw = { x: rx, y: y + h - btnH - 6 * s, w: rw, h: btnH };
			rh = sw.y - 12 * s - ry;
		}
		if (sw) {
			ctx.font = mono;
			const pad = 12 * s, bg = 8 * s, even = !head, tw = (v, k) => ctx.measureText(v[k].toUpperCase()).width + 2 * pad;
			const fits = k => even ? VIEWS.every(v => tw(v, k) <= (sw.w - 2 * bg) / 3) : VIEWS.reduce((a, v) => a + tw(v, k), 0) + 2 * bg <= sw.w;
			const k = fits("long") ? "long" : "short";
			let bx = sw.x;
			VIEWS.forEach((v, i) => {
				const t = v[k].toUpperCase(), bw = even ? (sw.w - 2 * bg) / 3 : ctx.measureText(t).width + 2 * pad;
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1;
				if (i === vi) { ctx.fillStyle = C.ink; ctx.fillRect(bx, sw.y, bw, sw.h); } else ctx.strokeRect(bx + px1 / 2, sw.y + px1 / 2, bw - px1, sw.h - px1);
				ctx.fillStyle = i === vi ? C.paper : C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
				ctx.fillText(t, bx + bw / 2, sw.y + sw.h / 2 + 0.5 * s);
				hit.buttons.push({ i, x0: bx, x1: bx + bw, y0: sw.y, y1: sw.y + sw.h });
				bx += bw + bg;
			});
			ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		}

		// ---- the square: the largest pitch at which it, the bracket's number and the labels under
		// it fit. The number is set beside the bracket, or along it where there is no room beside
		ctx.font = `600 ${15 * s}px ${C.sans}`;
		const tierH = 17 * s, tiersH = 2 * tierH + 8 * s;
		const bwH = 24 * s + ctx.measureText("of every 100").width, bwR = 34 * s;
		const fit = bw => Math.floor(Math.min((rw - bw) / COLS, (rh - tiersH) / ROWS) / q) * q;
		let p = fit(bwH), rot = false;
		if (fit(bwR) > p * 1.12) { p = fit(bwR); rot = true; }
		p = Math.max(p, 2 * q);
		const bw = rot ? bwR : bwH;
		const ox = snap(rx + Math.max(0, (rw - COLS * p - bw) / 2)), oy = snap(ry + Math.max(0, (rh - ROWS * p - tiersH) / 2));
		const gap = Math.max(q, Math.round(p * 0.24 / q) * q), d = p - gap, round = d >= 4;

		blocks.forEach((b, i) => {
			const n = rows[i][f];
			ctx.fillStyle = i < 3 ? C.red : C.ink;
			for (const [from, to, a] of [[0, n, 1], [n, b.n, 0.2]]) {
				if (to <= from) continue;
				ctx.globalAlpha = a; ctx.beginPath();
				for (let k = from; k < to; k++) {
					const cx = ox + (b.gx + (b.row ? k % COLS : Math.floor(k / BH))) * p, cy = oy + (b.gy + (b.row ? Math.floor(k / COLS) : k % BH)) * p;
					if (round) { ctx.moveTo(cx + d, cy + d / 2); ctx.arc(cx + d / 2, cy + d / 2, d / 2, 0, 6.2832); } else ctx.rect(cx, cy, d, d);
				}
				ctx.fill();
			}
			ctx.globalAlpha = 1;
		});

		// the three bands carry their names and numbers, on a patch of the page cut to whole dots
		const bf = Math.max(12.5 * s, Math.min(30 * s, p * 4.4));
		for (let i = 0; i < 3; i++) {
			const b = blocks[i], r = rows[i], fs = Math.min(bf, Math.max(12.5 * s, b.gh * p * 0.7));
			ctx.font = `600 ${fs}px ${C.sans}`; const nw = ctx.measureText(r.name + "  ").width;
			ctx.font = `400 ${fs}px ${C.sans}`; const mw = ctx.measureText(fmt(r[f])).width;
			const pc = Math.ceil((nw + mw + fs * 0.9) / p), pr = Math.ceil(fs * 1.55 / p);
			const c0 = 3, r0 = b.gy + Math.round((b.gh - pr) / 2);
			const X0 = ox + c0 * p - gap, Y0 = oy + r0 * p - gap, PW = pc * p + gap, PH = pr * p + gap;
			ctx.fillStyle = C.paper; ctx.fillRect(X0, Y0, PW, PH);
			ctx.fillStyle = C.ink; ctx.textBaseline = "middle";
			const tx = X0 + (PW - nw - mw) / 2, ty = Y0 + PH / 2 + fs * 0.04;
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillText(r.name, tx, ty);
			ctx.font = `400 ${fs}px ${C.sans}`; ctx.fillText(fmt(r[f]), tx + nw, ty);
			ctx.textBaseline = "alphabetic";
		}

		// the red number: a bracket down the three red bands, and their share of this view's total
		const b2 = blocks[2], bx0 = snap(ox + COLS * p - gap + 6 * s), by0 = oy, by1 = oy + (b2.gy + b2.gh) * p - gap, mid = (by0 + by1) / 2;
		ctx.strokeStyle = C.red; ctx.lineWidth = 1.5 * s; ctx.lineJoin = "miter";
		ctx.beginPath(); ctx.moveTo(bx0, by0 + 0.75 * s); ctx.lineTo(bx0 + 6 * s, by0 + 0.75 * s); ctx.lineTo(bx0 + 6 * s, by1 - 0.75 * s); ctx.lineTo(bx0, by1 - 0.75 * s); ctx.stroke();
		const per = D.per100[key(view)];
		ctx.fillStyle = C.red;
		if (rot) {
			ctx.save(); ctx.translate(bx0 + 6 * s + 17 * s, mid); ctx.rotate(-Math.PI / 2);
			ctx.font = `600 ${15 * s}px ${C.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
			ctx.fillText(`${per} of every 100`, 0, 0); ctx.restore();
		} else {
			const big = Math.min(54 * s, Math.max(30 * s, p * 8));
			ctx.font = `600 ${big}px ${C.sans}`; ctx.fillText(String(per), bx0 + 17 * s, mid + big * 0.1);
			ctx.font = `600 ${15 * s}px ${C.sans}`; ctx.fillText("of every 100", bx0 + 18 * s, mid + big * 0.1 + 21 * s);
		}

		// the six small blocks: name and number under each, a short tick down to a second line where
		// neighbours would collide; where even that cannot be done cleanly (a phone), one run of
		// names in the blocks' own order, left to right
		ctx.font = mono;
		const ty0 = oy + ROWS * p - gap + 4 * s, limL = x + 4 * s, limR = x + w - 4 * s;
		const place = short => {
			const out = [], ends = [[], []];
			for (let i = 3; i < N; i++) {
				const b = blocks[i], name = short && SHORT[rows[i].name] || rows[i].name, num = fmt(rows[i][f]);
				const tw = ctx.measureText(name + " " + num).width, x0 = ox + b.gx * p, cx = x0 + (b.gw * p - gap) / 2;
				let lx = Math.max(limL, Math.min(b.gw * p - gap >= tw ? x0 : cx - tw / 2, limR - tw)), t = -1;
				for (let k = 0; k < 2 && t < 0; k++) {
					const clear = ends[k].every(e => lx >= e.x1 + 9 * s || lx + tw <= e.x0 - 9 * s);
					const tickFree = k === 0 || ends[0].every(e => cx < e.x0 - 4 * s || cx > e.x1 + 4 * s);
					const noCut = k > 0 || out.every(o => o.t === 0 || o.cx < lx - 4 * s || o.cx > lx + tw + 4 * s);
					if (clear && tickFree && noCut) t = k;
				}
				if (t < 0) return null;
				ends[t].push({ x0: lx, x1: lx + tw });
				out.push({ i, name, num, lx, tw, t, cx });
			}
			return out;
		};
		const labels = place(false) || place(true);
		if (labels) for (const o of labels) {
			const by = ty0 + o.t * tierH + 11 * s;
			if (o.t) { ctx.strokeStyle = C.ink2; ctx.lineWidth = px1; const tx = snap(o.cx) + px1 / 2; ctx.beginPath(); ctx.moveTo(tx, ty0 - 1 * s); ctx.lineTo(tx, by - 12 * s); ctx.stroke(); }
			ctx.font = mono; ctx.fillStyle = C.ink; ctx.fillText(o.name, o.lx, by);
			ctx.font = monoB; ctx.fillText(o.num, o.lx + o.tw - ctx.measureText(o.num).width, by);
		} else {
			// whole items on each line, never a number alone
			const maxW = Math.min(limR - limL, Math.max(limR - ox, 300 * s));       // to the edge of the picture, so no country is left alone on a second line
			const run = short => {
				const out = [];
				for (const r of rows.slice(3)) {
					const item = `${short && SHORT[r.name] || r.name} ${fmt(r[f])}`, t = out.length ? out[out.length - 1] + " · " + item : item;
					if (out.length && ctx.measureText(t).width <= maxW) out[out.length - 1] = t; else out.push(item);
				}
				return out;
			};
			let lines = run(false); if (lines.length > 2 || (lines.length === 2 && !lines[1].includes("·"))) lines = run(true);
			ctx.fillStyle = C.ink;
			lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, Math.max(limL, Math.min(ox, limR - ctx.measureText(l).width)), ty0 + 11 * s + i * tierH));
		}

		// the reading: the picked block outlined, and its figures beside it
		if (sel >= 0) {
			const b = blocks[sel], r = rows[sel], X = u => ox + (b.gx + u) * p - gap / 2, Y = v => oy + (b.gy + v) * p - gap / 2;
			const full = Math.floor(b.n / (b.row ? COLS : BH)), rem = b.n % (b.row ? COLS : BH);
			const pts = b.row ? (rem ? [[0, 0], [COLS, 0], [COLS, full], [rem, full], [rem, full + 1], [0, full + 1]] : [[0, 0], [COLS, 0], [COLS, full], [0, full]])
				: (rem ? [[0, 0], [full + 1, 0], [full + 1, rem], [full, rem], [full, BH], [0, BH]] : [[0, 0], [full, 0], [full, BH], [0, BH]]);
			ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5 * s, gap); ctx.lineJoin = "miter";
			ctx.beginPath(); pts.forEach(([u, v], k) => k ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v))); ctx.closePath(); ctx.stroke();
			const px = ox + (b.gx + b.gw / 2) * p, top = oy + b.gy * p, bot = oy + (b.gy + b.gh) * p;
			const box = { x: x + 4 * s, y: y + 4 * s, w: w - 8 * s, h: (sw && !head ? sw.y - 6 * s : y + h - 4 * s) - y - 4 * s };
			// inside the two big bands, to the right of their own label; over China and the six
			if (sel < 2) CD.label(ctx, ox + COLS * p * 0.5, (top + bot) / 2, `${r.name} ${fmt(r.total)}`, context(r), s, { x: ox + 2 * p, y: top + p, w: COLS * p - 4 * p, h: bot - top - 3 * p }, ox + COLS * p * 0.5);
			else CD.label(ctx, px, top - 2 * s, `${r.name} ${fmt(r.total)}`, context(r), s, box, px, [{ x: ox, y: top, w: b.gw * p, h: bot - top }]);
		}
		return { ox, oy, p, hit };
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
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`, `400 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?c=china: the country; ?v=stockpile or ?v=deployed: the view; anything else, the overview of all
	sel = rows.findIndex(r => r.slug === (CD.state.get("c") || "").toLowerCase());
	const pick = CD.selection({ initial: sel, key: "c", encode: i => rows[i].slug, onChange: i => { sel = i; schedule(); } });
	// the view is set after the selection's own write, so the two do not undo each other in the link
	const setView = i => { vi = i; schedule(); setTimeout(() => CD.state.set({ v: i ? VIEWS[i].id : null, c: pick.pinned < 0 ? null : rows[pick.pinned].slug }), 0); };
	const inside = (q, mx, my) => mx >= q.x0 && mx < q.x1 && my >= q.y0 && my < q.y1;
	CD.bindSelection(cv, pick, {
		// a button of the switch changes the view and leaves the reading; a list row or a block picks
		// its country; the pinned one again, or anywhere else, goes back
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const btn = lay.hit.buttons.find(q => inside(q, mx, my));
			if (btn) { if (e.type === "pointerdown" && btn.i !== vi) setView(btn.i); return pick.pinned; }
			const row = lay.hit.list.find(q => inside(q, mx, my));
			const u = (mx - lay.ox) / lay.p, v = (my - lay.oy) / lay.p;
			const i = row ? row.i : blocks.findIndex(b => u >= b.gx - 0.5 && u < b.gx + b.gw + 0.5 && v >= b.gy - (b.row ? 0.5 : 1.5) && v < b.gy + b.gh + 0.5);
			return e.type === "pointerdown" && i === pick.pinned ? -1 : i;
		},
		// arrows step through the nine, largest first, and wrap
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	// 1, 2 and 3 choose the view; V steps to the next one
	cv.addEventListener("keydown", e => {
		if (e.key >= "1" && e.key <= "3") setView(+e.key - 1);
		else if (e.key === "v" || e.key === "V") setView((vi + 1) % VIEWS.length);
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * (w > h * 1.3 ? 2 : 1.6), true, null) };
})();
