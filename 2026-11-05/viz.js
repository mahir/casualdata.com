// 2026-11-05 — how far each Senate race moved from the state's 2024 vote for president.
// Margins are Republican minus Democrat, in points of the two-party vote for the Senate
// and of the total vote for president (as compiled for The midterm tide).
// Every arrow starts at one spine (each state's own 2024 vote) and runs as far as the state
// moved, so the picture is the count itself: thirty arrows left, one red arrow right.
(function () {
	const C = CD.colors;
	const rows = window.SENATE.map(d => {
		const sen = (d.rep - d.dem) / (d.rep + d.dem) * 100;
		return { ...d, sen, move: sen - d.pres, flip: d.won && d.won !== d.held };
	}).sort((a, b) => a.move - b.move);                       // the biggest move on top: the arrows form a wedge
	const toD = rows.filter(d => d.move < 0).length;
	const median = (() => { const m = rows.map(d => Math.abs(d.move)).sort((a, b) => a - b); return m[Math.floor(m.length / 2)]; })();
	const XMIN = -30, XMAX = 22;                               // points moved; left = toward the Democrats

	const lead = v => Math.abs(v) < 0.5 ? "even" : v > 0 ? `R +${v.toFixed(0)}` : `D +${(-v).toFixed(0)}`;
	const presLead = v => Math.abs(v) < 0.5 ? "even" : v > 0 ? `Trump +${v.toFixed(0)}` : `Harris +${(-v).toFixed(0)}`;

	// ---------- state ----------
	const q = new URLSearchParams(location.search);
	let sel = rows.findIndex(d => d.s === (q.get("s") || "").toUpperCase());   // -1 = the overview
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;   // arrows grow on load

	function readout() {
		if (sel < 0) return [`${toD} of ${rows.length} races moved toward the Democrats`, `typical move ${median.toFixed(0)} points`];
		const d = rows[sel];
		const status = d.won ? (d.flip ? "changed hands" : "held") : "still counting";
		const n = Math.round(Math.abs(d.move));
		return [`${d.name}, ${n} pt${n === 1 ? "" : "s"} ${d.move < 0 ? "to D" : "to R"}`,
			`${presLead(d.pres)} → ${lead(d.sen)} · ${status}`];
	}

	// ---------- drawing, shared by the screen and the PNG ----------
	function draw(ctx, x, y, w, h, s, narrow) {
		const T = 30 * s, B = 28 * s, x0 = x, pw = w, y0 = y + T, ph = h - T - B;
		const X = v => x0 + (v - XMIN) / (XMAX - XMIN) * pw;
		const rh = ph / rows.length, Y = i => y0 + (i + 0.5) * rh;
		const thick = Math.max(1.6 * s, Math.min(6 * s, rh * 0.34)), head = Math.max(4 * s, Math.min(11 * s, rh * 0.62));
		const zx = X(0);

		// scale: a rule every 10 points on the Democratic side, and the spine
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "alphabetic";
		for (const t of [-30, -20, -10]) {
			ctx.fillStyle = C.rule; ctx.fillRect(Math.round(X(t)), y0, 1, ph);
			ctx.fillStyle = C.ink2; ctx.textAlign = t === -30 ? "left" : "center";
			ctx.fillText(narrow && t < -10 ? `${-t}` : `${-t} PTS`, X(t), y0 + ph + 20 * s);   // phones: only the last one says PTS
		}
		ctx.fillStyle = C.ink; ctx.fillRect(zx - 0.75 * s, y0 - 8 * s, 1.5 * s, ph + 16 * s);
		ctx.textAlign = "center"; ctx.fillStyle = C.ink2;
		ctx.fillText(narrow ? "2024" : "2024 VOTE FOR PRESIDENT", zx, y0 + ph + 20 * s);
		ctx.textAlign = "right"; ctx.fillText("← TOWARD THE DEMOCRATS", zx - 10 * s, y0 - 14 * s);
		// the Republican side is narrow: shorten the label until it fits, and pin it to the edge if it still doesn't
		ctx.textAlign = "left";
		let rLabel = narrow ? "TOWARD R →" : "TOWARD THE REPUBLICANS →";
		if (zx + 10 * s + ctx.measureText(rLabel).width > x0 + pw) rLabel = "R →";
		if (zx + 10 * s + ctx.measureText(rLabel).width > x0 + pw) { ctx.textAlign = "right"; ctx.fillText(rLabel, x0 + pw, y0 - 14 * s); }
		else ctx.fillText(rLabel, zx + 10 * s, y0 - 14 * s);

		// arrows
		rows.forEach((d, i) => {
			const yy = Y(i), on = i === sel, odd = d.move > 0;
			const tip = X(d.move * grow), dir = odd ? 1 : -1;
			const col = odd ? C.red : on ? C.ink : C.ink2;
			const hd = Math.min(head, Math.abs(tip - zx));
			if (on) { ctx.fillStyle = C.rule; ctx.fillRect(x, yy - rh / 2, w, rh); }
			ctx.fillStyle = col;
			ctx.fillRect(Math.min(zx, tip - dir * hd), yy - thick / 2, Math.abs(tip - dir * hd - zx), thick);
			ctx.beginPath(); ctx.moveTo(tip, yy); ctx.lineTo(tip - dir * hd, yy - hd * 0.6); ctx.lineTo(tip - dir * hd, yy + hd * 0.6); ctx.closePath();
			if (d.won) ctx.fill(); else { ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 1.2 * s; ctx.strokeStyle = col; ctx.stroke(); }
			// the state's code just past the tip
			// rows too short for every code (small phones) still name the arrows the chart calls out:
			// the reader's selection and the one that moved the other way
			const roomy = rh >= 9 * s;
			if (grow === 1 && (roomy || on || odd)) {
				ctx.font = `400 ${roomy ? Math.min(11.5 * s, rh * 0.7) : 11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle";
				ctx.textAlign = odd ? "left" : "right"; ctx.fillStyle = on || odd ? C.ink : C.ink2;
				// a hollow head means the race is uncalled; say so beside it, not only in the footer
				let tag = d.won ? d.s : odd ? `${d.s} · STILL COUNTING` : `STILL COUNTING · ${d.s}`;
				if (!odd && tip - 6 * s - ctx.measureText(tag).width < x0) {    // no room past a long arrow: the note goes across the spine
					tag = d.s;
					ctx.textAlign = "left"; ctx.fillText("STILL COUNTING", zx + 10 * s, yy + 0.5 * s); ctx.textAlign = "right";
				}
				ctx.fillText(tag, tip + dir * 6 * s, yy + 0.5 * s);
			}
		});

		// the count, written into the picture so the image carries it without a title
		if (grow === 1) {
			const maine = rows.findIndex(d => d.move > 0);
			const bx = zx + 18 * s, by = y0 + ph * 0.3, room = x0 + pw - bx;
			const line = narrow ? `${toD} of ${rows.length}` : `${toD} of ${rows.length} moved left`;
			ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.fillStyle = C.ink;
			ctx.font = `400 ${100}px ${C.sans}`;
			const big = Math.max(16 * s, Math.min(34 * s, ph * 0.07, 100 * room / ctx.measureText(line).width));   // fit the space right of the spine
			ctx.font = `400 ${big}px ${C.sans}`;
			ctx.fillText(line, bx, by);
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
			if (narrow) { ctx.fillText("MOVED LEFT", bx, by + 20 * s); ctx.fillText(`TYPICAL ${median.toFixed(0)} PTS`, bx, by + 35 * s); }
			else ctx.fillText(`TYPICAL MOVE ${median.toFixed(0)} POINTS`, bx, by + 20 * s);
			if (maine >= 0 && sel !== maine) {
				ctx.fillStyle = C.ink; ctx.textBaseline = "middle";
				ctx.fillText(narrow ? "THE ONE" : "THE ONLY ONE THAT MOVED RIGHT", X(rows[maine].move) + 34 * s, Y(maine) + 0.5 * s);
			}
		}

		// the reading for the chosen state
		if (sel >= 0 && grow === 1) {
			const d = rows[sel], [value, context] = readout(), tip = X(d.move);
			CD.label(ctx, Math.max(tip, zx) + 28 * s, Y(sel), value, context, s, { x: x0, y: y0, w: pw, h: ph }, Math.min(tip, zx) - 28 * s);
		}
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		return { x0, pw, y0, ph, rh };
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
		geo = draw(ctx, 0, 0, W, H, 1, W < 560);
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	if (grow < 1) {                                             // the tide comes in once, on load
		const t0 = performance.now() + 250;
		const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 900)); grow = 1 - Math.pow(1 - k, 3); paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}

	const pick = CD.selection({ initial: sel, key: "s", encode: i => rows[i].s, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), i = Math.floor((e.clientY - r.top - geo.y0) / geo.rh);
			return i >= 0 && i < rows.length ? i : -1;
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : rows.length - 1) : (from + dir + rows.length) % rows.length
	});

	// the image is always the finished picture, even if the arrows are still growing on screen
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.7, false); grow = g; } };
})();
