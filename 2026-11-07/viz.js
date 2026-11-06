// 2026-11-07 — ballot measures against the party vote.
// x: Harris's share of the state's two-party vote for president in 2024.
// y: the share of the measure's votes for the side Democrats campaigned for.
// On the diagonal, voters took the Democratic side exactly as often as they voted for Harris.
// Above it, the measure did better than the party; below it, worse.
(function () {
	const C = CD.colors;
	const pts = window.MEASURES.filter(m => m.dside && window.PRES24[m.s]).map(m => {
		const [t, h] = window.PRES24[m.s];
		const x = h / (h + t) * 100;
		const y = (m.dside === "yes" ? m.yes : m.no) / (m.yes + m.no) * 100;
		return { ...m, x, y, gap: y - x };
	});
	const above = pts.filter(p => p.gap > 0).length;
	const star = pts.reduce((a, p) => Math.abs(p.gap) > Math.abs(a.gap) ? p : a, pts[0]);   // the one red dot
	const LO = 20, HI = 80;

	let sel = -1;
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const pct = v => `${Math.round(v)}%`;

	function readout() {
		if (sel < 0) return [`${above} of ${pts.length} measures beat the party`, `measured against Harris's 2024 share in each state`];
		const p = pts[sel];
		return [`${p.stateName}: ${p.label}`,
			`${pct(p.y)} took the Democratic side · Harris ${pct(p.x)} · ${p.passed ? "passed" : p.passed === false ? "failed" : "counting"}`];
	}

	function draw(ctx, x, y, w, h, s) {
		const L = 44 * s, B = 34 * s, T = 16 * s, R = 16 * s;
		const side = Math.min(w - L - R, h - T - B);
		const x0 = x + L + (w - L - R - side) / 2, y0 = y + T + (h - T - B - side) / 2;
		const X = v => x0 + (v - LO) / (HI - LO) * side, Y = v => y0 + side - (v - LO) / (HI - LO) * side;

		// grid
		ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		for (let v = LO; v <= HI; v += 10) {
			ctx.fillStyle = C.rule;
			ctx.fillRect(X(v), y0, 1, side); ctx.fillRect(x0, Y(v), side, 1);
			ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.textBaseline = "top";
			ctx.fillText(`${v}%`, X(v), y0 + side + 8 * s);
			ctx.textAlign = "right"; ctx.textBaseline = "middle";
			ctx.fillText(`${v}%`, x0 - 8 * s, Y(v));
		}
		// the diagonal: the measure did exactly as well as the party
		ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2 * s;
		ctx.beginPath(); ctx.moveTo(X(LO), Y(LO)); ctx.lineTo(X(HI), Y(HI)); ctx.stroke();
		// the diagonal's name sits at its far end, past the last dots; phones leave it to the corner notes
		if (side >= 460 * s) {
		ctx.save(); ctx.translate(X(HI - 0.5), Y(HI - 0.5)); ctx.rotate(-Math.PI / 4);
		ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillStyle = C.ink2;
		ctx.fillText("SAME AS THE PARTY", 0, -5 * s); ctx.restore();
		}
		// the count, written into the empty corners so the image carries it without a title
		const big = Math.max(18 * s, Math.min(34 * s, side * 0.07));
		ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = C.ink;
		ctx.font = `400 ${big}px ${C.sans}`;
		ctx.fillText(`${above} of ${pts.length}`, x0 + 10 * s, y0 + 10 * s);
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
		ctx.fillText("BEAT THE PARTY ↑", x0 + 10 * s, y0 + 16 * s + big);
		ctx.textAlign = "right"; ctx.textBaseline = "bottom";
		ctx.fillText(`↓ ${pts.length - above} DID WORSE`, x0 + side - 10 * s, y0 + side - 10 * s);
		ctx.textAlign = "center"; ctx.textBaseline = "top";
		ctx.fillText("HARRIS'S SHARE OF THE STATE, 2024 →", x0 + side / 2, y0 + side + 22 * s);
		ctx.save(); ctx.translate(x0 - 34 * s, y0 + side / 2); ctx.rotate(-Math.PI / 2);
		ctx.textBaseline = "bottom"; ctx.fillText("VOTE FOR THE DEMOCRATIC SIDE →", 0, 0); ctx.restore();

		// points: a stem from the diagonal shows the gap
		const r = 5 * s;
		pts.forEach((p, i) => {
			const px = X(p.x), py = Y(p.x + p.gap * grow), on = i === sel, red = p === star;
			ctx.strokeStyle = red ? C.red : on ? C.ink : C.ink3; ctx.lineWidth = 1 * s;
			ctx.beginPath(); ctx.moveTo(px, Y(p.x)); ctx.lineTo(px, py); ctx.stroke();
			ctx.beginPath(); ctx.arc(px, py, red ? r * 1.3 : r, 0, Math.PI * 2);
			ctx.fillStyle = red ? C.red : on ? C.ink : C.ink2; ctx.fill();
			ctx.lineWidth = 1.5 * s; ctx.strokeStyle = C.paper; ctx.stroke();
		});
		if (grow === 1) {
			ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle";
			const th = 12 * s, lh = 15 * s, taken = [];
			const free = b => !taken.some(t => b.x < t.x + t.w && t.x < b.x + b.w && b.y < t.y + t.h && t.y < b.y + b.h);
			// the red dot's note sits in the empty space to its left, ending just short of the dot
			const showNote = sel < 0 && star;
			if (showNote) {
				const name = star.stateName.toUpperCase();
				const lines = side < 460 * s ? [`${name} →`] : [`${name} →`, `${pct(star.y)} DEMOCRATIC SIDE`, `${pct(star.x)} HARRIS`];
				const ex = X(star.x) - r * 1.3 - 8 * s, sy = Y(star.y);
				ctx.textAlign = "right";
				lines.forEach((l, k) => {
					const tw = ctx.measureText(l).width;
					taken.push({ x: ex - tw, y: sy + k * lh - th / 2, w: tw, h: th });
					ctx.fillStyle = k ? C.ink2 : C.ink; ctx.fillText(l, ex, sy + k * lh);
				});
			}
			// state codes for the big breaks, biggest first; a code with no free spot beside its dot is left out
			ctx.textAlign = "left";
			const idx = pts.map((p, i) => i).filter(i => (pts[i] !== star || !showNote) && (Math.abs(pts[i].gap) >= 10 || i === sel))
				.sort((a, b) => (b === sel) - (a === sel) || Math.abs(pts[b].gap) - Math.abs(pts[a].gap));
			const named = new Set(showNote ? [star.s] : []);     // one code per state: a second CA adds nothing
			for (const i of idx) {
				const p = pts[i], px = X(p.x), py = Y(p.y), tw = ctx.measureText(p.s).width;
				if (named.has(p.s) && i !== sel) continue;
				const box = [px + r + 4 * s, px - r - 4 * s - tw].map(bx => ({ x: bx, y: py - th / 2, w: tw, h: th })).find(free);
				if (!box) continue;
				taken.push(box); named.add(p.s);
				ctx.fillStyle = i === sel || pts[i] === star ? C.ink : C.ink2;
				ctx.fillText(p.s, box.x, py);
			}
		}
		if (sel >= 0 && grow === 1) {
			const p = pts[sel], [value, context] = readout();
			CD.label(ctx, X(p.x) + r, Y(p.y), value, context, s, { x: x0, y: y0, w: side, h: side }, X(p.x) - r);
		}
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		return { X, Y, x0, y0, side };
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
	function pick(e) {
		if (!geo) return;
		const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
		let best = -1, bd = 24 * 24;
		pts.forEach((p, i) => { const dx = geo.X(p.x) - mx, dy = geo.Y(p.y) - my, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
		if (best !== sel) { sel = best; schedule(); }
	}
	cv.addEventListener("pointermove", pick);
	cv.addEventListener("pointerdown", pick);
	cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { sel = -1; schedule(); } });
	const order = pts.map((p, i) => i).sort((a, b) => pts[a].x - pts[b].x);
	cv.addEventListener("keydown", e => {
		if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
			e.preventDefault();
			const k = order.indexOf(sel), n = order.length;
			sel = order[k < 0 ? 0 : (k + (e.key === "ArrowRight" ? 1 : -1) + n) % n]; schedule();
		}
		if (e.key === "Escape") { sel = -1; schedule(); }
	});
	// the image is always the finished picture, even if the dots are still rising on screen
	CD.exporter = { draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6); grow = g; } };
	CD.measures = { pts, above, star };
})();
