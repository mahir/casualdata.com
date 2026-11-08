// 2026-11-07 — ballot measures, grouped by issue, against the party vote.
// Each measure's gap: the share that took the side Democrats campaigned for, minus Harris's share
// of the state's two-party vote for president in 2024. A positive gap means the state voted more
// liberally on the issue than it voted for president; negative, more conservatively.
// Left is liberal, as on 5 Nov. One row per issue; the abortion row is the one red idea.
(function () {
	const C = CD.colors;
	const GROUPS = [
		{ key: "abortion", name: "Abortion rights", topics: ["abortion"] },
		{ key: "trans", name: "Transgender policy", topics: ["transgender policy"] },
		{ key: "taxes", name: "Taxes", topics: ["taxes", "taxes/education"] },
		{ key: "voting", name: "Voting and elections", topics: ["voting rules", "ranked-choice voting", "redistricting"] },
		{ key: "other", name: "Everything else", topics: null },
	];
	const groupOf = t => GROUPS.findIndex(g => g.topics && g.topics.includes(t)) + 1 || GROUPS.length;
	const pts = window.MEASURES.filter(m => m.dside && window.PRES24[m.s]).map(m => {
		const [t, h] = window.PRES24[m.s];
		const harris = h / (h + t) * 100;
		const dem = (m.dside === "yes" ? m.yes : m.no) / (m.yes + m.no) * 100;
		return { ...m, harris, dem, gap: dem - harris, g: groupOf(m.topic) - 1 };
	});
	GROUPS.forEach((g, k) => {
		const mine = pts.filter(p => p.g === k), lib = mine.filter(p => p.gap > 0).length, n = mine.length;
		g.n = n; g.lib = lib; g.con = n - lib;
		g.avg = mine.reduce((a, p) => a + p.gap, 0) / n;
		g.sum = lib === n ? `ALL ${n} MORE LIBERAL` : lib === 0 ? `ALL ${n} MORE CONSERVATIVE`
			: lib > n - lib ? `${lib} OF ${n} MORE LIBERAL` : lib < n - lib ? `${n - lib} OF ${n} MORE CONSERVATIVE` : `SPLIT ${lib}–${n - lib}`;
		g.short = lib === n ? `ALL ${n} ←` : lib === 0 ? `ALL ${n} →` : lib > n - lib ? `${lib}/${n} ←` : `${n - lib}/${n} →`;
	});
	const HERO = 0;                                              // the abortion row carries the red
	const LIB = 26, CON = 20;                                    // points; left = more liberal

	let sel = -1;                                                // the chosen measure, -1 = the overview; read from ?m= below
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const pct = v => `${Math.round(v)}%`;
	const pts1 = v => { const n = Math.round(Math.abs(v)); return `${n} pt${n === 1 ? "" : "s"}`; };
	const result = p => p.passed ? "passed" : p.passed === false ? "failed" : "still counting";

	function readout() {
		if (sel < 0) {
			const a = GROUPS[0], t = GROUPS[1];
			return [`Abortion rights ran ahead of Harris in all ${a.n} states`, `transgender limits ran ahead of Trump in all ${t.n}`];
		}
		const p = pts[sel];
		return [`${p.stateName}: ${p.label}`,
			`${pts1(p.gap)} more ${p.gap > 0 ? "liberal" : "conservative"} than the state's 2024 vote · ${result(p)}`];
	}

	function draw(ctx, x, y, w, h, s) {
		const narrow = w < 560 * s;
		const T = 30 * s, B = 26 * s, padX = 6 * s;
		const x0 = x + padX, pw = w - 2 * padX, y0 = y + T, ph = h - T - B;
		const X = v => x0 + (LIB - v) / (LIB + CON) * pw;          // +gap (liberal) to the left
		const rh = ph / GROUPS.length;
		const head = Math.max(15 * s, Math.min(24 * s, rh * 0.2));
		const r = Math.max(3.5 * s, Math.min(6 * s, rh * 0.06));
		const zx = X(0);

		// scale
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "alphabetic";
		for (const t of [20, 10, -10]) {
			ctx.fillStyle = C.rule; ctx.fillRect(Math.round(X(t)), y0, 1, ph);
			ctx.fillStyle = C.ink2; ctx.textAlign = "center";
			ctx.fillText(t === 20 && !narrow ? `${t} PTS` : `${Math.abs(t)}`, X(t), y0 + ph + 18 * s);
		}
		ctx.fillStyle = C.ink2; ctx.textAlign = "center";
		ctx.fillText(narrow ? "SAME" : "SAME AS FOR PRESIDENT", zx, y0 + ph + 18 * s);
		ctx.textAlign = "right"; ctx.fillText(narrow ? "← MORE LIBERAL" : "← MORE LIBERAL THAN THE STATE VOTED IN 2024", zx - 10 * s, y0 - 14 * s);
		ctx.textAlign = "left"; ctx.fillText(narrow ? "CONSERVATIVE →" : "MORE CONSERVATIVE →", zx + 10 * s, y0 - 14 * s);

		// the zero line, the one reference; headings and dots are drawn over it
		ctx.fillStyle = C.ink; ctx.fillRect(zx - 0.75 * s, y0 - 6 * s, 1.5 * s, ph + 12 * s);

		// rows
		const placed = [], texts = [];                      // texts: every heading and summary, which the reading chip keeps clear of
		const backed = (str, tx, ty, size) => {               // text on a page-coloured backing, so no line runs through it
			const tw = ctx.measureText(str).width, lx = ctx.textAlign === "right" ? tx - tw : tx;
			texts.push({ x: lx - 4 * s, y: ty - 2 * s, w: tw + 8 * s, h: size + 4 * s });
			const col = ctx.fillStyle; ctx.fillStyle = C.paper; ctx.fillRect(lx - 4 * s, ty - 2 * s, tw + 8 * s, size + 4 * s);
			ctx.fillStyle = col; ctx.fillText(str, tx, ty);
		};
		GROUPS.forEach((g, k) => {
			const ry = y0 + k * rh;
			if (k) { ctx.fillStyle = C.rule; ctx.fillRect(x0, Math.round(ry), pw, 1); }
			// heading: the issue, and how its measures leaned (beside it, or under it on phones)
			ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillStyle = C.ink;
			ctx.font = `400 ${head}px ${C.sans}`;
			const hy = ry + 8 * s;
			backed(g.name, x0, hy, head);
			const nameW = ctx.measureText(g.name).width;
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = k === HERO ? C.ink : C.ink2;
			const beside = !narrow && x0 + nameW + 24 * s + ctx.measureText(g.sum).width < x0 + pw;
			let top = hy + head;
			if (beside) { ctx.textAlign = "right"; backed(g.sum, x0 + pw, hy + (head - 11.5 * s) * 0.6, 11.5 * s); }
			else { backed(g.sum, x0, hy + head + 4 * s, 11.5 * s); top += 4 * s + 11.5 * s; }

			// a beeswarm along the axis: each dot takes the nearest free slot to the row's centre line
			const band0 = top + 6 * s, band1 = ry + rh - 6 * s, cy = (band0 + band1) / 2, half = Math.max(r, (band1 - band0) / 2 - r * 0.5);
			const mine = pts.map((p, i) => i).filter(i => pts[i].g === k).sort((a, b) => pts[b].gap - pts[a].gap);
			const here = [];
			for (const i of mine) {
				const px = X(pts[i].gap * grow);
				let py = cy;
				for (let step = 0; step < 80; step++) {
					const off = Math.ceil(step / 2) * (r * 0.5) * (step % 2 ? -1 : 1);
					if (Math.abs(off) > half) break;
					const cand = cy + off;
					if (!here.some(q => (q.x - px) ** 2 + (q.y - cand) ** 2 < (2 * r + 1.5 * s) ** 2)) { py = cand; break; }
				}
				here.push({ x: px, y: py, i }); placed[i] = { x: px, y: py };
			}
			for (const q of here) {
				const red = k === HERO, on = q.i === sel;
				ctx.beginPath(); ctx.arc(q.x, q.y, red || on ? r * 1.15 : r, 0, Math.PI * 2);
				ctx.fillStyle = red ? C.red : on ? C.ink : C.ink2; ctx.fill();
				ctx.lineWidth = 1.5 * s; ctx.strokeStyle = on && !red ? C.ink : C.paper; ctx.stroke();
				// the chosen dot gets a ring, so it reads as chosen in a row of look-alikes
				if (on) { ctx.beginPath(); ctx.arc(q.x, q.y, r * 1.15 + 4 * s, 0, Math.PI * 2); ctx.lineWidth = 1.5 * s; ctx.strokeStyle = C.ink; ctx.stroke(); }
			}
		});
		// state codes on the far dots of each row, where there is room
		if (grow === 1) {
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle";
			// a code must sit clear of every other dot, or it could be read as that dot's
			const th = 12 * s, gap = r + 5 * s;
			const taken = placed.filter(Boolean).map(q => ({ x: q.x - gap, y: q.y - r * 0.8, w: 2 * gap, h: 1.6 * r }));
			const free = b => b.x >= x0 && b.x + b.w <= x0 + pw && !taken.some(t => b.x < t.x + t.w && t.x < b.x + b.w && b.y < t.y + t.h && t.y < b.y + b.h);
			// per row, the two most extreme measures on each side, if they are far from the line
			const ends = [];
			GROUPS.forEach((g, k) => [1, -1].forEach(side => ends.push(...pts.map((p, i) => i)
				.filter(i => pts[i].g === k && pts[i].gap * side >= (narrow ? 12 : 8))
				.sort((a, b) => Math.abs(pts[b].gap) - Math.abs(pts[a].gap)).slice(0, k === HERO ? 9 : narrow ? 1 : 2))));
			const idx = [...(sel >= 0 ? [sel] : []), ...ends.filter(i => i !== sel)];
			for (const i of idx) {
				const p = pts[i], q = placed[i], tw = ctx.measureText(p.s).width;
				const out = p.gap > 0 ? -1 : 1;                       // the far side of the dot first
				const self = taken.findIndex(t => t.x === q.x - gap && t.y === q.y - r * 0.8);
				const mine = taken.splice(self, 1);                   // a dot does not block its own code
				// outer side only: a code between two dots could belong to either
				const box = (p.g === HERO ? [0, -th, th] : [0]).map(dy => ({ x: q.x + out * (r + 4 * s) - (out < 0 ? tw : 0), y: q.y - th / 2 + dy, w: tw, h: th })).find(free);
				taken.push(...mine);
				if (!box) continue;
				taken.push(box);
				ctx.textAlign = "left"; ctx.fillStyle = i === sel || p.g === HERO ? C.ink : C.ink2;
				ctx.fillText(p.s, box.x, box.y + th / 2 + 0.5 * s);
			}
		}
		if (sel >= 0 && grow === 1) {
			const q = placed[sel], [value, context] = readout();
			// the chip keeps clear of the headings and of every other dot
			const dots = placed.map((o, i) => o && i !== sel ? { x: o.x - r - 2 * s, y: o.y - r - 2 * s, w: 2 * r + 4 * s, h: 2 * r + 4 * s } : null).filter(Boolean);
			CD.label(ctx, q.x + r + 4 * s, q.y, value, context, s, { x: x0, y: y0, w: pw, h: ph }, q.x - r - 4 * s, [...texts, ...dots]);
		}
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		return { placed, r };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	let geo = null, W = 0, H = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== H) { W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		geo = draw(ctx, 0, 0, W, H, 1);
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);
	if (grow < 1) {
		const t0 = performance.now() + 250;
		const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 900)); grow = k < 1 ? 1 - Math.pow(1 - k, 3) : 1; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// keys walk the rows top to bottom, liberal to conservative within each
	const order = pts.map((p, i) => i).sort((a, b) => pts[a].g - pts[b].g || pts[b].gap - pts[a].gap);
	const m0 = parseInt(CD.state.get("m"), 10);
	if (m0 >= 0 && m0 < pts.length) sel = m0;
	const pick = CD.selection({ initial: sel, key: "m", encode: i => i, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			let best = -1, bd = 20 * 20;
			geo.placed.forEach((q, i) => { if (!q) return; const d = (q.x - mx) ** 2 + (q.y - my) ** 2; if (d < bd) { bd = d; best = i; } });
			return best;
		},
		step: (from, dir) => { const k = order.indexOf(from), n = order.length; return order[k < 0 ? (dir > 0 ? 0 : n - 1) : (k + dir + n) % n]; }
	});
	// the image is always the finished picture, even if the dots are still moving out on screen
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6); grow = g; } };
	CD.measures = { pts, GROUPS };
})();
