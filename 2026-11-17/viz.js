// 2026-11-17 — orders to leave the EU in 2025, on a map. One circle per country (the EU 27, Norway,
// Switzerland, Liechtenstein and Montenegro): its area is how many people it ordered to leave in 2025,
// its dark core how many people left after an order to leave that year. The one red thing is France,
// which gave by far the most orders. Picking a circle reads both counts for 2025 and 2024.
(function () {
	const C = CD.colors, D = window.ORDERS;
	const P0 = D.places, N = P0.length, EU = D.eu;
	const fmt = n => n.toLocaleString("en-US");
	const per100 = (r, o) => Math.round(100 * r / o);
	const FR = P0.find(p => p.c === "FR");
	const S1 = `France ordered ${fmt(FR.o25)} people to leave in 2025, more than twice as many as any other EU country. ${fmt(FR.r25)} people left France after an order.`;
	const SUB = "SIZE: ORDERED TO LEAVE IN 2025 · DARK CORE: LEFT AFTER AN ORDER";
	const LABELLED = new Set(["FR", "DE", "ES", "NL", "EL", "BE", "IT", "SE", "PT"]);
	const isRed = p => p === FR;

	let sel = -1;

	function readout() {
		if (sel < 0) return [S1, "Each circle is a country: its size is how many people it ordered to leave in 2025, its dark core how many left"];
		const p = P0[sel];
		// each year's figures stay together when the chip wraps at its " · " breaks
		const y25 = `ordered to leave ${fmt(p.o25)}, left ${fmt(p.r25)} · ${per100(p.r25, p.o25)} left for every 100 orders`;
		const y24 = `2024: ordered ${fmt(p.o24)}, left ${fmt(p.r24)}`;
		return [`${p.n}, 2025`, `${y25} · ${y24}`];
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

	// equirectangular, squeezed by cos 52°
	const K = Math.cos(52 * Math.PI / 180), OMAX = FR.o25;
	const gx = p => p.lon * K, gy = p => -p.lat;
	const G = { x0: Math.min(...P0.map(gx)), x1: Math.max(...P0.map(gx)), y0: Math.min(...P0.map(gy)), y1: Math.max(...P0.map(gy)) };

	// Fits the circles (not Europe) to a region: rMax is France's radius; k the pixels per degree
	function fit(region, rMax, pad) {
		const rad = p => Math.max(2, rMax * Math.sqrt(p.o25 / OMAX));
		const need = k => {
			let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
			for (const p of P0) { const r = rad(p), X = gx(p) * k, Y = gy(p) * k; x0 = Math.min(x0, X - r); x1 = Math.max(x1, X + r); y0 = Math.min(y0, Y - r); y1 = Math.max(y1, Y + r); }
			return { x0, x1, y0, y1 };
		};
		let lo = 0.1, hi = 400;
		for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2, b = need(m); (b.x1 - b.x0 <= region.w - 2 * pad && b.y1 - b.y0 <= region.h - 2 * pad) ? lo = m : hi = m; }
		const k = lo, b = need(k);
		const ox = region.x + (region.w - (b.x1 - b.x0)) / 2 - b.x0, oy = region.y + (region.h - (b.y1 - b.y0)) / 2 - b.y0;
		return { k, ox, oy, rad };
	}

	// Two frames. On the page the map is the page: the title and dek are HTML, the circles are fitted to
	// the room beside or under them and the land runs off the edges. In a shared image there is no title,
	// so the drawing carries the sentence and one small line.
	// page = { head: {x, y, w, h} | null }: the title block's box inside the canvas when it lies over it.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.lineCap = "round";
		const [value, full] = readout();
		const head = page && page.head;
		let region, keyAt = null;

		if (page) {
			region = head ? { x: head.x + head.w + 20 * s, y, w: x + w - head.x - head.w - 20 * s, h } : { x, y, w, h };
			if (head) keyAt = { x: head.x, y: head.y + head.h + 34 * s, w: head.w };
		} else {
			// ---- a shared image: the sentence and the small line under it, on the left of a wide frame
			const wide = w >= 760 * s;
			const colW = wide ? Math.min(0.4 * w, 480 * s) : w;
			const fs = Math.max(19 * s, Math.min((wide ? 34 : 28) * s, colW / (wide ? 12 : 18)));
			ctx.font = `600 ${fs}px ${C.sans}`;
			const lines = balance(ctx, S1, colW);
			ctx.font = mono;
			const sub = balance(ctx, SUB, colW);
			const sentH = lines.length * fs * 1.14, headH = sentH + 7 * s + sub.length * 16 * s;
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 7 * s + 11 * s + i * 16 * s));
			const ay = y + headH + 16 * s;
			region = wide ? { x: x + colW + 30 * s, y, w: w - colW - 30 * s, h } : { x, y: ay, w, h: y + h - ay };
		}

		const rMax = 0.11 * Math.min(region.w, region.h);
		const F = fit(region, rMax, (page ? 14 : 4) * s);
		const P = (lon, lat) => [F.ox + lon * K * F.k, F.oy - lat * F.k];

		// ---- land, pale, no borders
		ctx.save();
		// on the page the land runs off every edge; in an image it stays in the map's own region, clear of the sentence
		const lb = page ? { x, y, w, h } : region;
		ctx.beginPath(); ctx.rect(lb.x, lb.y, lb.w, lb.h); ctx.clip();
		ctx.fillStyle = C.rule;
		ctx.beginPath();
		for (const ring of D.land) { ring.forEach((p, i) => { const q = P(p[0], p[1]); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); }
		ctx.fill();
		if (head) {
			// the land fades out under the title and the key
			const e0 = head.x + head.w - 30 * s, e1 = head.x + head.w + 40 * s;
			const g = ctx.createLinearGradient(e0, 0, e1, 0);
			g.addColorStop(0, C.paper); g.addColorStop(1, C.dark ? "rgba(14,14,14,0)" : "rgba(255,255,255,0)");
			ctx.fillStyle = C.paper; ctx.fillRect(x, y, e0 - x, h);
			ctx.fillStyle = g; ctx.fillRect(e0 - 1, y, e1 - e0 + 1, h);
		}
		ctx.restore();

		// ---- the circles, largest first, each ringed in the page's colour so overlaps stay readable
		const marks = P0.map((p, i) => { const q = P(p.lon, p.lat); return { i, p, x: q[0], y: q[1], r: F.rad(p), core: Math.max(p.r25 ? 1.2 * s : 0, rMax * Math.sqrt(p.r25 / OMAX)) }; });
		const order = marks.slice().sort((a, b) => b.r - a.r);
		const fade = m => sel >= 0 && m.i !== sel ? 0.35 : 1;
		for (const m of order) {
			const red = isRed(m.p);
			ctx.globalAlpha = fade(m);
			ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 1.5 * s, 0, 7); ctx.fill();
			ctx.fillStyle = red ? C.red : C.ink3;
			ctx.globalAlpha = fade(m) * (C.dark ? 0.32 : 0.2); ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 7); ctx.fill();
			ctx.globalAlpha = fade(m);
			ctx.strokeStyle = red ? C.red : C.ink3; ctx.lineWidth = (m.i === sel ? 2 : 1) * px1;
			if (m.i === sel && !red) ctx.strokeStyle = C.ink;
			ctx.beginPath(); ctx.arc(m.x, m.y, Math.max(0.5, m.r - ctx.lineWidth / 2), 0, 7); ctx.stroke();
			ctx.fillStyle = red ? C.red : m.i === sel ? C.ink : C.ink2;
			ctx.beginPath(); ctx.arc(m.x, m.y, m.core, 0, 7); ctx.fill();
		}
		ctx.globalAlpha = 1;

		// the key's place: a wide page has it under the title; a phone, smaller, in the open sea at the bottom left
		const sample = keyAt ? 100000 : 25000, so = rMax * Math.sqrt(sample / OMAX), sc = so * Math.sqrt(0.32);
		const kx = keyAt ? keyAt.x + so : x + 12 * s + so, ky = keyAt ? keyAt.y + so : y + h - 12 * s - so;
		const keyRect = page && !keyAt ? { x: x, y: ky - so - 6 * s, w: 2 * so + 190 * s, h: 2 * so + 18 * s } : null;

		// ---- names beside the largest circles: above, below, right or left, whichever touches nothing
		ctx.font = mono; ctx.textBaseline = "middle";
		const placed = [], lh = 14 * s;
		const hits = (b, list) => list.some(o => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
		const bounds = { x: (head ? head.x + head.w : x) + 4 * s, y: y + 2 * s, x1: x + w - 4 * s, y1: y + h - 2 * s };
		for (const m of marks.filter(m => LABELLED.has(m.p.c) || m.i === sel)) {
			const red = isRed(m.p), t = m.p.n.toUpperCase();
			ctx.font = m.i === sel ? monoB : mono;   // France's name is red, not bold: the bold face can arrive after a first share
			const tw = ctx.measureText(t).width, g = 4 * s;
			const cands = [
				{ x: m.x - tw / 2, y: m.y - m.r - g - lh },
				{ x: m.x - tw / 2, y: m.y + m.r + g },
				{ x: m.x + m.r + g, y: m.y - lh / 2 },
				{ x: m.x - m.r - g - tw, y: m.y - lh / 2 },
				{ x: m.x - tw / 2, y: m.y - lh / 2 }
			].map(c => ({ ...c, w: tw, h: lh }));
			const inside = b => b.x >= bounds.x && b.x + b.w <= bounds.x1 && b.y >= bounds.y && b.y + b.h <= bounds.y1;
			const circ = (b, outer) => marks.filter(o => o !== m && o.r > 4 * s).some(o => {
				const cx = Math.max(b.x, Math.min(o.x, b.x + b.w)), cy = Math.max(b.y, Math.min(o.y, b.y + b.h));
				return Math.hypot(cx - o.x, cy - o.y) < (outer ? o.r : o.core) + 1;
			});
			const free = c => inside(c) && !hits(c, placed) && !(keyRect && hits(c, [keyRect]));
			const b = cands.find(c => free(c) && !circ(c, true)) || cands.find(c => free(c) && !circ(c, false)) || cands.find(free) || cands[0];
			placed.push(b); m.lab = b;
			ctx.globalAlpha = sel >= 0 && m.i !== sel ? 0.45 : 1;
			ctx.lineWidth = 3 * s; ctx.strokeStyle = C.paper; ctx.strokeText(t, b.x, b.y + lh / 2);
			ctx.fillStyle = red ? C.red : m.i === sel ? C.ink : C.ink2;
			ctx.fillText(t, b.x, b.y + lh / 2);
		}
		ctx.globalAlpha = 1; ctx.textBaseline = "alphabetic";

		// ---- the key: a sample circle, and the EU's own totals. On a wide page it sits under the title;
		// on a phone, smaller, in the open sea at the bottom left; an image has none (its small line says it).
		if (page) {
			const fits = keyAt ? ky + so + 40 * s <= y + h : true;
			if (fits) {
				ctx.fillStyle = C.ink3; ctx.globalAlpha = C.dark ? 0.32 : 0.2; ctx.beginPath(); ctx.arc(kx, ky, so, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
				ctx.strokeStyle = C.ink3; ctx.lineWidth = px1; ctx.beginPath(); ctx.arc(kx, ky, so - 0.5, 0, 7); ctx.stroke();
				ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.arc(kx, ky, sc, 0, 7); ctx.fill();
				ctx.font = mono; ctx.fillStyle = C.ink2; ctx.textAlign = "left";
				const tx = kx + so + 10 * s;
				ctx.strokeStyle = C.paper; ctx.lineWidth = 3 * s;
				const k1 = `${fmt(sample)} ORDERED TO LEAVE`, k2 = `${fmt(sample * 0.32)} LEFT`;
				ctx.strokeText(k1, tx, ky - 4 * s); ctx.fillText(k1, tx, ky - 4 * s);
				ctx.strokeText(k2, tx, ky + 12 * s); ctx.fillText(k2, tx, ky + 12 * s);
				// leader from the core to its words
				ctx.strokeStyle = C.ink3; ctx.lineWidth = px1;
				ctx.beginPath(); ctx.moveTo(kx + sc + 2 * s, ky + 8 * s); ctx.lineTo(tx - 3 * s, ky + 8 * s); ctx.stroke();
				if (keyAt) {
					ctx.font = monoB; ctx.fillStyle = C.ink;
					ctx.fillText("EU 27, 2025", keyAt.x, ky + so + 28 * s);
					ctx.font = mono; ctx.fillStyle = C.ink2;
					ctx.fillText(`${fmt(EU.o25)} ORDERED TO LEAVE · ${fmt(EU.r25)} LEFT`, keyAt.x, ky + so + 45 * s);
				}
			}
		}

		// ---- the reader's country: the reading beside its circle, and the way back to all
		let back = null;
		if (sel >= 0) {
			const m = marks[sel];
			const near = head ? { x: region.x, y, w: region.w, h } : { x, y, w, h };
			CD.label(ctx, m.x + m.r - 10 * s, m.y, value, full, s, near, m.x - m.r + 10 * s, m.lab ? [m.lab] : []);
			if (!exporting && page) {
				ctx.font = mono;
				const t = "ALL", tw = ctx.measureText(t).width, bw = tw + 18 * s, bh = 21 * s;
				const bx = x + w - bw - 12 * s, by = y + h - bh - 8 * s;
				ctx.fillStyle = C.paper; ctx.fillRect(bx, by, bw, bh);
				ctx.strokeStyle = C.ink; ctx.lineWidth = px1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
				ctx.fillStyle = C.ink; ctx.fillText(t, bx + 9 * s, by + 14.5 * s);
				back = { x: bx - 24, y: by - 24, w: bw + 48, h: bh + 48 };
			}
		}
		return { marks, back };
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
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?c=FR: the country's Eurostat code (EL is Greece); anything else opens the overview
	const q = (CD.state.get("c") || "").toUpperCase();
	sel = P0.findIndex(p => p.c === q);
	const pick = CD.selection({ initial: sel, key: "c", encode: i => P0[i].c, onChange: i => { sel = i; schedule(); } });
	CD.bindSelection(cv, pick, {
		// the smallest circle under the pointer (within 8 px of its edge), or a country's name; a finger
		// that misses takes the nearest centre within 30 px. The "All" box and open water go back to all.
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
			const b = geo.back;
			if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return -1;
			let best = -1, br = Infinity;
			for (const m of geo.marks) {
				const d = Math.hypot(m.x - mx, m.y - my), L = m.lab;
				const onLab = L && mx >= L.x - 3 && mx <= L.x + L.w + 3 && my >= L.y - 3 && my <= L.y + L.h + 3;
				if ((d <= m.r + 8 || onLab) && m.r < br) { br = onLab ? -1 : m.r; best = m.i; }
			}
			if (best < 0 && e.pointerType && e.pointerType !== "mouse") {
				let bd = 30;
				for (const m of geo.marks) { const d = Math.hypot(m.x - mx, m.y - my) - m.r; if (d < bd) { bd = d; best = m.i; } }
			}
			return best;
		},
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true, null) };
})();
