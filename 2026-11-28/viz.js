// 2026-11-28 — every rider who has won a race in motorcycling's top class (500cc, then MotoGP) since
// 1949, as ranked horizontal bars on one scale, length = wins. The top riders get a named row with the
// number at the bar's end; the rest are a tail of thin bars on the same scale and the same left edge.
// One accent: Marc Márquez's bar and its 80, red. Picking any bar reads the rider: wins and one plain
// sentence (the years of the first and last win). Only the pinned rider goes in the URL (?r=rossi).
(function () {
	const C = CD.colors, D = window.WINNERS;
	const R = D.list.map(([slug, name, last, country, wins, rank, y1, r1, y2, r2]) => ({ slug, name, last, country, wins, rank, y1, r1, y2, r2 }));
	const n = R.length, MAX = R[0].wins;
	const MM = R.findIndex(r => r.slug === "marc-marquez");
	const ONES = R.filter(r => r.wins === 1).length;
	const SENTENCE = "Only Valentino Rossi has won more races in motorcycling’s top class than Marc Márquez, who said on 27 November 2026 that he is retiring.";
	const SMALL = `Wins in the 500cc and MotoGP class up to 27 November 2026, ${n} riders; the season’s last race is on 29 November. Sprints not counted. Wikipedia, from motogp.com.`;

	let sel = -1, inImage = false;        // inImage: a shared image is being drawn
	// the opening motion, once on load: the bars grow from the left, the top of the list first, over the
	// first four fifths; the numbers and the tail's labels fade in after.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const ease = t => 1 - Math.pow(1 - t, 3);
	const lenOf = i => grow >= 1 ? 1 : ease(Math.min(1, Math.max(0, (grow / 0.8) * 1.5 - (i / n) * 0.5)));
	const faded = () => Math.min(1, Math.max(0, (grow - 0.7) / 0.3));

	// a reading: the rider and the wins, then one short sentence a person would say
	function reading(i) {
		const r = R[i];
		const head = `${r.name}: ${r.wins} ${r.wins === 1 ? "win" : "wins"}`;
		const t = r.wins === 1 ? `Won the ${r.y1} ${r.r1}.`
			: r.y1 === r.y2 ? `Won races in ${r.y1}.` : `Won races from ${r.y1} to ${r.y2}.`;
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

	// the list in the box (X, Y, W, H): N named rows, then the tail. Returns the rows' places for picking.
	// `side` false: the reading for a picked rider is drawn in the free room right of the tail.
	function plot(ctx, X, Y, W, H, s, q, pick, side) {
		const snap = v => Math.round(v / q) * q;
		const gap = 8 * s, minT = 2 * s;
		// as many named rows as fit while the tail keeps 2 px a row: at least 10, at most 20
		let P = 20 * s;
		let N = Math.floor((H - gap - n * minT) / (P - minT));
		if (N < 10) { N = 10; P = Math.max(15 * s, Math.min(P, (H - gap - (n - N) * minT) / N)); }
		N = Math.min(20, N);
		let tp = (H - gap - N * P) / (n - N);
		// with room to spare, the named rows take it first: the tail stays near 3 px a row
		if (N === 20 && tp > 3 * s) { P = Math.min(27 * s, (H - gap - (n - N) * 3 * s) / N); tp = Math.min(6 * s, (H - gap - N * P) / (n - N)); }
		const tailY = Y + N * P + gap;
		const rowY = i => i < N ? Y + i * P : tailY + (i - N) * tp;        // top of row i
		const rowH = i => i < N ? P : tp;
		// the name column: full names when they fit in three tenths of the width, family names otherwise
		const nameFont = `500 ${13 * s}px ${C.sans}`;
		ctx.font = nameFont;
		let full = Math.max(...R.slice(0, N).map(r => ctx.measureText(r.name).width)) <= W * 0.3;
		const label = r => full ? r.name : r.last;
		const nameW = Math.max(...R.slice(0, N).map(r => ctx.measureText(label(r)).width));
		const bx = snap(X + nameW + 10 * s);
		ctx.font = `600 ${15 * s}px ${C.sans}`;
		const numW = ctx.measureText("89").width + 8 * s;
		const bw = X + W - bx - numW;
		const fa = faded();
		const dimmed = pick >= 0;
		ctx.textBaseline = "middle";
		// named rows
		for (let i = 0; i < N; i++) {
			const r = R[i], y = rowY(i), bh = Math.max(4 * s, Math.min(P - 6 * s, P * 0.62)), by = snap(y + (P - bh) / 2);
			const len = Math.max(q, bw * r.wins / MAX * lenOf(i));
			const on = i === pick, red = i === MM;
			ctx.globalAlpha = 1;
			ctx.font = on || red ? `600 ${13 * s}px ${C.sans}` : nameFont; ctx.textAlign = "right";
			ctx.fillStyle = dimmed && !on && !red ? C.ink2 : C.ink;
			ctx.fillText(label(r), bx - 10 * s, y + P / 2 + s * 0.5);
			ctx.fillStyle = red ? C.red : on ? C.ink : C.ink3;
			ctx.globalAlpha = dimmed && !on && !red ? 0.8 : 1;
			ctx.fillRect(bx, by, len, snap(bh));
			ctx.globalAlpha = fa; ctx.textAlign = "left";
			if (red) { ctx.font = `600 ${15 * s}px ${C.sans}`; ctx.fillStyle = C.red; }
			else { ctx.font = `${on || i === 0 ? 600 : 500} ${12.5 * s}px ${C.sans}`; ctx.fillStyle = on || i === 0 ? C.ink : C.ink2; }
			ctx.fillText(String(r.wins), bx + bw * r.wins / MAX + 6 * s, y + P / 2 + s * 0.5);
		}
		// the tail: thin bars, no names
		const solid = tp < 1.9 * s || (inImage && tp < 2.2 * s);
		const th = solid ? tp + q / 2 : Math.max(q, snap(tp * 0.6));        // under 2 px a row (small pictures) the tail is one solid shape
		for (let i = N; i < n; i++) {
			const r = R[i], on = i === pick;
			ctx.globalAlpha = dimmed && !on ? 0.8 : 1;
			ctx.fillStyle = on ? C.ink : C.ink3;
			const len = Math.max(q, bw * r.wins / MAX * lenOf(i));
			if (on) ctx.fillRect(bx, snap(rowY(i) + tp / 2 - Math.max(th, 3 * s) / 2), len, Math.max(th, 3 * s));
			else ctx.fillRect(bx, solid ? rowY(i) : snap(rowY(i)), len, th);
		}
		ctx.globalAlpha = 1;
		// the free room right of the tail's bars
		const fx = bx + bw * R[N].wins / MAX + 18 * s, fw = X + W - fx;
		const tailH = (n - N) * tp;
		let card = null;
		if (pick >= 0 && !side) {
			// the picked rider's reading, beside its row when it is in the tail, at the tail's top otherwise
			const h = readingH(ctx, pick, fw, s);
			// (above the row in the tail's lower half, so a phone's bottom bar never hides it)
			let ry = pick < N ? tailY + 4 * s : rowY(pick) + tp / 2 - (pick - N > (n - N) * 0.45 ? h + 5 * s : 12 * s);
			ry = Math.max(tailY, Math.min(Y + H - h, ry));
			if (pick >= N) {
				ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(q, s);
				const ly = snap(rowY(pick) + tp / 2) + q / 2, lx = bx + bw * R[pick].wins / MAX + 4 * s;
				ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(fx - 6 * s, ly); ctx.stroke();
			}
			drawReading(ctx, fx, ry, fw, s, pick);
			card = { x: fx, y: ry, w: fw, h };
		} else if (pick >= N) {
			// the reading is under the title: the picked bar in the tail gets its name beside it
			const ly = rowY(pick) + tp / 2, lx = bx + bw * R[pick].wins / MAX + 8 * s;
			ctx.font = `600 ${13 * s}px ${C.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "middle";
			ctx.fillText(R[pick].name, lx, Math.max(tailY + 7 * s, Math.min(Y + H - 7 * s, ly)));
		} else if (tailH > 60 * s) {
			// two grey labels: how many riders the tail holds, and the one-win riders at its end
			ctx.globalAlpha = fa * (dimmed ? 0.6 : 1); ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.textBaseline = "middle";
			ctx.font = `400 ${13 * s}px ${C.sans}`;
			const y1 = rowY(n - ONES), yEnd = rowY(n - 1) + tp;
			ctx.fillText(`${n - N} more riders`, fx, Math.max(tailY + 9 * s, (tailY + y1) / 2));
			const ox = bx + bw / MAX + 8 * s;
			ctx.strokeStyle = C.ink2; ctx.lineWidth = Math.max(q, s);
			ctx.beginPath(); ctx.moveTo(snap(ox) + q / 2, y1); ctx.lineTo(snap(ox) + q / 2, yEnd - (tp - th)); ctx.stroke();
			ctx.fillText(`${ONES} riders won one race`, ox + 8 * s, (y1 + yEnd) / 2);
			ctx.globalAlpha = 1;
		}
		return { N, P, tp, Y, H, tailY, bx, X, W, rowY, rowH, card };
	}

	function readingH(ctx, i, w, s) {
		ctx.font = `400 ${15 * s}px ${C.sans}`;
		const body = wrap(ctx, reading(i)[1], w).length;
		ctx.font = `600 ${17 * s}px ${C.sans}`;
		return wrap(ctx, reading(i)[0], w).length * 22 * s + 4 * s + body * 21 * s;
	}
	function drawReading(ctx, X, Y, w, s, i) {
		const [v, t] = reading(i);
		ctx.globalAlpha = 1; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillStyle = i === MM ? C.red : C.ink;
		const hl = wrap(ctx, v, w);
		hl.forEach((l, k) => ctx.fillText(l, X, Y + 16 * s + k * 22 * s));
		ctx.font = `400 ${15 * s}px ${C.sans}`; ctx.fillStyle = C.ink2;
		wrap(ctx, t, w).forEach((l, k) => ctx.fillText(l, X, Y + hl.length * 22 * s + 4 * s + 15 * s + k * 21 * s));
	}

	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1 / 2;
		if (!page) {
			// a shared image: the sentence, the small line, then the list
			const wide = w > h * 1.3, cw = wide ? w * 0.36 : w;
			const fs = wide ? Math.min(30 * s, w / 26) : Math.max(19 * s, Math.min(28 * s, w / 22));
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			const lines = wrap(ctx, SENTENCE, cw);
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.18));
			let used = lines.length * fs * 1.18 + 12 * s;
			ctx.font = `400 ${11.5 * s}px ${C.sans}`; ctx.fillStyle = C.ink2;
			const sm = wrap(ctx, SMALL, cw);
			sm.forEach((l, i) => ctx.fillText(l, x, y + used + 12 * s + i * 16 * s));
			used += sm.length * 16 * s + 26 * s;
			if (wide) plot(ctx, x + cw + 40 * s, y, w - cw - 40 * s, h, s, q, -1, true);
			else plot(ctx, x, y + used, w, h - used, s, q, -1, true);
			return null;
		}
		const head = page.head, gut = head ? page.gut : Math.max(16 * s, page.gut);
		if (head) {
			const ax = head.x + head.w + 48 * s, aw = x + w - gut - ax;
			// the reading under the title block when it fits there, in the tail's free room otherwise
			let side = false;
			if (sel >= 0) {
				const ry = head.y + head.h + 28 * s;
				side = ry + readingH(ctx, sel, head.w, s) < y + h - 12 * s;
				if (side) drawReading(ctx, head.x, ry, head.w, s, sel);
			}
			return plot(ctx, ax, y + 20 * s, aw, h - 36 * s, s, q, sel, side);
		}
		return plot(ctx, x + gut, y + 6 * s, w - 2 * gut, h - 12 * s, s, q, sel, false);
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
	Promise.all([`600 17px ${C.sans}`, `500 13px ${C.sans}`, `400 15px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?r=rossi: a rider; nothing is the overview. The bare "marquez" is Marc.
	const q0 = CD.state.get("r") || "";
	sel = R.findIndex(r => r.slug === (q0 === "marquez" ? "marc-marquez" : q0));
	const pick = CD.selection({ initial: sel, key: "r", encode: i => R[i].slug, onChange: i => { sel = i; if (i >= 0) grow = 1; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the row under the pointer, the nearest one in the tail; the pinned one again, or outside the list, goes back
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			let i = -1;
			if (mx >= lay.X - 8 && mx <= lay.X + lay.W + 8) {
				if (my >= lay.Y && my < lay.Y + lay.N * lay.P) i = Math.floor((my - lay.Y) / lay.P);
				else if (my >= lay.tailY - 4 && my <= lay.Y + lay.H + 6) i = Math.max(lay.N, Math.min(n - 1, lay.N + Math.floor((my - lay.tailY) / lay.tp)));
			}
			return e.type === "pointerdown" && i === pick.pinned ? -1 : i;
		},
		// arrows step down and up the list, most wins first, and wrap
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : n - 1) : (from + dir + n) % n
	});
	if (sel >= 0) grow = 1;
	if (grow < 1) {
		const t0 = performance.now() + 250;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1500)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow, sv = sel; grow = 1; sel = -1; inImage = true; draw(c, x, y, w, h, u * (w > h * 1.3 ? 1.6 : 1.5), true, null); grow = g; sel = sv; inImage = false; } };
})();
