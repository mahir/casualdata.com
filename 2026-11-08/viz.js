// 2026-11-08 — the five closest races of 2026, each lead drawn as a crowd: one figure per vote.
// All five crowds share one figure size, so they compare at a glance. On a wide stage they stand side
// by side; on a narrow one they stack. The rest of the set is one line of text.
// Pointing at a crowd (or the arrow keys) reads it out in that line: who leads whom, and what
// everyday crowd is that size.
(function () {
	const C = CD.colors;
	const all = window.CLOSE.slice().sort((a, b) => a.margin - b.margin);
	const races = all.slice(0, 5), rest = all.slice(5);
	// rough sizes of everyday crowds, for scale
	const CROWDS = [[70, "a school bus"], [400, "a jumbo jet"], [2500, "a concert hall"], [40000, "a ballpark"]];
	const like = n => { const c = CROWDS.find(c => n <= c[0]); return c ? `fewer than ${c[1]} holds` : `more than ${CROWDS[CROWDS.length - 1][1]} holds`; };
	const fmt = n => n.toLocaleString("en-US");
	// "Chuck Hubbard (D)" -> "Hubbard (D)", for the short label over a crowd
	const short = name => name.replace(/^.*\s(\S+\s\([A-Z]+\))$/, "$1");
	const status = r => r.final ? "" : r.called ? " · count not final" : " · still counting";

	let sel = Math.max(-1, races.findIndex(r => r.id === CD.state.get("r")));
	let fill = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;

	const restLine = `The next ${rest.length} closest races: ${fmt(rest[0].margin)} to ${fmt(rest[rest.length - 1].margin)} votes`;
	// the reading of one race, as the line under the crowds says it
	const reading = r => `${r.winner} ${r.called ? "beat" : "leads"} ${r.runnerUp} · ${like(r.margin)}${status(r)}`;
	function readout() {
		if (sel < 0) return null;
		const r = races[sel];
		return [`${fmt(r.margin)} votes · ${r.label}`, reading(r)];
	}

	// a person: a round head on a rounded body (the same figure as 6 Nov)
	function person(ctx, cx, cy, u) {
		const hr = u * 0.2, bw = u * 0.56, bh = u * 0.42;
		ctx.beginPath(); ctx.arc(cx, cy - u * 0.24, hr, 0, Math.PI * 2);
		ctx.roundRect(cx - bw / 2, cy + u * 0.02, bw, bh, [bw / 2, bw / 2, u * 0.06, u * 0.06]);
		ctx.fill();
	}
	// text broken at its " · " marks into lines no wider than w
	function wrap(ctx, text, w) {
		const lines = [];
		for (const p of text.split(" · ")) {
			const t = lines.length ? lines[lines.length - 1] + " · " + p : p;
			if (lines.length && ctx.measureText(t).width > w) lines.push(p); else if (lines.length) lines[lines.length - 1] = t; else lines.push(p);
		}
		return lines;
	}

	// Two frames (NEXT.md, "The layout of a day"). On the page the chart is the page: the title and dek
	// are HTML, so the drawing is only the crowds, their labels and the reading. A shared image has no
	// title, so there the drawing also carries the key line. `page` is null in a shared image.
	// page = { head: the title block's box where it lies over the canvas, or null; gut: the page margin }
	//   head (wide screens): the crowds stand across the whole canvas; those that start under the title
	//     block begin below it, the others at the top, so the smallest crowds sit under the title.
	//   no head (phones, tablets): the crowds take the whole canvas under the title.
	//   In both, the one line under the crowds is the rest of the set, or the reading of the chosen race.
	function draw(ctx, x, y, w, h, s, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, num = px => `600 ${px * s}px ${C.sans}`;
		const head = page && page.head, gut = page ? page.gut : 0, lh = 16 * s;
		ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";

		// the plot's frame
		const px0 = x + gut, pw = w - 2 * gut;
		let top = head ? y + Math.max(2 * s, head.y - 2 * s) : y + 2 * s;
		// where a crowd under the title block starts, and how far right the block reaches
		const topHead = head ? y + head.y + head.h + 24 * s : 0, headRight = head ? x + head.x + head.w + 28 * s : -Infinity;
		if (!page) {
			// the key, written into the drawing so the image explains itself
			ctx.font = mono;
			const key = wrap(ctx, "THE FIVE CLOSEST RACES OF 2026 · ONE FIGURE IS ONE VOTE OF THE LEAD", w - 18 * s);
			ctx.fillStyle = C.ink; person(ctx, x + 6 * s, y + 7 * s, 13 * s);
			ctx.fillStyle = C.ink2; key.forEach((t, i) => ctx.fillText(t, x + 18 * s, y + 11 * s + i * lh));
			top = y + key.length * lh + 18 * s;
		}

		// one figure size for all five: the largest cell at which every crowd and label fits.
		// Side by side where the plot is wide enough, stacked where it is not.
		const MAX = 22 * s, MIN = 2 * s, gapMin = 24 * s, blockGap = 14 * s;
		const modes = head ? [true, false] : [pw >= 720 * s];
		let wide, footH, sub, numPx, labelH, c, lay = null;
		for (wide of modes) {
			footH = (wide ? 1 : 3) * lh + 14 * s;          // room is kept for the longest reading, so nothing jumps
			const ground = y + h - footH, fieldH = ground - top;
			// each crowd's label: the number, then the race and who leads
			const W = wide;
			sub = r => W ? [r.label.toUpperCase(), `${short(r.winner).toUpperCase()} ${r.called ? "WON" : "LEADS"}`] : [`${r.label.toUpperCase()} · ${short(r.winner).toUpperCase()} ${r.called ? "WON" : "LEADS"}`];
			numPx = wide ? 26 : 17; labelH = wide ? (numPx + 6) * s + 2 * lh + 8 * s : 26 * s;
			const labelW = races.map(r => {
				ctx.font = num(numPx); const a = ctx.measureText(fmt(r.margin)).width;
				ctx.font = mono; return Math.max(a, ...sub(r).map(t => ctx.measureText(t).width));
			});
			for (c = MAX; c >= MIN; c -= 0.25 * s) {
				if (wide) {
					const Rf = Math.floor((fieldH - labelH) / c), Rh = head ? Math.floor((ground - topHead - labelH) / c) : Rf;
					if (Rf < 1) continue;
					// place left to right; the gap then opens to fill the width, which can move a crowd out from
					// under the title block, so place again until it settles
					let gap = gapMin, best = null;
					for (let pass = 0; pass < 4; pass++) {
						let cx = px0, ok = true;
						const tryLay = races.map((r, i) => {
							const under = cx < headRight, R = under ? Rh : Rf;
							if (R < 1) { ok = false; return null; }
							const cols = Math.ceil(r.margin / R), cw = Math.max(cols * c, labelW[i]), ty = under ? topHead : top;
							const b = { x: cx, y: ty, w: cw, cols, fx: cx, fy: ty + labelH }; cx += cw + gap; return b;
						});
						const total = cx - gap - px0;
						if (!ok || total > pw + 0.01) break;
						best = tryLay;
						const g = Math.min(72 * s, gap + (pw - total) / (races.length - 1));
						if (g - gap < 0.01) break;
						gap = g;
					}
					if (!best) continue;
					lay = best;
					break;
				} else {
					const cols = Math.floor(pw / c), rows = races.map(r => Math.ceil(r.margin / cols));
					if (rows.reduce((a, b) => a + b, 0) * c + races.length * labelH + blockGap * (races.length - 1) > ground - (head ? topHead : top)) continue;
					let cy = head ? topHead : top; lay = races.map((r, i) => { const b = { x: px0, y: cy, w: pw, cols, fx: px0, fy: cy + labelH }; cy += labelH + rows[i] * c + blockGap; return b; });
					break;
				}
			}
			if (lay) break;
		}
		if (!lay) return { boxes: [] };
		const figures = c >= 8 * s, dr = Math.max(0.5, c * 0.34);   // people while they are big enough to read as people, dots after

		const boxes = [];
		races.forEach((r, i) => {
			const b = lay[i], on = sel < 0 || sel === i, rows = Math.ceil(r.margin / b.cols);
			// label
			ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			ctx.fillStyle = on ? C.ink : C.ink3; ctx.font = num(numPx);
			if (wide) {
				ctx.fillText(fmt(r.margin), b.x, b.y + numPx * s);
				ctx.font = mono; ctx.fillStyle = on ? C.ink2 : C.ink3;
				sub(r).forEach((t, k) => ctx.fillText(t, b.x, b.y + (numPx + 6) * s + (k + 1) * lh - 4 * s));
			} else {
				ctx.fillText(fmt(r.margin), b.x, b.y + 17 * s);
				const nw = ctx.measureText(fmt(r.margin)).width;
				ctx.font = mono; ctx.fillStyle = on ? C.ink2 : C.ink3;
				ctx.fillText(sub(r)[0], b.x + nw + 8 * s, b.y + 17 * s);
			}
			// crowd
			ctx.fillStyle = on ? C.ink : C.ink3;
			const shown = Math.round(r.margin * fill);
			for (let k = 0; k < shown; k++) {
				const cx = b.fx + (k % b.cols + 0.5) * c, cy = b.fy + (Math.floor(k / b.cols) + 0.5) * c;
				if (figures) person(ctx, cx, cy, c * 0.86);
				else { ctx.beginPath(); ctx.arc(cx, cy, dr, 0, Math.PI * 2); ctx.fill(); }
			}
			boxes.push({ x: b.x - 6 * s, y: b.y - 6 * s, w: b.w + 12 * s, h: labelH + rows * c + 12 * s, i });
		});

		// foot line: the rest of the set, or the reading of the chosen race
		ctx.font = mono; ctx.textAlign = "left"; ctx.fillStyle = sel < 0 ? C.ink2 : C.ink;
		const foot = wrap(ctx, (sel < 0 ? restLine : reading(races[sel])).toUpperCase(), pw);
		foot.forEach((t, i) => ctx.fillText(t, px0, y + h - footH + 14 * s + (i + 1) * lh - 4 * s));
		return { boxes };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	const headEl = document.querySelector(".cd-head");
	let geo = null, W = 0, H = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, rr = stage.getBoundingClientRect();
		if (rr.width !== W || rr.height !== H) { W = rr.width; H = rr.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		geo = draw(ctx, 0, 0, W, H, 1, { head: CD.headBox(stage), gut: parseFloat(getComputedStyle(headEl).paddingLeft) || 16 });
		const r = readout();
		CD.announce(r ? r.join(", ") : races.map(r => `${r.label}: ${fmt(r.margin)} votes, ${r.winner} ${r.called ? "won" : "leads"}`).join(". ") + ". " + restLine + ".");
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(headEl);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);
	// the crowds fill in once, on load
	if (fill < 1) {
		const t0 = performance.now();
		const step = t => { const k = Math.min(1, (t - t0) / 900); fill = k < 1 ? 1 - Math.pow(1 - k, 2) : 1; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	} else schedule();

	const pick = CD.selection({ initial: sel, key: "r", encode: i => races[i].id, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		at(e) {
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo && geo.boxes.find(b => mx >= b.x && mx < b.x + b.w && my >= b.y && my < b.y + b.h);
			return b ? b.i : -1;
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : races.length - 1) : (from + dir + races.length) % races.length
	});
	// the image is always the finished crowds, showing the pinned race if there is one
	CD.exporter = {
		readout: () => { const s0 = sel; sel = pick.pinned; const r = readout(); sel = s0; return r; },
		draw: (c, x, y, w, h, u) => { const f = fill, s0 = sel; fill = 1; sel = pick.pinned; draw(c, x, y, w, h, u * 1.6, null); fill = f; sel = s0; }
	};
})();
