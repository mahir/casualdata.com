// 2026-11-06 — the 2026 electorate as a town of 100 people.
// Each person stands for 1% of the voting-eligible population. Voters are split by their
// share of the national House vote; everyone else stayed home. Counts are rounded with the
// largest-remainder method so they add up to exactly 100.
(function () {
	const C = CD.colors, D = window.TOWN;
	const turnout = D.turnout / 100;
	// Without a national House tally the town has two groups: voted, and stayed home.
	// With one (D.house), the voters split by party and the red people are the House margin.
	const split = !!D.house;
	const tot = split ? D.house.dem + D.house.rep + D.house.other : 1;
	const raw = split ? [
		{ k: "home", name: "Stayed home", v: (1 - turnout) * 100 },
		{ k: "dem", name: "Voted Democratic", v: turnout * D.house.dem / tot * 100 },
		{ k: "rep", name: "Voted Republican", v: turnout * D.house.rep / tot * 100 },
		{ k: "other", name: "Voted for someone else", v: turnout * D.house.other / tot * 100 }
	] : [
		{ k: "home", name: "Stayed home", v: (1 - turnout) * 100 },
		{ k: "voted", name: "Voted", v: turnout * 100 }
	];
	raw.forEach(g => { g.n = Math.floor(g.v); g.r = g.v - g.n; });
	let left = 100 - raw.reduce((a, g) => a + g.n, 0);
	raw.slice().sort((a, b) => b.r - a.r).forEach(g => { if (left > 0) { g.n++; left--; } });
	const groups = raw.filter(g => g.n > 0);
	const home = raw[0].n, voted = 100 - home;
	const dem = split ? raw[1].n : 0, rep = split ? raw[2].n : 0;
	// the red people: the House margin when we have it; otherwise how many more of the 100
	// voted than in 2022 (54 stayed home then), drawn as the last voters in
	const home2022 = Math.round(100 - D.turnout2022);
	const margin = split ? Math.abs(dem - rep) : Math.max(0, home2022 - home);
	const lead = split ? (dem > rep ? "dem" : "rep") : "voted";
	const perPerson = D.eligible / 100;
	const millions = v => `${(v / 1e6).toFixed(1)} million`;

	// people, in group order; the margin is the last few people of the larger party
	const people = [];
	groups.forEach(g => { for (let i = 0; i < g.n; i++) people.push({ g, red: g.k === lead && i >= g.n - margin }); });

	let sel = -1;                                 // hovered group index
	let walk = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;

	function readout() {
		if (sel < 0) return split
			? [`${voted} of 100 voted`, `${home} stayed home · the House margin is ${margin}`]
			: [`${home} of 100 stayed home`, `${voted} voted, ${margin} more than in 2022 · each person is about 2.5 million`];
		const g = groups[sel];
		return [`${g.name}: ${g.n} of 100`, `about ${millions(g.v / 100 * D.eligible)} people`];
	}

	// a person: a round head on a rounded body
	function person(ctx, cx, cy, u, fill, stroke) {
		const hr = u * 0.2, bw = u * 0.56, bh = u * 0.42, by = cy + u * 0.02;
		ctx.beginPath(); ctx.arc(cx, cy - u * 0.24, hr, 0, Math.PI * 2);
		ctx.roundRect(cx - bw / 2, by, bw, bh, [bw / 2, bw / 2, u * 0.06, u * 0.06]);
		if (fill) { ctx.fillStyle = fill; ctx.fill(); }
		if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, u * 0.05); ctx.stroke(); }
	}

	// ---------- drawing, shared by the screen and the PNG ----------
	function draw(ctx, x, y, w, h, s) {
		const labelH = 64 * s, gapCols = 1.4;
		// pick the number of rows that makes people largest while every group fits
		let best = null;
		for (let R = 1; R <= 30; R++) {
			const cols = groups.reduce((a, g) => a + Math.ceil(g.n / R), 0) + gapCols * (groups.length - 1);
			const cell = Math.min((h - labelH) / R, w / cols);
			if (!best || cell > best.cell) best = { R, cell, cols };
		}
		const { R, cell } = best;
		const totalW = best.cols * cell, ox = x + (w - totalW) / 2, oy = y + (h - labelH - R * cell) / 2;
		const boxes = [];
		let cx = ox, pi = 0;
		groups.forEach((g, gi) => {
			const cols = Math.ceil(g.n / R), on = gi === sel;
			for (let i = 0; i < g.n; i++, pi++) {
				const p = people[pi], c = Math.floor(i / R), r = i % R;
				const tx = cx + (c + 0.5) * cell, ty = oy + (R - r - 0.5) * cell;     // fill from the bottom up
				// on load everyone starts in one crowd in the middle and walks to their group
				const sx = x + w / 2 + ((pi * 37) % 23 - 11) * cell * 0.5, sy = oy + R * cell / 2 + ((pi * 53) % 13 - 6) * cell * 0.4;
				const px = sx + (tx - sx) * walk, py = sy + (ty - sy) * walk;
				const u = cell * 0.9;
				if (p.red) person(ctx, px, py, u, C.red);
				else if (g.k === "home") person(ctx, px, py, u * 0.94, null, on ? C.ink : C.ink2);
				else if (g.k === "other") person(ctx, px, py, u, C.ink3);
				else person(ctx, px, py, u, g.k === "rep" ? C.ink2 : C.ink);
			}
			const gw = cols * cell;
			boxes.push({ x: cx, w: gw, gi });
			if (walk === 1) {
				ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
				const ly = oy + R * cell + 22 * s;
				ctx.font = `400 ${Math.min(17 * s, Math.max(11 * s, gw / 7))}px ${C.sans}`; ctx.fillStyle = C.ink;
				ctx.fillText(String(g.n), cx + cell * 0.1, ly);
				ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = on ? C.ink : C.ink2;
				const words = { home: "STAYED HOME", voted: "VOTED", dem: "DEMOCRATIC", rep: "REPUBLICAN", other: "OTHER" }[g.k];
				ctx.fillText(gw > ctx.measureText(words).width || g.k !== "other" ? words : "", cx + cell * 0.1, ly + 15 * s);
			}
			cx += gw + gapCols * cell;
		});

		// note the margin
		if (walk === 1 && margin > 0) {
			const b = boxes[groups.findIndex(g => g.k === lead)];
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			const note = split ? `${margin} IN RED: THE HOUSE MARGIN` : `${margin} IN RED: MORE THAN VOTED IN 2022`;
			const nx = Math.min(b.x + cell * 0.1, x + w - ctx.measureText(note).width);   // stay inside the picture
			ctx.fillText(note, nx, oy + R * cell + 52 * s);
		}

		if (sel >= 0 && walk === 1) {
			const b = boxes[sel], [value, context] = readout();
			CD.label(ctx, b.x + b.w, oy + R * cell * 0.4, value, context, s, { x, y, w, h }, b.x);
		}
		ctx.textAlign = "left";
		return { boxes, oy, cell, R };
	}

	// ---------- screen ----------
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
	if (walk < 1) {
		const t0 = performance.now() + 300;
		const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 1100)); walk = k < 1 ? 1 - Math.pow(1 - k, 3) : 1; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}

	function pick(e) {
		if (!geo) return;
		const r = cv.getBoundingClientRect(), px = e.clientX - r.left;
		const b = geo.boxes.find(b => px >= b.x - geo.cell * 0.5 && px <= b.x + b.w + geo.cell * 0.5);
		const i = b ? b.gi : -1;
		if (i !== sel) { sel = i; schedule(); }
	}
	cv.addEventListener("pointermove", pick);
	cv.addEventListener("pointerdown", pick);
	cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { sel = -1; schedule(); } });
	cv.addEventListener("keydown", e => {
		if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
			e.preventDefault();
			const n = groups.length; sel = sel < 0 ? 0 : (sel + (e.key === "ArrowRight" ? 1 : -1) + n) % n; schedule();
		}
		if (e.key === "Escape") { sel = -1; schedule(); }
	});

	// the image is always the finished picture, even if people are still walking on screen
	CD.exporter = { draw: (c, x, y, w, h, u) => { const k = walk; walk = 1; draw(c, x, y, w, h, u * 1.6); walk = k; } };
	CD.town = { groups, margin, perPerson };
})();
