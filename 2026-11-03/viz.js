// 2026-11-03 — the Route du Rhum on a map of the North Atlantic. One course, Saint-Malo to
// Pointe-à-Pitre, and 13 marks on it: where the winner of each edition would be at the moment the
// 2026 winner finished, at that winner's own average speed over the 3,542 nautical miles.
// The one red thing is 2026, at the finish. 1978, the first winner, is ink; the rest are grey.
// Picking an edition reads its sailor, boat, time, speed and distance covered.
(function () {
	const C = CD.colors, D = window.RHUM;
	const eds = D.editions, N = eds.length;
	const fmt = n => n.toLocaleString("en-US");
	const first = eds[0], last = eds[N - 1];
	const dur = (e, secs) => `${e.d}d ${e.h}h ${e.m}m` + (secs && e.s ? ` ${e.s}s` : "");
	const S1 = `In the time it took to win the ${last.year} Route du Rhum, the ${first.year} winner had sailed ${first.pct}% of the way.`;
	const SUB = `WHERE EACH OF THE ${N} WINNERS WOULD BE AFTER ${dur(last).toUpperCase()}, AT THEIR OWN AVERAGE SPEED`;
	const role = e => e === last ? 2 : e === first ? 1 : 0;

	let sel = -1;

	function readout() {
		if (sel < 0) return [S1, `Where each of the ${N} winners would be after ${dur(last)}, at their own average speed`];
		const e = eds[sel];
		const where = e === last ? `finished: ${fmt(D.courseNm)} nautical miles` : `${fmt(e.nm)} nautical miles out when ${last.year} finished · ${fmt(e.togo)} to go`;
		return [`${e.year}: ${e.sailor}`, `${e.boat} · won in ${dur(e, true)} · ${e.knots} knots · ${where}`];
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

	// the map's window: the North Atlantic, with room past Guadeloupe for its label
	const LON0 = -72, LON1 = 3, LAT0 = 6.5, LAT1 = 53.5, K = Math.cos(33 * Math.PI / 180);
	const MW = (LON1 - LON0) * K, MH = LAT1 - LAT0;
	// a point at a share t of the drawn course
	function along(t) {
		const c = D.course; let i = 1;
		while (i < c.length - 1 && c[i][2] < t) i++;
		const a = c[i - 1], b = c[i], f = b[2] === a[2] ? 0 : (t - a[2]) / (b[2] - a[2]);
		return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
	}

	function draw(ctx, x, y, w, h, s, exporting) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		const wide = w >= 760 * s;
		const [value, full] = readout();

		// ---- the sentence and the small line under it
		const colW = wide ? Math.min(0.38 * w, 470 * s) : w;
		const short = !wide && h < 400 * s;
		const fs = short ? 17 * s : Math.max(19 * s, Math.min((wide ? 36 : 30) * s, colW / (wide ? 12 : 18)));
		ctx.font = `600 ${fs}px ${C.sans}`;
		const lines = balance(ctx, S1, colW);
		ctx.font = mono;
		const sub = short ? [] : balance(ctx, SUB, colW);
		const sentH = lines.length * fs * 1.14, headH = sentH + (sub.length ? 7 * s + sub.length * 16 * s : 0);
		const blockH = wide ? headH : Math.max(headH, 84 * s);
		const under = wide && headH + 18 * s + 116 * s <= h;
		if (under || sel < 0) {
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 7 * s + 11 * s + i * 16 * s));
		}

		// ---- a wide frame with room lists all 13 under the sentence: year, sailor, time. The reader's
		// edition is marked there, so its reading can sit on the map beside its mark.
		const ROW = 18.5 * s, listY = y + headH + 26 * s;
		// one column where the frame is tall enough, two (7 and 6) where it is not
		const perCol = listY + N * ROW <= y + h ? N : Math.ceil(N / 2);
		const list = wide && colW >= 440 * s && listY + perCol * ROW <= y + h;
		let rowsGeo = null;
		if (list) {
			ctx.font = mono;
			const gapC = 22 * s, cw = perCol === N ? colW : (colW - gapC) / 2, yw = ctx.measureText("0000 ").width;
			eds.forEach((e, i) => {
				const cx0 = x + Math.floor(i / perCol) * (cw + gapC), cT = cx0 + yw, cR = cx0 + cw;
				const r = role(e), on = i === sel, by = listY + (i % perCol) * ROW + 12 * s;
				ctx.font = r || on ? monoB : mono;
				ctx.fillStyle = r === 2 ? C.red : r === 1 || on ? C.ink : C.ink2;
				ctx.globalAlpha = sel >= 0 && !on ? 0.45 : 1;
				ctx.textAlign = "left"; ctx.fillText(String(e.year), cx0, by); ctx.fillText((perCol === N ? e.sailor : e.sailor.split(" ").pop()).toUpperCase(), cT, by);   // surnames where the columns are narrow
				ctx.textAlign = "right"; ctx.fillText(dur(e).toUpperCase(), cR, by);
			});
			ctx.globalAlpha = 1; ctx.textAlign = "left";
			rowsGeo = { x, y: listY, w: colW, row: ROW, perCol, cw: cw + gapC };
		}

		// ---- the map: fitted into what is left, whole
		const ax = wide ? x + colW + 36 * s : x, ay = wide ? y : y + blockH + 10 * s;
		const aw = x + w - ax, ah = y + h - ay;
		const k = Math.min(aw / MW, ah / MH);
		const mx = ax + (aw - MW * k) / 2, my = ay + (ah - MH * k) / 2;
		const P = (lon, lat) => [mx + (lon - LON0) * K * k, my + (LAT1 - lat) * k];
		ctx.save();
		ctx.beginPath(); ctx.rect(mx, my, MW * k, MH * k); ctx.clip();
		ctx.fillStyle = C.rule;
		ctx.beginPath();
		for (const ring of D.land) { ring.forEach((p, i) => { const q = P(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); }
		ctx.fill();
		ctx.restore();

		// the course, start to finish
		const cpts = D.course.map(p => P(p[0], p[1]));
		ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2 * s; ctx.setLineDash([2 * s, 4 * s]);
		ctx.beginPath(); cpts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
		ctx.setLineDash([]);
		const A = cpts[0], Z = cpts[cpts.length - 1];
		// the reader's edition: the water it had covered, as a solid line
		if (sel >= 0) {
			const e = eds[sel];
			ctx.strokeStyle = role(e) === 2 ? C.red : C.ink; ctx.lineWidth = 2.6 * s;
			ctx.beginPath(); ctx.moveTo(A[0], A[1]);
			for (const c of D.course) { if (c[2] >= e.frac) break; const q = P(c[0], c[1]); ctx.lineTo(q[0], q[1]); }
			const q = P(...along(e.frac)); ctx.lineTo(q[0], q[1]); ctx.stroke();
		}

		// the two ends
		ctx.font = mono; ctx.fillStyle = C.ink2;
		ctx.beginPath(); ctx.arc(A[0], A[1], 2.5 * s, 0, 7); ctx.fill();
		ctx.textAlign = "right"; ctx.fillText("SAINT-MALO", Math.min(A[0] + 4 * s, mx + MW * k), A[1] - 9 * s);
		ctx.textAlign = "left";

		// ---- the 13 marks, and a year for each: years alternate between the two sides of the course and
		// are pushed apart along it until none touches the next
		const ux = (Z[0] - A[0]), uy = (Z[1] - A[1]), ul = Math.hypot(ux, uy), dx = ux / ul, dy = uy / ul;
		const nx = -dy, ny = dx;                      // points to the open-ocean side (up and left)
		const marks = eds.map((e, i) => { const q = P(...along(e.frac)); return { i, e, x: q[0], y: q[1], t: (q[0] - A[0]) * dx + (q[1] - A[1]) * dy }; });
		const others = marks.filter(m => role(m.e) !== 2).sort((p, q) => p.t - q.t);
		const GAPL = 23 * s, OFF = 22 * s;
		[0, 1].forEach(side => {
			const list = others.filter((m, j) => j % 2 === side);
			list.forEach((m, j) => { m.side = side; m.lt = Math.max(m.t, j ? list[j - 1].lt + GAPL : -Infinity); });
			for (let j = list.length - 1; j >= 0; j--) {
				const lim = j < list.length - 1 ? list[j + 1].lt - GAPL : ul - 30 * s;
				list[j].lt = Math.min(list[j].lt, lim);
			}
			// centre a pushed group on its marks, as far as the neighbours allow
			list.forEach(m => {
				const sgn = side ? -1 : 1;
				const bx = m.x + (m.lt - m.t) * dx, by = m.y + (m.lt - m.t) * dy;
				m.lx = bx + nx * OFF * sgn; m.ly = by + ny * OFF * sgn;
			});
		});
		const fin = marks.find(m => role(m.e) === 2);
		fin.lx = fin.x - 6 * s; fin.ly = fin.y + 20 * s; fin.side = 2;

		marks.slice().sort((p, q) => (p.i === sel) - (q.i === sel) || role(p.e) - role(q.e)).forEach(m => {
			const r = role(m.e), on = m.i === sel;
			ctx.globalAlpha = sel >= 0 && !on ? 0.3 : 1;
			const col = r === 2 ? C.red : r === 1 || on ? C.ink : C.ink2;
			if (m.side < 2) {
				ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
				const ex = m.lx - (m.lx - m.x) * 0.36, ey = m.ly - (m.ly - m.y) * 0.36;
				ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ex, ey); ctx.stroke();
			}
			ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(m.x, m.y, (r === 2 ? 7.5 : r || on ? 5.5 : 4.5) * s, 0, 7); ctx.fill();
			ctx.fillStyle = col; ctx.beginPath(); ctx.arc(m.x, m.y, (r === 2 ? 6 : r || on ? 4.2 : 3.2) * s, 0, 7); ctx.fill();
			ctx.font = r || on ? monoB : mono; ctx.textBaseline = "middle";
			if (r === 2) {
				ctx.textAlign = "left";
				ctx.fillText(`${m.e.year} FINISHED`, m.lx, m.ly); ctx.fillStyle = C.ink2; ctx.font = mono;
				ctx.fillText("POINTE-À-PITRE", m.lx, m.ly + 15 * s);
			} else {
				ctx.textAlign = m.side ? "left" : "right";
				ctx.fillText(r === 1 ? `${m.e.year} · ${m.e.pct}%` : String(m.e.year), m.lx, m.ly);
			}
			ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
		});
		ctx.globalAlpha = 1;

		// ---- the reader's edition: the reading, and on the page the way back to all 13
		let back = null;
		if (sel >= 0) {
			const m = marks[sel];
			if (list) CD.label(ctx, m.x, m.y, value, full, s, { x: mx, y: my, w: MW * k, h: MH * k }, m.x, [{ x: m.x - 60 * s, y: m.y - 30 * s, w: 120 * s, h: 60 * s }]);
			else if (wide) CD.label(ctx, x - 12 * s, -1e4, value, full, s, { x, y: under ? y + headH + 18 * s : y, w: colW, h });
			else CD.label(ctx, x - 12 * s, -1e4, value, full, s, { x, y, w, h });
			if (!exporting) {
				ctx.font = mono;
				const t = `ALL ${N}`, tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
				const bx = x + w - bw, by = y + h - bh;
				ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
				back = { x: bx - 24, y: by - 24, w: bw + 24, h: bh + 24 };
			}
		}
		return { marks, back, rows: rowsGeo, map: { x: mx, y: my, w: MW * k, h: MH * k } };
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

	// ?y=1978: the edition's year; anything else opens the overview
	const q = CD.state.get("y");
	sel = eds.findIndex(e => String(e.year) === q);
	const pick = CD.selection({ initial: sel, key: "y", encode: i => eds[i].year, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the nearest mark or year label within reach picks that edition; the "All 13" box and anywhere
		// else go back to the overview
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			const L = geo.rows;
			if (L && mx >= L.x - 8 && mx <= L.x + L.w + 8 && my >= L.y && my < L.y + L.perCol * L.row) {
				const i = Math.floor(Math.max(0, mx - L.x) / L.cw) * L.perCol + Math.floor((my - L.y) / L.row);
				return i < N ? i : -1;
			}
			// a finger anywhere on the map takes the nearest mark; a mouse has to be close to one
			const M = geo.map, inMap = mx >= M.x && mx <= M.x + M.w && my >= M.y && my <= M.y + M.h;
			const reach = e.pointerType && e.pointerType !== "mouse" ? (inMap ? 1e4 : 30) : 16;
			let best = -1, bd = reach;
			for (const m of geo.marks) {
				const d = Math.min(Math.hypot(m.x - mx, m.y - my), Math.hypot(m.lx + (m.side === 1 ? 14 : m.side === 0 ? -14 : 40) - mx, m.ly - my));
				if (d < bd) { bd = d; best = m.i; }
			}
			return best;
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true) };
})();
