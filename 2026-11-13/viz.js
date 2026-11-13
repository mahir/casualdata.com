// 2026-11-13 — the 1960 "Doomsday" equation against the count. One dot per year, 1700 to 2026: the
// world's population (up, log scale) against the years left until the date the equation reaches
// infinity, 13 November 2026 (across, log scale, so the last 30 years take half the width). On these
// axes the equation is one straight line climbing out of the top; the dots ride just above it for
// three centuries, cross under it in the mid-1990s and go flat. The one red thing is the 2026 dot.
// Picking a year reads its count, the equation's value and the gap between them.
(function () {
	const C = CD.colors, D = window.DOOM;
	const rows = D.rows, N = rows.length, last = rows[N - 1];
	const tau = y => D.t0 - (y + 0.5);                        // the values are for 1 July
	const eqAt = t => D.K / Math.pow(t, D.k);
	rows.forEach(r => { r.tau = tau(r.year); r.eq = eqAt(r.tau); r.gap = r.pop / r.eq - 1; });
	const cross = rows.find(r => r.gap <= 0);                   // the first year the equation is higher
	const idx = y => rows.findIndex(r => r.year === y);
	const LIST = [1960, 1975, cross.year, 2010, last.year];

	const bn = v => { v /= 1e9; return v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v).toLocaleString("en-US"); };
	const pct = g => { const a = Math.abs(g * 100); return (a < 9.95 ? a.toFixed(1) : String(Math.round(a))) + "%"; };
	const side = g => g > 0 ? "ahead" : "behind";
	const S1 = `A 1960 equation put the world’s population at infinity on 13 November ${last.year}. Until the mid-1990s the world was ahead of it.`;
	const SUB = `EACH DOT IS A YEAR FROM ${rows[0].year} TO ${last.year}: THE WORLD’S POPULATION AGAINST THE YEARS LEFT UNTIL THAT DATE`;

	let sel = -1;

	function readout() {
		if (sel < 0) return [S1, `Each dot is a year from ${rows[0].year} to ${last.year}: the world’s population against the years left until that date`];
		const r = rows[sel];
		return [`${r.year}: ${pct(r.gap)} ${side(r.gap)}`, `${bn(r.pop)} billion ${r.proj ? "(UN projection)" : "people"} · ${bn(r.eq)} billion by the equation`];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}

	// the plot's window, fitted to the marks
	const T0 = rows[0].tau, T1 = last.tau, LT0 = Math.log10(T0), LT1 = Math.log10(T1);
	const N0 = 0.5e9, N1 = 60e9, LN0 = Math.log10(N0), LN1 = Math.log10(N1);
	const TIP = Math.pow(D.K / N1, 1 / D.k);                    // years left where the line leaves the top
	const XT = [300, 100, 30, 10, 3, 1], YT = [1, 2, 5, 10, 20, 50];

	// Two frames. On the page the chart is the page: the title and dek are HTML and, on wide screens,
	// lie over the empty top left. A shared image has no title, so the drawing carries the sentence
	// and one small line there instead.
	// page = { head: {x, y, w, h} | null, gut }: the title block's box inside the canvas, and the page's gutter.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		const [value, context] = readout();
		const gut = page ? page.gut : 0;
		// every tick can carry "years to go" when the first two labels do not meet (the first is held at the left edge)
		ctx.font = mono;
		const wideAxis = (w - 2 * gut - 13 * s) / (LT0 - LT1) * (LT0 - 2) >= ctx.measureText("300 YEARS TO GO").width * 1.5 + 22 * s;

		// ---- the plot's box
		let top = y + (page ? 14 * s : 6 * s);
		const padB = 44 * s;
		let head = page ? page.head : null, sent = null;
		const geom = t => {
			const pl = x + gut + 5 * s, pr = x + w - gut - 8 * s, pb = y + h - padB;
			const X = v => pl + (LT0 - Math.log10(v)) / (LT0 - LT1) * (pr - pl);
			const Y = v => pb - (Math.log10(v) - LN0) / (LN1 - LN0) * (pb - t);
			// the line's height at a pixel across
			const lineY = xp => Y(eqAt(Math.pow(10, LT0 - (xp - pl) / (pr - pl) * (LT0 - LT1))));
			return { pl, pr, pt: t, pb, X, Y, lineY };
		};
		let G = geom(top);
		// is the corner of a box at the top left clear of the dots and the line?
		const clear = (bx, by) => bx <= G.pl || by + 26 * s < G.lineY(Math.max(G.pl, bx));

		if (!page) {
			// ---- a shared image: the sentence and the small line, in the empty top left when the frame
			// is wide, above the plot when it is tall
			const wide = w >= 1.25 * h;
			let fs, colW, lines, sub, sentH, headH;
			const fit = (f, cw) => {
				fs = f; colW = cw;
				ctx.font = `600 ${fs}px ${C.sans}`; lines = wrap(ctx, S1, colW);
				ctx.font = mono; sub = wrap(ctx, SUB, colW);
				sentH = lines.length * fs * 1.14; headH = sentH + 8 * s + sub.length * 16 * s;
			};
			if (wide) {
				let done = false;
				for (let f = 34 * s; f >= 17 * s && !done; f -= s) for (const frac of [0.4, 0.44, 0.48, 0.52, 0.56]) {
					fit(f, frac * w);
					if (clear(x + colW + 12 * s, y + headH + 6 * s)) { done = true; break; }
				}
			} else {
				fit(Math.max(19 * s, Math.min(30 * s, w / 19)), w);
				top = y + headH + 22 * s; G = geom(top);
			}
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 8 * s + 11 * s + i * 16 * s));
			sent = { x, y, w: colW, h: headH };
			if (wide) head = sent;
		}
		const { pl, pr, pt, pb, X, Y, lineY } = G;
		const avoid = [];                                        // boxes the reading must not cover
		const soft = [];                                         // word labels that give way to the reading: drawn last, unless it covers them
		if (head) avoid.push({ x: x - 50, y: y - 50, w: head.x + head.w + 16 * s - x + 50, h: head.y + head.h + 14 * s - y + 50, k: 500 });

		// ---- the list under the title on a wide frame: five readings, and the reader's year
		let listGeo = null;
		if (head) {
			const ys = LIST.slice(); if (sel >= 0 && !ys.includes(rows[sel].year)) ys.push(rows[sel].year);
			ys.sort((a, b) => a - b);
			ctx.font = mono;
			const ch = ctx.measureText("0").width, ROW = 18.5 * s, lx = head.x, ly = head.y + head.h + 28 * s;
			const c1 = lx + 7 * ch, c2 = c1 + 12 * ch, c3 = c2 + 15 * ch, lw = c3 - lx + 10 * ch, rowsN = LIST.length + 2;
			if (clear(lx + lw + 10 * s, ly + rowsN * ROW)) {
				ctx.fillStyle = C.ink3;
				ctx.fillText("YEAR", lx, ly + 12 * s); ctx.fillText("THE WORLD", c1, ly + 12 * s); ctx.fillText("THE EQUATION", c2, ly + 12 * s);
				const items = ys.map((yr, j) => {
					const i = idx(yr), r = rows[i], on = i === sel, by = ly + (j + 1) * ROW + 12 * s;
					ctx.font = on || r === last ? monoB : mono;
					ctx.fillStyle = r === last ? C.red : on ? C.ink : C.ink2;
					ctx.fillText(String(yr), lx, by); ctx.fillText(`${bn(r.pop)} BN`, c1, by); ctx.fillText(`${bn(r.eq)} BN`, c2, by);
					ctx.fillText(`${pct(r.gap)} ${side(r.gap).toUpperCase()}`, c3, by);
					return i;
				});
				listGeo = { x: lx, y: ly + ROW, w: lw, row: ROW, items };
				avoid.push({ x: x - 50, y: ly - 10 * s, w: lx + lw + 12 * s - x + 50, h: (ys.length + 1) * ROW + 20 * s, k: 500 });
			}
		}
		// where a hairline may start: right of the title and the list when it would run under them
		const blockB = head ? (listGeo ? listGeo.y + (listGeo.items.length + 0.6) * listGeo.row : head.y + head.h + 14 * s) : -1e9;
		const blockR = head ? Math.max(head.x + head.w, listGeo ? listGeo.x + listGeo.w : 0) + 22 * s : pl;

		// ---- the axes: hairlines for the count, with their labels at the right; years to go along the bottom
		ctx.lineWidth = px1; ctx.font = mono;
		YT.forEach((v, i) => {
			const gy = Math.round(Y(v * 1e9)) + 0.5, x0 = gy < blockB ? Math.max(blockR, x) : x;
			ctx.strokeStyle = C.rule; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x + w, gy); ctx.stroke();
			ctx.fillStyle = C.ink3; ctx.textAlign = "right";
			const t = `${v} BILLION`, ry = Y(last.pop);
			if (gy - 17 * s < ry + 22 * s && gy - 3 * s > ry - 9 * s) return;      // the red label has this place
			if (pb - pt < 300 * s && v !== 1 && v !== 10 && v !== 50) return;      // a short plot labels 1, 10 and 50 only
			const tw = ctx.measureText(t).width;
			soft.push({ x: pr + 4 * s - tw, y: gy - 17 * s, w: tw, h: 14 * s, k: 4,
				draw: () => { ctx.font = mono; ctx.textAlign = "right"; ctx.fillStyle = C.ink3; ctx.fillText(t, pr + 4 * s, gy - 5 * s); } });
		});
		ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(x, Math.round(pb) + 0.5); ctx.lineTo(x + w, Math.round(pb) + 0.5); ctx.stroke();
		XT.forEach((v, i) => {
			const gx = X(v);
			ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(gx, pb); ctx.lineTo(gx, pb + 5 * s); ctx.stroke();
			// on a narrow frame only the first label carries the words, and 100 gives it the room
			let t = wideAxis ? `${v} YEAR${v > 1 ? "S" : ""} TO GO` : i === 0 ? `${v} YEARS TO GO` : i === 1 ? "" : String(v);
			if (!wideAxis && i === 0 && x + gut + ctx.measureText(t).width > X(30) - 16 * s) t = `${v} YRS TO GO`;
			const tw = ctx.measureText(t).width;
			ctx.textAlign = "left"; ctx.fillStyle = C.ink2;
			ctx.fillText(t, Math.min(Math.max(gx - tw / 2, x + gut), x + w - gut - tw), pb + 19 * s);
			const yr = String(Math.floor(D.t0 - v)), yw = ctx.measureText(yr).width;      // the year that date falls in
			ctx.fillStyle = C.ink3;
			ctx.fillText(yr, Math.min(Math.max(gx - yw / 2, x + gut), x + w - gut - yw), pb + 34 * s);
		});

		// ---- the equation: one straight line, out of the top
		const a = [X(T0), Y(eqAt(T0))], b = [X(TIP), pt];
		ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5 * s;
		ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
		const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), ah = 9 * s;
		ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(b[0], b[1]);
		ctx.lineTo(b[0] - ah * Math.cos(ang - 0.4), b[1] - ah * Math.sin(ang - 0.4)); ctx.lineTo(b[0] - ah * Math.cos(ang + 0.4), b[1] - ah * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
		const line = []; for (let i = 0; i <= 60; i++) line.push({ x: a[0] + (b[0] - a[0]) * i / 60, y: a[1] + (b[1] - a[1]) * i / 60 });
		{
			// its label, left of where it leaves: one line where there is room, else two
			ctx.font = monoB; ctx.textAlign = "right"; ctx.fillStyle = C.ink;
			const one = "THE EQUATION: INFINITY ON 13 NOV 2026", ex = b[0] - 30 * s, ow = ctx.measureText(one).width;
			const lim = Math.max(x + gut, head && pt + 20 * s < head.y + head.h + 14 * s ? head.x + head.w + 20 * s : -1e9);
			const two = ex - ow < lim, ls = two ? ["THE EQUATION:", "INFINITY ON 13 NOV 2026"] : [one];
			const lw2 = Math.max(...ls.map(l => ctx.measureText(l).width));
			soft.push({ x: ex - lw2, y: pt, w: lw2, h: 14 * s + (ls.length - 1) * 15 * s, k: 8,
				draw: () => { ctx.font = monoB; ctx.textAlign = "right"; ctx.fillStyle = C.ink; ls.forEach((l, i) => ctx.fillText(l, ex, pt + 12 * s + i * 15 * s)); } });
		}

		// ---- the count: one dot per year
		const r0 = Math.min(2.6, Math.max(1.7, (pr - pl) / 420 / s)) * s;
		const pts = rows.map((r, i) => ({ i, x: X(r.tau), y: Y(r.pop) }));
		ctx.fillStyle = C.ink;
		ctx.beginPath(); pts.forEach(p => { if (rows[p.i] !== last) { ctx.moveTo(p.x + r0, p.y); ctx.arc(p.x, p.y, r0, 0, 7); } }); ctx.fill();
		{
			// "the world", above the band where it has room at its left
			ctx.font = monoB; const t = "THE WORLD", tw = ctx.measureText(t).width;
			const p = pts.find(q => rows[q.i].year >= 1900 && q.x - 10 * s - tw >= x + gut) || pts[idx(1950)];
			soft.push({ x: p.x - 10 * s - tw, y: p.y - 17 * s, w: tw, h: 14 * s, k: 8,
				draw: () => { ctx.font = monoB; ctx.textAlign = "right"; ctx.fillStyle = C.ink; ctx.fillText(t, p.x - 10 * s, p.y - 5 * s); } });
		}
		{
			// the crossing: a short leader down into the empty side, and the year
			const p = pts[idx(cross.year)], ty = Math.max(p.y + 30 * s, Y(5e9) + 17 * s);
			ctx.strokeStyle = C.ink2; ctx.lineWidth = px1; ctx.beginPath(); ctx.moveTo(p.x, p.y + 6 * s); ctx.lineTo(p.x, ty - 3 * s); ctx.stroke();
			ctx.font = mono;
			const t = `${cross.year}: THE EQUATION OVERTAKES`;
			soft.push({ x: p.x + 4 * s, y: ty - 12 * s, w: ctx.measureText(t).width + 4 * s, h: 15 * s, k: 8,
				draw: () => { ctx.font = mono; ctx.textAlign = "left"; ctx.fillStyle = C.ink2; ctx.fillText(t, p.x + 6 * s, ty); } });
		}
		// ---- the one red thing: 2026
		const pl26 = pts[N - 1], rr = 5.5 * s;
		ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(pl26.x, pl26.y, rr + 1.5 * s, 0, 7); ctx.fill();
		ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(pl26.x, pl26.y, rr, 0, 7); ctx.fill();
		{
			const big = `700 ${14 * s}px ${C.mono}`; ctx.font = big; ctx.textAlign = "right";
			const t = `${last.year}: ${(last.pop / 1e9).toFixed(1)} BILLION`, tw = ctx.measureText(t).width;
			ctx.fillText(t, pr + 4 * s, pl26.y + 20 * s);
			avoid.push({ x: pr + 4 * s - tw, y: pl26.y + 7 * s, w: tw, h: 16 * s, k: 300 });
		}
		ctx.textAlign = "left";

		// ---- the reader's year: a line from its dot to the equation, so the gap is seen, and the reading
		// beside the dot, in the clearest place near it
		let back = null;
		if (sel >= 0) {
			const p = pts[sel], r = rows[sel], ey = Math.max(pt, Y(r.eq)), red = r === last;
			ctx.strokeStyle = red ? C.red : C.ink; ctx.lineWidth = 1.5 * s;
			ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, ey); ctx.stroke();
			if (Y(r.eq) >= pt) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p.x, ey, 2.4 * s, 0, 7); ctx.fill(); }
			if (!red) {
				ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(p.x, p.y, 6.5 * s, 0, 7); ctx.fill();
				ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(p.x, p.y, 4.6 * s, 0, 7); ctx.fill();
			}
			if (!exporting) {
				ctx.font = mono;
				const t = "ALL YEARS", tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
				const bx = pr + 4 * s - bw, by = pb - bh - 7 * s;
				ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
				back = { x: bx - 14, y: by - 14, w: bw + 40, h: bh + 28 };
				avoid.push({ x: bx - 4 * s, y: by - 4 * s, w: bw + 8 * s, h: bh + 8 * s, k: 400 });
			}
			// the chip's size, measured as CD.label will draw it
			const pad = 8 * s, maxW = Math.min(pr - pl, (pr - pl < 700 * s ? 236 : 380) * s);
			ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			const ls = [];
			for (const part of context.toUpperCase().split(" · ")) {
				const t = ls.length ? ls[ls.length - 1] + " · " + part : part;
				if (ls.length && ctx.measureText(t).width + pad * 2 > maxW) ls.push(part); else if (ls.length) ls[ls.length - 1] = t; else ls.push(part);
			}
			const cw = Math.min(maxW, Math.max(vw, ...ls.map(l => ctx.measureText(l).width)) + pad * 2);
			const chh = 17 * s + 11 * s + (ls.length - 1) * 15 * s + pad * 2 + 5 * s, gap = 12 * s;
			const m = 4 * s, hit = (c, q) => q.x >= c.x - m && q.x <= c.x + cw + m && q.y >= c.y - m && q.y <= c.y + chh + m;
			const cost = c => {
				let k = hit(c, p) ? 1000 : 0;
				for (const q of pts) if (hit(c, q)) k += 1;
				for (const q of line) if (hit(c, q)) k += 2;
				for (let yy = Math.min(p.y, ey); yy <= Math.max(p.y, ey); yy += 6 * s) if (hit(c, { x: p.x, y: yy })) k += 3;
				for (const o of avoid.concat(soft)) if (c.x < o.x + o.w && o.x < c.x + cw && c.y < o.y + o.h && o.y < c.y + chh) k += o.k;
				// distance from the dot to the nearest edge of the chip, so a wide chip beside its dot beats a far one centred under it
				return k + Math.hypot(Math.max(c.x - p.x, 0, p.x - c.x - cw), Math.max(c.y - p.y, 0, p.y - c.y - chh)) / (40 * s);
			};
			let best = null, bc = Infinity;
			for (const cx of [p.x + gap, p.x - gap - cw, p.x - cw / 2])
				for (const dy of [-chh / 2, gap, -chh - gap, gap + 40 * s, -chh - gap - 40 * s, gap + 90 * s, -chh - gap - 90 * s, gap + 150 * s, -chh - gap - 150 * s]) {
					const c = { x: Math.min(Math.max(cx, pl), pr + 4 * s - cw), y: Math.min(Math.max(p.y + dy, pt), pb - chh - 4 * s) };
					const k = cost(c); if (k < bc) { bc = k; best = c; }
				}
			soft.forEach(o => { if (!(best.x < o.x + o.w + m && o.x < best.x + cw + m && best.y < o.y + o.h + m && o.y < best.y + chh + m)) o.draw(); });
			ctx.textAlign = "left";
			CD.label(ctx, best.x - 12 * s, best.y + chh / 2, value, context, s, { x: best.x, y: best.y, w: cw, h: chh });
		} else { soft.forEach(o => o.draw()); ctx.textAlign = "left"; }
		return { pts, back, list: listGeo, plot: { x: pl, y: pt, w: pr - pl, h: pb - pt } };
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
		// where the title block lies over the canvas (wide screens), the hairlines and the reading keep clear of it
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

	// ?y=1975: the year; anything else opens the overview
	sel = rows.findIndex(r => String(r.year) === CD.state.get("y"));
	const pick = CD.selection({ initial: sel, key: "y", encode: i => rows[i].year, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// anywhere in the plot takes the year nearest across, since the dots are small; a row of the list
		// takes its year; the "All years" box and everything outside the plot go back to the overview
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			const L = geo.list;
			if (L && mx >= L.x - 8 && mx <= L.x + L.w + 8 && my >= L.y && my < L.y + L.items.length * L.row) return L.items[Math.floor((my - L.y) / L.row)];
			const P = geo.plot, hb = CD.headBox(stage);
			if (mx < P.x - 12 || mx > P.x + P.w + 14 || my < P.y - 6 || my > P.y + P.h + 6) return -1;
			if (hb && mx <= hb.x + hb.w + 12 && my <= hb.y + hb.h + 12) return -1;
			let best = -1, bd = Infinity;
			for (const p of geo.pts) { const d = Math.abs(p.x - mx); if (d < bd) { bd = d; best = p.i; } }
			return best;
		},
		// the first arrow key starts at 1960, the year of the paper (or at 2026 going left)
		step: (from, dir) => from < 0 ? (dir > 0 ? rows.findIndex(r => r.year === 1960) : N - 1) : (from + dir + N) % N
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true, null) };
})();
