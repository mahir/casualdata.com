// 2026-11-09 — every House seat, placed by its pre-election rating and shaded by who won it.
// Seven groups, from solid Democratic to solid Republican. A dark square is a seat a Democrat won
// or leads, a light one a Republican. The one accent idea, in green (a chart about parties never uses red): seats rated Republican that went to a
// Democrat. No seat went the other way, and every toss-up went to a Democrat.
(function () {
	const C = CD.colors;
	const seats = window.RATED;
	const GROUPS = [
		{ key: "solid-d", a: "SOLID", b: "DEM", name: "solid Democratic" },
		{ key: "likely-d", a: "LIKELY", b: "DEM", name: "likely Democratic" },
		{ key: "lean-d", a: "LEAN", b: "DEM", name: "lean Democratic" },
		{ key: "toss-up", a: "TOSS-UP", b: "", name: "a toss-up" },
		{ key: "lean-r", a: "LEAN", b: "REP", name: "lean Republican" },
		{ key: "likely-r", a: "LIKELY", b: "REP", name: "likely Republican" },
		{ key: "solid-r", a: "SOLID", b: "REP", name: "solid Republican" },
	];
	GROUPS.forEach(g => {
		g.idx = seats.map((r, i) => i).filter(i => seats[i].rating === g.key);
		g.n = g.idx.length; g.d = g.idx.filter(i => seats[i].won === "D").length; g.r = g.n - g.d;
	});
	const isUpset = r => r.rating.endsWith("-r") && r.won === "D";
	const upsets = seats.map((r, i) => i).filter(i => isUpset(seats[i]));
	const upCalled = upsets.filter(i => seats[i].status === "called").length;
	// the other way: seats rated Democratic or toss-up that a Republican won or leads
	const reverse = seats.filter(r => !r.rating.endsWith("-r") && r.won === "R").length;
	const fmt = n => n.toLocaleString("en-US");
	const party = p => p === "D" ? "D" : p === "R" ? "R" : "I";

	let sel = -1;
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;

	function readout() {
		if (sel < 0) return [`${upsets.length} seats rated Republican went to Democrats`,
			`${reverse === 0 ? "none" : reverse} rated Democratic or toss-up went to Republicans · ${upsets.length - upCalled} of the ${upsets.length} not yet called`];
		const r = seats[sel], g = GROUPS.find(g => g.key === r.rating);
		const verb = r.status === "called" ? "won" : r.status === "runoff" ? "led the first round" : "leads";
		const how = !r.l ? `${verb} unopposed` : `${verb} by ${fmt(r.m)} vote${r.m === 1 ? "" : "s"} over ${r.l} (${party(r.lp)})`;
		const st = r.status === "called" ? "" : r.status === "runoff" ? " · goes to a runoff" : " · not yet called";
		return [`${r.id} · ${r.w} (${party(r.won)})`, `rated ${g.name} · ${how}${st}`];
	}

	// the takeaway, written into the drawing: two large counts, each with what it counts
	function head(ctx, x, y, w, s) {
		const stacked = w < 620 * s, big = 44 * s;
		const pair = (px, py, num, col, l1, l2) => {
			ctx.font = `600 ${big}px ${C.sans}`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
			ctx.fillStyle = col; ctx.fillText(num, px, py + 36 * s);
			const nw = ctx.measureText(num).width;
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink;
			ctx.fillText(l1, px + nw + 10 * s, py + 17 * s);
			ctx.fillStyle = C.ink2; ctx.fillText(l2, px + nw + 10 * s, py + 33 * s);
			return px + nw + 10 * s + Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width);
		};
		const open = upsets.length - upCalled;
		const end = pair(x, y, String(upsets.length), C.green, "SEATS RATED REPUBLICAN", `WENT TO DEMOCRATS · ${open} NOT YET CALLED`);
		if (stacked) pair(x, y + 48 * s, String(reverse), C.ink, "RATED DEMOCRATIC OR TOSS-UP", "WENT TO REPUBLICANS");
		else pair(Math.max(end + 40 * s, x + w * 0.5), y, String(reverse), C.ink, "SEATS RATED DEMOCRATIC OR TOSS-UP", "WENT TO REPUBLICANS");
		return (stacked ? 96 : 48) * s;
	}

	// the key, flowing onto as many lines as it needs; returns its height. dry: measure only
	function key(ctx, x, y, w, s, dry) {
		const items = [[C.ink, "DEMOCRAT WON"], [C.ink3, "REPUBLICAN WON"], [C.green, "DEMOCRAT WON, RATED REPUBLICAN"], [null, "NOT YET CALLED"]];
		const q = 10 * s, lh = 18 * s;
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
		let cx = x, cy = y;
		for (const [col, text] of items) {
			const tw = q + 6 * s + ctx.measureText(text).width;
			if (cx > x && cx + tw > x + w) { cx = x; cy += lh; }
			if (!dry) {
				ctx.fillStyle = col || C.ink2; ctx.fillRect(cx, cy + (lh - q) / 2, q, q);
				if (!col) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(cx + q / 2, cy + lh / 2, q * 0.2, 0, Math.PI * 2); ctx.fill(); }
				ctx.fillStyle = C.ink2; ctx.fillText(text, cx + q + 6 * s, cy + lh / 2 + 0.5 * s);
			}
			cx += tw + 18 * s;
		}
		return cy - y + lh;
	}

	function draw(ctx, x, y, w, h, s) {
		const hh = head(ctx, x, y, w, s);
		const kh = key(ctx, x, 0, w, s, true);
		key(ctx, x, y + h - kh, w, s, false);
		const gy = y + hh + 22 * s, gh = h - hh - 22 * s - kh - 16 * s;
		ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		const labW = Math.max(ctx.measureText("TOSS-UP").width, ctx.measureText("LIKELY").width) + 2 * s;
		const CAP = 30 * s;

		// across: one block of columns per rating, its name above and its count below
		const TOP = 34 * s, BOT = 36 * s, GAPX = 14 * s;
		let across = { cell: 0 };
		for (let R = 4; R <= 26; R++) {
			const cols = GROUPS.map(g => Math.ceil(g.n / R));
			let cell = Math.min(CAP, (gh - TOP - BOT) / R);
			const width = c => cols.reduce((a, k) => a + Math.max(k * c, labW), 0) + GAPX * (GROUPS.length - 1);
			while (cell > 2 && width(cell) > w) cell -= 0.25;
			if (cell > across.cell) across = { cell, R, cols, width: width(cell) };
		}
		// down: one block of rows per rating, its name and count on a line above
		const LH = 20 * s, GAPY = 8 * s;
		let down = { cell: 0 };
		for (let K = 9; K <= 60; K++) {
			const rows = GROUPS.map(g => Math.ceil(g.n / K)), total = rows.reduce((a, b) => a + b, 0);
			const cell = Math.min(CAP, w / K, (gh - GROUPS.length * LH - (GROUPS.length - 1) * GAPY) / total);
			if (cell > down.cell) down = { cell, K, rows, total };
		}
		const horizontal = across.cell >= down.cell * 0.9;
		const cell = Math.max(2, horizontal ? across.cell : down.cell);
		const inset = Math.max(0.5, cell * 0.08), side = cell - 2 * inset;
		const cells = [];
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
		const texts = [];
		if (horizontal) {
			const R = across.R, blockH = R * cell;
			const oy = gy + Math.max(0, (gh - TOP - BOT - blockH) / 2), ox0 = x + Math.max(0, (w - across.width) / 2);
			let ox = ox0;
			GROUPS.forEach((g, k) => {
				const bw = Math.max(across.cols[k] * cell, labW);
				ctx.fillStyle = C.ink; ctx.fillText(g.a, ox, oy + 12 * s);
				ctx.fillStyle = C.ink2; ctx.fillText(g.b, ox, oy + 26 * s);
				const by = oy + TOP + blockH;
				ctx.fillStyle = C.ink2;
				ctx.fillText(`D ${g.d}`, ox, by + 17 * s); ctx.fillText(`R ${g.r}`, ox, by + 31 * s);
				texts.push({ x: ox, y: oy, w: bw, h: 28 * s }, { x: ox, y: by + 4 * s, w: bw, h: 30 * s });
				g.idx.forEach((i, j) => cells[i] = { x: ox + Math.floor(j / R) * cell, y: oy + TOP + (j % R) * cell });
				ox += bw + GAPX;
			});
		} else {
			const K = down.K, blockH = down.total * cell + GROUPS.length * LH + (GROUPS.length - 1) * GAPY;
			let oy = gy + Math.max(0, (gh - blockH) / 2);
			const ox = x + Math.max(0, (w - K * cell) / 2);
			GROUPS.forEach((g, k) => {
				ctx.fillStyle = C.ink; const t = `${g.a}${g.b ? " " + g.b : ""}`; ctx.fillText(t, ox, oy + 13 * s);
				ctx.fillStyle = C.ink2; ctx.fillText(`D ${g.d} · R ${g.r}`, ox + ctx.measureText(t).width + 12 * s, oy + 13 * s);
				texts.push({ x: ox, y: oy, w: K * cell, h: LH });
				g.idx.forEach((i, j) => cells[i] = { x: ox + (j % K) * cell, y: oy + LH + Math.floor(j / K) * cell });
				oy += LH + down.rows[k] * cell + GAPY;
			});
		}
		// the squares; on load the upsets start as forecast, a Republican's, and turn green one by one
		const turned = Math.round(upsets.length * grow);
		seats.forEach((r, i) => {
			const c = cells[i], up = isUpset(r);
			ctx.fillStyle = up ? (upsets.indexOf(i) < turned ? C.green : C.ink3) : r.won === "D" ? C.ink : C.ink3;
			ctx.fillRect(c.x + inset, c.y + inset, side, side);
			if (r.status !== "called" && side >= 7 * s) {
				ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(c.x + cell / 2, c.y + cell / 2, Math.max(1.2 * s, side * 0.16), 0, Math.PI * 2); ctx.fill();
			}
		});
		if (sel >= 0 && grow === 1) {
			const c = cells[sel], [value, context] = readout();
			ctx.lineWidth = 2 * s; ctx.strokeStyle = C.ink;
			ctx.strokeRect(c.x - 2 * s, c.y - 2 * s, cell + 4 * s, cell + 4 * s);
			CD.label(ctx, c.x + cell + 2 * s, c.y + cell / 2, value, context, s, { x, y: gy, w, h: gh }, c.x - 2 * s, texts);
		}
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		return { cells, cell };
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
		const t0 = performance.now() + 400;
		const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 1400)); grow = k; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	const s0 = seats.findIndex(r => r.id === CD.state.get("s"));
	if (s0 >= 0) sel = s0;
	const pick = CD.selection({ initial: sel, key: "s", encode: i => seats[i].id, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			// the square under the pointer; a finger gets the nearest one within reach
			const reach = e.pointerType === "mouse" ? 0 : Math.max(0, 14 - geo.cell / 2);
			let best = -1, bd = Infinity;
			geo.cells.forEach((c, i) => {
				const dx = Math.max(c.x - mx, 0, mx - c.x - geo.cell), dy = Math.max(c.y - my, 0, my - c.y - geo.cell), d = dx * dx + dy * dy;
				if (d <= reach * reach && d < bd) { bd = d; best = i; }
			});
			return best;
		},
		// the arrow keys walk the green seats, from lean to solid Republican
		step: (from, dir) => {
			const k = upsets.indexOf(from), n = upsets.length;
			if (k >= 0) return upsets[(k + dir + n) % n];
			const next = upsets.find(i => i > from);
			return from < 0 || next === undefined ? upsets[dir > 0 ? 0 : n - 1] : dir > 0 ? next : upsets[(upsets.indexOf(next) - 1 + n) % n];
		}
	});
	// the image is always the finished picture, even while the squares are still turning green
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6); grow = g; } };
})();
