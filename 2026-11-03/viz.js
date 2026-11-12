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
	const CB = (() => {
		const lons = D.course.map(c => c[0]), lats = D.course.map(c => c[1]);
		const lon0 = Math.min(...lons), lat1 = Math.max(...lats);
		return { lon0, lat1, w: (Math.max(...lons) - lon0) * K, h: lat1 - Math.min(...lats) };
	})();
	// a point at a share t of the drawn course
	function along(t) {
		const c = D.course; let i = 1;
		while (i < c.length - 1 && c[i][2] < t) i++;
		const a = c[i - 1], b = c[i], f = b[2] === a[2] ? 0 : (t - a[2]) / (b[2] - a[2]);
		return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
	}

	// Two frames. On the page the map is the page: the title and dek are HTML, the course is fitted to
	// the room beside or under them and the land runs off the edges. In a shared image there is no
	// title, so the drawing carries the sentence, the small line and (where it is wide) the list.
	// page = { head: {x, y, w, h} | null }: the title block's box inside the canvas when it lies over it.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		const [value, full] = readout();
		const head = page && page.head;
		const wide = page ? !!head : w >= 760 * s;
		let colX = x, colW = w, listY = 0, region, headH = 0, under = false;

		if (page) {
			if (head) { colX = head.x; colW = head.w; listY = head.y + head.h + 30 * s; }
			region = head ? { x: head.x + head.w + 28 * s, y, w: x + w - head.x - head.w - 28 * s, h } : { x, y, w, h };
		} else {
			// ---- a shared image: the sentence and the small line under it
			colW = wide ? Math.min(0.38 * w, 470 * s) : w;
			const fs = Math.max(19 * s, Math.min((wide ? 36 : 30) * s, colW / (wide ? 12 : 18)));
			ctx.font = `600 ${fs}px ${C.sans}`;
			const lines = balance(ctx, S1, colW);
			ctx.font = mono;
			const sub = balance(ctx, SUB, colW);
			const sentH = lines.length * fs * 1.14; headH = sentH + 7 * s + sub.length * 16 * s;
			under = wide && headH + 18 * s + 116 * s <= h;
			if (under || sel < 0) {
				ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
				lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
				ctx.font = mono; ctx.fillStyle = C.ink2;
				sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 7 * s + 11 * s + i * 16 * s));
			}
			listY = y + headH + 26 * s;
			const ay = wide ? y : y + Math.max(headH, 84 * s) + 10 * s;
			region = wide ? { x: x + colW + 36 * s, y, w: w - colW - 36 * s, h } : { x, y: ay, w, h: y + h - ay };
		}

		// ---- the map. In an image: the whole window, fitted and cut square. On the page: the course
		// fitted to the room, with space kept for the years beside it, and land wherever it falls.
		let k, ox, oy;
		if (page) {
			const padL = 62 * s, padR = 34 * s, padT = 34 * s, padB = 52 * s;
			k = Math.min((region.w - padL - padR) / CB.w, (region.h - padT - padB) / CB.h);
			ox = region.x + padL + (region.w - padL - padR - CB.w * k) / 2 - (CB.lon0 - LON0) * K * k;
			oy = region.y + padT + (region.h - padT - padB - CB.h * k) / 2 - (LAT1 - CB.lat1) * k;
		} else {
			k = Math.min(region.w / MW, region.h / MH);
			ox = region.x + (region.w - MW * k) / 2; oy = region.y + (region.h - MH * k) / 2;
		}
		const P = (lon, lat) => [ox + (lon - LON0) * K * k, oy + (LAT1 - lat) * k];
		const box = page ? { x, y, w, h } : { x: ox, y: oy, w: MW * k, h: MH * k };
		// marks and years grow a little with a big map
		const ms = s * Math.min(1.3, Math.max(1, k / (11 * s)));
		const mmono = `400 ${11.5 * ms}px ${C.mono}`, mmonoB = `700 ${11.5 * ms}px ${C.mono}`;
		ctx.save();
		ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
		ctx.fillStyle = C.rule;
		ctx.beginPath();
		for (const ring of D.land) { ring.forEach((p, i) => { const q = P(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); }
		ctx.fill();
		if (head) {
			// the land fades out under the title and the list
			const g = ctx.createLinearGradient(head.x + head.w - 40 * s, 0, region.x + 70 * s, 0);
			g.addColorStop(0, C.paper); g.addColorStop(1, C.dark ? "rgba(14,14,14,0)" : "rgba(255,255,255,0)");
			ctx.fillStyle = C.paper; ctx.fillRect(x, y, head.x + head.w - 40 * s - x, h);
			ctx.fillStyle = g; ctx.fillRect(head.x + head.w - 41 * s, y, region.x + 70 * s - head.x - head.w + 41 * s, h);
		}
		ctx.restore();

		// ---- a wide frame with room lists all 13: year, sailor, time
		const ROW = 18.5 * s;
		const perCol = listY + N * ROW <= y + h ? N : Math.ceil(N / 2);
		const list = wide && colW >= (perCol === N ? 300 : 440) * s && listY + perCol * ROW <= y + h;
		let rowsGeo = null;
		if (list) {
			ctx.font = mono;
			const gapC = 22 * s, lw = perCol === N ? Math.min(colW, 380 * s) : colW, cw = perCol === N ? lw : (lw - gapC) / 2, yw = ctx.measureText("0000 ").width;
			eds.forEach((e, i) => {
				const cx0 = colX + Math.floor(i / perCol) * (cw + gapC), cT = cx0 + yw, cR = cx0 + cw;
				const r = role(e), on = i === sel, by = listY + (i % perCol) * ROW + 12 * s;
				ctx.font = r || on ? monoB : mono;
				ctx.fillStyle = r === 2 ? C.red : r === 1 || on ? C.ink : C.ink2;
				ctx.globalAlpha = sel >= 0 && !on ? 0.45 : 1;
				ctx.textAlign = "left"; ctx.fillText(String(e.year), cx0, by);
				ctx.fillText((perCol === N ? e.sailor : e.sailor.split(" ").pop()).toUpperCase(), cT, by);   // surnames where the columns are narrow
				ctx.textAlign = "right"; ctx.fillText(dur(e).toUpperCase(), cR, by);
			});
			ctx.globalAlpha = 1; ctx.textAlign = "left";
			rowsGeo = { x: colX, y: listY, w: lw, row: ROW, perCol, cw: cw + gapC };
		}

		// ---- the course, start to finish
		const cpts = D.course.map(p => P(p[0], p[1]));
		ctx.strokeStyle = C.ink3; ctx.lineWidth = 1.2 * ms; ctx.setLineDash([2 * ms, 4 * ms]);
		ctx.beginPath(); cpts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
		ctx.setLineDash([]);
		const A = cpts[0], Z = cpts[cpts.length - 1];
		// the reader's edition: the water it had covered, as a solid line
		if (sel >= 0) {
			const e = eds[sel];
			ctx.strokeStyle = role(e) === 2 ? C.red : C.ink; ctx.lineWidth = 2.6 * ms;
			ctx.beginPath(); ctx.moveTo(A[0], A[1]);
			for (const c of D.course) { if (c[2] >= e.frac) break; const q = P(c[0], c[1]); ctx.lineTo(q[0], q[1]); }
			const q = P(...along(e.frac)); ctx.lineTo(q[0], q[1]); ctx.stroke();
		}
		ctx.font = mmono; ctx.fillStyle = C.ink2;
		ctx.beginPath(); ctx.arc(A[0], A[1], 2.5 * ms, 0, 7); ctx.fill();
		ctx.textAlign = "right"; ctx.fillText("SAINT-MALO", Math.min(A[0] + 4 * ms, x + w), A[1] - 9 * ms);
		ctx.textAlign = "left";

		// ---- the 13 marks, and a year for each: years alternate between the two sides of the course and
		// are pushed apart along it until none touches the next
		const ux = (Z[0] - A[0]), uy = (Z[1] - A[1]), ul = Math.hypot(ux, uy), dx = ux / ul, dy = uy / ul;
		const nx = -dy, ny = dx;
		const marks = eds.map((e, i) => { const q = P(...along(e.frac)); return { i, e, x: q[0], y: q[1], t: (q[0] - A[0]) * dx + (q[1] - A[1]) * dy }; });
		const others = marks.filter(m => role(m.e) !== 2).sort((p, q) => p.t - q.t);
		const GAPL = 23 * ms, OFF = 22 * ms;
		[0, 1].forEach(side => {
			const ls = others.filter((m, j) => j % 2 === side);
			ls.forEach((m, j) => { m.side = side; m.lt = Math.max(m.t, j ? ls[j - 1].lt + GAPL : -Infinity); });
			for (let j = ls.length - 1; j >= 0; j--) ls[j].lt = Math.min(ls[j].lt, j < ls.length - 1 ? ls[j + 1].lt - GAPL : ul - 30 * ms);
			ls.forEach(m => {
				const sgn = side ? -1 : 1;
				m.lx = m.x + (m.lt - m.t) * dx + nx * OFF * sgn; m.ly = m.y + (m.lt - m.t) * dy + ny * OFF * sgn;
			});
		});
		const fin = marks.find(m => role(m.e) === 2);
		fin.lx = fin.x - 6 * ms; fin.ly = fin.y + 20 * ms; fin.side = 2;

		marks.slice().sort((p, q) => (p.i === sel) - (q.i === sel) || role(p.e) - role(q.e)).forEach(m => {
			const r = role(m.e), on = m.i === sel;
			ctx.globalAlpha = sel >= 0 && !on ? 0.3 : 1;
			const col = r === 2 ? C.red : r === 1 || on ? C.ink : C.ink2;
			if (m.side < 2) {
				ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
				ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.lx - (m.lx - m.x) * 0.36, m.ly - (m.ly - m.y) * 0.36); ctx.stroke();
			}
			ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(m.x, m.y, (r === 2 ? 7.5 : r || on ? 5.5 : 4.5) * ms, 0, 7); ctx.fill();
			ctx.fillStyle = col; ctx.beginPath(); ctx.arc(m.x, m.y, (r === 2 ? 6 : r || on ? 4.2 : 3.2) * ms, 0, 7); ctx.fill();
			ctx.font = r || on ? mmonoB : mmono; ctx.textBaseline = "middle";
			if (r === 2) {
				ctx.textAlign = "left";
				ctx.fillText(`${m.e.year} FINISHED`, m.lx, m.ly); ctx.fillStyle = C.ink2; ctx.font = mmono;
				ctx.fillText("POINTE-À-PITRE", m.lx, m.ly + 15 * ms);
			} else {
				ctx.textAlign = m.side ? "left" : "right";
				ctx.fillText(r === 1 ? `${m.e.year} · ${m.e.pct}%` : String(m.e.year), m.lx, m.ly);
			}
			ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
		});
		ctx.globalAlpha = 1;

		// ---- the reader's edition: the reading beside its mark (in an image without the list, where the
		// sentence was), and on the page the way back to all 13
		let back = null;
		if (sel >= 0) {
			const m = marks[sel];
			const near = page ? (head ? { x: region.x, y, w: region.w, h } : { x, y, w, h }) : { x: ox, y: oy, w: MW * k, h: MH * k };
			if (head) {
				// beside the mark, on whichever side has the room, and narrow enough to wrap
				const bw = Math.min(near.w, 400 * s) + 14 * s, right = m.x + bw <= near.x + near.w;
				CD.label(ctx, m.x, m.y, value, full, s, { x: right ? m.x : m.x - bw, y, w: bw, h }, m.x);
			} else if (page || list) CD.label(ctx, m.x, m.y, value, full, s, near, m.x, [{ x: m.x - 70 * ms, y: m.y - 34 * ms, w: 140 * ms, h: 68 * ms }]);
			else if (wide) CD.label(ctx, x - 12 * s, -1e4, value, full, s, { x, y: under ? y + headH + 18 * s : y, w: colW, h });
			else CD.label(ctx, x - 12 * s, -1e4, value, full, s, { x, y, w, h });
			if (!exporting) {
				ctx.font = mono;
				const t = `ALL ${N}`, tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
				const bx = x + w - bw - (page ? 12 * s : 0), by = y + h - bh - (page ? 8 * s : 0);
				ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
				back = { x: bx - 24, y: by - 24, w: bw + 48, h: bh + 48 };
			}
		}
		return { marks, back, rows: rowsGeo, map: page ? region : { x: ox, y: oy, w: MW * k, h: MH * k } };
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
		// where the title block lies over the canvas (wide screens), the map keeps clear of it
		geo = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage) });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(headEl);
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
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true, null) };
})();
