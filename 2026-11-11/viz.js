// 2026-11-11 — weekly sea-surface temperature in the central Pacific (Niño 3.4), in °C above normal,
// for five El Niño years laid over each other from January to December.
// Four grey lines (1982, 1997, 2015, 2023), a dashed rule at the highest week before 2026, and the one
// red thing: the 2026 line, which has been above that rule for seven weeks. Picking a week reads 2026
// against the highest of the other four at the same week of the year.
(function () {
	const C = CD.colors, D = window.NINO;
	const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
	const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];          // none of the five is a leap year
	const Mon = m => MON[m][0] + MON[m].slice(1).toLowerCase();
	const doy = iso => { const m = +iso.slice(5, 7) - 1; return MDAYS.slice(0, m).reduce((a, b) => a + b, 0) + +iso.slice(8, 10); };
	const dm = iso => `${+iso.slice(8, 10)} ${Mon(+iso.slice(5, 7) - 1)}`;
	const dmy = iso => `${dm(iso)} ${iso.slice(0, 4)}`;
	const deg = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);

	// each week: its date, its anomaly, its day of the year and its slot k (0 to 51): the week of 2026
	// whose date is nearest (2026's weeks are centred on days 7, 14, … 364 of the year). The other years'
	// weeks fall at most three days from it; 1997's first week (1 Jan) is nearest to none and is drawn only.
	const years = D.years.map(y => ({ year: y.year, weeks: y.weeks.map(([d, a]) => ({ d, a, doy: doy(d), k: Math.round((doy(d) - 7) / 7) })) }));
	const now = years[years.length - 1], others = years.slice(0, -1);
	const REC = D.recordBefore;
	const SLOTS = 52;
	const at = (y, k) => y.weeks.find(w => w.k === k);
	const last = now.weeks[now.weeks.length - 1];
	// the claim, counted from the data every time the page loads
	const above = now.weeks.filter(w => w.a > REC.a);
	const firstAt = now.weeks.find(w => w.a >= REC.a) || last;
	const peak = Math.max(...now.weeks.map(w => w.a)), peakWeeks = now.weeks.filter(w => w.a === peak);
	const sameMonth = peakWeeks.every(w => w.d.slice(0, 7) === peakWeeks[0].d.slice(0, 7));
	const peakWhen = sameMonth
		? `${peakWeeks.map(w => +w.d.slice(8, 10)).join(" and ")} ${Mon(+peakWeeks[0].d.slice(5, 7) - 1)} ${now.year}`
		: peakWeeks.map(w => dm(w.d)).join(" and ") + " " + now.year;
	const SENT = [`${above.length} weeks above`, "the old record"];
	const SUB = `${deg(peak)} °C on ${peakWhen} · old record ${deg(REC.a)} °C, ${dmy(REC.date)}`;
	const NOTE = `CENTRAL PACIFIC SEA SURFACE, °C ABOVE THE ${D.normal} NORMAL`;
	const LO = -1, HI = 3.5;

	let sel = -1;
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;

	// the date a week of 2026 is (or will be) centred on: the link carries it
	const weekDate = k => { const t = new Date(now.weeks[0].d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + 7 * (k - now.weeks[0].k)); return t.toISOString().slice(0, 10); };
	const best = k => others.map(y => ({ y, w: at(y, k) })).filter(o => o.w).sort((a, b) => b.w.a - a.w.a)[0];

	function readout() {
		if (sel < 0) return [`${above.length} weeks above the old record`, SUB];
		const w = at(now, sel), b = best(sel);
		const rest = b ? `highest other year: ${b.y.year}, ${deg(b.w.a)} °C` : "";
		if (!w) return [`${now.year}: not yet`, `week of ${dm(weekDate(sel))} · ${rest}`];
		return [`${deg(w.a)} °C · week of ${dmy(w.d)}`, rest];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}

	function draw(ctx, x, y, w, h, s) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";

		// ---- the frame of the plot: a gutter at the right for the year names, a band at the top for the
		// red end label, a row under it for the months
		ctx.font = mono;
		const gut = ctx.measureText("0000").width + 9 * s, BOT = 24 * s;
		const pw = w - gut, bottom = y + h - BOT;
		const xOf = d => x + (d - 1) / 364 * pw;

		// ---- the takeaway and what a mark is. It sits in the empty top-left corner of the plot when
		// nothing is there (wide frames); otherwise above the plot.
		// compact (a short frame: a small phone, a phone on its side): 1 sets the sentence on one line,
		// smaller if it must; 2 also leaves out the note on what a mark is (the page's dek and foot say it)
		const head = (maxW, compact = 0) => {
			let lines = [SENT.join(" ")], fs = 34 * s;
			ctx.font = `600 ${fs}px ${C.sans}`;
			const w1 = ctx.measureText(lines[0]).width;
			if (w1 > maxW && compact) { fs = Math.max(20 * s, fs * maxW / w1 * 0.99); ctx.font = `600 ${fs}px ${C.sans}`; }
			else if (w1 > maxW) { lines = SENT; fs = 30 * s; ctx.font = `600 ${fs}px ${C.sans}`; }
			const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
			ctx.font = mono;
			const note = compact >= 2 ? [] : wrap(ctx, NOTE, maxW);
			const bw = Math.max(tw, ...note.map(l => ctx.measureText(l).width));
			// (without the note, a little room stays under the sentence for the reader's reading)
			const bh = lines.length * fs * 1.1 + 8 * s + (note.length ? note.length * 16 * s : 14 * s);
			return { lines, fs, note, w: bw, h: bh };
		};
		const BAND = 46 * s;
		// the old record's label ends just before the red line reaches the rule
		ctx.font = mono;
		// the value always; the date in full where it fits before the red line, else the year, else nothing
		const recRoom = xOf(firstAt.doy) - 14 * s - x;
		const recText = [`OLD RECORD ${deg(REC.a)} °C · ${dmy(REC.date).toUpperCase()}`, `OLD RECORD ${deg(REC.a)} °C · ${REC.date.slice(0, 4)}`, `OLD RECORD ${deg(REC.a)} °C`].find((r, i) => i === 2 || ctx.measureText(r).width <= recRoom);
		const recW = ctx.measureText(recText).width;
		const recX = Math.max(x, xOf(firstAt.doy) - 14 * s - recW);

		let H = head(Math.min(w, 520 * s)), top = y, inside = false;
		{
			// would it fit inside? Above the +2 line and its label, clear of every line and of the record's label
			const yOfIn = v => bottom - (v - LO) / (HI - LO) * (bottom - (y + BAND));
			const xr = x + H.w + 14 * s;
			let hi = 2;
			years.forEach(yr => yr.weeks.forEach(wk => { if (xOf(wk.doy) <= xr) hi = Math.max(hi, wk.a); }));
			inside = y + H.h <= yOfIn(hi) - 20 * s && xr <= recX;
		}
		let compact = 0;
		if (!inside) {
			H = head(w); top = y + H.h + 4 * s;
			// the plot keeps at least 150 px of height where the head can give it
			while (compact < 2 && bottom - (top + BAND) < 150 * s) { H = head(w, ++compact); top = y + H.h + 4 * s; }
		}
		const ptop = top + BAND;
		const yOf = v => bottom - (v - LO) / (HI - LO) * (bottom - ptop);
		const headBox = { x, y, w: H.w, h: H.h };

		ctx.fillStyle = C.ink;
		ctx.font = `600 ${H.fs}px ${C.sans}`;
		H.lines.forEach((l, i) => ctx.fillText(l, x, y + H.fs * 0.84 + i * H.fs * 1.1));
		let ty = y + H.lines.length * H.fs * 1.1 + 8 * s;
		// in a narrow frame the reader's reading takes the place of the small line under the sentence
		const swap = !inside && sel >= 0 && grow >= 1, swapY = ty;
		if (!swap) {
			ctx.font = mono; ctx.fillStyle = C.ink2;
			H.note.forEach((l, i) => ctx.fillText(l, x, ty + 11 * s + i * 16 * s));
		}

		// ---- the scale: +1 and +2 as hairlines, zero as "normal", the old record as a dashed rule
		ctx.font = mono;
		for (const v of [1, 2]) {
			ctx.fillStyle = C.rule; ctx.fillRect(x, Math.round(yOf(v)), pw, px1);
		}
		ctx.fillStyle = C.ink3; ctx.fillRect(x, Math.round(yOf(0)), pw, px1);
		// the scale's names go on after the lines, each on a patch of page, so a line never runs through one
		const scaleNames = () => {
			ctx.font = mono; ctx.textAlign = "left";
			for (const [v, t] of [[2, `${deg(2).slice(0, 2)} °C`], [1, `${deg(1).slice(0, 2)} °C`], [0, "NORMAL"]]) {
				const tw = ctx.measureText(t).width;
				ctx.fillStyle = C.paper; ctx.fillRect(x, yOf(v) - 17 * s, tw + 5 * s, 16 * s);
				ctx.fillStyle = C.ink2; ctx.fillText(t, x, yOf(v) - 5 * s);
			}
		};
		ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.setLineDash([4 * s, 4 * s]); ctx.lineCap = "butt";
		ctx.beginPath(); ctx.moveTo(recX, yOf(REC.a)); ctx.lineTo(x + pw, yOf(REC.a)); ctx.stroke();
		ctx.setLineDash([]); ctx.lineCap = "round";
		ctx.fillStyle = C.ink; ctx.fillText(recText, recX, yOf(REC.a) - 6 * s);
		const recBox = { x: recX, y: yOf(REC.a) - 18 * s, w: recW, h: 20 * s };

		// ---- the months
		const every = pw / 12 < 34 * s ? 2 : 1;
		let acc = 0;
		MDAYS.forEach((n, m) => {
			const x0 = xOf(acc + 1), x1 = xOf(acc + n + 1);
			ctx.fillStyle = C.ink3; ctx.fillRect(Math.round(x0), bottom, px1, 5 * s);
			if (m % every === 0) { ctx.fillStyle = C.ink2; ctx.textAlign = "left"; ctx.fillText(MON[m], x0 + 4 * s, bottom + 17 * s); }
			acc += n;
		});
		ctx.fillStyle = C.ink3; ctx.fillRect(x, bottom, pw, px1);
		ctx.textAlign = "left";

		// ---- the four earlier years, each named at its end
		const line = (yr, upTo) => {
			ctx.beginPath();
			yr.weeks.forEach((wk, i) => { if (i > upTo) return; const X = xOf(wk.doy), Y = yOf(wk.a); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
			ctx.stroke();
		};
		others.forEach(yr => {
			const strong = yr.weeks.some(wk => wk.d === REC.date);          // the year that holds the old record
			ctx.strokeStyle = strong ? C.ink2 : C.ink3; ctx.lineWidth = (strong ? 1.8 : 1.4) * s;
			line(yr, 1e9);
		});
		const ends = others.map(yr => ({ yr, w: yr.weeks[yr.weeks.length - 1] })).sort((a, b) => b.w.a - a.w.a);
		let prev = -Infinity;
		ctx.font = mono;
		ends.forEach(e => {
			const Y = Math.max(yOf(e.w.a) + 4 * s, prev + 13.5 * s); prev = Y;
			ctx.fillStyle = e.yr.weeks.some(wk => wk.d === REC.date) ? C.ink : C.ink2;
			ctx.fillText(String(e.yr.year), x + pw + 7 * s, Y);
		});

		// ---- the one red thing: 2026, to the latest week
		const n = now.weeks.length, shownTo = grow >= 1 ? n - 1 : Math.floor(grow * (n - 1));
		ctx.strokeStyle = C.red; ctx.lineWidth = 2.6 * s;
		line(now, shownTo);
		scaleNames();
		const tip = now.weeks[shownTo], tx = xOf(tip.doy), tyy = yOf(tip.a);
		ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(tx, tyy, 4.5 * s, 0, 7); ctx.fill();
		const done = grow >= 1;
		const geo = { x, pw, top: inside ? y : top, head: headBox };
		if (!done) return geo;

		// its end label, over the line's highest point, set to the right edge
		const big = 22 * s, ex = x + w, ey = yOf(peak) - 10 * s;
		ctx.textAlign = "right";
		ctx.font = `600 ${big}px ${C.sans}`; ctx.fillStyle = C.red;
		// (in a narrow frame the reader's reading takes this label's place as well: there is no room for both)
		const showEnd = !swap;
		const numT = `${deg(last.a)} °C`; if (showEnd) ctx.fillText(numT, ex, ey);
		const endW = ctx.measureText(numT).width;
		ctx.font = mono; ctx.fillStyle = C.ink;
		const endT = `${now.year} · WEEK OF ${dm(last.d).toUpperCase()}`;
		if (showEnd) ctx.fillText(endT, ex, ey - big * 0.86 - 4 * s);
		const endBox = { x: ex - Math.max(endW, ctx.measureText(endT).width), y: ey - big - 18 * s, w: Math.max(endW, ctx.measureText(endT).width), h: big + 20 * s };
		ctx.textAlign = "left";

		// ---- the reader's week: a hairline, a dot on every line, and the reading beside 2026's dot
		if (sel >= 0) {
			const wk = at(now, sel), b = best(sel);
			const hx = wk ? xOf(wk.doy) : xOf(sel * 7 + 7);
			// the hairline runs from the baseline to just over the highest line at that week
			const hy0 = Math.min(...years.map(yr => at(yr, sel)).filter(Boolean).map(o => yOf(o.a))) - 14 * s;
			ctx.fillStyle = C.ink; ctx.fillRect(Math.round(hx) - px1 / 2, hy0, px1, bottom - hy0);
			others.forEach(yr => {
				const o = at(yr, sel); if (!o) return;
				ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(xOf(o.doy), yOf(o.a), 5 * s, 0, 7); ctx.fill();
				ctx.fillStyle = b && yr === b.y ? C.ink : C.ink2; ctx.beginPath(); ctx.arc(xOf(o.doy), yOf(o.a), 3.4 * s, 0, 7); ctx.fill();
			});
			let ax = hx, ay = b ? yOf(b.w.a) : yOf(0);
			if (wk) {
				ax = xOf(wk.doy); ay = yOf(wk.a);
				ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(ax, ay, 8 * s, 0, 7); ctx.fill();
				ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(ax, ay, 4.5 * s, 0, 7); ctx.fill();
				ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(ax, ay, 7.5 * s, 0, 7); ctx.stroke();
			}
			const [value, context] = readout();
			// keep the chip off the sentence, the end label and, where it can, the lines near the point
			const dots = years.map(yr => at(yr, sel)).filter(Boolean).map(o => ({ x: xOf(o.doy) - 6 * s, y: yOf(o.a) - 6 * s, w: 12 * s, h: 12 * s }));
			if (swap) CD.label(ctx, x - 12 * s, -1e4, value, context, s, { x, y: swapY, w, h: bottom - swapY });
			else {
				// in a wide frame it sits beside the hairline, in the place that covers the fewest points
				// of the lines and none of the words
				ctx.font = `600 ${17 * s}px ${C.sans}`; let cw = ctx.measureText(value).width;
				ctx.font = `400 ${11 * s}px ${C.mono}`; cw = Math.max(cw, ctx.measureText(context.toUpperCase()).width) + 16 * s;
				const ch = 49 * s, words = [headBox, endBox, recBox];
				const pts = []; years.forEach(yr => yr.weeks.forEach(o => pts.push([xOf(o.doy), yOf(o.a)])));
				let bestSpot = null, bestCost = Infinity;
				for (const cx of [hx + 12 * s, hx - 12 * s - cw]) {
					if (cx < x || cx + cw > x + w) continue;
					for (let cy = bottom - 8 * s - ch; cy >= y; cy -= 8 * s) {
						const m = 6 * s;
						let cost = pts.filter(q => q[0] > cx - m && q[0] < cx + cw + m && q[1] > cy - m && q[1] < cy + ch + m).length;
						cost += 100 * words.filter(a => cx < a.x + a.w + m && a.x < cx + cw + m && cy < a.y + a.h + m && a.y < cy + ch + m).length;
						cost += Math.abs(cy + ch / 2 - ay) / (bottom - y);          // of two clear places, the nearer to the point
						if (cost < bestCost) { bestCost = cost; bestSpot = { x: cx, y: cy }; }
					}
				}
				if (bestSpot) CD.label(ctx, bestSpot.x - 12 * s, -1e4, value, context, s, { x: bestSpot.x, y: bestSpot.y, w: cw + 1, h: ch + 200 * s });
				else CD.label(ctx, ax, ay, value, context, s, { x, y, w, h: bottom - y - 4 * s }, ax, words);
			}
		}
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		return geo;
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	let geo = null, W = 0, Hh = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== Hh) { W = r.width; Hh = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		geo = draw(ctx, 0, 0, W, Hh, 1);
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 1300)); grow = k; paint(); if (k < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	// ?w=2026-10-21: the date of the 2026 week
	const q = CD.state.get("w");
	if (q && /^\d{4}-\d\d-\d\d$/.test(q)) for (let k = 0; k < SLOTS; k++) if (weekDate(k) === q && years.some(y => at(y, k))) sel = k;
	const pick = CD.selection({ initial: sel, key: "w", encode: weekDate, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// anywhere on the chart picks the nearest week, so a thumb can drag along the year;
		// the sentence is the way back to the overview
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const hb = geo.head;
			if (my < geo.top || (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h)) return -1;
			const d = (mx - geo.x) / geo.pw * 364 + 1;
			return Math.min(SLOTS - 1, Math.max(0, Math.round((d - 7) / 7)));
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : last.k) : (from + dir + SLOTS) % SLOTS
	});
	// the image is always the finished picture, even while the red line is still being drawn
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow; grow = 1; draw(c, x, y, w, h, u * 1.6); grow = g; } };
})();
