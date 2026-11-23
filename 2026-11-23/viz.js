// 2026-11-23 — one circle for each of 2,361 counties in the 36 states that had a Senate or governor's
// race in both 2022 and 2026: across, how the county voted for president in 2024 (Harris to the left,
// Trump to the right); up, the change in the votes it cast from the 2022 midterms to the 2026
// midterms; its size, the votes it cast in the 2022 midterms. Hairlines cut the plot into seven
// bands by the 2024 margin, and a stepped line gives each band's counties added together. That line
// is the one accent idea: orange on the white page, the kit's green on the black one (a chart about
// parties never uses red; the owner chose orange for this day, where green sank into the grey
// circles). Picking a circle reads that county and lights up the rest of its state; on wide screens
// the states are listed under the title and can be picked there.
(function () {
	const C = CD.colors, D = window.COUNTIES;
	// b0 = the votes cast in the 2022 midterms, the circle's size; t = in 2026; v0 = the 2024 presidential votes
	const rows = D.rows.map(r => ({ fips: r[0], name: r[1], st: r[2], m: r[3], v0: r[4], b0: r[5], t: r[6], open: !!r[7], p: r[6] / r[5] * 100 }));
	const N = rows.length, VMAX = Math.max(...rows.map(r => r.b0));
	const big = rows.map((_, i) => i).sort((a, b) => rows[b].b0 - rows[a].b0);       // drawn largest first, so small circles stay on top
	const firsts = []; rows.forEach((r, i) => { if (!i || rows[i - 1].st !== r.st) firsts.push(i); });       // each state's largest county; the rows come by state, A to Z, largest first
	const ranked = Object.keys(D.states).sort((a, b) => D.states[b] - D.states[a]);
	const X0 = -80, X1 = 96, EDGES = [-40, -20, 0, 20, 40, 60];
	const Y0 = 70, Y1 = 160, GRID = [80, 90, 100, 110, 120, 130, 140, 150];       // every county fits: the lowest is −28%, the highest +57%
	const DAY_ACCENT = "#F26B0F";
	const fmt = n => n.toLocaleString("en-US");
	// the change in votes cast: 112 votes for every 100 is "+12%"
	const delta = p => Math.sign(p - 100) * Math.round(Math.abs(p - 100));
	const chg = p => { const v = delta(p); return (v < 0 ? "−" : v > 0 ? "+" : "") + Math.abs(v) + "%"; };
	const fewer = p => { const v = delta(p); return v ? `${Math.abs(v)}% ${v < 0 ? "fewer" : "more"} votes` : "as many votes"; };
	const lean = m => Math.abs(m) < 0.5 ? "Even" : `${m < 0 ? "Harris" : "Trump"} +${Math.abs(m).toFixed(0)}`;

	// the reading: sel = a county, or -1 for the overview
	let sel = -1;
	// the opening motion, once on load (NEXT.md, "Opening motion"): grow runs 0 to 1; the circles come
	// in from the Harris side to the Trump side, the line is drawn the same way after them, and the
	// numbers fade in last. Still under reduced motion.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const clamp01 = v => Math.min(1, Math.max(0, v));
	const arrived = u => 1 - Math.pow(1 - clamp01((grow / 0.7 * 1.3 - u) / 0.3), 3);
	const drawn = () => clamp01((grow - 0.4) / 0.45);
	const faded = () => clamp01((grow - 0.85) / 0.15);

	const sentence = () => "Turnout rose from the 2022 midterms to 2026, most in counties Harris won and least where Trump had done best";
	const small = () => "Each circle is a county: the change in votes cast between the 2022 and 2026 midterms · Line: the counties between two hairlines, added together · AP via NPR";
	const context = r => `${fewer(r.p)} in 2026 than in 2022 · ${lean(r.m)} in 2024 · ${fmt(r.b0)} votes in 2022, ${fmt(r.t)} in 2026${r.open ? " · AP’s count not final" : ""}`;
	function readout() {
		if (sel < 0) return [sentence(), `Counties Harris won cast ${fewer(D.harris)} than in 2022 · Counties Trump won by 60 points or more cast ${fewer(D.trump60)}`];
		const r = rows[sel];
		return [`${r.name}, ${D.names[r.st]}: ${fewer(r.p)} in 2026 than in 2022`, `${lean(r.m)} in 2024 · ${fmt(r.b0)} votes in 2022, ${fmt(r.t)} in 2026 · ${D.names[r.st]} as a whole: ${chg(D.states[r.st])}`];
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
	// lie over the top left, so the plot takes the room to their right and the states are listed under
	// them. A shared image has no title, so the drawing carries the sentence and one small line
	// instead. page = { head, gut, dpr }.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1, px1 = Math.max(q, s);
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`;
		const head = page ? page.head : null, la = faded();
		const inset = page ? (head ? page.gut : 8 * s) : 0;
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round";
		let rx = x + inset, ry = y + (page ? 4 * s : 0), rw = w - 2 * inset, rh = h - (page ? 8 * s : 0);
		const list = [], cur = sel >= 0 ? rows[sel].st : null;

		// ---- a shared image: the sentence and one small line; beside the plot when the image is wide
		if (!page) {
			const wide = w > h * 1.3, cw = wide ? w * 0.3 : w;
			const fs = wide ? Math.min(31 * s, w / 34) : Math.max(19 * s, Math.min(29 * s, w / 22));
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink;
			const lines = wrap(ctx, sentence(), cw);
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			const sm = wrap(ctx, small().toUpperCase(), cw);
			sm.forEach((l, i) => ctx.fillText(l, x, y + lines.length * fs * 1.14 + 12 * s + 11 * s + i * 16 * s));
			const sentH = lines.length * fs * 1.14 + 12 * s + sm.length * 16 * s + 14 * s;
			if (wide) { rx = x + cw + 28 * s; rw = w - cw - 28 * s; } else { ry += sentH; rh -= sentH; }
		}

		// ---- the page on a wide screen: the states under the title, the largest rise first
		if (head) {
			rx = head.x + head.w + 32 * s; rw = x + w - inset - rx;
			const ly = head.y + head.h + 30 * s, room = y + h - 10 * s - ly, per = Math.ceil(ranked.length / 2);
			const rowH = Math.min(19 * s, (room - 22 * s) / per);
			if (rowH >= 14.5 * s) {
				ctx.font = mono; ctx.fillStyle = C.ink2; ctx.fillText("CHANGE IN VOTES CAST, 2022 TO 2026, BY STATE", head.x, ly);
				const colW = (head.w - 24 * s) / 2;
				ranked.forEach((st, i) => {
					const cx = head.x + (i >= per ? colW + 24 * s : 0), y0 = ly + 10 * s + (i % per) * rowH, cy = y0 + rowH / 2;
					if (st === cur) { ctx.fillStyle = C.rule; ctx.globalAlpha = 0.6; ctx.fillRect(cx - 5 * s, y0, colW + 10 * s, rowH); ctx.globalAlpha = 1; }
					ctx.textBaseline = "middle"; ctx.font = st === cur ? monoB : mono; ctx.fillStyle = C.ink;
					ctx.textAlign = "left"; ctx.fillText(D.names[st].toUpperCase(), cx, cy + 0.5 * s);
					ctx.textAlign = "right"; ctx.fillText(chg(D.states[st]), cx + colW, cy + 0.5 * s);
					list.push({ st, x0: cx - 5 * s, x1: cx + colW + 5 * s, y0, y1: y0 + rowH });
				});
				ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			}
		}

		const halo = (text, tx, ty, font, color, align = "left") => {
			ctx.font = font; ctx.textAlign = align; ctx.strokeStyle = C.paper; ctx.lineWidth = 4 * s;
			ctx.strokeText(text, tx, ty); ctx.fillStyle = color; ctx.fillText(text, tx, ty); ctx.textAlign = "left";
		};

		// ---- the plot
		const gutL = 36 * s, padT = 24 * s, padB = 38 * s;
		const X = rx + gutL, Y = ry + padT, PW = rw - gutL - 2 * s, PH = rh - padT - padB;
		const px = m => X + (m - X0) / (X1 - X0) * PW, py = p => Y + (Y1 - Math.min(Y1, Math.max(Y0, p))) / (Y1 - Y0) * PH;
		const RMAX = Math.min(38 * s, Math.max(10 * s, Math.min(PW, PH) * 0.085)), rad = v => Math.max(1.15 * s, RMAX * Math.sqrt(v / VMAX));
		const color = C.dark ? C.green : DAY_ACCENT;

		// what the scale counts
		ctx.font = mono; ctx.fillStyle = C.ink2;
		ctx.fillText(PW >= 330 * s ? "CHANGE IN VOTES CAST, 2022 MIDTERMS TO 2026 MIDTERMS" : "CHANGE IN VOTES CAST SINCE 2022", rx, ry + 12 * s);

		// the grid: a hairline every ten percent, a darker one at no change, and one at each edge of the seven bands
		ctx.lineWidth = px1;
		for (const v of GRID) {
			const gy = Math.round(py(v) / q) * q + px1 / 2;
			ctx.strokeStyle = v === 100 ? C.ink3 : C.rule;
			ctx.beginPath(); ctx.moveTo(X, gy); ctx.lineTo(X + PW, gy); ctx.stroke();
		}
		for (const m of EDGES) {
			const gx = Math.round(px(m) / q) * q + px1 / 2;
			ctx.strokeStyle = m ? C.rule : C.ink3; ctx.beginPath(); ctx.moveTo(gx, Y); ctx.lineTo(gx, Y + PH + 4 * s); ctx.stroke();
		}

		// the counties. With a county picked, its state stands out and the rest step back
		const pos = new Float32Array(N * 3);
		ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.6 * s;
		for (const i of big) {
			const r = rows[i], cx = px(r.m), cy = py(r.p), rr = rad(r.b0) * arrived((r.m - X0) / (X1 - X0));
			pos[i * 3] = cx; pos[i * 3 + 1] = cy; pos[i * 3 + 2] = rr;
			if (rr <= 0) continue;
			const mine = cur && r.st === cur;
			ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832);
			ctx.globalAlpha = cur ? (mine ? 0.5 : 0.05) : 0.13; ctx.fill();
			if (!cur || mine) { ctx.globalAlpha = cur ? 0.9 : 0.3; ctx.stroke(); }
		}
		ctx.globalAlpha = 1;

		// the stepped line: each band's counties added together, drawn from the Harris side to Trump's
		ctx.save(); ctx.beginPath(); ctx.rect(X - 4 * s, Y - 8 * s, (PW + 8 * s) * drawn(), PH + 16 * s); ctx.clip();
		ctx.lineJoin = "miter"; ctx.beginPath();
		D.bins.forEach((b, i) => { const xa = px(Math.max(b.lo, X0)), xb = px(Math.min(b.hi, X1)), yy = py(b.per100); i ? ctx.lineTo(xa, yy) : ctx.moveTo(xa, yy); ctx.lineTo(xb, yy); });
		ctx.strokeStyle = C.paper; ctx.lineWidth = 7 * s; ctx.stroke();
		ctx.strokeStyle = color; ctx.lineWidth = 3 * s; ctx.stroke();
		ctx.restore(); ctx.lineJoin = "round";
		// its numbers, one above each step, and what the line is, above its start and clear of the next steps' numbers
		ctx.globalAlpha = la;
		const pc = px(20) - px(0) >= 50 * s ? "%" : "";       // narrow bands: the scale beside them carries the sign
		D.bins.forEach(b => halo(chg(b.per100).replace("%", pc), (px(Math.max(b.lo, X0)) + px(Math.min(b.hi, X1))) / 2, py(b.per100) - 8 * s, `600 ${15 * s}px ${C.sans}`, color, "center"));
		const lift = Math.max(...D.bins.slice(0, 3).map(b => b.per100));
		halo(PW >= 420 * s ? "ALL COUNTIES TOGETHER, BAND BY BAND" : "ALL COUNTIES TOGETHER", X + 4 * s, py(lift) - 30 * s, monoB, color);
		ctx.globalAlpha = 1;

		// the scale's numbers, left of the plot; the bands' edges and what they are, under it
		ctx.font = mono; ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.textBaseline = "middle";
		for (const v of GRID) ctx.fillText(v === 100 ? "0%" : chg(v), X - 6 * s, py(v) + 0.5 * s);
		ctx.textBaseline = "alphabetic"; ctx.textAlign = "center";
		const ay = Y + PH + 16 * s;
		const ticks = PW >= 470 * s ? [[-40, "HARRIS +40"], [-20, "+20"], [0, "EVEN"], [20, "+20"], [40, "+40"], [60, "TRUMP +60"]] : [[-40, "HARRIS +40"], [0, "EVEN"], [40, "TRUMP +40"]];
		ticks.forEach(([m, t]) => ctx.fillText(t, px(m), ay));
		ctx.fillText(PW >= 330 * s ? "HOW THE COUNTY VOTED FOR PRESIDENT IN 2024" : PW >= 250 * s ? "THE COUNTY’S VOTE FOR PRESIDENT, 2024" : "COUNTY’S 2024 VOTE", X + PW / 2, ay + 16 * s);
		ctx.textAlign = "left";

		// what a circle's size means, in the corner no county reaches
		const k1 = rad(1e6), k2 = rad(1e5), kx = X + 6 * s + k1, kb = Y + PH - 8 * s;
		ctx.strokeStyle = C.ink2; ctx.lineWidth = px1; ctx.globalAlpha = la;
		for (const kr of [k1, k2]) { ctx.beginPath(); ctx.arc(kx, kb - kr, kr, 0, 6.2832); ctx.stroke(); }
		ctx.font = mono; ctx.fillStyle = C.ink2;
		ctx.fillText(PW >= 300 * s ? "1 MILLION VOTES IN 2022" : "1 MILLION VOTES", kx + k1 + 8 * s, kb - 1 * s - Math.max(15 * s, k1 * 2 - 10 * s));
		ctx.fillText("100,000", kx + k1 + 8 * s, kb - 1 * s);
		ctx.globalAlpha = 1;

		// the reading: the picked county ringed, and its figures beside it
		if (sel >= 0) {
			const r = rows[sel], cx = pos[sel * 3], cy = pos[sel * 3 + 1], rr = Math.max(pos[sel * 3 + 2], 3 * s);
			ctx.strokeStyle = C.paper; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(cx, cy, rr + 1.5 * s, 0, 6.2832); ctx.stroke();
			ctx.strokeStyle = C.ink; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.arc(cx, cy, rr + 1.5 * s, 0, 6.2832); ctx.stroke();
			CD.label(ctx, cx + rr, cy, `${r.name}, ${r.st}`, context(r), s, { x: X + 2 * s, y: Y, w: PW - 4 * s, h: PH }, cx - rr);
		}
		return { pos, list };
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
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?c=48201: the county being read, by its FIPS code; anything else, the overview
	sel = rows.findIndex(r => r.fips === CD.state.get("c"));
	const pick = CD.selection({ initial: sel, key: "c", encode: i => rows[i].fips, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// a state in the list picks its largest county; otherwise the smallest circle under the pointer;
		// the pinned county (or its state) again, or empty ground, goes back to the overview
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, press = e.type === "pointerdown";
			const row = lay.list.find(q => mx >= q.x0 && mx < q.x1 && my >= q.y0 && my < q.y1);
			if (row) return press && pick.pinned >= 0 && rows[pick.pinned].st === row.st ? -1 : firsts.find(i => rows[i].st === row.st);
			let best = -1, br = Infinity;
			for (let i = 0; i < N; i++) {
				const rr = lay.pos[i * 3 + 2], d = Math.hypot(mx - lay.pos[i * 3], my - lay.pos[i * 3 + 1]);
				if (d <= rr + 5 && rr < br) { best = i; br = rr; }
			}
			return press && best === pick.pinned ? -1 : best;
		},
		// arrows step through the states, A to Z, reading each one's largest county, and wrap
		step: (from, dir) => {
			if (from < 0) return firsts[dir > 0 ? 0 : firsts.length - 1];
			const k = firsts.findIndex(i => rows[i].st === rows[from].st);
			return firsts[(k + dir + firsts.length) % firsts.length];
		}
	});
	// the opening motion ends at once when the reader picks something
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1900)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// the image is always the finished picture, even while the opening motion is still running
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * (w > h * 1.3 ? 2 : 1.6), true, null); grow = g; } };
})();
