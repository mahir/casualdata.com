// 2026-11-21 — how long a radio signal takes from Earth to each of the five spacecraft leaving the
// solar system, on the 1st of every month since launch and on 21 Nov 2026. Five lines on one scale,
// a hairline at 24 hours. The one red thing is Voyager 1, which ends on that hairline.
// Picking a month reads every craft that had launched by then, and Voyager 1's distance.
(function () {
	const C = CD.colors, D = window.VOYAGER;
	const crafts = D.crafts, V1 = crafts.find(c => c.id === "voyager1");
	const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const kOf = ym => { const [y, m] = ym.split("-").map(Number); return y * 12 + m - 1; };
	crafts.forEach(c => { c.k0 = kOf(c.start); });
	const K0 = Math.min(...crafts.map(c => c.k0)), K1 = kOf(D.asOf.slice(0, 7)), N = K1 - K0 + 1;
	const asOfDay = +D.asOf.slice(8), KT = K1 + (asOfDay - 1) / 30;          // 21 Nov, as a place on the month scale
	const dayText = iso => `${+iso.slice(8)} ${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
	const TODAY = dayText(D.asOf), CROSSED = dayText(D.crossed);
	const S1 = CD.day ? CD.day.title : document.querySelector(".cd-title").textContent;
	const SUB = "HOURS FOR A RADIO SIGNAL FROM EARTH TO REACH EACH SPACECRAFT, MONTHLY SINCE LAUNCH · NASA/JPL HORIZONS";
	const hm = hours => { const m = Math.round(hours * 60), h = Math.floor(m / 60); return h ? `${h} h ${m % 60} min` : `${m} min`; };
	const kmText = au => { const km = au * D.auKm; return km >= 1e9 ? `${(km / 1e9).toFixed(2)} billion km` : `${Math.round(km / 1e6)} million km`; };
	const ymOf = i => { const k = K0 + i; return `${Math.floor(k / 12)}-${String(k % 12 + 1).padStart(2, "0")}`; };
	const monthText = i => { const k = K0 + i; return `${MONTHS[k % 12]} ${Math.floor(k / 12)}`; };
	// a craft's hours in month i (null before its first month), or today's when i is -1
	const at = (c, i) => i < 0 ? c.today.hours : (K0 + i >= c.k0 ? c.hours[K0 + i - c.k0] : null);
	const v1Au = i => i < 0 ? V1.today.au : (K0 + i >= V1.k0 ? V1.au[K0 + i - V1.k0] : null);

	let sel = -1;

	function readout() {
		if (sel < 0) return [S1, `On ${TODAY}: ` + crafts.map(c => `${c.name} ${hm(c.today.minutes / 60)}`).join(" · ")];
		const up = crafts.filter(c => at(c, sel) !== null), au = v1Au(sel);
		return [`1 ${monthText(sel)}`, up.map(c => `${c.name} ${hm(at(c, sel))}`).join(" · ") + (au !== null ? ` · Voyager 1 was ${kmText(au)} from Earth` : "")];
	}

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	function balance(ctx, text, w) {
		const n = wrap(ctx, text, w).length;
		let lo = w * 0.4, hi = w;
		for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; wrap(ctx, text, m).length > n ? lo = m : hi = m; }
		return wrap(ctx, text, hi);
	}

	// Two frames. On the page the chart is the page: the title is HTML and, on wide screens, lies over
	// the empty top left of the plot (page.head is its box). A shared image has no title, so the
	// drawing carries the sentence and one small line in that same corner.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const px1 = Math.max(1, s);
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`;
		const name = `500 ${12.5 * s}px ${C.sans}`, nameB = `700 ${12.5 * s}px ${C.sans}`;
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		let head = page ? page.head : null, top = y;

		// ---- a shared image: the sentence, and one small line under it
		if (!page) {
			const wideImg = w >= 760 * s;
			const colW = wideImg ? Math.min(0.5 * w, 560 * s) : w;
			const fs = wideImg ? Math.min(30 * s, colW / 17) : 30 * s;
			ctx.font = `600 ${fs}px ${C.sans}`;
			const lines = balance(ctx, S1, colW);
			ctx.fillStyle = C.ink;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			const sentH = lines.length * fs * 1.14;
			ctx.font = mono; ctx.fillStyle = C.ink2;
			const sub = balance(ctx, SUB, colW);
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 8 * s + 11 * s + i * 16 * s));
			const hh = sentH + 8 * s + sub.length * 16 * s + 4 * s;
			if (wideImg) head = { x, y, w: colW, h: hh }; else top = y + hh + 14 * s;
		}

		// ---- the end labels decide the right margin: one line each where there is room, two on a phone
		const single = w >= 700 * s;
		const ends = crafts.map(c => ({ c, red: c === V1, a: c.name, b: c === V1 ? "24 hours" : `${c.today.hours.toFixed(1)} h` }));
		const lw = t => { ctx.font = t.red ? nameB : name; const a = ctx.measureText(single ? t.a + " " : t.a).width; ctx.font = t.red ? monoB : mono; const b = ctx.measureText(single ? "· " + t.b : t.b).width; return single ? a + b : Math.max(a, b); };
		const bodyText = b => single ? `${b.name} · ${b.hours.toFixed(1)} h` : `${b.name} ${b.hours.toFixed(1)} h`;
		const widest = Math.max(...ends.map(lw));
		ctx.font = mono;
		const dateW = exporting ? ctx.measureText(CROSSED.toUpperCase()).width : 0;
		const labW = Math.max(dateW, widest, ...D.bodies.map(b => ctx.measureText(bodyText(b)).width));
		const gapL = 16 * s;
		const padR = labW + gapL + (page ? (single ? 24 : 10) * s : 2 * s), padB = 24 * s, padT = 30 * s;
		let pl = head ? head.x : x + 26 * s;
		const pr = x + w - padR, yB = y + h - padB, y24 = top + padT;
		const Y = hrs => yB - hrs / 24 * (yB - y24);
		let X = k => pl + (k - K0) / (KT - K0) * (pr - pl);

		// ---- the key: under the title on wide frames, in the empty top left of the plot otherwise
		// (there only once a month is picked, or where the plot is wide enough to spare the corner)
		const up = crafts.filter(c => at(c, sel) !== null);
		const slim = !head && pr - pl < 560 * s;                                // a phone: the corner is small
		const keyW = head ? Math.min(head.w, 330 * s) : slim ? Math.min(pr - pl - 20 * s, 152 * s) : 300 * s;
		const rowH = (slim ? 17 : 19) * s, keyH = 22 * s + crafts.length * rowH + 22 * s;
		const showKey = !!head || sel >= 0 || pr - pl >= 560 * s;
		let key = showKey ? (head ? { x: head.x, y: head.y + head.h + 24 * s, w: keyW, h: keyH } : { x: pl + (slim ? 4 : 12) * s, y: y24 + (slim ? 8 : 12) * s, w: keyW, h: keyH }) : null;
		if (head) {
			// the lines must pass under the title and the key; if they would not, the plot starts beside them
			const edge = head.x + Math.max(head.w, keyW) + 14 * s, floor = (key ? key.y + key.h : head.y + head.h) + 12 * s;
			const clear = () => crafts.every(c => c.hours.every((v, j) => X(c.k0 + j) > edge || Y(v) > floor));
			if (!clear()) { pl = edge + 30 * s; }
		}

		// ---- hour lines: 6, 12 and 18 in grey, and the hairline at 24. Each starts clear of the title and key
		const blocks = [head, slim ? null : key].filter(Boolean);   // on a phone the key is small: the line is cleared from under it below
		const startX = (gy, pad) => blocks.reduce((m, b) => gy > b.y - pad && gy < b.y + b.h + pad ? Math.max(m, b.x + b.w + 30 * s) : m, pl);
		ctx.lineWidth = px1; ctx.font = mono; ctx.textBaseline = "middle";
		[0, 6, 12, 18].forEach(v => {
			const gy = Math.round(Y(v)) + 0.5, gx = startX(gy, 10 * s);
			ctx.strokeStyle = v ? C.rule : C.ink3; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(pr, gy); ctx.stroke();
			ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.fillText(String(v), gx - 7 * s, gy);
		});
		ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
		{
			const gy = Math.round(Y(24)) + 0.5, gx = head ? startX(gy, 22 * s) : pl;
			ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(pr, gy); ctx.stroke();
			ctx.fillStyle = C.ink; ctx.font = monoB; ctx.fillText("24 HOURS: ONE LIGHT-DAY", gx, gy - 8 * s);
		}
		// on a phone the key lies over the 18 line: clear the line from under its rows, so it does not strike them through
		if (slim && key) { ctx.fillStyle = C.paper; ctx.fillRect(key.x - 3 * s, key.y, key.w + 9 * s, key.h - 14 * s); }
		// decades along the bottom
		ctx.font = mono; ctx.fillStyle = C.ink2; ctx.textAlign = "center"; ctx.strokeStyle = C.ink3;
		let mBox = null;
		if (sel >= 0) {
			ctx.font = monoB; const tw = ctx.measureText(monthText(sel).toUpperCase()).width;
			const mx = Math.min(Math.max(X(K0 + sel) - tw / 2, x + 4 * s), x + w - tw - 4 * s);
			mBox = { x: mx, w: tw }; ctx.font = mono;
		}
		for (let yr = 1980; yr <= 2020; yr += 10) {
			const tx = X(yr * 12);
			if (tx < pl + 10 * s) continue;
			if (mBox && tx + 26 * s > mBox.x && tx - 26 * s < mBox.x + mBox.w) continue;
			ctx.beginPath(); ctx.moveTo(tx, yB); ctx.lineTo(tx, yB + 4 * s); ctx.stroke();
			ctx.fillText(String(yr), tx, yB + 17 * s);
		}
		ctx.textAlign = "left";

		// ---- the five lines, grey first, the red one last
		const path = c => {
			ctx.beginPath();
			c.hours.forEach((v, j) => { const qx = X(c.k0 + j), qy = Y(v); j ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy); });
			ctx.lineTo(X(KT), Y(c.today.hours)); ctx.stroke();
		};
		crafts.filter(c => c !== V1).forEach(c => { ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5 * s; path(c); });
		ctx.strokeStyle = C.paper; ctx.lineWidth = 5 * s; path(V1);
		ctx.strokeStyle = C.red; ctx.lineWidth = 2.6 * s; path(V1);

		// ---- the ends: a dot and a label each, pushed apart where two lines end close together
		const xe = X(KT), lh = single ? 17 * s : 31 * s;
		ends.forEach(t => { t.y = Y(t.c.today.hours); t.ly = t.y; });
		const byY = ends.slice().sort((p, q) => p.y - q.y);
		for (let n = 0; n < 40; n++) for (let j = 1; j < byY.length; j++) {
			const d = byY[j - 1].ly + lh - byY[j].ly;
			if (d > 0) { if (byY[j - 1].red) byY[j].ly += d; else { byY[j - 1].ly -= d / 2; byY[j].ly += d / 2; } }
		}
		// Neptune and Pluto on the same day, for scale: two short ticks at the right edge
		ctx.font = mono; ctx.textBaseline = "middle";
		const bodies = D.bodies.map(b => ({ b, y: Y(b.hours), ly: Y(b.hours) })).sort((p, q) => p.y - q.y);
		if (bodies.length === 2 && bodies[1].ly - bodies[0].ly < 14 * s) { const d = 14 * s - (bodies[1].ly - bodies[0].ly); bodies[0].ly -= d / 2; bodies[1].ly += d / 2; }
		bodies.forEach(t => {
			ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(xe - 5 * s, t.y); ctx.lineTo(xe + 5 * s, t.y); ctx.lineTo(xe + gapL - 4 * s, t.ly); ctx.stroke();
			ctx.fillStyle = C.ink2; ctx.fillText(bodyText(t.b), xe + gapL, t.ly);
		});
		ends.forEach(t => {
			if (Math.abs(t.ly - t.y) > 1) { ctx.strokeStyle = C.ink3; ctx.lineWidth = px1; ctx.beginPath(); ctx.moveTo(xe + 5 * s, t.y); ctx.lineTo(xe + gapL - 4 * s, t.ly); ctx.stroke(); }
			ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(xe, t.y, (t.red ? 8 : 4.6) * s, 0, 7); ctx.fill();
			ctx.fillStyle = t.red ? C.red : C.ink2; ctx.beginPath(); ctx.arc(xe, t.y, (t.red ? 6.5 : 3.2) * s, 0, 7); ctx.fill();
			const tx = xe + gapL;
			if (single) {
				ctx.font = t.red ? nameB : name; ctx.fillStyle = t.red ? C.red : C.ink;
				ctx.fillText(t.a, tx, t.ly); const aw = ctx.measureText(t.a + " ").width;
				ctx.font = t.red ? monoB : mono; ctx.fillStyle = t.red ? C.red : C.ink2;
				ctx.fillText("· " + t.b, tx + aw, t.ly + 0.5 * s);
				if (t.red && exporting) { ctx.font = mono; ctx.fillStyle = C.ink; ctx.fillText(CROSSED.toUpperCase(), tx, t.ly + 17 * s); }
			} else {
				ctx.font = t.red ? nameB : name; ctx.fillStyle = t.red ? C.red : C.ink;
				ctx.fillText(t.a, tx, t.ly - 7 * s);
				ctx.font = t.red ? monoB : mono; ctx.fillStyle = t.red ? C.red : C.ink2;
				ctx.fillText(t.b, tx, t.ly + 8 * s);
				if (t.red && exporting) { ctx.font = mono; ctx.fillStyle = C.ink; ctx.fillText(CROSSED.toUpperCase(), tx, t.ly + 24 * s); }
			}
		});
		ctx.textBaseline = "alphabetic";

		// ---- the reader's month: a hairline up to the farthest craft, and a dot on each line
		if (sel >= 0) {
			const sx = Math.round(X(K0 + sel)) + 0.5, vals = up.map(c => at(c, sel));
			ctx.strokeStyle = C.ink; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(sx, yB); ctx.lineTo(sx, Y(Math.max(0, ...vals)) - 10 * s); ctx.stroke();
			up.forEach(c => {
				const qy = Y(at(c, sel));
				ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(sx, qy, 5.6 * s, 0, 7); ctx.fill();
				ctx.fillStyle = c === V1 ? C.red : C.ink; ctx.beginPath(); ctx.arc(sx, qy, 4 * s, 0, 7); ctx.fill();
			});
			// the month under the axis, on a patch of paper so the decade beside it gives way
			ctx.font = monoB; ctx.fillStyle = C.ink; ctx.fillText(monthText(sel).toUpperCase(), mBox.x, yB + 17 * s);
		}

		// ---- the key: every craft's reading for the day shown
		if (key) {
			ctx.font = `600 ${14 * s}px ${C.sans}`; ctx.fillStyle = C.ink;
			ctx.fillText(sel < 0 ? TODAY : `1 ${monthText(sel)}`, key.x, key.y + 13 * s);
			const withYear = key.w >= 280 * s;
			crafts.forEach((c, i) => {
				const by = key.y + (slim ? 40 : 22) * s + i * rowH + 14 * s, v = at(c, sel), red = c === V1;
				ctx.globalAlpha = v === null ? 0.45 : 1;
				if (!slim) {
					ctx.strokeStyle = red ? C.red : C.ink2; ctx.lineWidth = (red ? 2.6 : 1.5) * s;
					ctx.beginPath(); ctx.moveTo(key.x, by - 4 * s); ctx.lineTo(key.x + 14 * s, by - 4 * s); ctx.stroke();
				}
				ctx.font = red ? nameB : name; ctx.fillStyle = C.ink; ctx.textAlign = "left";
				ctx.fillText(c.name, key.x + (slim ? 0 : 22 * s), by);
				ctx.font = mono; ctx.fillStyle = C.ink2;
				if (withYear) ctx.fillText(`SINCE ${c.firstYear}`, key.x + 124 * s, by);
				ctx.font = red ? monoB : mono; ctx.fillStyle = red ? C.ink : C.ink2; ctx.textAlign = "right";
				ctx.fillText(v === null ? "–" : (sel < 0 ? hm(c.today.minutes / 60) : hm(v)), key.x + key.w, by);
				ctx.globalAlpha = 1;
			});
			ctx.textAlign = "left";
			const au = v1Au(sel);
			if (au !== null) {
				ctx.font = name; ctx.fillStyle = C.ink2;
				ctx.fillText(slim ? `Voyager 1: ${kmText(au)}` : `Voyager 1: ${kmText(au)} from Earth`, key.x, slim ? key.y + 32 * s : key.y + 22 * s + crafts.length * rowH + 17 * s);   // on a phone it sits at the top, where the corner is widest
			}
		}

		// ---- on the page, the way back to today
		let back = null;
		if (sel >= 0 && !exporting) {
			ctx.font = mono;
			const t = "TODAY", tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
			const bx = x + w - bw - 12 * s, by = yB - bh - 6 * s;
			ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
			ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
			ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
			back = { x: bx - 12, y: by - 14, w: bw + 24, h: bh + 28 };
		}
		return { pl, pr, back, kAt: mx => K0 + (mx - pl) / (pr - pl) * (KT - K0) };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	const headEl = document.querySelector(".cd-head .cd-text");
	let geo = null, W = 0, Hh = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== Hh) { W = r.width; Hh = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		geo = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage) });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(headEl);
	// ask for every face the drawing uses, so an image shared in the first instant is the finished frame
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `500 13px ${C.sans}`, `600 17px ${C.sans}`, `700 13px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?t=1990-02: the month; anything else opens on today
	const q = CD.state.get("t") || "";
	sel = /^\d{4}-(0[1-9]|1[0-2])$/.test(q) ? kOf(q) - K0 : -1;
	if (sel < 0 || sel >= N) sel = -1;
	const pick = CD.selection({ initial: sel, key: "t", encode: ymOf, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// anywhere over the plot picks the nearest month; the "Today" box and the margins go back to today
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			if (mx < geo.pl - 14 || mx > geo.pr + 6) return -1;
			return Math.min(N - 1, Math.max(0, Math.round(geo.kAt(mx)) - K0));
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : Math.min(N - 1, Math.max(0, from + dir))
	});
	// Page Up and Page Down step a year
	cv.addEventListener("keydown", e => {
		const dir = { PageDown: 1, PageUp: -1 }[e.key]; if (!dir) return;
		e.preventDefault();
		pick.pin(pick.shown < 0 ? (dir > 0 ? 0 : N - 12) : Math.min(N - 1, Math.max(0, pick.shown + dir * 12)));
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true, null) };
})();
