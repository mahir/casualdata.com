// 2026-11-15 — Wales v New Zealand, every rugby union match since 1905. One bar per match in date
// order, evenly spaced (not a time axis): up from the line when Wales won, down when Wales lost, as
// tall as the margin in points, on one linear scale. The one red thing is the last bar, Wales's win
// of 14 November 2026. Picking a bar reads the match: score, date, ground and occasion.
(function () {
	const C = CD.colors, D = window.WALNZ;
	const rows = D.matches.map(m => Object.assign({ margin: m.walesPts - m.nzPts, year: m.date.slice(0, 4) }, m));
	const N = rows.length, LAST = N - 1;
	// everything the words say is counted here from the rows
	const wins = rows.map((r, i) => r.margin > 0 ? i : -1).filter(i => i >= 0);
	const PREV = wins[wins.length - 2];                      // the last Welsh win before the newest match
	const RUN0 = PREV + 1, RUN1 = LAST - 1, RUN = RUN1 - RUN0 + 1;   // the defeats in a row between them
	const MAXW = Math.max(...rows.map(r => r.margin)), MAXL = -Math.min(...rows.map(r => r.margin));
	const DEEP = rows.findIndex(r => r.margin === -MAXL);
	const TICKS = [25, 50].filter(v => v < MAXL);
	const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const longDate = iso => `${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
	const score = r => `${r.walesPts}–${r.nzPts}`;

	const S1 = `Wales v New Zealand, every match since ${rows[0].year}: ${RUN} defeats in a row from ${rows[RUN0].year}, then ${score(rows[LAST])} to Wales on ${longDate(rows[LAST].date)}.`;
	const SUB = `EACH BAR IS A RUGBY UNION MATCH, IN DATE ORDER AND EVENLY SPACED: UP WHEN WALES WON, DOWN WHEN WALES LOST, AS TALL AS THE MARGIN IN POINTS · SCORES: WIKIPEDIA`;
	const RUNLABEL = [`${RUN} DEFEATS IN A ROW, ${rows[RUN0].year}–${rows[RUN1].year}`, `${RUN} DEFEATS IN A ROW`];

	let sel = -1;
	// the opening motion, once on load (NEXT.md, "Opening motion"): grow runs 0 to 1; the marks arrive
	// over its first four fifths, then their labels fade in. Still under reduced motion.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const moved = () => 1 - Math.pow(1 - Math.min(1, grow / 0.8), 3);
	const faded = () => Math.min(1, Math.max(0, (grow - 0.8) / 0.2));

	const parts = r => {
		const p = [longDate(r.date), r.venue, r.occasion];
		if (r === rows[LAST]) p.push(`Wales’s first win since ${rows[PREV].year}`);
		return p;
	};
	function readout() {
		if (sel < 0) return [S1, "Each bar is a match: up when Wales won, down when Wales lost, as tall as the margin in points"];
		const r = rows[sel];
		return [`Wales ${score(r)} New Zealand`, parts(r).join(" · ")];
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
	// lie over the top left, above the three early wins. A shared image has no title, so the drawing
	// carries the sentence and one small line there instead.
	// page = { head: {x, y, w, h} | null, gut }: the title block's box inside the canvas, and the page's gutter.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, big = `700 ${13 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "butt";
		const gut = page ? page.gut : 0;
		const edgeL = x + (page ? Math.max(gut, 4 * s) : 0), edgeR = x + w - (page ? Math.max(4 * s, Math.min(gut, 8 * s)) : 0);

		// ---- across: one slot per match, edge to edge
		const pl = x, sw = w / N, gapX = Math.max(px1, Math.min(4 * s, sw * 0.16)), bar = Math.max(1, sw - gapX);
		const bx = i => pl + i * sw + gapX / 2;

		// ---- the block at the top left: the title on a wide page, the sentence in a shared image
		let head = page ? page.head : null;
		const top0 = y + (page ? 12 * s : 0);
		const backH = 21 * s;
		if (!page) {
			const wide = w >= 1.25 * h;
			const colW = wide ? Math.min(w, Math.max(0.56 * w, 520 * s)) : w;
			let fs = wide ? Math.max(19 * s, Math.min(32 * s, w / 34)) : Math.max(19 * s, Math.min(30 * s, w / 19));
			ctx.font = `600 ${fs}px ${C.sans}`; const lines = wrap(ctx, S1, colW);
			ctx.font = mono; const sub = wrap(ctx, SUB, colW);
			const sentH = lines.length * fs * 1.14, headH = sentH + 8 * s + sub.length * 16 * s;
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 8 * s + 11 * s + i * 16 * s));
			head = { x, y, w: wide ? colW : w, h: headH };
		}
		const blockR = head ? head.x + head.w + 18 * s : pl, blockB = head ? head.y + head.h + 12 * s : -1e9;
		const block = head ? { x: x - 50, y: y - 50, w: blockR - x + 50, h: blockB - y + 50, k: 500 } : null;

		// ---- up and down: one scale, fitted to the marks. The foot of the deepest bar leaves room for
		// its score and the bracket under the run; the zero line sits as high as the labels above the
		// wins allow, and lower when the block at the top left lies over the early wins.
		const LAB = 40 * s;                                      // two rows of labels above a win
		const pb = y + h - (16 * s + 30 * s + (page ? 12 * s : 2 * s));
		const ptNat = top0 + (page && !head ? backH + 6 * s : 0) + 22 * s;   // the top of the tallest win
		let zeroY = (ptNat + MAXW * pb / MAXL) / (1 + MAXW / MAXL);
		if (head) {
			let under = 0;
			for (let i = 0; i < N && bx(i) < blockR; i++) under = Math.max(under, rows[i].margin);
			zeroY = Math.max(zeroY, (blockB + LAB + under * pb / MAXL) / (1 + under / MAXL));
		}
		const k = (pb - zeroY) / MAXL, Y = v => zeroY - v * k;
		const endOf = i => Y(rows[i].margin);                    // the bar's far end: its top for a win, its foot for a defeat

		// ---- hairlines at 25 and 50 points lost, behind the bars
		ctx.lineWidth = px1; ctx.strokeStyle = C.rule;
		const tickGeo = TICKS.map(v => {
			const gy = Math.round(Y(-v)) + 0.5;
			ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
			return { v, gy };
		});

		// ---- the bars
		// on load the bars grow from the line in date order, the red one last; the labels follow
		const g8 = Math.min(1, grow / 0.8), la = faded();
		const rise = i => 1 - Math.pow(1 - Math.min(1, Math.max(0, g8 * 1.6 - (i / N) * 0.6)), 3);
		for (let i = 0; i < N; i++) {
			ctx.fillStyle = i === LAST ? C.red : i === sel ? C.ink : C.ink3;
			const a = zeroY, b = zeroY + (endOf(i) - zeroY) * rise(i);
			ctx.fillRect(bx(i), Math.min(a, b), bar, Math.max(px1, Math.abs(b - a)));
		}
		ctx.strokeStyle = C.ink; ctx.lineWidth = px1;
		ctx.beginPath(); ctx.moveTo(x, Math.round(zeroY) + 0.5); ctx.lineTo(x + w, Math.round(zeroY) + 0.5); ctx.stroke();

		// ---- labels on marks
		const hard = [], soft = [];
		const text = (t, font, color, tx, base, align = "left") => () => { ctx.font = font; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(t, tx, base); ctx.textAlign = "left"; };
		const boxOf = (t, font, tx, base, kk) => { ctx.font = font; const tw = ctx.measureText(t).width; return { x: tx, y: base - 12 * s, w: tw, h: 16 * s, k: kk }; };
		// the red bar's score, above it, ending at the right edge
		{
			const t = score(rows[LAST]); ctx.font = big; const tw = ctx.measureText(t).width;
			const xl = Math.min(bx(LAST) + bar / 2 - tw / 2, edgeR - tw), base = endOf(LAST) - 7 * s;
			const b = { x: xl, y: base - 13 * s, w: tw, h: 17 * s, k: 300 };
			hard.push(b); ctx.globalAlpha = la; text(t, big, C.red, xl, base)(); ctx.globalAlpha = 1;
		}
		// the last win before the run, and the first match
		{
			const t4 = [`${rows[PREV].year}, THE LAST WIN`, rows[PREV].year], xl4 = Math.max(edgeL, bx(PREV)), base4 = endOf(PREV) - 6 * s;
			let b4 = null;
			for (const t of t4) {
				const b = boxOf(t, mono, xl4, base4, 6);
				if (b.x + b.w > edgeR || hard.some(o => over(b, o, 8 * s))) continue;
				b4 = Object.assign(b, { of: PREV, draw: text(t, sel === PREV ? monoB : mono, sel === PREV ? C.ink : C.ink2, xl4, base4) }); soft.push(b4); break;
			}
			const t1 = rows[0].year, xl1 = Math.max(edgeL, bx(0));
			let base1 = endOf(0) - 6 * s, b1 = boxOf(t1, mono, xl1, base1, 6);
			// stacked a row above the other label when the two would touch, clear of every win it lies over
			if (b4 && over(b1, b4, 6 * s)) {
				let m = endOf(0);
				for (let j = 0; j <= PREV; j++) if (rows[j].margin > 0 && bx(j) < xl1 + b1.w + 2 * s) m = Math.min(m, endOf(j));
				base1 = Math.min(base1, b4.y - 4 * s, m - 6 * s); b1 = boxOf(t1, mono, xl1, base1, 6);
			}
			soft.push(Object.assign(b1, { of: 0, draw: text(t1, sel === 0 ? monoB : mono, sel === 0 ? C.ink : C.ink2, xl1, base1) }));
			// what up means, on the empty side of the line over the run
			const tw0 = "WALES WON", bw = boxOf(tw0, mono, 0, zeroY - 6 * s, 3);
			bw.x = Math.max(bx(RUN0) + 4 * s, (b4 ? b4.x + b4.w : xl4) + 18 * s);
			if (bw.x + bw.w < bx(LAST) - 10 * s && !hard.some(o => over(bw, o, 10 * s)))
				soft.push(Object.assign(bw, { draw: text(tw0, mono, C.ink2, bw.x, zeroY - 6 * s) }));
		}
		// the scale on the losing side: a label above each hairline, where no bar reaches down to it
		{
			let worded = false;
			tickGeo.forEach(g => {
				const opts = worded ? [`${g.v} POINTS`, `${g.v}`] : [`WALES LOST BY ${g.v} POINTS`, `LOST BY ${g.v} POINTS`, `LOST BY ${g.v}`, `${g.v}`];
				for (const t of opts) {
					const b = boxOf(t, mono, edgeL, g.gy - 5 * s, 4);
					let hit = false;
					for (let j = 0; j < N && !hit; j++) if (endOf(j) > g.gy - 20 * s && bx(j) < b.x + b.w + 4 * s && bx(j) + bar > b.x - 2 * s) hit = true;
					if (hit) continue;
					if (t.length > 3) worded = true;
					soft.push(Object.assign(b, { draw: text(t, mono, C.ink2, edgeL, g.gy - 5 * s) }));
					break;
				}
			});
		}
		// the deepest defeat's score under its foot
		{
			const t = score(rows[DEEP]); ctx.font = mono; const tw = ctx.measureText(t).width;
			const xc = Math.min(Math.max(bx(DEEP) + bar / 2, edgeL + tw / 2), edgeR - tw / 2), base = endOf(DEEP) + 14 * s;
			soft.push({ x: xc - tw / 2, y: base - 12 * s, w: tw, h: 16 * s, k: 6, of: DEEP, draw: text(t, sel === DEEP ? monoB : mono, sel === DEEP ? C.ink : C.ink2, xc, base, "center") });
		}
		// the claim: a bracket under the run of defeats, along the bottom
		{
			const by = Math.round(pb + 21 * s) + 0.5, x0 = bx(RUN0), x1 = bx(RUN1) + bar;
			ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.globalAlpha = la;
			ctx.beginPath(); ctx.moveTo(x0 + px1 / 2, by - 5 * s); ctx.lineTo(x0 + px1 / 2, by); ctx.lineTo(x1 - px1 / 2, by); ctx.lineTo(x1 - px1 / 2, by - 5 * s); ctx.stroke();
			ctx.font = monoB;
			const t = RUNLABEL.find(l => ctx.measureText(l).width <= x1 - x0) || RUNLABEL[1], tw = ctx.measureText(t).width;
			const xc = (x0 + x1) / 2, base = by + 15 * s;
			text(t, monoB, C.ink, xc, base, "center")(); ctx.globalAlpha = 1;
			hard.push({ x: xc - tw / 2, y: by, w: tw, h: 18 * s, k: 300 });
		}

		// ---- the reader's match: its bar in ink and the reading beside it
		let back = null;
		if (sel >= 0) {
			const r = rows[sel], won = r.margin > 0;
			const p = { x: bx(sel) + bar / 2, y: (zeroY + endOf(sel)) / 2 };
			const avoid = hard.slice(); if (block) avoid.push(block);
			if (!exporting) {
				ctx.font = mono;
				const t = "ALL MATCHES", tw = ctx.measureText(t).width, bw = tw + 18 * s;
				const bxx = block ? Math.min(blockR, edgeR - bw) : edgeL, byy = top0;
				ctx.fillStyle = C.paper; ctx.fillRect(bxx, byy, bw, backH);
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bxx + 0.5, byy + 0.5, bw - 1, backH - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bxx + 9 * s, byy + 14.5 * s);
				back = { x: bxx - 14, y: byy - 14, w: bw + 28, h: backH + 28 };
				avoid.push({ x: bxx - 4 * s, y: byy - 4 * s, w: bw + 8 * s, h: backH + 8 * s, k: 400 });
			}
			// the chip: the score, then the date, ground and occasion, wrapped to the room there is
			const [value, context] = readout();
			const pad = 8 * s, room = edgeR - edgeL, maxW = Math.min(room, (room < 700 * s ? 250 : 360) * s);
			ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			const ls = [];
			for (const part of context.toUpperCase().split(" · ")) ls.push(...wrap(ctx, part, maxW - pad * 2));
			const chw = Math.min(room, Math.max(vw, ...ls.map(l => ctx.measureText(l).width)) + pad * 2);
			const chh = 17 * s + 11 * s + (ls.length - 1) * 15 * s + pad * 2 + 5 * s, gap = 10 * s;
			const barBox = j => { const a = zeroY, b = endOf(j); return { x: bx(j), y: Math.min(a, b), w: bar, h: Math.abs(b - a) }; };
			const cost = c => {
				const cb = { x: c.x, y: c.y, w: chw, h: chh };
				let kk = 0;
				for (let j = 0; j < N; j++) if (over(cb, barBox(j))) kk += j === sel ? 60 : j === LAST ? 30 : 2;
				for (const o of avoid) if (over(cb, o, 2 * s)) kk += o.k;
				for (const o of soft) if (o.of !== sel && over(cb, o)) kk += o.k;
				return kk + Math.hypot(Math.max(c.x - p.x, 0, p.x - c.x - chw), Math.max(c.y - p.y, 0, p.y - c.y - chh)) / (12 * s);
			};
			let best = null, bc = Infinity;
			const lowY = pb + 16 * s - chh, hiY = top0 + (page && !head ? backH + 6 * s : 0);
			for (const cx0 of [p.x + bar / 2 + gap, p.x - bar / 2 - gap - chw, p.x - chw / 2]) {
				const xx = Math.min(Math.max(cx0, edgeL), edgeR - chw);
				for (const yy of [p.y - chh / 2, endOf(sel) + (won ? -chh - gap - 18 * s : gap), zeroY - chh - gap, zeroY + gap, zeroY - chh - gap - 22 * s, lowY]) {
					const c = { x: xx, y: Math.min(Math.max(yy, hiY), lowY) };
					const kk = cost(c); if (kk < bc) { bc = kk; best = c; }
				}
			}
			const cb = { x: best.x, y: best.y, w: chw, h: chh };
			soft.forEach(o => { if (o.of === sel || !over(cb, o, 6 * s)) o.draw(); });
			// a hairline from the bar to the nearest point of the chip when the chip stands off it
			{
				const bb = barBox(sel), ax = p.x;
				let ay = Math.min(Math.max(best.y + chh / 2, bb.y), bb.y + bb.h);
				// a chip above the red bar: the line starts above the bar's score, not through it
				if (sel === LAST && best.y + chh <= bb.y) ay = Math.min(ay, bb.y - 7 * s - 15 * s);
				const qx = Math.min(Math.max(ax, best.x), best.x + chw), qy = Math.min(Math.max(ay, best.y), best.y + chh);
				if (Math.hypot(qx - ax, qy - ay) > bar / 2 + 2 * s) { ctx.strokeStyle = sel === LAST ? C.red : C.ink; ctx.lineWidth = px1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(qx, qy); ctx.stroke(); }
			}
			ctx.fillStyle = C.ink; ctx.fillRect(best.x, best.y, chw, chh);
			ctx.fillStyle = C.paper; ctx.textAlign = "left";
			ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillText(value, best.x + pad, best.y + pad + 14 * s);
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			ls.forEach((l, i) => ctx.fillText(l, best.x + pad, best.y + pad + 17 * s + 5 * s + 11 * s + i * 15 * s - 1 * s));
		} else { ctx.globalAlpha = la; soft.forEach(o => o.draw()); ctx.globalAlpha = 1; }
		ctx.textAlign = "left";
		return { back, pl, sw, plot: { x: pl, y: block ? Math.min(blockB, top0) : top0, w, h: y + h - top0 }, block: block ? { r: blockR, b: blockB } : null };
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
		// where the title block lies over the canvas (wide screens), the bars and the reading keep clear of it
		geo = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage), gut: parseFloat(getComputedStyle(headEl).paddingLeft) || 16 });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(textEl);
	// ask for every face the drawing uses now, so an image shared in the first instant waits for them
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?m=2003-06-21: the match's date; anything else opens the overview
	sel = rows.findIndex(r => r.date === CD.state.get("m"));
	const pick = CD.selection({ initial: sel, key: "m", encode: i => rows[i].date, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// anywhere in a match's slot takes it, so the whole height is the target and a one-point bar
		// can be tapped; the "All matches" box and the title go back
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			if (geo.block && mx <= geo.block.r && my <= geo.block.b) return -1;
			const P = geo.plot;
			if (mx < P.x || mx > P.x + P.w || my < P.y || my > P.y + P.h) return -1;
			return Math.min(N - 1, Math.max(0, Math.floor((mx - geo.pl) / geo.sw)));
		},
		// the first arrow key starts at the first match (or, going left, at the newest, the red bar)
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : LAST) : (from + dir + N) % N
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
