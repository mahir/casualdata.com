// 2026-11-08 — the closest races of 2026, one figure per vote of the leader's margin.
// The field shows the chosen race's margin as a crowd. The red ones are how many voters would have had
// to vote the other way to flip the result: just over half the margin.
// The strip below lists every race in the set, smallest margin first.
(function () {
	const C = CD.colors;
	const races = window.CLOSE.slice().sort((a, b) => a.margin - b.margin);
	// rough sizes of everyday crowds, for scale ("about")
	const CROWDS = [[70, "a school bus"], [400, "a jumbo jet"], [2500, "a concert hall"], [40000, "a ballpark"]];
	const like = n => { const c = CROWDS.find(c => n <= c[0]); return c ? `fewer than ${c[1]} holds` : `more than ${CROWDS[CROWDS.length - 1][1]} holds`; };
	const fmt = n => n.toLocaleString("en-US");

	const q = new URLSearchParams(location.search);
	let cur = Math.max(0, races.findIndex(r => r.id === q.get("r")));
	let hover = -1;
	let fill = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	// switching this many votes from the leader to the runner-up would flip the result
	const flipOf = n => Math.floor(n / 2) + 1;

	function readout() {
		const r = races[hover >= 0 ? hover : cur];
		return [`${fmt(r.margin)} votes · ${r.label}`, `${r.winner} ${r.called ? "won" : "leads"} · ${fmt(flipOf(r.margin))} switching sides would flip it${r.final ? "" : " · still counting"}`];
	}

	// a person: a round head on a rounded body (the same figure as 6 Nov)
	function person(ctx, cx, cy, u) {
		const hr = u * 0.2, bw = u * 0.56, bh = u * 0.42;
		ctx.beginPath(); ctx.arc(cx, cy - u * 0.24, hr, 0, Math.PI * 2);
		ctx.roundRect(cx - bw / 2, cy + u * 0.02, bw, bh, [bw / 2, bw / 2, u * 0.06, u * 0.06]);
		ctx.fill();
	}

	// ui: true on screen, where narrow screens get ‹ › buttons beside the strip; false for the image
	function draw(ctx, x, y, w, h, s, ui) {
		const stripH = 54 * s, gap = 30 * s, chipRoom = 96 * s;
		const r = races[cur], n = r.margin, MAX = 34 * s, flip = flipOf(n);
		// the key, written into the drawing so the image explains itself: what a figure is, what red is
		const keyW = w, twoLines = keyW < 560 * s, keyH = (twoLines ? 40 : 22) * s;
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
		const key = (cx, cy, col, text) => {
			ctx.fillStyle = col; person(ctx, cx + 6 * s, cy + 1 * s, 13 * s);
			ctx.fillStyle = col === C.red ? C.ink : C.ink2; ctx.fillText(text, cx + 18 * s, cy + 0.5 * s);
			return cx + 18 * s + ctx.measureText(text).width;
		};
		const k1 = key(x, y + 7 * s, C.ink2, `ONE VOTE OF THE ${fmt(n)}-VOTE LEAD`);
		// the red line in the longest wording that fits
		const room = twoLines ? keyW - 18 * s : x + keyW - k1 - 46 * s;
		const red = [`THE ${fmt(flip)} WHO WOULD FLIP IT BY VOTING THE OTHER WAY`, `THE ${fmt(flip)} WHO WOULD FLIP IT BY SWITCHING SIDES`, `${fmt(flip)} SWITCHING SIDES WOULD FLIP IT`]
			.find(t => ctx.measureText(t).width <= room) || `${fmt(flip)} WOULD FLIP IT`;
		if (twoLines) key(x, y + 25 * s, C.red, red);
		else key(k1 + 28 * s, y + 7 * s, C.red, red);
		// the field leaves room under the crowd for the reading, so the chip never covers a vote
		const fx = x, fy = y + keyH + 22 * s, fw = w, fh = h - stripH - gap - chipRoom - keyH - 22 * s;
		// a grid that fills the field: choose a cell so n marks fit; a small margin stays a small crowd
		const cell = Math.min(MAX, Math.sqrt(fw * fh / n) * 0.98);
		// keep the crowd compact: roughly the field's shape, never wider than it
		const cols = Math.max(1, Math.min(Math.floor(fw / cell), Math.ceil(Math.sqrt(n * fw / fh)))), rows = Math.ceil(n / cols);
		const c2 = Math.min(MAX, fw / cols, fh / rows), ox = fx + (fw - cols * c2) / 2, oy = fy + (fh - rows * c2) / 2;
		const figures = c2 >= 10 * s, dr = Math.max(0.5, c2 * 0.34);   // people while they are big enough to read as people, dots after
		const shown = Math.round(n * fill);
		const mark = (cx, cy) => {
			if (figures) person(ctx, cx, cy, c2 * 0.86);
			else if (dr < 1.6) ctx.fillRect(cx - dr, cy - dr, dr * 2, dr * 2);
			else { ctx.beginPath(); ctx.arc(cx, cy, dr, 0, Math.PI * 2); ctx.fill(); }
		};
		// the first `flip` votes, in reading order, are red: just over half the crowd
		for (let i = 0; i < shown; i++) {
			ctx.fillStyle = i < flip ? C.red : C.ink2;
			mark(ox + (i % cols + 0.5) * c2, oy + (Math.floor(i / cols) + 0.5) * c2);
		}
		if (fill === 1) {
			const [value, context] = readout();
			if (hover < 0) CD.label(ctx, ox - 12 * s, oy + rows * c2 + 50 * s, value, context, s, { x: fx, y: fy, w: fw, h: fh + chipRoom });
		}

		// strip: every race as a bar, height ~ log of its margin
		const narrow = ui && w < 520 * s, bw = narrow ? 40 * s : 0;
		const sx = x + bw, sw = w - 2 * bw;
		const sy = y + h - stripH, maxLog = Math.log10(races[races.length - 1].margin + 1);
		const slot = sw / races.length, boxes = [];
		ctx.fillStyle = C.ink; ctx.fillRect(sx, sy, sw, 1 * s);
		races.forEach((rc, i) => {
			const bx = sx + i * slot, bh = Math.max(3 * s, (stripH - 22 * s) * Math.log10(rc.margin + 1) / maxLog);
			const on = i === cur, hv = i === hover;
			ctx.fillStyle = on ? C.ink : hv ? C.ink2 : C.ink3;
			ctx.fillRect(bx + slot * 0.2, sy + 4 * s, slot * 0.6, bh);
			if (on && fill === 1) { ctx.beginPath(); ctx.arc(bx + slot / 2, sy + 4 * s + bh + 6 * s, 2.5 * s, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill(); }
			boxes.push({ x: bx, w: slot, i });
		});
		// on a phone a bar is too thin to tap, so the strip gets a previous and a next button
		let btn = null;
		if (narrow) {
			const by = sy - 6 * s, bh = stripH - 16 * s;
			btn = { prev: { x, w: bw - 6 * s }, next: { x: x + w - bw + 6 * s, w: bw - 6 * s }, y: by, h: bh };
			ctx.strokeStyle = C.ink2; ctx.lineWidth = 1 * s; ctx.fillStyle = C.ink;
			ctx.font = `400 ${18 * s}px ${C.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
			for (const [b, t] of [[btn.prev, "‹"], [btn.next, "›"]]) {
				ctx.beginPath(); ctx.roundRect(b.x + 0.5, by + 0.5, b.w - 1, bh - 1, 999); ctx.stroke();
				ctx.fillText(t, b.x + b.w / 2, by + bh / 2 - 1 * s);
			}
		}
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2; ctx.textBaseline = "alphabetic";
		ctx.textAlign = "left"; ctx.fillText("CLOSEST", sx, y + h - 2 * s);
		ctx.textAlign = "right"; ctx.fillText(narrow ? `${races.length} RACES →` : `${races.length} CLOSEST RACES OF 2026 →`, sx + sw, y + h - 2 * s);
		if (hover >= 0) {
			const [value, context] = readout(), b = boxes[hover];
			CD.label(ctx, b.x + b.w, sy - 30 * s, value, context, s, { x, y, w, h: sy - y }, b.x);
		}
		ctx.textAlign = "left";
		return { boxes, sy, btn };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d"), titleEl = document.querySelector(".cd-title");
	let geo = null, W = 0, H = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, rr = stage.getBoundingClientRect();
		if (rr.width !== W || rr.height !== H) { W = rr.width; H = rr.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		geo = draw(ctx, 0, 0, W, H, 1, true);
		CD.announce(readout().join(", "));
		// the headline follows the chosen race; uncalled races "may" decide
		const r = races[cur], what = r.id.endsWith("senate") ? "a Senate seat" : r.id.endsWith("governor") ? "who governs " + r.label.replace(" governor", "") : "a seat in Congress";
		const t = `${fmt(r.margin)} votes ${r.called ? "decided" : "may decide"} ${what}`;
		if (titleEl.textContent !== t) titleEl.textContent = t;
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);
	function grow() {
		fill = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
		if (fill === 1) return schedule();
		const t0 = performance.now();
		const step = t => { const k = Math.min(1, (t - t0) / 900); fill = k < 1 ? 1 - Math.pow(1 - k, 2) : 1; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	grow();
	function choose(i) {
		if (i === cur) return;
		cur = i; grow();
		CD.state.set({ r: races[cur].id });
	}
	const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
	function at(e) {
		const [mx, my] = pos(e);
		if (!geo || my < geo.sy - 8) return -1;
		const b = geo.boxes.find(b => mx >= b.x && mx < b.x + b.w);
		return b ? b.i : -1;
	}
	function button(e) {
		const [mx, my] = pos(e), b = geo && geo.btn;
		if (!b || my < b.y - 6 || my > b.y + b.h + 6) return 0;
		if (mx >= b.prev.x && mx <= b.prev.x + b.prev.w) return -1;
		if (mx >= b.next.x && mx <= b.next.x + b.next.w) return 1;
		return 0;
	}
	let scrub = false;                       // a finger dragged along the strip scrubs through the races
	cv.addEventListener("pointermove", e => {
		const i = at(e);
		if (scrub) { if (i >= 0) choose(i); return; }
		const hv = e.pointerType === "mouse" ? i : -1;
		if (hv !== hover) { hover = hv; schedule(); }
	});
	cv.addEventListener("pointerdown", e => {
		const d = button(e);
		if (d) return choose((cur + d + races.length) % races.length);
		const i = at(e);
		if (i >= 0) { scrub = true; cv.setPointerCapture(e.pointerId); choose(i); }
	});
	const stop = () => { scrub = false; };
	cv.addEventListener("pointerup", stop);
	cv.addEventListener("pointercancel", stop);
	cv.addEventListener("pointerleave", () => { hover = -1; schedule(); });
	cv.addEventListener("keydown", e => {
		// arrows step through the races, as on every day; Escape and Home go back to the closest
		const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
		if (dir) { e.preventDefault(); choose((cur + dir + races.length) % races.length); }
		if (e.key === "Escape" || e.key === "Home") { e.preventDefault(); choose(0); }
	});
	// the image is always the finished crowd, with no hover reading and no buttons
	CD.exporter = { readout: () => { const hv = hover; hover = -1; const r = readout(); hover = hv; return r; }, draw: (c, x, y, w, h, u) => { const f = fill, hv = hover; fill = 1; hover = -1; draw(c, x, y, w, h, u * 1.6, false); fill = f; hover = hv; } };
})();
