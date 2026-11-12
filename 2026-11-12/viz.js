// 2026-11-12 — estimated deaths of children under five from pneumonia in 2015 and 2024, for the six
// countries with the most in 2024, as a slope chart: one straight line per country between two dates,
// all on one scale from zero.
// The one red thing is Nigeria: its line, dots and two end labels. India is ink and a little heavier,
// the other four are grey. Picking a country reads its two numbers, their ranges, and the change,
// as a percent only where the two ranges do not overlap.
(function () {
	const C = CD.colors, D = window.LRI;
	// in the file's order: largest in 2024 first
	const rows = D.countries.map(c => ({ iso: c.iso, name: c.name, a: c.y2015, b: c.y2024, apart: c.rangesApart, pct: c.changePct }));
	const N = rows.length;
	const fmt = n => n.toLocaleString("en-US");
	const S1 = "India more than halved child pneumonia deaths in nine years.", S2 = "Nigeria’s barely moved.";
	const SUB = `ESTIMATED DEATHS OF CHILDREN UNDER FIVE, ${D.years[0]} → ${D.years[1]}`;
	const MAX = 190000;          // room above India's 2015 range (to 186,611)
	const role = r => r.iso === "NGA" ? 2 : r.iso === "IND" ? 1 : 0;

	let sel = -1;

	function readout() {
		if (sel < 0) return [`${S1} ${S2}`, `Estimated deaths of children under five, ${D.years[0]} and ${D.years[1]}`];
		const r = rows[sel];
		const change = r.apart ? `${r.pct < 0 ? "down" : "up"} ${Math.abs(r.pct)}%` : "change is within the estimate’s range";
		return [`${r.name}: ${fmt(r.a[0])} to ${fmt(r.b[0])}`,
			`child pneumonia deaths, ${D.years[0]} to ${D.years[1]} · ${D.years[0]} range ${fmt(r.a[1])}–${fmt(r.a[2])} · ${D.years[1]} range ${fmt(r.b[1])}–${fmt(r.b[2])} · ${change}`];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	// the same number of lines, but as even as they can be: no word left alone on the last one
	function balance(ctx, text, w) {
		const n = wrap(ctx, text, w).length;
		let lo = w * 0.4, hi = w;
		for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; wrap(ctx, text, m).length > n ? lo = m : hi = m; }
		return wrap(ctx, text, hi);
	}

	// labels in one column, top to bottom, pushed apart until none touches the next
	function spread(items, lo, hi) {
		items.sort((p, q) => p.y - q.y);
		items.forEach((it, i) => { const pv = items[i - 1]; it.ly = Math.max(it.y, lo + it.h / 2, pv ? pv.ly + (pv.h + it.h) / 2 : -Infinity); });
		for (let i = items.length - 1; i >= 0; i--) {
			const nx = items[i + 1];
			items[i].ly = Math.min(items[i].ly, nx ? nx.ly - (nx.h + items[i].h) / 2 : hi - items[i].h / 2);
		}
	}

	function draw(ctx, x, y, w, h, s, exporting) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, bigF = `600 ${16 * s}px ${C.sans}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		const wide = w >= 760 * s;
		// on the page a narrow frame has the title just above, so the reading leaves out its first part
		// (what is counted); a wide frame keeps the sentence beside it; a narrow image needs it said
		const [value, full] = readout();
		const context = sel >= 0 && (wide || !exporting) ? full.split(" · ").slice(1).join(" · ") : full;

		// ---- the sentence and the small line under it: a column at the left of a wide frame, a block on
		// top of a narrow one
		const colW = wide ? Math.min(0.4 * w, 460 * s) : w;
		// a short narrow frame (a small phone) sets the sentence smaller and leaves out the small line,
		// which the page's dek says, so the plot keeps its height
		const short = !wide && h < 330 * s;
		const fs = short ? 18 * s : Math.max(20 * s, Math.min((wide ? 40 : 34) * s, colW / (wide ? 11.5 : 17)));
		ctx.font = `600 ${fs}px ${C.sans}`;
		const lines = [...balance(ctx, S1, colW), ...wrap(ctx, S2, colW)];
		ctx.font = mono;
		const sub = short ? [] : balance(ctx, SUB, colW);
		const sentH = lines.length * fs * 1.12, headH = sentH + (sub.length ? 6 * s + sub.length * 16 * s : 0);
		// in a narrow frame the reader's reading takes the sentence's place, so the block keeps room for
		// its three lines, in a short frame too: the reading must not cover the two year labels
		const blockH = wide ? headH : Math.max(headH, 82 * s);
		// a wide frame too short to hold the reading under the sentence (a phone on its side) also gives
		// the reading the sentence's place
		const under = wide && headH + 18 * s + 82 * s <= h;
		const showHead = under || sel < 0;
		if (showHead) {
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.12));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 6 * s + 11 * s + i * 16 * s));
		}

		// ---- the chart's frame: a column of labels each side, a band for the years on top, one for zero below
		const cx = wide ? x + colW + 48 * s : x, cw = x + w - cx;
		const top = wide ? y : y + blockH + 12 * s;
		const names = cw >= 480 * s;          // the 2015 labels carry the name too where there is room
		const BAND = 24 * s, BOT = 28 * s, GAP = 16 * s;
		const ptop = top + BAND, bottom = y + h - BOT;
		const yOf = v => bottom - v / MAX * (bottom - ptop);
		const font = r => role(r) ? bigF : mono;
		const text = (r, side) => {
			const nm = role(r) ? r.name : r.name.toUpperCase();
			return side ? `${nm} ${fmt(r.b[0])}` : (names ? `${nm} ` : "") + fmt(r.a[0]);
		};
		const measure = side => Math.max(...rows.map(r => { ctx.font = font(r); return ctx.measureText(text(r, side)).width; }));
		const LW = measure(0), RW = measure(1);
		const xL = cx + LW + GAP, xR = cx + cw - RW - GAP;

		// the two dates and zero
		ctx.fillStyle = C.rule; ctx.fillRect(Math.round(xL), ptop, px1, bottom - ptop); ctx.fillRect(Math.round(xR), ptop, px1, bottom - ptop);
		ctx.fillStyle = C.ink3; ctx.fillRect(xL, Math.round(bottom), xR - xL, px1);
		ctx.font = mono; ctx.fillStyle = C.ink2; ctx.textAlign = "center";
		ctx.fillText(String(D.years[0]), xL, top + 12 * s); ctx.fillText(String(D.years[1]), xR, top + 12 * s);
		ctx.fillText("0", (xL + xR) / 2, bottom + 16 * s);
		ctx.textAlign = "left";

		// ---- the lines: greys first, then India, then Nigeria, the reader's country last
		const color = r => role(r) === 2 ? C.red : role(r) === 1 ? C.ink : C.ink3;
		const order = rows.map((r, i) => i).sort((p, q) => (p === sel) - (q === sel) || role(rows[p]) - role(rows[q]));
		if (sel >= 0) {
			// the estimate's range at each end, faint, behind the line
			const r = rows[sel];
			ctx.globalAlpha = 0.22; ctx.fillStyle = role(r) === 2 ? C.red : C.ink;
			for (const [X, d] of [[xL, r.a], [xR, r.b]]) ctx.fillRect(X - 5 * s, yOf(d[2]), 10 * s, yOf(d[1]) - yOf(d[2]));
			ctx.globalAlpha = 1;
		}
		order.forEach(i => {
			const r = rows[i], on = i === sel, k = role(r);
			ctx.globalAlpha = sel >= 0 && !on ? 0.28 : 1;
			const col = on && !k ? C.ink : color(r);
			ctx.strokeStyle = col; ctx.fillStyle = col;
			ctx.lineWidth = ((k === 2 ? 3 : k === 1 ? 2.4 : 1.5) + (on ? 0.8 : 0)) * s;
			ctx.beginPath(); ctx.moveTo(xL, yOf(r.a[0])); ctx.lineTo(xR, yOf(r.b[0])); ctx.stroke();
			const rad = (k ? 4.5 : 3.2) * s + (on ? s : 0);
			for (const [X, v] of [[xL, r.a[0]], [xR, r.b[0]]]) { ctx.beginPath(); ctx.arc(X, yOf(v), rad, 0, 7); ctx.fill(); }
		});
		ctx.globalAlpha = 1;

		// ---- the end labels, nudged apart, each tied to its line end by a short leader where it moved
		const cols = [0, 1].map(side => {
			const items = rows.map((r, i) => ({ i, r, y: yOf(side ? r.b[0] : r.a[0]), h: (role(r) ? 21 : 15) * s }));
			spread(items, ptop - 6 * s, bottom + 2 * s);
			items.forEach(it => {
				const r = it.r, on = it.i === sel, k = role(r);
				const X = side ? xR : xL, dir = side ? 1 : -1;
				if (Math.abs(it.ly - it.y) > 2.5 * s) {
					ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
					ctx.beginPath(); ctx.moveTo(X + dir * 7 * s, it.y); ctx.lineTo(X + dir * (GAP - 3 * s), it.ly); ctx.stroke();
				}
				ctx.font = font(r); ctx.textBaseline = "middle"; ctx.textAlign = side ? "left" : "right";
				ctx.fillStyle = k === 2 ? C.red : k === 1 || on ? C.ink : C.ink2;
				ctx.fillText(text(r, side), X + dir * GAP, it.ly + (k ? 0.5 * s : s));
			});
			ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
			return items;
		});

		// ---- the reader's country: the reading, and on the page the way back to all six
		let back = null;
		if (sel >= 0) {
			if (wide) CD.label(ctx, x - 12 * s, -1e4, value, context, s, { x, y: under ? y + headH + 18 * s : y, w: colW, h: h });
			else CD.label(ctx, x - 12 * s, -1e4, value, context, s, { x, y, w, h: h });
			if (!exporting) {
				ctx.font = mono;
				const t = "ALL SIX", tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
				const bx = x + w - bw, by = bottom + 6 * s;
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
				back = { x: bx - 24, y: by - 18, w: bw + 24, h: bh + 30 };
			}
		}
		return { cx, xL, xR, ptop, bottom, cols, back, yOf };
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
		geo = draw(ctx, 0, 0, W, Hh, 1, false);
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?c=NGA: the country's ISO code; anything else opens the overview
	const q = (CD.state.get("c") || "").toUpperCase();
	sel = rows.findIndex(r => r.iso === q);
	const pick = CD.selection({ initial: sel, key: "c", encode: i => rows[i].iso, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// a country's label row (either side) or its line picks it; the "All six" box, the sentence and
		// empty plot go back to the overview (left of the 2015 labels in a wide frame is the sentence's column)
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const touch = e.pointerType && e.pointerType !== "mouse";
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			if (my < geo.ptop - 14 || my > geo.bottom + 14) return -1;
			const nearest = (list, reach) => {
				const hit = list.map(o => ({ i: o.i, d: Math.abs(o.y - my) })).sort((p, q2) => p.d - q2.d)[0];
				return hit && hit.d <= reach ? hit.i : -1;
			};
			if (mx < geo.xL - 5) return mx >= geo.cx - 8 ? nearest(geo.cols[0].map(o => ({ i: o.i, y: o.ly })), 22) : -1;
			if (mx > geo.xR + 5) return nearest(geo.cols[1].map(o => ({ i: o.i, y: o.ly })), 22);
			const t = (mx - geo.xL) / (geo.xR - geo.xL);
			return nearest(rows.map((row, i) => ({ i, y: geo.yOf(row.a[0] + (row.b[0] - row.a[0]) * Math.min(1, Math.max(0, t))) })), touch ? 22 : 12);
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true) };
})();
