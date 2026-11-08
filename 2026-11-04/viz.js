// 2026-11-04 — daylight hours for every latitude and day of 2026.
// Sunrise and sunset use the standard -0.833° solar altitude (refraction plus
// the sun's radius) and the Spencer (1971) series for solar declination.
(function () {
	const C = CD.colors;
	const DAYS = 365, LAT_STEP = 0.5, ROWS = 361;          // 90N .. 90S
	const PUB = 307;                                        // 4 Nov 2026, 0-based day of year
	const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const MSTART = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	const CITIES = [
		["Tromsø", 69.65], ["Reykjavík", 64.15], ["London", 51.51], ["New York", 40.71],
		["Cairo", 30.04], ["Mumbai", 19.08], ["Singapore", 1.35], ["São Paulo", -23.55],
		["Sydney", -33.87], ["Ushuaia", -54.80]
	];

	const LONDON = 51.51;
	const rad = Math.PI / 180;
	function decl(d) {
		const g = 2 * Math.PI / 365 * d;
		return 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g)
			+ 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
	}
	function daylight(d, lat) {
		const p = lat * rad, dl = decl(d);
		const c = (Math.sin(-0.833 * rad) - Math.sin(p) * Math.sin(dl)) / (Math.cos(p) * Math.cos(dl));
		if (c >= 1) return 0;
		if (c <= -1) return 24;
		return Math.acos(c) * 24 / Math.PI;
	}

	// precompute the field and the heat map bitmap (1 px = 1 day x 0.5°)
	const field = new Float32Array(DAYS * ROWS);
	const bmp = document.createElement("canvas"); bmp.width = DAYS; bmp.height = ROWS;
	const bctx = bmp.getContext("2d"), img = bctx.createImageData(DAYS, ROWS);
	const night = [0x1C, 0x1C, 0x1B], day = [0xED, 0xEB, 0xE6];   // dark = no sun
	for (let r = 0; r < ROWS; r++) {
		const lat = 90 - r * LAT_STEP;
		for (let d = 0; d < DAYS; d++) {
			const h = daylight(d, Math.max(-89.99, Math.min(89.99, lat)));
			field[r * DAYS + d] = h;
			const t = Math.pow(Math.min(Math.floor(h), 23) / 23, 0.95), i = (r * DAYS + d) * 4;
			for (let k = 0; k < 3; k++) img.data[i + k] = night[k] + (day[k] - night[k]) * t;
			img.data[i + 3] = 255;
		}
	}
	bctx.putImageData(img, 0, 0);

	// contour at a level: per day, latitude rows where the field crosses it
	function contour(level) {
		const segs = [];
		for (let d = 0; d < DAYS; d++) {
			const pts = [];
			for (let r = 0; r < ROWS - 1; r++) {
				const a = field[r * DAYS + d], b = field[(r + 1) * DAYS + d];
				if ((a - level) * (b - level) < 0) pts.push(r + (level - a) / (b - a));
			}
			segs.push(pts);
		}
		return segs;
	}
	const LEVELS = [4, 8, 16, 20].map(l => ({ l, c: contour(l) }));

	// ---------- state ----------
	const q = new URLSearchParams(location.search);
	const st = {
		d: clampD(parseInt(q.get("d"), 10)), lat: clampL(parseFloat(q.get("lat")))
	};
	if (isNaN(st.d)) st.d = PUB;
	if (isNaN(st.lat)) st.lat = 41;
	function clampD(d) { return isNaN(d) ? NaN : Math.max(0, Math.min(DAYS - 1, d)); }
	function clampL(l) { return isNaN(l) ? NaN : Math.max(-89.5, Math.min(89.5, Math.round(l * 2) / 2)); }

	const fmtH = h => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; };
	const fmtLat = l => l === 0 ? "0°" : `${Math.abs(l)}°${l > 0 ? "N" : "S"}`;
	const fmtDay = d => { const m = MSTART.findLastIndex(s => s <= d); return `${d - MSTART[m] + 1} ${MONTHS[m]}`; };
	function fmtDelta(d, lat) {
		const s = Math.round((daylight(Math.min(d + 1, 364), lat) - daylight(d, lat)) * 3600);
		if (Math.abs(s) < 1) return "steady";
		const a = Math.abs(s), str = a >= 60 ? `${Math.floor(a / 60)}m ${String(a % 60).padStart(2, "0")}s` : `${a}s`;
		return `${s < 0 ? "−" : "+"}${str} a day`;
	}
	function readout() {
		const h = daylight(st.d, st.lat);
		const where = `${fmtLat(st.lat)} · ${fmtDay(st.d)}`;
		const tail = h === 0 ? "polar night" : h === 24 ? "midnight sun" : fmtDelta(st.d, st.lat);
		return [fmtH(h), `${where} · ${tail}`];
	}

	// ---------- drawing (shared by screen and PNG) ----------
	function layout(x, y, w, h, s, compact) {
		const L = 40 * s, R = compact ? 8 * s : 92 * s, B = 26 * s;
		return { x0: x + L, y0: y, pw: w - L - R, ph: h - B, s, compact };
	}
	function draw(ctx, x, y, w, h, s, compact) {
		const g = layout(x, y, w, h, s, compact);
		const X = d => g.x0 + (d + 0.5) / DAYS * g.pw;
		const Y = lat => g.y0 + (90 - lat) / 180 * g.ph;
		const Yr = r => g.y0 + (r + 0.5) / ROWS * g.ph;

		ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
		ctx.drawImage(bmp, g.x0, g.y0, g.pw, g.ph);

		// contour labels near the left edge
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle";
		for (const { l, c } of LEVELS) {
			const d = l < 12 ? 20 : 172, pts = c[d]; if (!pts.length) continue;
			ctx.fillStyle = l < 12 ? "#EDEBE6" : "#121212";   // on the map's own night/day tones, whatever the theme
			ctx.fillText(`${l}h`, X(d) + 4 * s, Yr(pts[0]) + (l < 12 ? 8 : -8) * s);
		}

		// axes: latitude left, months below
		ctx.fillStyle = C.ink2; ctx.textAlign = "right"; ctx.font = `400 ${11.5 * s}px ${C.mono}`;
		for (let lat = 90; lat >= -90; lat -= 30) {
			ctx.fillText(fmtLat(lat), g.x0 - 8 * s, Math.min(Math.max(Y(lat), g.y0 + 6 * s), g.y0 + g.ph - 6 * s));
		}
		ctx.textAlign = "left"; ctx.textBaseline = "top";
		const step = g.pw < 420 ? 2 : 1;
		MONTHS.forEach((m, i) => {
			if (i % step) return;
			ctx.fillRect(X(MSTART[i]) - 0.5 * s, g.y0 + g.ph, 1 * s, 5 * s);
			ctx.fillText(m.toUpperCase(), X(MSTART[i]) + 3 * s, g.y0 + g.ph + 8 * s);
		});
		ctx.fillStyle = C.ink; ctx.fillRect(g.x0, g.y0 + g.ph, g.pw, 1 * s);

		// cities on the right
		if (!g.compact) {
			ctx.textBaseline = "middle"; ctx.font = `400 ${11.5 * s}px ${C.mono}`;
			for (const [name, lat] of CITIES) {
				const yy = Y(lat), near = Math.abs(lat - st.lat) < 1;
				ctx.fillStyle = near ? C.ink : C.ink3;
				ctx.fillRect(g.x0 + g.pw, yy - 0.5 * s, 6 * s, 1 * s);
				ctx.fillStyle = near ? C.ink : C.ink2;
				ctx.fillText(name, g.x0 + g.pw + 10 * s, yy);
			}
		}

		// the day it was published (4 Nov): the one red line
		const xp = X(PUB);
		ctx.fillStyle = C.red; ctx.fillRect(xp - 1 * s, g.y0, 2 * s, g.ph + 6 * s);
		ctx.font = `400 ${11.5 * s}px ${C.mono}`; ctx.textBaseline = "middle";
		// the tag carries the day's one fact, so the image says something without the title
		const tag = g.compact ? "4 NOV" : `4 NOV · LONDON LOSES ${fmtDelta(PUB, LONDON).replace(/^−/, "").replace(" a day", "").toUpperCase()} OF LIGHT A DAY`;
		const tw = ctx.measureText(tag).width + 12 * s, th = 20 * s;
		const tx = Math.min(xp - tw / 2, g.x0 + g.pw - tw);
		ctx.fillStyle = C.ink; ctx.fillRect(tx, g.y0, tw, th);
		ctx.fillStyle = C.paper; ctx.fillText(tag, tx + 6 * s, g.y0 + th / 2 + 0.5 * s);

		// selection: thin crosshair + red dot
		const sx = X(st.d), sy = Y(st.lat);
		ctx.strokeStyle = C.red; ctx.globalAlpha = 0.75; ctx.lineWidth = 1 * s;
		ctx.beginPath(); ctx.moveTo(g.x0, sy); ctx.lineTo(g.x0 + g.pw, sy); ctx.stroke();
		if (st.d !== PUB) { ctx.beginPath(); ctx.moveTo(sx, g.y0); ctx.lineTo(sx, g.y0 + g.ph); ctx.stroke(); }
		ctx.globalAlpha = 1;
		ctx.beginPath(); ctx.arc(sx, sy, 6 * s, 0, 2 * Math.PI);
		ctx.fillStyle = C.red; ctx.fill();
		ctx.lineWidth = 2 * s; ctx.strokeStyle = C.paper; ctx.stroke();

		// the reading, next to the dot
		const [value, context] = readout();
		CD.label(ctx, sx, sy, value, context, s, { x: g.x0, y: g.y0, w: g.pw, h: g.ph });
		return g;
	}

	// ---------- screen ----------
	const cv = document.getElementById("cv"), stage = document.getElementById("stage");
	const ctx = cv.getContext("2d");
	let geo = null, W = 0, H = 0, raf = 0;

	function paint() {
		raf = 0;
		const dpr = window.devicePixelRatio || 1;
		const r = stage.getBoundingClientRect();
		if (r.width !== W || r.height !== H) { W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		geo = draw(ctx, 0, 0, W, H, 1, W < 560);
		CD.announce(readout().join(", "));
	}
	const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
	new ResizeObserver(schedule).observe(stage);
	document.addEventListener("cd-theme", schedule);
	document.fonts.ready.then(schedule);

	// Same handling as every day (see CD.selection in kit/cd.js): pointing previews a reading, a click,
	// tap or key pins it, only the pinned reading goes into the link, and leaving returns to it.
	let pinned = { d: st.d, lat: st.lat };
	function show(d, lat) { st.d = clampD(Math.round(d)); st.lat = clampL(lat); schedule(); }
	function set(d, lat) { show(d, lat); pinned = { d: st.d, lat: st.lat }; CD.state.set({ d: st.d, lat: st.lat }); }
	function at(e) {
		const r = cv.getBoundingClientRect();
		const px = e.clientX - r.left, py = e.clientY - r.top;
		return [Math.max(0, Math.min(DAYS - 1, (px - geo.x0) / geo.pw * DAYS - 0.5)), 90 - (py - geo.y0) / geo.ph * 180];
	}
	cv.addEventListener("pointerdown", e => { if (!geo) return; if (e.pointerType !== "mouse") cv.setPointerCapture(e.pointerId); set(...at(e)); });
	cv.addEventListener("pointermove", e => { if (!geo) return; if (e.buttons) set(...at(e)); else if (e.pointerType === "mouse") show(...at(e)); });
	cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") show(pinned.d, pinned.lat); });
	cv.addEventListener("keydown", e => {
		const k = e.shiftKey ? 10 : 1;
		const m = { ArrowLeft: [-k, 0], ArrowRight: [k, 0], ArrowUp: [0, k], ArrowDown: [0, -k] }[e.key];
		if (m) { e.preventDefault(); set((st.d + m[0] + DAYS) % DAYS, st.lat + m[1]); }
		if (e.key === "Escape" || e.key === "Home" || e.key === "t") { e.preventDefault(); set(PUB, st.lat); }
	});

	CD.exporter = {
		readout,
		draw: (c, x, y, w, h, u) => draw(c, x, y, w, h, u * 1.8, false)
	};
})();
