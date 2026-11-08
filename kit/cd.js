// casualdata daily — shared chrome: day stepper and phone bottom bar, the reader's selection,
// the share sheet, PNG export.
// A day page sets <body class="cd-day" data-day="YYYY-MM-DD"> and calls
//   CD.exporter = { draw(ctx, x, y, w, h, scale) }
// The exported image is the visualization, the date and casualdata.com.
(function () {
	// Days marked draft: true are left out of the home grid and the stepper until the flag
	// is removed. Add ?drafts to any URL to list them for review.
	const id = document.body.dataset.day || "";
	const showDrafts = new URLSearchParams(location.search).has("drafts");
	const all = window.CD_DAYS || [];
	const days = all.filter(d => !d.draft || showDrafts);
	const day = all.find(d => d.date === id);
	if (day && day.draft) document.addEventListener("DOMContentLoaded", () => {
		const meta = document.querySelector(".cd-bar .cd-meta");
		if (meta) meta.insertAdjacentHTML("afterbegin", '<b class="cd-draft">Draft</b> · ');
	});
	const fmtDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).replace(",", "");

	const shortDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
	const CD = window.CD = { day, days, fmtDate, shortDate, exporter: null };

	// Canvas colors follow the CSS tokens, so they flip with the day/night theme.
	// Pages redraw on the "cd-theme" event that kit/theme.js sends.
	const C = { sans: '"Host Grotesk", Arial, sans-serif', mono: '"Ioskeley Mono", ui-monospace, Menlo, monospace' };
	const readColors = () => {
		const cs = getComputedStyle(document.documentElement);
		const v = n => cs.getPropertyValue(n).trim();
		Object.assign(C, { paper: v("--paper"), ink: v("--ink"), ink2: v("--ink-2"), ink3: v("--ink-3"), rule: v("--rule"), red: v("--red") });
		C.dark = document.documentElement.dataset.theme === "dark";
	};
	readColors();
	document.addEventListener("cd-theme", readColors);
	CD.colors = C;
	CD.wordmark = `<img class="wm wm-d" src="/kit/wordmark.svg" alt="casualdata"><img class="wm wm-l" src="/kit/wordmark-light.svg" alt="casualdata">`;

	// The reading sits in the chart, next to the point it describes: an ink chip with
	// the value on top and the context under it. (px, py) is the point; box = {x, y, w, h}
	// keeps the chip inside the chart. It flips to the left of the point near the right edge.
	// leftX, if given, is where the chip should end when it has to flip (e.g. the far end of a bar).
	// avoid, if given, lists rectangles {x, y, w, h} the chip must not cover (headings, other marks):
	// it then tries right of the point, left, above and below, and takes the first place that is clear.
	CD.label = (ctx, px, py, value, context, s, box, leftX = px, avoid = []) => {
		const pad = 8 * s, gap = 12 * s;
		ctx.save();
		ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
		ctx.font = `400 ${11 * s}px ${C.mono}`;
		// the context wraps at its " · " breaks when the chip would be wider than the chart
		const parts = context.toUpperCase().split(" · "), lines = [];
		for (const p of parts) {
			const t = lines.length ? lines[lines.length - 1] + " · " + p : p;
			if (lines.length && ctx.measureText(t).width + pad * 2 > box.w) lines.push(p); else if (lines.length) lines[lines.length - 1] = t; else lines.push(p);
		}
		const cw = Math.max(...lines.map(l => ctx.measureText(l).width)), lh = 15 * s;
		const w = Math.min(box.w, Math.max(vw, cw) + pad * 2), h = 17 * s + 11 * s + (lines.length - 1) * lh + pad * 2 + 5 * s;
		let x = px + gap, y = py - h / 2;
		if (x + w > box.x + box.w) x = leftX - gap - w;
		if (x < box.x) {                                   // no room on either side: sit above (or below) the point
			x = Math.min(Math.max(px - w, box.x), box.x + box.w - w);
			y = py - h - gap; if (y < box.y) y = py + gap;
		}
		y = Math.min(Math.max(y, box.y), box.y + box.h - h);
		if (avoid.length) {
			const fit = c => ({ x: Math.min(Math.max(c.x, box.x), box.x + box.w - w), y: Math.min(Math.max(c.y, box.y), box.y + box.h - h) });
			// how much a place covers: every rectangle it overlaps, and the point itself counts most
			const cost = c => avoid.filter(a => c.x < a.x + a.w && a.x < c.x + w && c.y < a.y + a.h && a.y < c.y + h).length
				+ (px >= c.x && px <= c.x + w && py >= c.y && py <= c.y + h ? 1000 : 0);
			const spots = [{ x: px + gap, y: py - h / 2 }, { x: leftX - gap - w, y: py - h / 2 }, { x: px - w / 2, y: py - h - gap }, { x: px - w / 2, y: py + gap },
				{ x: px + gap, y: py - h - gap }, { x: leftX - gap - w, y: py - h - gap }, { x: px + gap, y: py + gap }, { x: leftX - gap - w, y: py + gap }].map(fit);
			// the first clear place, or else the one that covers least
			const best = spots.reduce((b, c) => cost(c) < cost(b) ? c : b, spots[0]);
			({ x, y } = spots.find(c => cost(c) === 0) || best);
		}
		ctx.fillStyle = C.ink; ctx.fillRect(x, y, w, h);
		ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillText(value, x + pad, y + pad + 14 * s);
		ctx.font = `400 ${11 * s}px ${C.mono}`;
		lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad + 17 * s + 5 * s + 11 * s + i * lh - 1 * s));
		ctx.restore();
	};
	// ---------- the reader's selection ----------
	// The selection lives in the URL, so a shared link opens the same view. Other parameters (theme,
	// drafts) are kept.
	let stateT;
	CD.state = {
		get: k => new URLSearchParams(location.search).get(k),
		set(values) {
			clearTimeout(stateT);
			stateT = setTimeout(() => {
				const q = new URLSearchParams(location.search);
				for (const [k, v] of Object.entries(values)) (v === null || v === undefined || v === "") ? q.delete(k) : q.set(k, v);
				const qs = q.toString();
				history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
			}, 150);
		}
	};
	// Every day handles its reading the same way: pointing previews it, a click, tap or key pins it, and
	// only the pinned reading goes into the link. Leaving the chart goes back to the pinned one.
	// The keys are the same on every day: arrows step, Escape and Home go back to the overview.
	CD.selection = ({ initial = -1, key, encode, onChange }) => {
		let shown = initial, pinned = initial;
		const show = i => { if (i !== shown) { shown = i; onChange(i); } };
		const pin = i => { pinned = i; show(i); CD.state.set({ [key]: i < 0 ? null : encode(i) }); };
		return { show, pin, leave: () => show(pinned), get shown() { return shown; }, get pinned() { return pinned; } };
	};
	// Wires a chart's pointer and keys to a selection. at(e) returns the index under the pointer (or -1);
	// step(from, dir) returns the next index for an arrow key (dir is +1 or -1).
	CD.bindSelection = (cv, sel, { at, step }) => {
		cv.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") cv.setPointerCapture(e.pointerId); sel.pin(at(e)); });
		cv.addEventListener("pointermove", e => { const i = at(e); if (e.buttons) { if (i >= 0) sel.pin(i); } else if (e.pointerType === "mouse") sel.show(i); });
		cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") sel.leave(); });
		cv.addEventListener("keydown", e => {
			const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
			if (dir) { e.preventDefault(); sel.pin(step(sel.shown, dir)); }
			if (e.key === "Escape" || e.key === "Home") { e.preventDefault(); sel.pin(-1); }
		});
	};

	// A visually hidden live region that repeats the reading for screen readers.
	CD.announce = text => { const el = document.getElementById("cd-live"); if (el && el.textContent !== text) el.textContent = text; };

	// ---------- toast ----------
	const toast = document.createElement("div");
	toast.className = "cd-toast"; toast.setAttribute("role", "status");
	document.body.append(toast);
	let tt;
	CD.toast = msg => { toast.textContent = msg; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 1800); };

	// ---------- the share panel ----------
	function panel(id, title, body) {
		const d = document.createElement("dialog");
		d.className = "cd-panel"; d.id = id; d.setAttribute("aria-label", title);
		d.innerHTML = `<div class="in"><div class="top"><a class="cd-mark" href="/">${CD.wordmark}</a><button class="cd-btn" data-close>Close</button></div>${body}</div>`;
		d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
		document.body.append(d);
		return d;
	}

	// ---------- moving between days ----------
	// A day page gets a stepper around its date in the top bar (‹ date ›) and, on phones, a bar at the
	// bottom with the previous day, all days and the next day. A draft steps through drafts too.
	const order = day && day.draft ? all : days;
	const at = order.findIndex(d => d.date === id);
	if (day && at > -1) {
		const prev = order[at - 1], next = order[at + 1];
		// the newest published day has no next one yet: the slot says so instead of going dead
		const latest = !next && !day.draft;
		const arrow = (d, rel, glyph) => d
			? `<a class="cd-arrow" rel="${rel}" href="${d.path}" aria-label="${rel === "prev" ? "Previous" : "Next"} day, ${shortDate(d.date)}">${glyph}</a>`
			: rel === "next" && latest
				? `<span class="cd-arrow" role="img" aria-label="The next day comes tomorrow" title="The next day comes tomorrow">${glyph}</span>`
				: `<span class="cd-arrow" aria-hidden="true">${glyph}</span>`;
		const meta = document.querySelector(".cd-bar .cd-meta");
		if (meta) {
			const step = document.createElement("nav");
			step.className = "cd-step"; step.setAttribute("aria-label", "Previous and next day");
			meta.replaceWith(step);
			step.append(document.createRange().createContextualFragment(arrow(prev, "prev", "‹")), meta, document.createRange().createContextualFragment(arrow(next, "next", "›")));
		}
		// phones: everything the thumb needs at the bottom: previous day, all days, share, next day
		const bar = document.createElement("nav");
		bar.className = "cd-daynav"; bar.setAttribute("aria-label", "Previous day, all days, share, next day");
		bar.innerHTML = (prev ? `<a href="${prev.path}" rel="prev"><span aria-hidden="true">‹</span> ${shortDate(prev.date)}</a>` : `<span></span>`)
			+ `<a href="/" class="all">All days</a>`
			+ `<button type="button" class="share" data-open="cd-share">Share</button>`
			+ (next ? `<a href="${next.path}" rel="next">${shortDate(next.date)} <span aria-hidden="true">›</span></a>`
				: latest ? `<span class="soon">Tomorrow</span>` : `<span></span>`);
		document.body.append(bar);
	}

	if (day) {
		const share = panel("cd-share", "Share", `
			<section><h2>Share this view</h2><p class="cd-share-view"></p></section>
			<ul class="cd-list">
				<li><button data-act="copy" autofocus><span class="n">link</span><span>Copy link</span></button></li>
				${navigator.share ? '<li><button data-act="native"><span class="n">send</span><span>Share…</span></button></li>' : ""}
				<li><button data-act="png-tall"><span class="n">4:5</span><span>Download image, portrait</span></button></li>
				<li><button data-act="png-wide"><span class="n">16:9</span><span>Download image, wide</span></button></li>
			</ul>`);

		share.addEventListener("click", async e => {
			const b = e.target.closest("[data-act]"); if (!b) return;
			const act = b.dataset.act;
			if (act === "copy") {
				try { await navigator.clipboard.writeText(location.href); CD.toast("Link copied"); }
				catch { prompt("Copy this link", location.href); }
			} else if (act === "native") {
				try {
					const blob = await render(1080, 1350);
					const file = new File([blob], fileName(), { type: "image/png" });
					const data = { title: day ? day.title : document.title, url: location.href };
					if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
					await navigator.share(data);
				} catch (err) { if (err && err.name !== "AbortError") CD.toast("Could not share"); }
			} else {
				const [w, h] = act === "png-tall" ? [1080, 1350] : [1600, 900];
				const blob = await render(w, h);
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob); a.download = fileName(w > h ? "wide" : "portrait");
				a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
				CD.toast("Image saved");
			}
		});

	}

	document.addEventListener("click", e => {
		const t = e.target.closest("[data-open]");
		const panelEl = t && document.getElementById(t.dataset.open);
		if (!panelEl) return;
		// the share panel says which reading the link and the image will carry
		const view = panelEl.querySelector(".cd-share-view");
		if (view) {
			const r = CD.exporter && CD.exporter.readout ? CD.exporter.readout() : null;
			view.innerHTML = r ? `The link and the image show <b></b>.` : "The link and the image show this view.";
			if (r) view.querySelector("b").textContent = r[0];
		}
		panelEl.showModal();
	});

	const fileName = (kind = "") => `casualdata-${id || "today"}${kind ? "-" + kind : ""}.png`;

	// ---------- PNG export ----------
	// The wordmark files carry only a viewBox; they get a pixel size before drawing, since some browsers
	// draw a size-less SVG into a canvas at the wrong scale.
	const WORDMARK_RATIO = 5250 / 955;
	const marks = {};
	const wordmarkImage = dark => marks[dark] || (marks[dark] = fetch(dark ? "/kit/wordmark.svg" : "/kit/wordmark-light.svg")
		.then(r => r.text())
		.then(svg => new Promise(res => {
			const img = new Image();
			img.onload = () => res(img); img.onerror = () => res(null);
			img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", '<svg width="1100" height="200" '));
		}))
		.catch(() => null));
	async function render(W, H) {
		await document.fonts.ready;
		const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
		const ctx = cv.getContext("2d");
		const u = Math.min(W, H) / 1080;          // unit scale
		const p = Math.round(56 * u);
		ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);

		// the foot, the same on every image: the {casualdata} wordmark and the date at the left, the
		// day's address at the right, so an image seen on its own still says whose it is and where it lives
		const fy = H - p, mh = Math.round(30 * u);
		const mark = await wordmarkImage(C.dark);
		if (mark) ctx.drawImage(mark, p, fy - mh * 0.8, mh * WORDMARK_RATIO, mh);
		ctx.textBaseline = "alphabetic";
		ctx.font = `400 ${22 * u}px ${C.mono}`;
		ctx.fillStyle = C.ink2;
		ctx.fillText(day ? fmtDate(day.date).toUpperCase() : "", p + (mark ? mh * WORDMARK_RATIO + 24 * u : 0), fy);
		ctx.textAlign = "right"; ctx.fillStyle = C.ink;
		ctx.fillText(`casualdata.com/${id}`, W - p, fy);
		ctx.textAlign = "left";

		// everything else is the visualization
		if (CD.exporter) { ctx.save(); CD.exporter.draw(ctx, p, p, W - 2 * p, fy - 44 * u - p, u); ctx.restore(); }
		return new Promise(r => cv.toBlob(r, "image/png"));
	}
	CD.render = render;
})();
