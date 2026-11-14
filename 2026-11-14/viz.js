// 2026-11-14 — the FAA ground stop of 13 November 2026, airport by airport. One column per US
// airport: the share of its departures that day that were cancelled, from the least at the left to
// the most at the right, on one linear scale. The one red thing is Dallas Love Field; Dallas-Fort
// Worth, the same city under the same stop, is in full ink. Picking a column reads the airport's
// name, how many departures were cancelled and how many were delayed.
(function () {
	const C = CD.colors, D = window.STOP;
	const rows = D.rows, N = rows.length;
	const idx = code => rows.findIndex(r => r.code === code);
	const DAL = idx("DAL"), DFW = idx("DFW"), TOP = N - 1;
	const MAXP = rows[TOP].cancelledPct;
	const PAIRS = D.pairs.map(([city, big, small]) => ({ city, big: idx(big), small: idx(small) }));
	// labelled while they fit, in this order (the first three always)
	const LABELS = [DAL, DFW, TOP].concat(["HOU", "MDW", "IAH", "ORD", "ATL", "LAX"].map(idx)).filter((v, i, a) => v >= 0 && a.indexOf(v) === i);
	const TICKS = [10, 20, 30].filter(v => v < MAXP);
	const num = v => v.toLocaleString("en-US");

	const S1 = `On 13 November 2026 the FAA halted departures across the US for hours. Dallas-Fort Worth lost ${rows[DFW].cancelledPct}% of the day’s departures. Dallas Love Field, ${rows[DAL].cancelledPct}%.`;
	const SUB = `EACH COLUMN IS ONE OF ${N} US AIRPORTS: THE SHARE OF ITS DEPARTURES CANCELLED · FLIGHTAWARE, AS OF ${D.asOf.toUpperCase()}`;

	let sel = -1;

	function readout() {
		if (sel < 0) return [S1, `Each column is one of ${N} US airports: the share of its departures cancelled`];
		const r = rows[sel];
		return [`${r.code}: ${r.cancelledPct}% cancelled`, `${r.name} · ${num(r.cancelled)} departures cancelled · ${num(r.delayed)} delayed, ${r.delayedPct}%`];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	const over = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

	// Two frames. On the page the chart is the page: the title and dek are HTML and, on wide screens,
	// lie over the empty top left, above the short columns. A shared image has no title, so the
	// drawing carries the sentence and one small line there instead.
	// page = { head: {x, y, w, h} | null, gut }: the title block's box inside the canvas, and the page's gutter.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "butt";
		let [value, context] = readout();
		const gut = page ? page.gut : 0;

		// ---- across: the columns edge to edge
		const pl = x, pr = x + w, cw = (pr - pl) / N, gapX = cw >= 8 * s ? 2 * px1 : px1, bar = Math.max(1, cw - gapX);
		const cx = i => pl + i * cw + gapX / 2;
		const codes = !exporting && cw >= 12 * s;                 // room for each airport's code under its column
		const pb = y + h - (codes ? 36 * s : page ? 10 * s : 2 * s);
		const top0 = y + (page ? 14 * s : 6 * s);

		// ---- up: 0 to the highest share, with room above it for its label; lower if a block at the
		// top left (the title and list, or the image's sentence) would otherwise touch the columns under it
		const fitTop = (pt, blockR, blockB) => {
			let under = 0;
			for (let i = 0; i < N && cx(i) < blockR; i++) under = Math.max(under, rows[i].cancelledPct);
			if (!under) return pt;
			return Math.max(pt, pb - (pb - blockB - 30 * s) * MAXP / under);
		};
		let head = page ? page.head : null, pt = top0 + 22 * s;
		const natural = pt;

		if (!page) {
			// ---- a shared image: the sentence and the small line, in the empty top left when the frame
			// is wide, above the plot when it is tall
			const wide = w >= 1.25 * h;
			let fs, colW, lines, sub, sentH, headH;
			const fit = (f, cwid) => {
				fs = f; colW = cwid;
				ctx.font = `600 ${fs}px ${C.sans}`; lines = wrap(ctx, S1, colW);
				ctx.font = mono; sub = wrap(ctx, SUB, colW);
				sentH = lines.length * fs * 1.14; headH = sentH + 8 * s + sub.length * 16 * s;
			};
			if (wide) {
				let done = false;
				for (let f = 34 * s; f >= 17 * s && !done; f -= s) for (const frac of [0.46, 0.52, 0.58, 0.64]) {
					fit(f, frac * w);
					if (fitTop(natural, x + colW + 16 * s, y + headH) <= natural + 1) { done = true; break; }
				}
				pt = fitTop(natural, x + colW + 16 * s, y + headH);
				head = { x, y, w: colW, h: headH };
			} else {
				fit(Math.max(19 * s, Math.min(30 * s, w / 19)), w);
				pt = y + headH + 22 * s + 22 * s;
			}
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 8 * s + 11 * s + i * 16 * s));
		}

		// ---- the list under the title on a wide page: the three cities with two airports
		let listGeo = null, blockB = head ? head.y + head.h + 14 * s : -1e9, blockR = head ? head.x + head.w + 22 * s : pl;
		if (page && head) {
			ctx.font = mono;
			const ch = ctx.measureText("0").width, ROW = 20 * s, lx = head.x, ly = head.y + head.h + 22 * s;
			const c1 = lx + 10 * ch, c2 = c1 + 10 * ch, lw = c2 + 8 * ch - lx;
			const lb = ly + PAIRS.length * ROW + 6 * s;
			// the list stays only if it costs the plot little height
			if (fitTop(natural, Math.max(blockR, lx + lw + 12 * s), lb) <= natural + 0.12 * (pb - natural)) {
				PAIRS.forEach((p, j) => {
					const by = ly + j * ROW + 14 * s, a = rows[p.big], b = rows[p.small];
					ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText(p.city.toUpperCase(), lx, by);
					const on = sel === p.big || sel === p.small;
					ctx.font = p.big === DFW || on ? monoB : mono; ctx.fillStyle = p.big === DFW || on ? C.ink : C.ink2;
					ctx.fillText(`${a.code} ${a.cancelledPct}%`, c1, by);
					ctx.fillStyle = p.small === DAL ? C.red : ctx.fillStyle;
					ctx.fillText(`${b.code} ${b.cancelledPct}%`, c2, by);
				});
				listGeo = { x: lx, y: ly, w: lw, row: ROW, items: PAIRS.map(p => p.big) };
				blockB = lb; blockR = Math.max(blockR, lx + lw + 12 * s);
			}
		}
		if (head) pt = fitTop(pt, blockR, blockB);
		const Y = v => pb - v / MAXP * (pb - pt);
		const topOf = i => Y(rows[i].cancelledPct);
		const block = head ? { x: x - 50, y: y - 50, w: blockR - x + 50, h: blockB - y + 50, k: 500 } : null;

		// ---- hairlines at 10, 20 and 30%, behind the columns; each starts right of the title block when it would run under it
		ctx.lineWidth = px1; ctx.strokeStyle = C.rule;
		const tickGeo = TICKS.map(v => {
			const gy = Math.round(Y(v)) + 0.5, x0 = block && gy < blockB + 4 * s ? blockR : x;
			ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x + w, gy); ctx.stroke();
			return { v, gy, x0 };
		});

		// ---- the columns
		const colorOf = i => i === DAL ? C.red : i === DFW || i === sel ? C.ink : C.ink3;
		for (let i = 0; i < N; i++) {
			ctx.fillStyle = colorOf(i);
			const ty = topOf(i);
			ctx.fillRect(cx(i), ty, bar, pb - ty);
		}
		ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x, Math.round(pb) + 0.5); ctx.lineTo(x + w, Math.round(pb) + 0.5); ctx.stroke();
		if (codes) {
			ctx.textAlign = "right"; ctx.textBaseline = "middle";
			for (let i = 0; i < N; i++) {
				ctx.font = i === DAL || i === DFW || i === sel ? monoB : mono; ctx.fillStyle = i === DAL ? C.red : i === DFW || i === sel ? C.ink : C.ink2;
				ctx.save(); ctx.translate(cx(i) + bar / 2, pb + 6 * s); ctx.rotate(-Math.PI / 2); ctx.fillText(rows[i].code, 0, 0.5 * s); ctx.restore();
			}
			ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		}

		// ---- labels on columns. A label ends at its column's right edge and lies over the shorter
		// columns at its left; one too near the left edge starts at its column instead and is lifted
		// clear of the columns it lies over, with a short leader.
		const placed = [], soft = [], hard = [];
		const edgeL = x + (page ? Math.max(gut, 4 * s) : 0), edgeR = x + w - (page ? Math.max(4 * s, Math.min(gut, 8 * s)) : 0);
		LABELS.forEach((i, n) => {
			const r = rows[i], t = `${r.code} ${r.cancelledPct}%`, strong = i === DAL || i === DFW;
			const font = strong ? `700 ${(n < 2 ? 13 : 11.5) * s}px ${C.mono}` : mono;
			ctx.font = font; const tw = ctx.measureText(t).width;
			let xr = Math.min(cx(i) + bar, edgeR), xl = xr - tw, base = topOf(i) - 6 * s, leader = false;
			if (xl < edgeL) {
				xl = Math.max(edgeL, cx(i) + bar + 3 * s);
				let m = topOf(i);
				for (let j = 0; j < N; j++) if (cx(j) + bar > xl - 2 * s && cx(j) < xl + tw + 2 * s) m = Math.min(m, topOf(j));
				base = m - 7 * s; leader = true;
			}
			const box = { x: xl, y: base - 12 * s, w: tw, h: 15 * s, k: strong ? 300 : 6 };
			if (n > 2 && (placed.some(b => over(box, b, 5 * s)) || (block && over(box, block)))) return;
			placed.push(box);
			if (leader) placed.push({ x: cx(i), y: base - 12 * s, w: Math.max(bar, xl - cx(i)), h: topOf(i) - base + 12 * s });   // nothing lies across the leader
			const paint = () => {
				if (leader) {
					const lx0 = cx(i) + bar / 2;
					ctx.strokeStyle = i === DAL ? C.red : C.ink2; ctx.lineWidth = px1;
					ctx.beginPath(); ctx.moveTo(lx0, topOf(i) - 2 * s); ctx.lineTo(lx0, base - 4 * s); ctx.lineTo(xl - 3 * s, base - 4 * s); ctx.stroke();
				}
				// the two strong labels stand on paper, so a hairline at their height does not strike through them
				if (strong) { ctx.fillStyle = C.paper; ctx.fillRect(xl - 3 * s, base - 11 * s, tw + 5 * s, 14 * s); }
				ctx.font = font; ctx.textAlign = "left"; ctx.fillStyle = i === DAL ? C.red : strong || i === sel ? C.ink : C.ink2; ctx.fillText(t, xl, base);
			};
			if (strong) { paint(); hard.push(box); } else soft.push(Object.assign(box, { draw: paint, of: i }));
		});
		// the scale's labels, above each hairline at its start; the first says what the scale is
		ctx.font = mono;
		let worded = false;                                      // the lowest label with room says what the scale is
		tickGeo.forEach(g => {
			const opts = worded ? [`${g.v}%`] : [`${g.v}% OF DEPARTURES CANCELLED`, `${g.v}% CANCELLED`, `${g.v}%`];
			const lx = g.x0 === x ? edgeL : g.x0;
			for (const t of opts) {
				const tw = ctx.measureText(t).width, box = { x: lx, y: g.gy - 17 * s, w: tw, h: 14 * s, k: 4 };
				// clear of the columns that reach above the line, and of the labels already placed
				let hit = placed.some(b => over(box, b, 4 * s));
				for (let j = 0; j < N && !hit; j++) if (topOf(j) < g.gy - 2 * s && cx(j) < lx + tw + 4 * s && cx(j) + bar > lx) hit = true;
				if (hit) continue;
				placed.push(box); if (t.length > 4) worded = true;
				soft.push(Object.assign(box, { draw: () => { ctx.font = mono; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText(t, lx, g.gy - 5 * s); } }));
				break;
			}
		});

		// ---- the reader's airport: its column in ink and the reading beside the column's top, in the
		// clearest place near it (the empty side is up and to the left)
		let back = null;
		if (sel >= 0) {
			const r = rows[sel], p = { x: cx(sel) + bar / 2, y: topOf(sel) };
			const avoid = hard.slice(); if (block) avoid.push(block);
			let backR = edgeL;
			if (!exporting) {
				ctx.font = mono;
				const t = "ALL AIRPORTS", tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
				const bx = block ? blockR : edgeL, by = top0;
				ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
				back = { x: bx - 14, y: by - 14, w: bw + 28, h: bh + 28 }; backR = bx + bw + 8 * s;
				avoid.push({ x: bx - 4 * s, y: by - 4 * s, w: bw + 8 * s, h: bh + 8 * s, k: 400 });
			}
			// the chip's size, measured as CD.label will draw it
			// a narrow chart wraps the reading into short lines, so the chip fits the empty corner over the low columns
			const pad = 8 * s, maxW = Math.min(edgeR - edgeL, (edgeR - edgeL < 700 * s ? 236 : 380) * s);
			ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			// a name too long for the chip on a narrow screen is cut at a word and ends in "…" (the full name is in the spoken reading)
			{
				const parts = context.split(" · "), room = edgeR - edgeL - pad * 2;
				if (ctx.measureText(parts[0].toUpperCase()).width > room) {
					const words = parts[0].split(" ");
					while (words.length > 1 && ctx.measureText((words.join(" ") + "…").toUpperCase()).width > room) words.pop();
					parts[0] = words.join(" ") + "…"; context = parts.join(" · ");
				}
			}
			const ls = [];
			for (const part of context.toUpperCase().split(" · ")) {
				const t = ls.length ? ls[ls.length - 1] + " · " + part : part;
				if (ls.length && ctx.measureText(t).width + pad * 2 > maxW) ls.push(part); else if (ls.length) ls[ls.length - 1] = t; else ls.push(part);
			}
			const chw = Math.min(edgeR - edgeL, Math.max(vw, ...ls.map(l => ctx.measureText(l).width)) + pad * 2);
			const chh = 17 * s + 11 * s + (ls.length - 1) * 15 * s + pad * 2 + 5 * s, gap = 10 * s;
			const cost = c => {
				const cb = { x: c.x, y: c.y, w: chw, h: chh };
				let k = 0;
				// columns the chip would cover (its own counts most)
				for (let j = 0; j < N; j++) if (cx(j) + bar > c.x && cx(j) < c.x + chw && topOf(j) < c.y + chh) k += j === sel ? 40 : 2;
				for (const o of avoid) if (over(cb, o)) k += o.k;
				for (const o of soft) if (o.of !== sel && over(cb, o)) k += o.k;
				return k + Math.hypot(Math.max(c.x - p.x, 0, p.x - c.x - chw), Math.max(c.y - p.y, 0, p.y - c.y - chh)) / (40 * s);
			};
			let best = null, bc = Infinity;
			const lowest = xx => { let m = pb; for (let j = 0; j < N; j++) if (cx(j) + bar > xx && cx(j) < xx + chw) m = Math.min(m, topOf(j)); return m; };
			for (const cx0 of [p.x - bar / 2 - gap - chw, p.x - chw + bar / 2, p.x - chw / 2, p.x + bar / 2 + gap, edgeL, backR]) {
				const xx = Math.min(Math.max(cx0, edgeL), edgeR - chw);
				for (const yy of [p.y - chh / 2, p.y - chh - gap, lowest(xx) - chh - gap, p.y - chh - gap - 30 * s, lowest(xx) - chh - gap - 30 * s, top0, top0 + 29 * s]) {
					const c = { x: xx, y: Math.min(Math.max(yy, top0), pb - chh - 4 * s) };
					const k = cost(c); if (k < bc) { bc = k; best = c; }
				}
			}
			const cb = { x: best.x, y: best.y, w: chw, h: chh };
			soft.forEach(o => { if (o.of !== sel && !over(cb, o, 4 * s)) o.draw(); });
			// a hairline from the column's top to the nearest point of the chip when the chip stands off it
			{
				const qx = Math.min(Math.max(p.x, best.x), best.x + chw), qy = Math.min(Math.max(p.y - 2 * s, best.y), best.y + chh);
				if (Math.hypot(qx - p.x, qy - (p.y - 2 * s)) > 6 * s) {
					ctx.strokeStyle = sel === DAL ? C.red : C.ink; ctx.lineWidth = px1; ctx.beginPath(); ctx.moveTo(p.x, p.y - 2 * s); ctx.lineTo(qx, qy); ctx.stroke();
				}
			}
			ctx.textAlign = "left";
			CD.label(ctx, best.x - 12 * s, best.y + chh / 2, value, context, s, { x: best.x, y: best.y, w: chw, h: chh });
		} else { soft.forEach(o => o.draw()); ctx.textAlign = "left"; }
		return { back, list: listGeo, plot: { x: pl, y: top0, w: pr - pl, h: y + h - top0 }, cw, pl, block: block ? { r: blockR, b: blockB } : null };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	const headEl = document.querySelector(".cd-head"), textEl = document.querySelector(".cd-head .cd-text");
	let geo = null, W = 0, Hh = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== Hh) { W = r.width; Hh = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		// where the title block lies over the canvas (wide screens), the columns and the reading keep clear of it
		geo = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage), gut: parseFloat(getComputedStyle(headEl).paddingLeft) || 16 });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(textEl);
	// ask for every face the drawing uses now, so an image shared in the first instant waits for them
	// (CD.render awaits document.fonts.ready) and is the finished frame
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?a=IAH: the airport's code; anything else opens the overview
	sel = idx(CD.state.get("a"));
	const pick = CD.selection({ initial: sel, key: "a", encode: i => rows[i].code, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// anywhere in the chart takes the column at that place across, so the whole height is the target;
		// a row of the list takes its city's big airport; the "All airports" box and the title go back
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			const L = geo.list;
			if (L && mx >= L.x - 8 && mx <= L.x + L.w + 8 && my >= L.y && my < L.y + L.items.length * L.row) return L.items[Math.floor((my - L.y) / L.row)];
			if (geo.block && mx <= geo.block.r && my <= geo.block.b) return -1;
			const P = geo.plot;
			if (mx < P.x || mx > P.x + P.w || my < P.y - 14 || my > P.y + P.h) return -1;
			return Math.min(N - 1, Math.max(0, Math.floor((mx - geo.pl) / geo.cw)));
		},
		// the first arrow key starts at Love Field, the red column (or at the highest going left)
		step: (from, dir) => from < 0 ? (dir > 0 ? DAL : TOP) : (from + dir + N) % N
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true, null) };
})();
