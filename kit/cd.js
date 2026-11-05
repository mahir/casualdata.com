// casualdata daily — shared chrome: menu, share sheet, PNG export.
// A day page sets <body class="cd-day" data-day="YYYY-MM-DD"> and calls
//   CD.exporter = { draw(ctx, x, y, w, h, scale) }
// The exported image is the visualization, the date and casualdata.com.
(function () {
	const days = window.CD_DAYS || [];
	const id = document.body.dataset.day || "";
	const day = days.find(d => d.date === id);
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
	CD.label = (ctx, px, py, value, context, s, box, leftX = px) => {
		const pad = 8 * s, gap = 12 * s;
		ctx.save();
		ctx.font = `600 ${17 * s}px ${C.sans}`; const vw = ctx.measureText(value).width;
		ctx.font = `400 ${10.5 * s}px ${C.mono}`; const cw = ctx.measureText(context.toUpperCase()).width;
		const w = Math.max(vw, cw) + pad * 2, h = 17 * s + 10.5 * s + pad * 2 + 5 * s;
		let x = px + gap, y = py - h / 2;
		if (x + w > box.x + box.w) x = leftX - gap - w;
		if (x < box.x) {                                   // no room on either side: sit above (or below) the point
			x = Math.min(Math.max(px - w, box.x), box.x + box.w - w);
			y = py - h - gap; if (y < box.y) y = py + gap;
		}
		y = Math.min(Math.max(y, box.y), box.y + box.h - h);
		ctx.fillStyle = C.ink; ctx.fillRect(x, y, w, h);
		ctx.fillStyle = C.paper; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
		ctx.font = `600 ${17 * s}px ${C.sans}`; ctx.fillText(value, x + pad, y + pad + 14 * s);
		ctx.font = `400 ${10.5 * s}px ${C.mono}`; ctx.fillText(context.toUpperCase(), x + pad, y + h - pad - 1 * s);
		ctx.restore();
	};
	// A visually hidden live region that repeats the reading for screen readers.
	CD.announce = text => { const el = document.getElementById("cd-live"); if (el && el.textContent !== text) el.textContent = text; };

	// ---------- toast ----------
	const toast = document.createElement("div");
	toast.className = "cd-toast"; toast.setAttribute("role", "status");
	document.body.append(toast);
	let tt;
	CD.toast = msg => { toast.textContent = msg; toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 1800); };

	// ---------- panels ----------
	function panel(id, title, body) {
		const d = document.createElement("dialog");
		d.className = "cd-panel"; d.id = id; d.setAttribute("aria-label", title);
		d.innerHTML = `<div class="in"><div class="top"><a class="cd-mark" href="/next/">${CD.wordmark}</a><button class="cd-btn" data-close>Close</button></div>${body}</div>`;
		d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
		document.body.append(d);
		return d;
	}

	const dayItems = days.slice().reverse().map(d =>
		`<li><a href="${d.path}"${d.date === id ? ' aria-current="page"' : ""}><span class="n">${shortDate(d.date)}</span><span>${d.title}</span></a></li>`).join("");

	const menu = panel("cd-menu", "Menu", `
		<section><h2>Daily</h2><ul class="cd-list">${dayItems}</ul></section>
		<section><h2>Work 2007–2014</h2><ul class="cd-list">
			<li><a href="/newsknitter/"><span class="n">2007</span><span>newsknitter</span></a></li>
			<li><a href="/valuemachine/"><span class="n">2008</span><span>value machine</span></a></li>
			<li><a href="/newshaper/"><span class="n">2009</span><span>newshaper</span></a></li>
			<li><a href="/socialbits/"><span class="n">2009</span><span>social bits</span></a></li>
			<li><a href="/senseofpatterns/"><span class="n">2011</span><span>sense of patterns</span></a></li>
			<li><a href="/"><span class="n">all</span><span>The archive</span></a></li>
		</ul></section>
		<section><h2>About</h2><p>A new data visualization every day, one screen each. Made by casualdata since 2005. All data is somehow casual.</p></section>`);

	const share = panel("cd-share", "Share", `
		<section><h2>Share this view</h2><p>The link keeps what you have selected.</p></section>
		<ul class="cd-list">
			<li><button data-act="copy"><span class="n">link</span><span>Copy link</span></button></li>
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

	document.addEventListener("click", e => {
		const t = e.target.closest("[data-open]");
		if (t) document.getElementById(t.dataset.open).showModal();
	});

	const fileName = (kind = "") => `casualdata-${id || "today"}${kind ? "-" + kind : ""}.png`;

	// ---------- PNG export ----------
	async function render(W, H) {
		await document.fonts.ready;
		const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
		const ctx = cv.getContext("2d");
		const u = Math.min(W, H) / 1080;          // unit scale
		const p = Math.round(56 * u);
		ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);

		// one line at the foot: the date, and where it lives
		const fy = H - p;
		ctx.textBaseline = "alphabetic";
		ctx.font = `400 ${22 * u}px ${C.mono}`;
		ctx.fillStyle = C.ink2;
		ctx.fillText(day ? fmtDate(day.date).toUpperCase() : "", p, fy);
		ctx.textAlign = "right"; ctx.fillStyle = C.ink;
		ctx.fillText("CASUALDATA.COM", W - p, fy);
		ctx.textAlign = "left";

		// everything else is the visualization
		if (CD.exporter) { ctx.save(); CD.exporter.draw(ctx, p, p, W - 2 * p, fy - 44 * u - p, u); ctx.restore(); }
		return new Promise(r => cv.toBlob(r, "image/png"));
	}
	CD.render = render;
})();
