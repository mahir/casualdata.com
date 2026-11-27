// 2026-11-27 — ships tracked a day through 28 sea passages, week by week since January 2019, one strip
// per passage on its own scale. On wide screens the strips sit on a world map beside their passages,
// joined by a hairline; on narrow screens (and in tall images) they are rows sorted by 2025 traffic.
// The Strait of Hormuz is red. Pointing at a strip reads that week: a hairline marks the same week in
// every strip, and a card beside the strip gives its number and one sentence. Only the pinned week goes
// in the URL (?s=hormuz.2026-03-02).
(function () {
	const C = CD.colors, D = window.STRAITS, LAND = window.LAND;
	const NW = D.nweeks, P = D.passages;
	const D0 = new Date(D.start + "T12:00:00Z");
	const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const wkDate = k => new Date(D0.getTime() + k * 7 * 864e5);
	const fmtDay = (d, long) => `${d.getUTCDate()} ${long ? MON[d.getUTCMonth()] : MON[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
	const iso = d => d.toISOString().slice(0, 10);
	const MARCH = Math.floor((Date.UTC(2026, 2, 2) - D0.getTime() + 432e5) / (7 * 864e5));    // the week of 2 March 2026
	// PortWatch counts jump in many passages in the week of 27 January 2020 (Magellan: about 3 a day before and
	// after, 44 that week), which looks like a glitch in the source. The value is kept, but a strip's scale
	// ignores that week when it is more than twice the strip's next highest week, and it is drawn clipped.
	const GLITCH = Math.round((Date.UTC(2020, 0, 27) - D0.getTime()) / (7 * 864e5));
	P.forEach(p => { const rest = Math.max(...p.weeks.filter((v, k) => k !== GLITCH)); p.max = p.weeks[GLITCH] > 2 * rest ? rest : Math.max(rest, p.weeks[GLITCH]); p.slug = p.short.toLowerCase().replace(/[^a-z]+/g, "-"); });
	const HI = P.findIndex(p => p.short === "Hormuz");
	const H = P[HI];
	const ranked = P.map((p, i) => i).sort((a, b) => P[b].y2025 - P[a].y2025);
	const n0 = v => v >= 10 ? Math.round(v).toLocaleString("en-US") : (Math.round(v * 10) / 10).toString();
	const ROUND = v => Math.round(v).toLocaleString("en-US");
	const SENTENCE = `About ${ROUND(H.nov2026)} ships a day were tracked through the Strait of Hormuz in November 2026, down from ${ROUND(H.y2025)} a day in 2025.`;
	const SMALL = "Ships tracked a day, week by week, January 2019 to 22 November 2026, each strip on its own scale; the number is 2025’s daily average. Only ships broadcasting their position (AIS) are counted. IMF PortWatch.";

	let sel = -1;
	// the opening motion, once: every strip is drawn left to right through its weeks, all together, so
	// Hormuz falls last; the names and numbers fade in after.
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const ease = t => 1 - Math.pow(1 - t, 2);
	const upTo = () => grow >= 1 ? NW : Math.max(1, Math.round(NW * ease(Math.min(1, grow / 0.85))));
	const faded = () => Math.min(1, Math.max(0, (grow - 0.75) / 0.25));

	// a reading: the week's number, then one sentence a person would say
	function reading(i) {
		const p = P[Math.floor(i / NW)], k = i % NW, v = p.weeks[k];
		const head = `${p.name}: ${n0(v)} a day`;
		const t = `Ships tracked a day in the week of ${fmtDay(wkDate(k), true)}.`;
		return [head, t];
	}
	const readout = () => sel < 0 ? [SENTENCE] : reading(sel);

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}

	// one strip: the weeks as a filled step line in (x, y, w, h), on the passage's own scale
	function strip(ctx, p, x, y, w, h, s, q, red, pickW) {
		const n = upTo(), dx = w / NW, base = Math.round((y + h) / q) * q;
		ctx.fillStyle = red ? C.red : C.ink3;
		ctx.beginPath(); ctx.moveTo(x, base);
		for (let k = 0; k < n; k++) { const yy = base - h * Math.min(1, p.weeks[k] / p.max); ctx.lineTo(x + k * dx, yy); ctx.lineTo(x + (k + 1) * dx, yy); }
		ctx.lineTo(x + n * dx, base); ctx.closePath(); ctx.fill();
		// the baseline, and a short tick under it at the week of 2 March 2026
		ctx.fillStyle = C.rule; ctx.fillRect(x, base, w, Math.max(q, 0.5));
		const mx = Math.round((x + (MARCH + 0.5) * dx) / q) * q;
		ctx.fillStyle = C.ink2; ctx.globalAlpha = 0.7 * faded(); ctx.fillRect(mx, base + 1.5 * s, Math.max(q, 0.75 * s), 4 * s); ctx.globalAlpha = 1;
		if (pickW >= 0) {
			const hx = Math.round((x + (pickW + 0.5) * dx) / q) * q;
			ctx.fillStyle = C.ink; ctx.globalAlpha = 0.85; ctx.fillRect(hx - q / 2, y - 2 * s, Math.max(q, 1), h + 2 * s); ctx.globalAlpha = 1;
		}
	}

	// ---- the map ----
	const LON0 = -150, LON1 = 198, LAT0 = -58, LAT1 = 74;
	const BW = 21, BH = 7.2;          // a strip, in degrees of the map
	const SC = i => i === HI ? 1.45 : 1;    // Hormuz's strip is drawn larger
	const lonX = lon => lon < LON0 ? lon + 360 : lon;
	function mapFit(W, H) { const k = Math.min(W / (LON1 - LON0), H / (LAT1 - LAT0)); return k; }
	// where the map and every strip's box go in (X, Y, W, H); bottom: the map sits on the bottom edge
	function mapGeom(X, Y, W, H, s, bottom) {
		const k = mapFit(W, H), mw = k * (LON1 - LON0), mh = k * (LAT1 - LAT0);
		const ox = X + (W - mw) / 2, oy = bottom ? Y + H - mh : Y + (H - mh) / 2;
		const px = lon => ox + (lonX(lon) - LON0) * k, py = lat => oy + (LAT1 - lat) * k;
		return { k, ox, oy, mw, mh, boxes: P.map((p, i) => ({ x: px(p.box[0]), y: py(p.box[1]), w: BW * k * SC(i), h: BH * k * SC(i) + 20 * s, p: i })) };
	}
	function drawMap(ctx, X, Y, W, H, s, q, pick, page, bottom) {
		const k = mapFit(W, H), mw = k * (LON1 - LON0), mh = k * (LAT1 - LAT0);
		const ox = X + (W - mw) / 2, oy = bottom ? Y + H - mh : Y + (H - mh) / 2;
		const px = lon => ox + (lonX(lon) - LON0) * k, py = lat => oy + (LAT1 - lat) * k;
		// land, faint, no borders
		ctx.save(); ctx.beginPath(); ctx.rect(X, Y, W, H); ctx.clip();
		ctx.fillStyle = C.ink; ctx.globalAlpha = 0.07; ctx.beginPath();
		for (const r of LAND) {
			// rings at the date line are drawn where they are; the Chukotka tip beyond 180 is drawn again on the right
			for (const shift of [0, 360]) {
				if (shift && Math.min(...r.filter((v, j) => j % 2 === 0)) >= LON0) continue;
				ctx.moveTo(ox + (r[0] + shift - LON0) * k, py(r[1]));
				for (let j = 2; j < r.length; j += 2) ctx.lineTo(ox + (r[j] + shift - LON0) * k, py(r[j + 1]));
				ctx.closePath();
			}
		}
		ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
		const pickP = pick >= 0 ? Math.floor(pick / NW) : -1, pickW = pick >= 0 ? pick % NW : -1;
		const sw = BW * k, sh = BH * k, fa = faded();
		const boxes = [];
		// leaders first, under everything
		P.forEach((p, i) => {
			const bx = px(p.box[0]), by = py(p.box[1]), cx = px(p.lon), cy = py(p.lat);
			// the nearest point of the strip's box (strip and label) to the passage
			const bh = sh * SC(i) + 18 * s;
			const tx = Math.max(bx, Math.min(bx + sw * SC(i), cx)), ty = Math.max(by, Math.min(by + bh, cy));
			ctx.strokeStyle = i === HI ? C.red : C.ink3; ctx.lineWidth = Math.max(q, 0.8 * s); ctx.globalAlpha = i === HI ? 0.9 : 0.8;
			ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
			ctx.globalAlpha = 1; ctx.fillStyle = i === HI ? C.red : C.ink2;
			ctx.beginPath(); ctx.arc(cx, cy, 2.4 * s, 0, 6.2832); ctx.fill();
			boxes.push({ x: bx, y: by, w: sw * SC(i), h: sh * SC(i), p: i });
		});
		P.forEach((p, i) => {
			const b = boxes[i];
			strip(ctx, p, b.x, b.y, b.w, b.h, s, q, i === HI, pickP >= 0 ? pickW : -1);
			if (i === pickP) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5 * s; ctx.strokeRect(b.x - 3 * s, b.y - 4 * s, b.w + 6 * s, b.h + 8 * s); }
			ctx.globalAlpha = fa; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
			const ly = b.y + b.h + 17 * s;
			if (i === HI) {
				ctx.font = `600 ${14 * s}px ${C.sans}`; ctx.fillStyle = C.red;
				ctx.fillText(`Hormuz ${ROUND(p.y2025)} → ${ROUND(p.nov2026)} a day`, b.x, ly + 1 * s);
			} else {
				ctx.font = `500 ${12.5 * s}px ${C.sans}`; ctx.fillStyle = C.ink;
				ctx.fillText(p.short, b.x, ly);
				const nw = ctx.measureText(p.short + " ").width;
				ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2;
				ctx.fillText(ROUND(p.y2025), b.x + nw, ly);
			}
			ctx.globalAlpha = 1;
		});
		return { boxes, k, ox, oy, mw, mh };
	}

	// ---- the rows: every passage, sorted by 2025 traffic ----
	function drawRows(ctx, X, Y, W, HH, s, q, pick, compact) {
		const fa = faded(), pickP = pick >= 0 ? Math.floor(pick / NW) : -1, pickW = pick >= 0 ? pick % NW : -1;
		ctx.font = `500 ${12.5 * s}px ${C.sans}`;
		const nm = p => compact && p.short === "Cape of Good Hope" ? "Cape" : p.short;
		const nameW = Math.max(...P.map(p => ctx.measureText(nm(p)).width));
		ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		const numW = ctx.measureText("1,000").width;
		const labW = nameW + numW + 14 * s, sx = X + labW + 10 * s, sw = X + W - sx;
		const axH = 20 * s, rh = (HH - axH) / P.length, sh = Math.max(6 * s, rh - 4 * s);
		const boxes = [];
		ranked.forEach((i, r) => {
			const p = P[i], y = Y + r * rh, red = i === HI;
			strip(ctx, p, sx, y + rh - sh - 3 * s, sw, sh, s, q, red, pickP >= 0 ? pickW : -1);
			if (i === pickP) { ctx.fillStyle = C.ink; ctx.fillRect(X - 1 * s, y + rh / 2 - 1 * s, 3 * s, 2 * s); }
			ctx.globalAlpha = 1; ctx.textBaseline = "middle"; ctx.textAlign = "left";
			const ty = y + rh - 3 * s - sh / 2;
			ctx.font = `${red ? 600 : 500} ${12.5 * s}px ${C.sans}`; ctx.fillStyle = red ? C.red : C.ink;
			ctx.fillText(nm(p), X, ty);
			ctx.font = `${red ? 600 : 400} ${11.5 * s}px ${C.mono}`; ctx.fillStyle = red ? C.red : C.ink2; ctx.textAlign = "right";
			ctx.fillText(ROUND(p.y2025), X + labW, ty);
			boxes.push({ x: sx, y: y + rh - sh - 3 * s, w: sw, h: sh, p: i, rowY: y, rowH: rh });
		});
		// Hormuz's November number, just before the fall, so the fall and the June bump stay in sight
		const hb = boxes[ranked.indexOf(HI)];
		ctx.globalAlpha = fa; ctx.font = `600 ${13 * s}px ${C.sans}`; ctx.textAlign = "right"; ctx.textBaseline = "middle";
		const hl = `Nov: ${ROUND(H.nov2026)} a day`;
		const hw = ctx.measureText(hl).width, hr = hb.x + MARCH * hb.w / NW - 4 * s;
		ctx.fillStyle = C.paper; ctx.fillRect(hr - hw - 6 * s, hb.y + hb.h / 2 - 9 * s, hw + 8 * s, 18 * s);
		ctx.fillStyle = C.red; ctx.fillText(hl, hr - 2 * s, hb.y + hb.h / 2);
		// years under the rows
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.fillStyle = C.ink2; ctx.textBaseline = "alphabetic";
		const ay = Y + P.length * rh + 15 * s;
		for (let yr = 2019; yr <= 2026; yr++) {
			if (compact && yr % 2 === 0 && yr !== 2026) continue;
			const kx = sx + (Date.UTC(yr, 0, 1) - D0.getTime()) / (7 * 864e5) / NW * sw;
			ctx.textAlign = "left"; ctx.fillText(String(yr), kx, ay);
		}
		ctx.textAlign = "right"; ctx.fillText(compact ? "2025" : "2025 A DAY", X + labW, ay);
		ctx.globalAlpha = 1;
		return { boxes };
	}

	function readingH(ctx, i, w, s) {
		ctx.font = `400 ${15 * s}px ${C.sans}`;
		return 22 * s + wrap(ctx, reading(i)[1], w).length * 21 * s;
	}
	function drawReading(ctx, X, Y, w, s, i) {
		const [v, t] = reading(i);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillStyle = C.paper;
		wrap(ctx, v, w).slice(0, 1).forEach(l => ctx.fillText(l, X, Y + 15 * s));
		ctx.font = `400 ${15 * s}px ${C.sans}`;
		wrap(ctx, t, w).forEach((l, k) => ctx.fillText(l, X, Y + 22 * s + 15 * s + k * 21 * s));
	}
	// the key, in words: what a strip and its number are
	function key(ctx, X, Y, w, s, short) {
		ctx.globalAlpha = faded(); ctx.font = `400 ${13 * s}px ${C.sans}`; ctx.fillStyle = C.ink2;
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		const lines = wrap(ctx, short ? "The number: ships a day in 2025. The tick: 1 March 2026." : "Each strip: ships a day, week by week, 2019 to 2026, on its own scale. The number: its 2025 daily average. The tick: 1 March 2026.", w);
		lines.forEach((l, k) => ctx.fillText(l, X, Y + 13 * s + k * 18 * s));
		ctx.globalAlpha = 1;
		return lines.length * 18 * s;
	}

	function draw(ctx, x, y, w, h, s, exporting, page) {
		const q = page ? 1 / page.dpr : 1 / 2;
		if (!page) {
			// a shared image: the sentence, the small line, then the map (wide) or the rows (tall)
			const wide = w > h * 1.3;
			const fs = wide ? Math.min(30 * s, w / 30) : Math.max(19 * s, Math.min(26 * s, w / 22));
			const cw = wide ? w * 0.62 : w;
			ctx.font = `600 ${fs}px ${C.sans}`; ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
			const lines = wrap(ctx, SENTENCE, cw);
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.18));
			let used = lines.length * fs * 1.18 + 6 * s;
			ctx.font = `400 ${11.5 * s}px ${C.sans}`; ctx.fillStyle = C.ink2;
			const sm = wrap(ctx, SMALL, cw);
			sm.forEach((l, i) => ctx.fillText(l, x, y + used + 12 * s + i * 16 * s));
			used += sm.length * 16 * s + 22 * s;
			if (wide) drawMap(ctx, x, y + used, w, h - used, s, q, -1, null);
			else drawRows(ctx, x, y + used, w, h - used, s, q, -1, false);
			return null;
		}
		const head = page.head, gut = head ? page.gut : Math.max(16 * s, page.gut);
		let L, mode;
		// the map needs room: a strip at least about 80 px wide
		// the map, on the bottom of the stage, when a strip gets about 75 px and none lies under the title
		const G = mapGeom(x + gut, y + 8 * s, w - 2 * gut, h - 16 * s, s, true);
		const hit = b => head && b.x < head.x + head.w + 24 * s && b.y < head.y + head.h + 16 * s;
		if (G.k >= 3.5 && !G.boxes.some(hit)) {
			mode = "map";
			L = drawMap(ctx, x + gut, y + 8 * s, w - 2 * gut, h - 16 * s, s, q, sel, page, true);
			if (head) key(ctx, head.x + head.w + 48 * s, head.y + 4 * s, Math.min(360 * s, w - head.x - head.w - 48 * s - gut), s);
		} else {
			mode = "rows";
			if (head) {
				const ax = head.x + head.w + 48 * s;
				L = drawRows(ctx, ax, y + 20 * s, x + w - gut - ax, h - 36 * s, s, q, sel, false);
				key(ctx, head.x, head.y + head.h + 24 * s, head.w, s);
			} else {
				ctx.font = `400 ${13 * s}px ${C.sans}`;
				const kh = key(ctx, x + gut, y + 2 * s, w - 2 * gut, s, true) + 12 * s;
				L = drawRows(ctx, x + gut, y + 6 * s + kh, w - 2 * gut, h - 14 * s - kh, s, q, sel, w < 520 * s);
			}
		}
		// the pinned or pointed week's reading in an ink card beside its strip
		if (sel >= 0) {
			const b = L.boxes.find(o => o.p === Math.floor(sel / NW)), pad = 12 * s;
			const hx = b.x + ((sel % NW) + 0.5) * b.w / NW;
			const cw = Math.min(290 * s, w - 2 * gut), ch = readingH(ctx, sel, cw - 2 * pad, s) + 2 * pad;
			let cx, cy;
			if (mode === "map") {
				cx = b.x + b.w + 14 * s; if (cx + cw > x + w - gut) cx = b.x - 14 * s - cw;
				cy = b.y + b.h / 2 - ch / 2;
			} else {
				cx = Math.max(x + gut, Math.min(x + w - gut - cw, hx - cw / 2));
				cy = b.y + b.h / 2 > y + h / 2 ? b.y - ch - 10 * s : b.y + b.h + 12 * s;
			}
			cy = Math.max(y + 4 * s, Math.min(y + h - ch - 4 * s, cy));
			ctx.fillStyle = C.ink; ctx.fillRect(cx, cy, cw, ch);
			drawReading(ctx, cx + pad, cy + pad, cw - 2 * pad, s, sel);
		}
		return { L, mode };
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
	Promise.all([`400 12px ${C.mono}`, `600 12px ${C.mono}`, `600 17px ${C.sans}`, `500 12px ${C.sans}`, `400 15px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?s=hormuz.2026-03-02: a passage and the Monday of a week; nothing is the overview
	const code = i => `${P[Math.floor(i / NW)].slug}.${iso(wkDate(i % NW))}`;
	const parse = v => {
		const [slug, day] = (v || "").split("."), pi = P.findIndex(p => p.slug === slug);
		if (pi < 0 || !day) return -1;
		const k = Math.round((Date.parse(day + "T12:00:00Z") - D0.getTime()) / (7 * 864e5));
		return k >= 0 && k < NW ? pi * NW + k : -1;
	};
	sel = parse(CD.state.get("s"));
	const pick = CD.selection({ initial: sel, key: "s", encode: code, onChange: i => { sel = i; if (i >= 0) grow = 1; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the strip under the pointer (a little reach around it), and the week under the pointer
		at: e => {
			if (!lay) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const reach = e.pointerType === "touch" ? 12 : 6;
			for (const b of lay.L.boxes) {
				const y0 = b.rowY !== undefined ? b.rowY : b.y - reach, y1 = b.rowY !== undefined ? b.rowY + b.rowH : b.y + b.h + reach + 16;
				if (mx >= b.x - reach && mx <= b.x + b.w + reach && my >= y0 && my <= y1) {
					const k = Math.max(0, Math.min(NW - 1, Math.floor((mx - b.x) / b.w * NW)));
					const i = b.p * NW + k;
					return e.type === "pointerdown" && i === pick.pinned ? -1 : i;
				}
			}
			return -1;
		},
		// arrows step through the weeks of the passage; from the overview they start at Hormuz's last week
		step: (from, dir) => {
			if (from < 0) return HI * NW + (dir > 0 ? MARCH : NW - 1);
			const pi = Math.floor(from / NW), k = (from % NW + dir + NW) % NW;
			return pi * NW + k;
		}
	});
	if (sel >= 0) grow = 1;
	if (grow < 1) {
		const t0 = performance.now() + 250;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1500)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow, sv = sel; grow = 1; sel = -1; draw(c, x, y, w, h, u * (w > h * 1.3 ? 1.4 : 1.5), true, null); grow = g; sel = sv; } };
})();
