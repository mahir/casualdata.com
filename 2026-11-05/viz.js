// 2026-11-05 — each Senate race against the state's 2024 vote for president.
// Margins are Republican minus Democrat, in points of the two-party vote for the Senate
// and of the total vote for president (as compiled for The midterm tide).
(function () {
	const C = CD.colors;
	const rows = window.SENATE.map(d => {
		const sen = (d.rep - d.dem) / (d.rep + d.dem) * 100;
		return { ...d, sen, move: sen - d.pres, flip: d.won && d.won !== d.held };
	}).sort((a, b) => b.pres - a.pres);                      // Trump's best state on top
	const toD = rows.filter(d => d.move < 0).length;
	const median = (() => { const m = rows.map(d => Math.abs(d.move)).sort((a, b) => a - b); return m[Math.floor(m.length / 2)]; })();
	const XMIN = -45, XMAX = 50;

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
		const L = (narrow ? 34 : 118) * s, R = 12 * s, T = 26 * s, B = 26 * s;
		const x0 = x + L, pw = w - L - R, y0 = y + T, ph = h - T - B;
		const X = v => x0 + (v - XMIN) / (XMAX - XMIN) * pw;
		const rh = ph / rows.length, Y = i => y0 + (i + 0.5) * rh;
		const dot = Math.max(2.5 * s, Math.min(5 * s, rh * 0.26));

		// grid and axis
		ctx.font = `400 ${10.5 * s}px ${C.mono}`; ctx.textBaseline = "alphabetic";
		for (const t of [-40, -20, 0, 20, 40]) {
			ctx.fillStyle = t === 0 ? C.ink : C.rule;
			ctx.fillRect(Math.round(X(t)) - (t === 0 ? 0.5 * s : 0.5), y0 - 6 * s, t === 0 ? 1 * s : 1, ph + 12 * s);
			ctx.fillStyle = C.ink2; ctx.textAlign = "center";
			ctx.fillText(t === 0 ? "EVEN" : t < 0 ? `D+${-t}` : `R+${t}`, X(t), y0 + ph + 20 * s);
		}
		ctx.textAlign = "right"; ctx.fillStyle = C.ink2;
		ctx.fillText("← MORE DEMOCRATIC", X(0) - 8 * s, y0 - 12 * s);
		ctx.textAlign = "left";
		ctx.fillText("MORE REPUBLICAN →", X(0) + 8 * s, y0 - 12 * s);

		// rows
		const fs = Math.max(9 * s, Math.min(13 * s, rh * 0.66));
		rows.forEach((d, i) => {
			const yy = Y(i), on = i === sel, odd = d.move > 0;
			const a = X(d.pres), b = X(d.pres + d.move * grow);
			if (on) { ctx.fillStyle = C.rule; ctx.fillRect(x, yy - rh / 2, w, rh); }

			// state name
			ctx.textBaseline = "middle"; ctx.textAlign = "right";
			ctx.font = `${d.flip || on ? 700 : 500} ${fs}px ${C.sans}`;
			ctx.fillStyle = on || d.flip ? C.ink : C.ink2;
			ctx.fillText(narrow ? d.s : d.name, x0 - 10 * s, yy + 0.5 * s);

			// the move: a line from 2024 to 2026 with an arrowhead
			const col = odd ? C.red : on ? C.ink : C.ink2;
			const dir = Math.sign(b - a) || -1, head = Math.min(dot * 1.9, Math.abs(b - a));
			ctx.strokeStyle = col; ctx.lineWidth = (odd || on ? 2.2 : 1.6) * s;
			ctx.beginPath(); ctx.moveTo(a, yy); ctx.lineTo(b - dir * head * 0.6, yy); ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(b, yy); ctx.lineTo(b - dir * head, yy - head * 0.62); ctx.lineTo(b - dir * head, yy + head * 0.62); ctx.closePath();
			if (d.won) { ctx.fillStyle = col; ctx.fill(); } else { ctx.lineWidth = 1.2 * s; ctx.stroke(); }
			// 2024 tail
			ctx.beginPath(); ctx.arc(a, yy, dot * 0.62, 0, Math.PI * 2);
			ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 1.3 * s; ctx.strokeStyle = col; ctx.stroke();

			// the exception gets the red dot and a note (unless its reading is open)
			if (odd) {
				ctx.beginPath(); ctx.arc(b, yy, dot * 1.25, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
				if (!on) {
					ctx.font = `400 ${10.5 * s}px ${C.mono}`; ctx.textAlign = "left"; ctx.fillStyle = C.ink;
					ctx.fillText(narrow ? "← MOVED RIGHT" : "← THE ONE THAT MOVED RIGHT", Math.max(a, b, X(0)) + dot * 2 + 6 * s, yy + 0.5 * s);
				}
			}
		});

		// the reading for the chosen state, beside its arrow
		if (sel >= 0 && grow === 1) {
			const d = rows[sel], [value, context] = readout();
			const lo = Math.min(X(d.pres), X(d.sen)) - dot * 2, hi = Math.max(X(d.pres), X(d.sen)) + dot;
			CD.label(ctx, hi, Y(sel), value, context, s, { x: x0, y: y0, w: pw, h: ph }, lo);
		}
		ctx.textAlign = "left";
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

	let urlT;
	function select(i) {
		sel = i; schedule();
		clearTimeout(urlT);
		urlT = setTimeout(() => history.replaceState(null, "", sel < 0 ? location.pathname : `?s=${rows[sel].s}`), 150);
	}
	function fromPointer(e) {
		if (!geo) return;
		const r = cv.getBoundingClientRect(), py = e.clientY - r.top;
		const i = Math.floor((py - geo.y0) / geo.rh);
		if (i >= 0 && i < rows.length && i !== sel) select(i);
	}
	cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); fromPointer(e); });
	cv.addEventListener("pointermove", e => { if (e.pointerType === "mouse" || e.buttons) fromPointer(e); });
	cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") select(-1); });
	cv.addEventListener("keydown", e => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			const n = rows.length, step = e.key === "ArrowDown" ? 1 : -1;
			select(sel < 0 ? (step > 0 ? 0 : n - 1) : (sel + step + n) % n);
		}
		if (e.key === "Escape") select(-1);
	});

	CD.exporter = { draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.7, false) };
})();
