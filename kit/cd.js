// casualdata daily — shared chrome: menu, share sheet, PNG export.
// A day page sets <body class="cd-day" data-day="N"> and calls
//   CD.exporter = { draw(ctx, x, y, w, h, scale), readout() -> [big, small] }
// The kit draws the branded frame around whatever draw() paints.
(function () {
	const days = window.CD_DAYS || [];
	const n = Number(document.body.dataset.day || 0);
	const day = days.find(d => d.n === n);
	const pad3 = x => String(x).padStart(3, "0");
	const fmtDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).replace(",", "");

	const CD = window.CD = { day, days, pad3, fmtDate, exporter: null };

	const C = {
		paper: "#0E0E0E", ink: "#EDEBE6", ink2: "#A8A59E", ink3: "#66635E", red: "#FF3D1F",
		sans: '"Host Grotesk", Arial, sans-serif', mono: '"Ioskeley Mono", ui-monospace, Menlo, monospace'
	};
	CD.colors = C;

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
		d.innerHTML = `<div class="in"><div class="top"><a class="cd-mark" href="/next/"><img class="wm" src="/kit/wordmark.svg" alt="casualdata"></a><button class="cd-btn" data-close>Close</button></div>${body}</div>`;
		d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
		document.body.append(d);
		return d;
	}

	const dayItems = days.slice().reverse().map(d =>
		`<li><a href="${d.path}"${d.n === n ? ' aria-current="page"' : ""}><span class="n">No.${pad3(d.n)}</span><span>${d.title}</span></a></li>`).join("");

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

	const fileName = (kind = "") => `casualdata-${pad3(n)}${kind ? "-" + kind : ""}.png`;

	// ---------- PNG export ----------
	const markImg = new Image(); markImg.src = "/kit/wordmark.svg";   // 5656 x 981

	function wrap(ctx, text, maxW) {
		const words = text.split(" "), lines = []; let line = "";
		for (const w of words) {
			const t = line ? line + " " + w : w;
			if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
		}
		if (line) lines.push(line);
		return lines;
	}

	async function render(W, H) {
		await document.fonts.ready;
		if (!markImg.complete) await new Promise(r => { markImg.onload = markImg.onerror = r; });
		const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
		const ctx = cv.getContext("2d");
		const u = Math.min(W, H) / 1080;          // unit scale
		const p = Math.round(64 * u);
		ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
		ctx.textBaseline = "alphabetic";

		// top bar: mark left, number + date right, ink rule
		const mh = 36 * u, mw = mh * 5656 / 981;
		ctx.drawImage(markImg, p, p, mw, mh);
		ctx.font = `400 ${18 * u}px ${C.mono}`; ctx.fillStyle = C.ink2; ctx.textAlign = "right";
		ctx.fillText(day ? `NO.${pad3(day.n)} · ${fmtDate(day.date).toUpperCase()}` : "", W - p, p + mh * .82);
		ctx.textAlign = "left";
		let y = p + mh + 22 * u;
		ctx.fillStyle = C.ink; ctx.fillRect(p, y, W - 2 * p, Math.max(1, 2 * u));
		y += 40 * u;

		// title
		const wide = W > H * 1.3;
		const ts = (wide ? 72 : 84) * u;
		ctx.font = `800 ${ts}px ${C.sans}`; ctx.letterSpacing = `${-ts * .045}px`;
		const [big, small] = CD.exporter ? CD.exporter.readout() : ["", ""];
		const readW = wide ? 420 * u : 0;
		const lines = wrap(ctx, day ? day.title : document.title, W - 2 * p - readW);
		for (const l of lines) { y += ts * .92; ctx.fillText(l, p, y); }
		ctx.letterSpacing = "0px";
		// readout
		const bs = (wide ? 72 : 64) * u;
		if (wide) {
			ctx.textAlign = "right"; ctx.font = `800 ${bs}px ${C.sans}`;
			ctx.fillText(big, W - p, y - 30 * u);
			ctx.font = `400 ${17 * u}px ${C.mono}`; ctx.fillStyle = C.ink2;
			ctx.fillText(small.toUpperCase(), W - p, y);
			ctx.textAlign = "left";
		} else {
			y += 26 * u + bs;
			ctx.font = `800 ${bs}px ${C.sans}`; ctx.fillText(big, p, y);
			const bw = ctx.measureText(big).width;
			ctx.font = `400 ${18 * u}px ${C.mono}`; ctx.fillStyle = C.ink2;
			ctx.fillText(small.toUpperCase(), p + bw + 18 * u, y);
		}
		y += 32 * u;

		// footer
		const fy = H - p;
		ctx.font = `400 ${17 * u}px ${C.mono}`; ctx.fillStyle = C.ink2;
		const src = document.querySelector("[data-source]");
		ctx.fillText(src ? src.dataset.source.toUpperCase() : "", p, fy);
		ctx.textAlign = "right"; ctx.fillStyle = C.ink;
		ctx.fillText(("casualdata.com" + (day ? day.path.replace(/\/$/, "") : "")).toUpperCase(), W - p, fy);
		ctx.textAlign = "left";

		// the visualization
		const vy = y, vh = fy - 36 * u - vy;
		if (CD.exporter) { ctx.save(); CD.exporter.draw(ctx, p, vy, W - 2 * p, vh, u); ctx.restore(); }

		return new Promise(r => cv.toBlob(r, "image/png"));
	}
	CD.render = render;
})();
