// 2026-11-22 — one axis of money, $0 to $4 billion. 200 grey dots, one per film, stacked in $50 million
// steps by worldwide cinema gross; one red mark past the last of them: Grand Theft Auto VI's sales by the
// end of its first day. The one red thing is the game. Avengers: Endgame, the film furthest along, is ink.
// Wide frames run the axis left to right and stack upward; tall ones run it up the page and stack rightward.
// Picking a dot reads the film, its year, its gross and how many times over the game's figure covers it.
(function () {
	const C = CD.colors, D = window.GTA;
	const films = D.films.map(f => ({ rank: f[0], title: f[1], gross: f[2], year: f[3], slug: f[4] }));
	const N = films.length, GAME = N, G = D.game, MAX = 4e9, STEPS = MAX / D.step;
	// place every film in its step, stacked in rank order
	const fill = {};
	films.forEach(f => { f.step = Math.floor(f.gross / D.step); f.row = fill[f.step] = (fill[f.step] || 0) + 1; f.row--; });
	const TALL = Math.max(...Object.values(fill)), top = films[0];
	const money = n => Math.round(n / 1e6) >= 1000 ? `$${(n / 1e9).toFixed(2)} billion` : `$${Math.round(n / 1e6)} million`;
	const BIG = money(G.sales);
	const S1 = `${G.title} took in ${BIG} by the end of its first day. No film has made that much in cinemas`;
	const SUB = `EACH DOT IS ONE OF THE ${N} BIGGEST FILMS BY WORLDWIDE CINEMA GROSS, IN ${money(D.step).toUpperCase()} STEPS. NOT ADJUSTED FOR INFLATION`;
	const MORE = `${money(D.gap).toUpperCase()} MORE`;

	let sel = -1;
	// the opening motion, once on load: the film dots appear from $0 upward, then the red mark travels the
	// axis from zero past the last film, and the labels fade in as it stops. Still under reduced motion.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
	const counted = () => Math.min(1, grow / 0.5);
	const travelled = () => ease((grow - 0.35) / 0.5);
	const faded = () => Math.min(1, Math.max(0, (grow - 0.85) / 0.15));

	function readout() {
		if (sel < 0) return [S1, `Sales of ${G.title} by the end of its first day, beside the cinema earnings of the ${N} biggest films`];
		if (sel === GAME) return [`${G.title}: ${BIG}`, "Take-Two’s estimate of worldwide sales · up to the end of 19 November 2026"];
		const f = films[sel];
		return [f.title + (f.year ? ` (${f.year})` : ""), `${money(f.gross)} in cinemas worldwide · the game’s ${BIG} covers it ${(G.sales / f.gross).toFixed(1)} times`];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	function balance(ctx, text, w) {
		const n = wrap(ctx, text, w).length;
		let lo = w * 0.4, hi = w;
		for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; wrap(ctx, text, m).length > n ? lo = m : hi = m; }
		return wrap(ctx, text, hi);
	}

	// page = { head: {x, y, w, h} | null } on the page; null in a shared image, which carries the sentence.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "butt";
		const head = page && page.head;
		const across = w >= 1.25 * h;
		const m = page ? 20 * s : 0;                       // the page's canvas runs edge to edge: keep the marks off the edge
		const cnt = counted(), trav = travelled(), la = faded();
		let y0 = y + (page ? 10 * s : 0);                  // the top of the room the plot may use
		let stackTop = y0;                                 // across: the stacks stay under this line

		// ---- a shared image: the sentence and one small line
		if (!page) {
			const colW = across ? Math.min(0.56 * w, 760 * s) : w;
			const fs = Math.max(18 * s, Math.min((across ? 30 : 31) * s, colW / (across ? 17 : 15)));
			ctx.font = `600 ${fs}px ${C.sans}`;
			const lines = balance(ctx, S1, colW);
			ctx.font = mono;
			const sub = balance(ctx, SUB, colW);
			const sentH = lines.length * fs * 1.14;
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 8 * s + 11 * s + i * 16 * s));
			const used = sentH + 8 * s + sub.length * 16 * s + 14 * s;
			if (across) stackTop = y + used; else y0 = y + used;
		} else if (head) {
			if (across) stackTop = head.y + head.h + 18 * s; else y0 = head.y + head.h + 18 * s;
		}

		const pts = [];
		let gp, ep, chip, box = { x, y, w, h };
		const keep = [];                                   // the big number and the labels: a film's reading stays off them
		ctx.font = mono;
		const moreW = ctx.measureText(MORE).width;
		// one film: a dot, stretched into a short bar where the frame has room to spare (hw, hh: half its width and height)
		const drawDot = (f, cx, cy, r, hw = r, hh = r) => {
			const on = films[sel] === f, ink = on || f === top, e = Math.max(0.01, hw - r), v = Math.max(0, hh - r);
			const pill = (col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(cx - e, cy - v); ctx.lineTo(cx + e, cy + v); ctx.stroke(); };
			ctx.lineCap = "round";
			if (on) { pill(C.ink, 2 * r + 7 * s); pill(C.paper, 2 * r + 4 * s); }
			pill(ink ? C.ink : C.ink3, 2 * r);
			ctx.lineCap = "butt";
		};

		if (across) {
			// ---- the axis runs left to right along the bottom; the dots stack upward
			const axL = x + m, axR = x + w - m, axisY = y + h - (page ? 30 : 24) * s, base = axisY - 7 * s;
			const unit = (axR - axL) / STEPS, pitch = Math.max(2 * s, Math.min(unit * 1.6, (base - stackTop) / TALL));
			const r = Math.min(unit, pitch) * 0.41, rr = Math.max(r * 1.55, 5.5 * s), hh = Math.max(r, pitch / 2 - Math.max(1 * s, pitch * 0.09));
			const few = axR - axL < 620 * s;                  // a short axis names every other billion
			const X = v => axL + v / MAX * (axR - axL);
			ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(axL, axisY); ctx.lineTo(axR, axisY); ctx.stroke();
			ctx.font = mono; ctx.fillStyle = C.ink2;
			for (let b = 0; b <= 4; b++) {
				const tx = X(b * 1e9);
				ctx.beginPath(); ctx.moveTo(tx, axisY); ctx.lineTo(tx, axisY + 5 * s); ctx.stroke();
				ctx.textAlign = b === 0 ? "left" : b === 4 ? "right" : "center";
				if (!few || b % 2 === 0) ctx.fillText(b ? `$${b} BILLION` : "$0", tx, axisY + 19 * s);
			}
			ctx.textAlign = "left";
			films.forEach((f, i) => {
				const cx = axL + (f.step + 0.5) * unit, cy = base - (f.row + 0.5) * pitch;
				pts.push({ i, x: cx, y: cy });
				if (f.step < cnt * (top.step + 1)) drawDot(f, cx, cy, r, r, hh);
			});
			const e = pts[0], gx = X(G.sales), gy = base - Math.max(pitch / 2, rr);
			ep = e; gp = { x: gx, y: gy };
			pts.push({ i: GAME, x: gx, y: gy });

			// the film furthest along, named above its stack
			ctx.globalAlpha = la;
			const eTop = base - fill[top.step] * pitch - 9 * s;
			ctx.textAlign = "right"; ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText(money(top.gross).toUpperCase(), e.x + r, eTop);
			ctx.font = monoB; ctx.fillStyle = C.ink; ctx.fillText(top.title.toUpperCase(), e.x + r, eTop - 15 * s);
			// the distance between them
			const bx0 = e.x + r + 5 * s, bx1 = gx - rr - 5 * s;
			ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(bx0, gy - 4 * s); ctx.lineTo(bx0, gy + 4 * s); ctx.moveTo(bx0, gy); ctx.lineTo(bx1, gy); ctx.moveTo(bx1, gy - 4 * s); ctx.lineTo(bx1, gy + 4 * s); ctx.stroke();
			if (bx1 - bx0 >= moreW + 8 * s) { ctx.textAlign = "center"; ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText(MORE, (bx0 + bx1) / 2, gy - 8 * s); }
			ctx.globalAlpha = 1;

			// the one red mark, and its number in the empty upper right, over it
			const rx = X(G.sales * trav);
			ctx.strokeStyle = C.red; ctx.lineWidth = 2 * px1;
			ctx.beginPath(); ctx.moveTo(rx, axisY - 7 * s); ctx.lineTo(rx, axisY + 6 * s); ctx.stroke();
			ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(rx, gy, rr, 0, 7); ctx.fill();
			ctx.globalAlpha = la;
			const bigFs = Math.max(26 * s, Math.min(72 * s, w / 13));
			const subY = Math.min(gy - rr - 22 * s, eTop - 15 * s - 11.5 * s - 22 * s), numY = subY - 20 * s, nameY = numY - bigFs * 0.82 - 8 * s;
			ctx.lineWidth = px1; ctx.beginPath(); ctx.moveTo(gx, gy - rr - 4 * s); ctx.lineTo(gx, subY + 7 * s); ctx.stroke();
			ctx.textAlign = "right";
			ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText("BY THE END OF DAY ONE", axR, subY);
			ctx.font = `600 ${bigFs}px ${C.sans}`; ctx.fillStyle = C.red; ctx.fillText(BIG, axR, numY);
			ctx.font = monoB; ctx.fillText(G.title.toUpperCase(), axR, nameY);
			chip = { x: axR + 12 * s, y: nameY - 58 * s };       // the game's own reading sits above its number
			ctx.font = `600 ${bigFs}px ${C.sans}`;
			const bigW = ctx.measureText(BIG).width;
			keep.push({ x: axR - bigW, y: nameY - 14 * s, w: bigW, h: subY + 6 * s - (nameY - 14 * s) });
			ctx.globalAlpha = 1; ctx.textAlign = "left";
		} else {
			// ---- the axis runs up the page, $0 at the bottom; the dots stack to the right
			ctx.font = mono;
			const ax = x + m * 0.7 + ctx.measureText("$4 BILLION").width + 10 * s, left = ax + 7 * s;
			const room = x + w - m * 0.7 - left;
			const bigFs = Math.max(24 * s, Math.min(60 * s, (room - 24 * s) / 6.9));
			const ayT = y0 + Math.max(22 * s, bigFs * 0.6 + 6 * s), ayB = y + h - (page ? 14 : 8) * s;
			const unit = (ayB - ayT) / STEPS, pitch = Math.max(2 * s, Math.min(unit * 2.4, room * 0.94 / TALL));
			const r = Math.min(unit, pitch) * 0.41, hw = Math.max(r, pitch / 2 - Math.max(1 * s, pitch * 0.09));
			const rr = Math.max(r * 1.8, 6.5 * s);
			const Y = v => ayB - v / MAX * (ayB - ayT);
			ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(ax, ayT); ctx.lineTo(ax, ayB); ctx.stroke();
			ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.textBaseline = "middle";
			for (let b = 0; b <= 4; b++) {
				const ty = Y(b * 1e9);
				ctx.beginPath(); ctx.moveTo(ax - 5 * s, ty); ctx.lineTo(ax, ty); ctx.stroke();
				ctx.fillText(b ? `$${b} BILLION` : "$0", ax - 9 * s, b === 0 ? ty - 5 * s : b === 4 ? ty + 5 * s : ty);
			}
			ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			films.forEach((f, i) => {
				const cx = left + (f.row + 0.5) * pitch, cy = ayB - (f.step + 0.5) * unit;
				pts.push({ i, x: cx, y: cy });
				if (f.step < cnt * (top.step + 1)) drawDot(f, cx, cy, r, hw);
			});
			const e = pts[0], gy = Y(G.sales), gx = left + pitch / 2;
			ep = e; gp = { x: gx, y: gy };
			pts.push({ i: GAME, x: gx, y: gy });

			// the red label: the name, the number level with the mark, the small line under it
			const tx = gx + rr + 12 * s, numY = gy + bigFs * 0.34, subY = numY + 17 * s;
			ctx.globalAlpha = la;
			// the film furthest along, named beside its stack
			const ex = left + fill[top.step] * pitch + 9 * s;
			ctx.font = monoB; ctx.fillStyle = C.ink; ctx.fillText(top.title.toUpperCase(), ex, e.y - 2 * s);
			ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText(money(top.gross).toUpperCase(), ex, e.y + 13 * s);
			// the distance between them
			const by0 = gy + rr + 5 * s, by1 = e.y - r - 5 * s;
			ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(gx - 4 * s, by0); ctx.lineTo(gx + 4 * s, by0); ctx.moveTo(gx, by0); ctx.lineTo(gx, by1); ctx.moveTo(gx - 4 * s, by1); ctx.lineTo(gx + 4 * s, by1); ctx.stroke();
			const my = Math.max((by0 + by1) / 2 + 4 * s, subY + 19 * s);
			if (my < e.y - 20 * s) { ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText(MORE, gx + 10 * s, my); }
			ctx.globalAlpha = 1;

			const ry = Y(G.sales * trav);
			ctx.strokeStyle = C.red; ctx.lineWidth = 2 * px1;
			ctx.beginPath(); ctx.moveTo(ax - 6 * s, ry); ctx.lineTo(ax + 7 * s, ry); ctx.stroke();
			ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(gx, ry, rr, 0, 7); ctx.fill();
			ctx.globalAlpha = la;
			ctx.font = `600 ${bigFs}px ${C.sans}`; ctx.fillText(BIG, tx, numY);
			ctx.font = monoB; ctx.fillText(G.title.toUpperCase(), tx, numY - bigFs * 0.8 - 6 * s);
			ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText("BY THE END OF DAY ONE", tx, subY);
			// the game's own reading sits under the Endgame label, clear of the number and the bracket
			chip = { x: ex - 12 * s, y: e.y + 64 * s, lx: x + w - (page ? 6 * s : 0) + 12 * s };
			ctx.font = `600 ${bigFs}px ${C.sans}`;
			const bigW = ctx.measureText(BIG).width, topY = numY - bigFs * 0.8 - 6 * s - 14 * s;
			keep.push({ x: tx, y: topY, w: bigW, h: subY + 6 * s - topY });
			ctx.globalAlpha = 1;
		}

		// ---- the reader's film (or the game): the reading beside its mark
		if (sel >= 0) {
			const p = pts[sel], [value, full] = readout(), pad = page ? 6 * s : 0, inner = { x: box.x + pad, y: box.y + pad, w: box.w - 2 * pad, h: box.h - 2 * pad };
			if (sel === GAME) { ctx.strokeStyle = C.red; ctx.lineWidth = 1.5 * px1; ctx.beginPath(); ctx.arc(p.x, p.y, Math.hypot(gp.x - p.x, gp.y - p.y) + 9 * s, 0, 7); ctx.stroke(); }
			if (sel === GAME) CD.label(ctx, chip.x, chip.y, value, full, s, inner, chip.lx || chip.x);
			else CD.label(ctx, p.x, p.y, value, full, s, inner, p.x, [{ x: p.x - 10 * s, y: p.y - 10 * s, w: 20 * s, h: 20 * s }, ...keep]);
		}
		return { pts };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	const headEl = document.querySelector(".cd-head .cd-text");
	let geo = null, W = 0, Hh = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== Hh) { W = r.width; Hh = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		geo = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage) });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(headEl);
	// every face the drawing uses is loaded before it is trusted
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`, `600 40px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?film=avatar: the film's slug, or "grand-theft-auto-vi" for the red mark; anything else opens the overview
	const GSLUG = "grand-theft-auto-vi";
	const q = CD.state.get("film");
	sel = q === GSLUG ? GAME : films.findIndex(f => f.slug === q);
	const pick = CD.selection({ initial: sel, key: "film", encode: i => i === GAME ? GSLUG : films[i].slug, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the nearest dot within reach; the dots are small, so a finger reaches further than a mouse.
		// Anywhere else goes back to the overview.
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const reach = e.pointerType && e.pointerType !== "mouse" ? 34 : 16;
			let best = -1, bd = reach;
			for (const p of geo.pts) {
				const d = Math.hypot(p.x - mx, p.y - my) - (p.i === GAME ? 6 : 0);
				if (d < bd) { bd = d; best = p.i; }
			}
			return best;
		},
		// arrows walk the ranking: the game, then the films from the biggest down
		step: (from, dir) => from < 0 ? (dir > 0 ? GAME : N - 1) : from === GAME ? (dir > 0 ? 0 : N - 1) : from + dir < 0 || from + dir >= N ? GAME : from + dir
	});
	// the opening motion ends at once when the reader picks something
	if (grow < 1) {
		const t0 = performance.now() + 250;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1600)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// the image is always the finished picture, even while the opening motion is still running
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6, true, null); grow = g; } };
})();
