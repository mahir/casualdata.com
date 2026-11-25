// 2026-11-24 — the ages of both players in every two-player world chess title match since 1886, drawn as a
// lifeline (Lexis) diagram: calendar years one way, age the other. Each match is a short link between its
// two players' ages on the day it began; a player who played more than one title match gets a thin diagonal
// from their first match to their last, since a person ages one year per year. The one red thing is 2026:
// Gukesh and Sindarov, both 20, alone at the young edge, with no link at all (their ages are five months apart).
// Wide screens: years across, age up. Phones and tall images: years run down the page, age across.
(function () {
	const C = CD.colors, D = window.CHESS;
	const MS = D.matches, PL = D.players;
	const DAY = 864e5, YEAR = 365.2425 * DAY;
	const tOf = iso => { const d = Date.parse(iso + "T12:00:00Z"), y = +iso.slice(0, 4); return y + (d - Date.UTC(y, 0, 1)) / (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)); };
	const exact = (born, iso) => (Date.parse(iso + "T12:00:00Z") - Date.parse(born + "T12:00:00Z")) / YEAR;
	const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const dayText = iso => `${+iso.slice(8)} ${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
	MS.forEach(m => { m.t = tOf(m.date); m.xw = exact(PL[m.w].born, m.date); m.xl = exact(PL[m.l].born, m.date); m.year = +m.date.slice(0, 4); });
	const NOW = MS.length - 1, M26 = MS[NOW];
	// the players who played more than one title match get a line from their first match to their last
	PL.forEach((p, k) => { p.ms = MS.filter(m => m.w === k || m.l === k); });
	const lines = PL.filter(p => p.ms.length > 1).map(p => {
		const a = p.ms[0], b = p.ms[p.ms.length - 1];
		return { p, t0: a.t, a0: exact(p.born, a.date), t1: b.t, a1: exact(p.born, b.date) };
	});
	const NAMED = ["Lasker", "Botvinnik", "Karpov", "Kasparov", "Anand", "Carlsen"];
	// the youngest "older player" before 2026, for the rule
	const FLOOR = Math.min(...MS.slice(0, NOW).map(m => Math.max(m.aw, m.al)));
	const S1 = `Both players in the 2026 world chess title match are 20. In every earlier match, at least one player was ${FLOOR} or older.`;
	const SUB = "AGES OF BOTH PLAYERS WHEN EACH WORLD TITLE MATCH BEGAN, 1886–2026 · WIKIPEDIA, WIKIDATA";
	// a match in the link: 1972, or 1993-short where a year had two matches
	const dup = y => MS.filter(m => m.year === y).length > 1;
	const slug = s => s.normalize("NFD").replace(/[^A-Za-z]/g, "").toLowerCase();
	const code = i => { const m = MS[i]; return dup(m.year) ? `${m.year}-${slug(PL[m.l].short)}` : String(m.year); };
	const resText = m => {
		const W = PL[m.w].short, L = PL[m.l].short;
		return m.res === "won" ? `${W} won` : m.res === "drawn" ? `Drawn: ${W} kept the title` : m.res === "abandoned" ? `Stopped with no result: ${W} kept the title` : `Game 1 on ${dayText(m.date)}`;
	};
	const pair = m => `${PL[m.w].short} ${m.aw} · ${PL[m.l].short} ${m.al}`;

	let sel = -1, hov = -1;
	let grow = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0;
	const moved = () => 1 - Math.pow(1 - Math.min(1, grow / 0.8), 3);
	const faded = () => Math.min(1, Math.max(0, (grow - 0.8) / 0.2));

	function readout() {
		const i = sel < 0 ? NOW : sel, m = MS[i];
		const what = m.title === "classical" ? " (Classical title)" : m.title === "fide" ? (m.knockout ? " (FIDE title, final of a knockout)" : " (FIDE title)") : "";
		return [`${m.year}${what}`, `${PL[m.w].name} ${m.aw}, ${PL[m.l].name} ${m.al}. ${resText(m)}`];
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

	const T0 = 1882, T1 = 2029, A1 = 62;

	function draw(ctx, x, y, w, h, s, exporting, page) {
		const px1 = Math.max(1, s);
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`;
		const name = `500 ${12.5 * s}px ${C.sans}`, nameB = `700 ${13.5 * s}px ${C.sans}`;
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		let head = page ? page.head : null, top = y;
		const tall = w < 600 * s || h > 1.15 * w;
		const A0 = tall ? 15 : 12;   // wide frames keep room under the youngest marks for the red label

		// ---- a shared image: the sentence, and one small line under it
		if (!page) {
			const wideImg = !tall && w >= 760 * s;
			const colW = wideImg ? Math.min(0.5 * w, 560 * s) : w;
			const fs = wideImg ? Math.min(30 * s, colW / 17) : 30 * s;
			ctx.font = `600 ${fs}px ${C.sans}`;
			const ls = balance(ctx, S1, colW);
			ctx.fillStyle = C.ink;
			ls.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			const sentH = ls.length * fs * 1.14;
			ctx.font = mono; ctx.fillStyle = C.ink2;
			const sub = balance(ctx, SUB, colW);
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 8 * s + 11 * s + i * 16 * s));
			const hh = sentH + 8 * s + sub.length * 16 * s + 4 * s;
			if (wideImg) head = { x, y, w: colW, h: hh }; else top = y + hh + 22 * s;
		}

		// ---- the frame. P(t, a) gives a point for a time and an age in either orientation
		let P, box;
		if (!tall) {
			const padL = 30 * s, padR = 14 * s, padB = 26 * s;
			let x0 = x + padL, x1 = x + w - padR, yB = y + h - padB, yT = top + 18 * s;
			const X = t => x0 + (t - T0) / (T1 - T0) * (x1 - x0), Y = a => yB - (a - A0) / (A1 - A0) * (yB - yT);
			if (head) {
				// the marks must stay clear of the title block: if any would fall under it, the plot starts below it
				const hb = { x0: head.x - 10 * s, x1: head.x + head.w + 16 * s, y1: head.y + head.h + 18 * s };
				const under = (t, a) => X(t) > hb.x0 && X(t) < hb.x1 && Y(a) < hb.y1;
				const hit = MS.some(m => under(m.t, Math.max(m.xw, m.xl))) || lines.some(l => [0, .25, .5, .75, 1].some(f => under(l.t0 + f * (l.t1 - l.t0), l.a0 + f * (l.a1 - l.a0))));
				if (hit) x0 = hb.x1 + 34 * s;   // beside the title block: the plot keeps its full height
			}
			P = (t, a) => [X(t), Y(a)];
			box = { x0, x1, y0: yT, y1: yB };
		} else {
			const padL = 40 * s, padR = 16 * s, padT = 16 * s, padB = 48 * s;
			const x0 = x + padL, x1 = x + w - padR, yT = top + padT, yB = y + h - padB;
			const Ax = a => x0 + (a - A0) / (A1 - A0) * (x1 - x0), Ty = t => yT + (t - T0) / (T1 - T0) * (yB - yT);
			P = (t, a) => [Ax(a), Ty(t)];
			box = { x0, x1, y0: yT, y1: yB };
		}

		// ---- grid: ages every ten years, decades of the calendar every twenty
		ctx.lineWidth = px1; ctx.font = mono; ctx.fillStyle = C.ink2;
		[20, 30, 40, 50, 60].forEach(a => {
			const [ax0, ay0] = P(T0, a), [ax1, ay1] = P(T1, a);
			ctx.strokeStyle = C.rule; ctx.beginPath();
			if (!tall) { const gy = Math.round(ay0) + 0.5; ctx.moveTo(box.x0, gy); ctx.lineTo(box.x1, gy); }
			else { const gx = Math.round(ax0) + 0.5; ctx.moveTo(gx, box.y0); ctx.lineTo(gx, box.y1); }
			ctx.stroke();
			const lab = a === 60 ? (tall ? "60" : "60 YEARS OLD") : String(a);
			if (!tall) { ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(lab, box.x0 - 26 * s, ay0 - 3 * s); }
			else { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(lab, ax0, box.y0 - 2 * s); }
		});
		if (tall) { ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText("AGE", P(T0, 60)[0] - 16 * s, box.y0 - 2 * s); }
		for (let yr = 1900; yr <= 2020; yr += 20) {
			const [tx, ty] = P(yr, A0);
			if (!tall) { ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(String(yr), tx, box.y1 + 18 * s); ctx.strokeStyle = C.ink3; ctx.beginPath(); ctx.moveTo(tx, box.y1); ctx.lineTo(tx, box.y1 + 4 * s); ctx.stroke(); }
			else { ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(String(yr), box.x0 - 8 * s, ty); }
		}
		// the rule: every earlier match had a player this old or older
		{
			const [a0x, a0y] = P(T0, FLOOR), [a1x, a1y] = P(T1, FLOOR);
			ctx.strokeStyle = C.ink2; ctx.setLineDash([3 * s, 3 * s]); ctx.beginPath();
			if (!tall) { const gy = Math.round(a0y) + 0.5; ctx.moveTo(box.x0, gy); ctx.lineTo(box.x1, gy); }
			else { const gx = Math.round(a0x) + 0.5; ctx.moveTo(gx, box.y0); ctx.lineTo(gx, box.y1); }
			ctx.stroke(); ctx.setLineDash([]);
			ctx.fillStyle = C.ink; ctx.font = monoB;
			if (!tall) { ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(String(FLOOR), box.x0 - 26 * s, a0y - 3 * s); }
			else { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(String(FLOOR), a0x, box.y0 - 2 * s); }
		}
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

		// ---- the motion: everything up to tNow is drawn; links arrive in date order, 2026 last
		const mv = moved(), la = faded(), tNow = T0 + 4 + (M26.t - T0 - 4) * mv;
		const shown = m => m.t <= tNow + 1e-6;

		// lifelines: thin grey diagonals, each as far as the motion has come
		ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.4 * s;
		lines.forEach(l => {
			if (l.t0 > tNow) return;
			const f = Math.min(1, (tNow - l.t0) / Math.max(1e-6, l.t1 - l.t0));
			const [ax, ay] = P(l.t0, l.a0), [bx, by] = P(l.t0 + f * (l.t1 - l.t0), l.a0 + f * (l.a1 - l.a0));
			ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
		});
		// links: a grey bar between the two ages, a dot at each end. Where a match was won, the winner's end is a
		// larger ink dot and the loser's a hollow ring; drawn and abandoned matches (and 2026, still playing) keep two plain dots
		const r = (tall ? 2.6 : 3) * s;
		const winnerDot = (qx, qy, rr, col) => { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(qx, qy, rr * 1.35 + 1.2 * s, 0, 7); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(qx, qy, rr * 1.35, 0, 7); ctx.fill(); };
		const loserDot = (qx, qy, rr, col) => { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(qx, qy, rr, 0, 7); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(qx, qy, rr - 0.3 * s, 0, 7); ctx.stroke(); };
		MS.forEach((m, i) => {
			if (i === NOW || !shown(m)) return;
			const [ax, ay] = P(m.t, m.xw), [bx, by] = P(m.t, m.xl);
			ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
			if (m.res === "won") { loserDot(bx, by, r, C.ink2); winnerDot(ax, ay, r, C.ink); }
			else { ctx.fillStyle = C.ink2; [[ax, ay], [bx, by]].forEach(([qx, qy]) => { ctx.beginPath(); ctx.arc(qx, qy, r, 0, 7); ctx.fill(); }); }
		});

		// player names, light, at the end of six long lines
		ctx.globalAlpha = la; ctx.font = name; ctx.fillStyle = C.ink2; ctx.textBaseline = "middle";
				lines.filter(l => NAMED.includes(l.p.short)).forEach(l => {
			// the name sits beside the middle of the line, on its young side
			const tm = (l.t0 + l.t1) / 2, am = (l.a0 + l.a1) / 2;
			const [qx, qy] = P(tm, am);
			const tw = ctx.measureText(l.p.short).width;
			let bx, by;
			if (!tall) { bx = qx + 6 * s; by = qy + 12 * s; ctx.textAlign = "left"; }
			else { bx = qx - 7 * s; by = qy + 2 * s; ctx.textAlign = "right"; }
			if (l.p.short === "Carlsen" || l.p.short === "Anand") { if (!tall) { by = qy - 14 * s; bx = qx - tw / 2; } }
			ctx.strokeStyle = C.paper; ctx.lineWidth = 4 * s; ctx.strokeText(l.p.short, bx, by);
			ctx.fillText(l.p.short, bx, by);
		});
		// the key: one winner mark and one loser mark. Wide: top right, above the old ages of recent years; tall: bottom right
		{
			ctx.font = mono; ctx.textBaseline = "middle"; ctx.textAlign = "left";
			const t1 = "WON", t2 = "LOST", gap = 14 * s, rr = r;
			const w1 = ctx.measureText(t1).width, w2 = ctx.measureText(t2).width;
			const kw = 2 * (rr * 1.35 * 2 + 6 * s) + w1 + w2 + gap;
			const kx = box.x1 - kw, ky = tall ? box.y1 - 8 * s : box.y0 + 8 * s;
			let cx = kx + rr * 1.35;
			winnerDot(cx, ky, rr, C.ink); ctx.fillStyle = C.ink2; ctx.fillText(t1, cx + rr * 1.35 + 6 * s, ky);
			cx += rr * 1.35 + 6 * s + w1 + gap + rr * 1.35;
			loserDot(cx, ky, rr, C.ink2); ctx.fillStyle = C.ink2; ctx.fillText(t2, cx + rr * 1.35 + 6 * s, ky);
		}
		ctx.globalAlpha = 1; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

		// ---- the reader's match: the link in ink, its year, both names and ages, and the result beside it
		const pick = sel >= 0 ? sel : hov;
		if (pick >= 0 && pick !== NOW) {
			const m = MS[pick], [ax, ay] = P(m.t, m.xw), [bx, by] = P(m.t, m.xl);
			ctx.strokeStyle = C.paper; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
			ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
			if (m.res === "won") { loserDot(bx, by, 4.4 * s, C.ink); winnerDot(ax, ay, 4.4 * s, C.ink); }
			else [[ax, ay], [bx, by]].forEach(([qx, qy]) => { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(qx, qy, 6 * s, 0, 7); ctx.fill(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(qx, qy, 4.4 * s, 0, 7); ctx.fill(); });
			const l1 = String(m.year) + (m.title === "classical" ? " · CLASSICAL TITLE" : m.title === "fide" ? " · FIDE TITLE" : ""), l2 = pair(m), l3 = resText(m);
			ctx.font = monoB; const w1 = ctx.measureText(l1).width; ctx.font = nameB; const w2 = ctx.measureText(l2).width; ctx.font = name; const w3 = ctx.measureText(l3).width;
			const bw = Math.max(w1, w2, w3), bh = 52 * s;
			let lx, ly;
			if (!tall) {
				const midY = (ay + by) / 2;
				lx = ax + 12 * s; if (lx + bw > x + w - 8 * s) lx = ax - 12 * s - bw;
				ly = Math.min(Math.max(midY - bh / 2, box.y0), box.y1 - bh);
			} else {
				lx = Math.min(Math.max(Math.min(ax, bx), box.x0), x + w - bw - 8 * s);
				ly = ay + 12 * s; if (ly + bh > box.y1) ly = ay - 12 * s - bh;
			}
			ctx.fillStyle = C.paper; ctx.globalAlpha = 0.9; ctx.fillRect(lx - 5 * s, ly - 3 * s, bw + 10 * s, bh + 4 * s); ctx.globalAlpha = 1;
			ctx.fillStyle = C.ink; ctx.font = monoB; ctx.fillText(l1, lx, ly + 11 * s);
			ctx.font = nameB; ctx.fillText(l2, lx, ly + 29 * s);
			ctx.font = name; ctx.fillStyle = C.ink2; ctx.fillText(l3, lx, ly + 46 * s);
		}

		// ---- 2026, the red pair, last
		if (grow >= 0.8 || mv >= 1) {
			const k = Math.min(1, la * 1.5 + (mv >= 1 ? 0.3 : 0));
			const [ax, ay] = P(M26.t, M26.xw), [bx, by] = P(M26.t, M26.xl);
			ctx.globalAlpha = Math.min(1, k + 0.2);
			const dots = [[bx, by], [ax, ay]];
			dots.forEach(([qx, qy]) => { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(qx, qy, 8 * s, 0, 7); ctx.fill(); });
			dots.forEach(([qx, qy]) => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(qx, qy, 5.5 * s, 0, 7); ctx.fill(); });
			ctx.globalAlpha = la;
			const a = "Gukesh 20 · Sindarov 20", b = "2026";
			ctx.font = `700 ${(tall ? 15 : 17) * s}px ${C.sans}`; const aw = ctx.measureText(a).width;
			ctx.fillStyle = C.red;
			if (!tall) {
				// left of the pair, under the youngest links of the last decade
				// under the pair, in the room below the youngest age anyone has played at
				const rx = Math.max(ax, bx) + 8 * s, ly = P(M26.t, 16.4)[1];
				ctx.textAlign = "right"; ctx.fillText(a, rx, ly);
				ctx.font = monoB; ctx.fillText((exporting ? "GAME 1 · " + dayText(M26.date).toUpperCase() : b), rx, ly + 17 * s);
				ctx.textAlign = "left";
			} else {
				// under the pair: the 2020s links lie just above it
				const lx = Math.max(box.x0 - 30 * s, Math.min(ax, bx) - 8 * s), ly = Math.max(ay, by) + 24 * s;
				ctx.fillText(a, lx, ly);
				ctx.font = monoB; ctx.fillText((exporting ? "GAME 1 · " + dayText(M26.date).toUpperCase() : b), lx, ly + 17 * s);
			}
			ctx.globalAlpha = 1;
		}

		// ---- the way back, on the page
		let back = null;
		if (sel >= 0 && !exporting) {
			ctx.font = mono;
			const t = "2026", tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
			const bx = x + w - bw - 12 * s, by = box.y0;
			ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
			ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
			ctx.fillStyle = C.ink; ctx.textAlign = "left"; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
			back = { x: bx - 12, y: by - 12, w: bw + 24, h: bh + 24 };
		}
		return { P, back, tall };
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
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `500 13px ${C.sans}`, `600 17px ${C.sans}`, `700 13px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?m=1972 or ?m=1993-short: the match; anything else opens on 2026
	const q = CD.state.get("m") || "";
	sel = MS.findIndex((m, i) => i !== NOW && code(i) === q);
	const pick = CD.selection({ initial: sel, key: "m", encode: code, onChange: i => { sel = i; schedule(); } });
	// nearest link within reach of the pointer
	function nearest(mx, my, reach) {
		let best = -1, bd = reach;
		MS.forEach((m, i) => {
			if (i === NOW) return;
			const [ax, ay] = geo.P(m.t, m.xw), [bx, by] = geo.P(m.t, m.xl);
			const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1;
			const f = Math.max(0, Math.min(1, ((mx - ax) * vx + (my - ay) * vy) / L));
			const d = Math.hypot(mx - (ax + f * vx), my - (ay + f * vy));
			if (d < bd) { bd = d; best = i; }
		});
		return best;
	}
	CD.bindSelection(cv, pick, {
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			return nearest(mx, my, e.pointerType === "touch" ? 28 : 18);
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : NOW - 1) : (from + dir < 0 || from + dir >= NOW ? -1 : from + dir)
	});
	if (grow < 1) {
		const t0 = performance.now() + 300;
		const step = t => { grow = sel >= 0 ? 1 : Math.min(1, Math.max(0, (t - t0) / 1800)); paint(); if (grow < 1) requestAnimationFrame(step); };
		requestAnimationFrame(step);
	}
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => { const g = grow, sv = hov; grow = 1; draw(c, x, y, w, h, u * 1.6, true, null); grow = g; hov = sv; } };
})();
