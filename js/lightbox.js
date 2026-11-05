// Photo viewer for project pages. Every link inside a [data-gallery] element that points at an image
// opens in a full-screen <dialog> with previous / next / close, arrow keys, Esc and swipe.
// Without this script (or without <dialog> support) the same links simply open the image file.
(() => {
	const galleries = document.querySelectorAll("[data-gallery]");
	if (!galleries.length || typeof HTMLDialogElement !== "function") return;

	const viewer = document.createElement("dialog");
	viewer.className = "viewer";
	viewer.setAttribute("aria-label", "Photo viewer");
	viewer.innerHTML =
		'<img class="viewer-img" alt="">' +
		'<div class="viewer-bar">' +
		'<p class="viewer-count" aria-live="polite"></p>' +
		'<button type="button" class="viewer-prev">previous</button>' +
		'<button type="button" class="viewer-next">next</button>' +
		'<button type="button" class="viewer-close" autofocus>close</button>' +
		"</div>";
	document.body.append(viewer);

	const img = viewer.querySelector(".viewer-img");
	const loaded = () => img.classList.remove("is-loading");
	img.addEventListener("load", loaded);
	img.addEventListener("error", loaded);
	const count = viewer.querySelector(".viewer-count");
	const prev = viewer.querySelector(".viewer-prev");
	const next = viewer.querySelector(".viewer-next");
	let links = [];
	let index = 0;
	let opener = null;

	const preload = (i) => {
		const link = links[(i + links.length) % links.length];
		if (link) new Image().src = link.href;
	};

	const show = (i) => {
		index = (i + links.length) % links.length;
		const link = links[index];
		const thumb = link.querySelector("img");
		img.classList.add("is-loading");
		img.src = link.href;
		img.alt = thumb ? thumb.alt : "";
		if (img.complete) img.classList.remove("is-loading");
		const several = links.length > 1;
		count.textContent = several ? `${index + 1} / ${links.length}` : "";
		prev.hidden = next.hidden = !several;
		if (several) {
			preload(index + 1);
			preload(index - 1);
		}
	};

	galleries.forEach((gallery) => {
		gallery.addEventListener("click", (event) => {
			const link = event.target.closest("a[href]");
			if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			event.preventDefault();
			links = [...gallery.querySelectorAll("a[href]")];
			opener = link;
			show(links.indexOf(link));
			viewer.showModal();
		});
	});

	prev.addEventListener("click", () => show(index - 1));
	next.addEventListener("click", () => show(index + 1));
	viewer.querySelector(".viewer-close").addEventListener("click", () => viewer.close());

	viewer.addEventListener("keydown", (event) => {
		if (event.key === "ArrowRight") show(index + 1);
		else if (event.key === "ArrowLeft") show(index - 1);
	});

	// A click on the empty space around the photo closes the viewer
	viewer.addEventListener("click", (event) => {
		if (event.target === viewer) viewer.close();
	});

	let touchX = null;
	viewer.addEventListener("touchstart", (event) => {
		touchX = event.touches.length === 1 ? event.touches[0].clientX : null;
	}, { passive: true });
	viewer.addEventListener("touchend", (event) => {
		if (touchX === null || links.length < 2) return;
		const dx = event.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
		touchX = null;
	});

	viewer.addEventListener("close", () => {
		img.removeAttribute("src");
		if (opener) opener.focus();
	});
})();
