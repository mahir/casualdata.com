// 2026-11-16 — Türkiye's electricity, each month since January 2018: one square per month, months
// across and years down (turned on a tall screen), shaded by the share made from fossil fuels, darker
// for more. The one red thing: outlines on the only three months under a third, April to June 2026.
// Picking a square reads the month's mix: fossil, hydro, wind and solar, other renewables.
(function () {
	const C = CD.colors, D = window.TRPOWER;
	const rows = D.months.map(([m, fossil, hydro, ws, other]) => ({ m, y: +m.slice(0, 4), mo: +m.slice(5, 7) - 1, fossil, hydro, ws, other }));
	const N = rows.length, Y0 = rows[0].y, Y1 = rows[N - 1].y, NY = Y1 - Y0 + 1;
	const THIRD = 100 / 3;
	// everything the words say is counted here from the rows
	const UNDER = rows.map((r, i) => r.fossil < THIRD ? i : -1).filter(i => i >= 0);
	const LOW = UNDER.reduce((a, i) => rows[i].fossil < rows[a].fossil ? i : a, UNDER[0]);
	const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const M3 = MON.map(m => m.slice(0, 3).toUpperCase()), M1 = MON.map(m => m[0]);
	const monthName = r => `${MON[r.mo]} ${r.y}`;
	const list = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
	const AS_OF = (() => { const [y, m, d] = D.asOf.split("-"); return `${+d} ${MON[+m - 1].slice(0, 3)} ${y}`; })();

	const S1 = `Türkiye, host of the COP31 climate talks, made less than a third of its electricity from fossil fuels in ${list(UNDER.map(i => MON[rows[i].mo]))} ${rows[UNDER[0]].y}, the only ${["", "one", "two", "three", "four"][UNDER.length] || UNDER.length} such months since ${Y0}.`;
	const SUB = `EACH SQUARE IS A MONTH, SHADED BY THE SHARE OF TÜRKIYE’S ELECTRICITY MADE FROM COAL, GAS AND OIL · EMBER, AS OF ${AS_OF.toUpperCase()}`;
	const pct = v => `${v.toFixed(1)}%`;

	let sel = -1;
	function readout() {
		if (sel < 0) return [S1, "Each square is a month, darker for a larger share from fossil fuels"];
		const r = rows[sel];
		return [`${pct(r.fossil)} fossil`, [monthName(r), `Hydro ${pct(r.hydro)}`, `Wind and solar ${pct(r.ws)}`, `Other renewables ${pct(r.other)}`].join(" · ")];
	}

	// ---- the grey ramp, page to ink: pale for a small fossil share, dark for a large one
	const rgb = c => {
		c = String(c).trim();
		if (c[0] === "#") { if (c.length === 4) c = "#" + [...c.slice(1)].map(h => h + h).join(""); return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
		const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
	};
	const LO = 25, HI = 75;
	const mixOf = v => 0.07 + 0.88 * Math.min(1, Math.max(0, (v - LO) / (HI - LO)));
	const shade = v => { const a = rgb(C.paper), b = rgb(C.ink), t = mixOf(v); return `rgb(${a.map((p, i) => Math.round(p + (b[i] - p) * t)).join(",")})`; };

	function wrap(ctx, text, w) {
		const out = [];
		for (const word of text.split(" ")) {
			const t = out.length ? out[out.length - 1] + " " + word : word;
			if (out.length && ctx.measureText(t).width <= w) out[out.length - 1] = t; else out.push(word);
		}
		return out;
	}
	const over = (a, b, m = 0) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

	// The grid in an area: landscape (12 months across, years down) or portrait (years across, months
	// down). Cells are as square as the room allows and never taller than wide.
	function fit(ctx, area, s, port) {
		const mono = `400 ${11.5 * s}px ${C.mono}`; ctx.font = mono;
		const cols = port ? NY : 12, rws = port ? 12 : NY;
		const side = port ? ctx.measureText("JAN").width + 9 * s : ctx.measureText("2026").width + 10 * s;
		const headH = 20 * s;
		const cw = (area.w - side) / cols;
		const ch = Math.min(cw, (area.h - headH) / rws);
		if (cw <= 0 || ch <= 0) return null;
		return { port, cols, rws, side, headH, cw, ch, x: area.x + side, y: area.y + headH, score: Math.min(cw, ch) ** 2 * (port ? 1 : 1.25) };
	}

	// Two frames. On the page the chart is the page: the title and dek are HTML and, on wide screens,
	// lie over the top left; the grid sits beside them and the key under them. A shared image has no
	// title, so the drawing carries the sentence and one small line in that place instead.
	// page = { head: {x, y, w, h} | null, gut }: the title block's box inside the canvas, and the page's gutter.
	function draw(ctx, x, y, w, h, s, exporting, page) {
		const mono = `400 ${11.5 * s}px ${C.mono}`, monoB = `700 ${11.5 * s}px ${C.mono}`, px1 = Math.max(1, s);
		ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "miter";
		const gut = page ? page.gut : 0;
		const edgeL = x + gut, edgeR = x + w - (page ? Math.max(gut, 8 * s) : 0);
		const top = y + (page ? 10 * s : 0), bottom = y + h - (page ? 10 * s : 0);
		const gap = 28 * s;

		// ---- the block at the top left: the title on a wide page, the sentence in a shared image
		let head = page ? page.head : null;
		if (!page) {
			const wide = w >= 1.25 * h;
			const colW = wide ? Math.min(w * 0.36, 520 * s) : w;
			const fs = wide ? Math.max(19 * s, Math.min(30 * s, colW / 15)) : Math.max(19 * s, Math.min(30 * s, w / 19));
			ctx.font = `600 ${fs}px ${C.sans}`; const lines = wrap(ctx, S1, colW);
			ctx.font = mono; const sub = wrap(ctx, SUB, colW);
			const sentH = lines.length * fs * 1.14, headH = sentH + 10 * s + sub.length * 16 * s;
			ctx.fillStyle = C.ink; ctx.font = `600 ${fs}px ${C.sans}`;
			lines.forEach((l, i) => ctx.fillText(l, x, y + fs * 0.86 + i * fs * 1.14));
			ctx.font = mono; ctx.fillStyle = C.ink2;
			sub.forEach((l, i) => ctx.fillText(l, x, y + sentH + 10 * s + 11 * s + i * 16 * s));
			head = { x, y, w: colW, h: headH };
		}

		// ---- the key: a ramp from 25% to 75% with a tick at a third
		const keyH = 50 * s;
		const keyAt = (kx, ky, kw) => ({ x: kx, y: ky, w: Math.min(kw, 300 * s), h: keyH });

		// ---- where the grid goes: beside the block (the key under it) or below (the key above the grid)
		const cands = [];
		const tryArea = (area, key) => { for (const port of [false, true]) { const g = fit(ctx, area, s, port); if (g) cands.push(Object.assign(g, { key })); } };
		if (head) {
			const ax = head.x + head.w + gap;
			const key = keyAt(head.x, head.y + head.h + 22 * s, head.w);
			if (key.y + key.h <= bottom && edgeR - ax > 200 * s) tryArea({ x: ax, y: top, w: edgeR - ax, h: bottom - top }, key);
			const ky = head.y + head.h + 18 * s;
			tryArea({ x: edgeL, y: ky + keyH + 14 * s, w: edgeR - edgeL, h: bottom - (ky + keyH + 14 * s) }, keyAt(edgeL, ky, edgeR - edgeL));
		} else {
			tryArea({ x: edgeL, y: top + keyH + 14 * s, w: edgeR - edgeL, h: bottom - top - keyH - 14 * s }, keyAt(edgeL, top, edgeR - edgeL));
		}
		const G = cands.reduce((a, b) => b.score > a.score ? b : a);
		const pad = Math.max(px1, Math.min(3 * s, G.cw * 0.06));
		const cell = i => {
			const r = rows[i] || { y: Y0 + Math.floor(i / 12), mo: i % 12 };
			const c = G.port ? r.y - Y0 : r.mo, rr = G.port ? r.mo : r.y - Y0;
			return { x: G.x + c * G.cw + pad / 2, y: G.y + rr * G.ch + pad / 2, w: G.cw - pad, h: G.ch - pad };
		};

		// ---- labels: months and years
		ctx.font = mono; ctx.fillStyle = C.ink2;
		const mLab = G.port ? M3 : (G.cw >= ctx.measureText("JAN").width + 8 * s ? M3 : M1);
		for (let mo = 0; mo < 12; mo++) {
			const b = cell(mo);   // 2018's row or column
			if (G.port) { ctx.textAlign = "left"; ctx.fillText(mLab[mo], G.x - G.side, b.y + b.h / 2 + 4 * s); }
			else { ctx.textAlign = "center"; ctx.fillText(mLab[mo], b.x + b.w / 2, G.y - 7 * s); }
		}
		const yLab = G.port && G.cw < ctx.measureText("2026").width + 6 * s ? (yy => "’" + String(yy).slice(2)) : (yy => String(yy));
		for (let yy = Y0; yy <= Y1; yy++) {
			const b = cell((yy - Y0) * 12);
			if (G.port) { ctx.textAlign = "center"; ctx.fillText(yLab(yy), b.x + b.w / 2, G.y - 7 * s); }
			else { ctx.textAlign = "left"; ctx.fillText(yLab(yy), G.x - G.side, b.y + b.h / 2 + 4 * s); }
		}
		ctx.textAlign = "left";

		// ---- the cells: a value inside when there is room for it
		const nfs = Math.min(15 * s, Math.max(11.5 * s, G.ch * 0.27));
		const showN = Math.min(G.cw, G.ch) >= 26 * s;
		for (let i = 0; i < NY * 12; i++) {
			const b = cell(i);
			if (i >= N) {   // months to come: an outline, no fill
				ctx.strokeStyle = C.rule; ctx.lineWidth = px1;
				ctx.strokeRect(b.x + px1 / 2, b.y + px1 / 2, b.w - px1, b.h - px1);
				continue;
			}
			const r = rows[i];
			ctx.fillStyle = shade(r.fossil); ctx.fillRect(b.x, b.y, b.w, b.h);
			if (showN) {
				const red = UNDER.includes(i);
				ctx.font = `${red || i === sel ? 700 : 400} ${nfs}px ${C.mono}`; ctx.textAlign = "center";
				ctx.fillStyle = mixOf(r.fossil) > 0.45 ? C.paper : C.ink;
				ctx.fillText(String(Math.round(r.fossil)), b.x + b.w / 2, b.y + b.h / 2 + nfs * 0.36);
				ctx.textAlign = "left";
			}
		}
		// the one red thing: outlines on the months under a third, the lowest the heaviest
		for (const i of UNDER) {
			const b = cell(i), lw = (i === LOW ? 3.5 : 2.25) * s;
			ctx.strokeStyle = C.red; ctx.lineWidth = lw;
			ctx.strokeRect(b.x + lw / 2, b.y + lw / 2, b.w - lw, b.h - lw);
		}

		// ---- the key
		const K = G.key;
		{
			ctx.font = mono; ctx.fillStyle = C.ink2;
			ctx.fillText("FOSSIL SHARE OF ELECTRICITY", K.x, K.y + 11 * s);
			const ry = K.y + 18 * s, rh = 12 * s, kx = v => K.x + (v - LO) / (HI - LO) * K.w;
			const steps = 60;
			for (let k = 0; k < steps; k++) {
				const v0 = LO + (HI - LO) * k / steps;
				ctx.fillStyle = shade(v0 + (HI - LO) / steps / 2);
				ctx.fillRect(kx(v0), ry, K.w / steps + 0.5, rh);
			}
			const tx = Math.round(kx(THIRD)) + 0.5;
			ctx.strokeStyle = C.ink; ctx.lineWidth = px1;
			ctx.beginPath(); ctx.moveTo(tx, ry - 3 * s); ctx.lineTo(tx, ry + rh + 4 * s); ctx.stroke();
			const ly = ry + rh + 15 * s, placed = [];
			const lab = (t, xx, align, font = mono, color = C.ink2) => {
				ctx.font = font; const tw = ctx.measureText(t).width;
				const x0 = align === "center" ? xx - tw / 2 : align === "right" ? xx - tw : xx;
				const b = { x: x0, y: ly - 11 * s, w: tw, h: 14 * s };
				if (placed.some(o => over(o, b, 6 * s))) return;
				placed.push(b); ctx.fillStyle = color; ctx.textAlign = "left"; ctx.fillText(t, x0, ly);
			};
			lab("A THIRD", tx - 3 * s, "left", monoB, C.ink);
			lab("75%", K.x + K.w, "right");
			lab("50%", kx(50), "center");
			lab("25%", K.x, "left");
		}

		// ---- the reader's month: an ink ring and the reading beside it
		if (sel >= 0) {
			const b = cell(sel), lw = 2 * s;
			ctx.strokeStyle = C.ink; ctx.lineWidth = lw;
			ctx.strokeRect(b.x - lw * 1.5, b.y - lw * 1.5, b.w + lw * 3, b.h + lw * 3);
			const [value, context] = readout();
			const cp = 8 * s;
			ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			const ls = context.toUpperCase().split(" · ");
			const chw = Math.max(vw, ...ls.map(l => ctx.measureText(l).width)) + cp * 2;
			const chh = 17 * s + 5 * s + ls.length * 15 * s + cp * 2 - 2 * s, g = 10 * s;
			const avoid = [{ x: K.x, y: K.y, w: K.w, h: K.h, k: 50 }];
			if (head) avoid.push({ x: head.x, y: head.y, w: head.w, h: head.h, k: 500 });
			for (const i of UNDER) if (i !== sel) avoid.push(Object.assign(cell(i), { k: 20 }));
			const lim = { x0: x + 2 * s, x1: x + w - 2 * s - chw, y0: y + 2 * s, y1: y + h - 2 * s - chh };
			let best = null, bc = Infinity;
			for (const c0 of [
				{ x: b.x + b.w + g, y: b.y + b.h / 2 - chh / 2 }, { x: b.x - g - chw, y: b.y + b.h / 2 - chh / 2 },
				{ x: b.x + b.w / 2 - chw / 2, y: b.y - g - chh }, { x: b.x + b.w / 2 - chw / 2, y: b.y + b.h + g },
				{ x: b.x + b.w + g, y: b.y }, { x: b.x - g - chw, y: b.y }, { x: b.x + b.w + g, y: b.y + b.h - chh }, { x: b.x - g - chw, y: b.y + b.h - chh }]) {
				const c = { x: Math.min(Math.max(c0.x, lim.x0), lim.x1), y: Math.min(Math.max(c0.y, lim.y0), lim.y1), w: chw, h: chh };
				let k = 0;
				if (over(c, { x: b.x - lw * 2, y: b.y - lw * 2, w: b.w + lw * 4, h: b.h + lw * 4 })) k += 1000;
				for (const o of avoid) if (over(c, o, 2 * s)) k += o.k;
				k += Math.hypot(c.x - c0.x, c.y - c0.y) / (10 * s);
				if (k < bc) { bc = k; best = c; }
			}
			ctx.fillStyle = C.ink; ctx.fillRect(best.x, best.y, chw, chh);
			ctx.fillStyle = C.paper;
			ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillText(value, best.x + cp, best.y + cp + 14 * s);
			ctx.font = `400 ${11 * s}px ${C.mono}`;
			ls.forEach((l, i) => ctx.fillText(l, best.x + cp, best.y + cp + 17 * s + 5 * s + 9 * s + i * 15 * s));
		}
		ctx.textAlign = "left";
		return { G, pad, cell };
	}

	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	const headEl = document.querySelector(".cd-head"), textEl = document.querySelector(".cd-head .cd-text");
	let geo = null, W = 0, Hh = 0, raf = 0;
	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1, r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== Hh) { W = r.width; Hh = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, Hh);
		geo = draw(ctx, 0, 0, W, Hh, 1, false, { head: CD.headBox(stage), gut: parseFloat(getComputedStyle(headEl).paddingLeft) || 16 });
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage); new ResizeObserver(schedule).observe(textEl);
	Promise.all([`400 12px ${C.mono}`, `700 12px ${C.mono}`, `600 17px ${C.sans}`].map(f => document.fonts.load(f))).then(schedule, schedule);
	document.fonts.ready.then(schedule);
	document.addEventListener("cd-theme", schedule);

	// ?m=2026-05: the month; anything else opens the overview
	sel = rows.findIndex(r => r.m === CD.state.get("m"));
	const pick = CD.selection({ initial: sel, key: "m", encode: i => rows[i].m, onChange: i => { sel = i; schedule(); } });
	// up and down move a year (registered first, so the shared handler does not also step a month)
	cv.addEventListener("keydown", e => {
		const d = { ArrowUp: -1, ArrowDown: 1 }[e.key];
		if (!d) return;
		e.preventDefault(); e.stopImmediatePropagation();
		const from = pick.shown;
		const dy = geo && geo.G.port ? d : d * 12;   // a turned grid has the months down
		pick.pin(from < 0 ? (d > 0 ? 0 : N - 1) : Math.min(N - 1, Math.max(0, from + dy)));
	});
	CD.bindSelection(cv, pick, {
		// a square under the pointer; tapping the pinned square again goes back to the overview
		at: e => {
			if (!geo) return -1;
			const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, G = geo.G;
			const c = Math.floor((mx - G.x) / G.cw), rr = Math.floor((my - G.y) / G.ch);
			if (c < 0 || c >= G.cols || rr < 0 || rr >= G.rws) return -1;
			const i = G.port ? c * 12 + rr : rr * 12 + c;
			if (i >= N) return -1;
			if (e.type === "pointerdown" && i === pick.pinned) return -1;
			return i;
		},
		// left and right step a month; the first key starts at the first month, or going back at the last
		step: (from, dir) => from < 0 ? (dir > 0 ? 0 : N - 1) : (from + dir + N) % N
	});
	CD.exporter = { readout, draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.6, true, null) };
})();
