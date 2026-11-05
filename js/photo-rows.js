// Justified photo rows for project pages. Without this script the CSS lays each .photos group out in rows
// that grow in proportion to each photo's --ar, capped by --grow-max. This script sets exact rows instead:
// photos go into a row while that brings its height closer to the target (--row), and the row is then sized
// to fill the width exactly. The last row fills the width too if that makes it at most 15% taller than the
// row above; otherwise it takes the row above's height and stays visibly partial, rather than growing large
// or ending just short of the edge.
(() => {
	const groups = document.querySelectorAll(".photos");
	if (!groups.length || typeof ResizeObserver !== "function") return;

	const targetHeight = (group) => {
		const probe = document.createElement("div");
		probe.style.cssText = "position: absolute; visibility: hidden; height: var(--row)";
		group.append(probe);
		const height = probe.offsetHeight;
		probe.remove();
		return height;
	};

	const layout = (group) => {
		const width = group.clientWidth - 0.5;
		if (width <= 0) return;
		const gap = parseFloat(getComputedStyle(group).columnGap) || 0;
		const target = targetHeight(group);
		const items = [...group.children]
			.filter((el) => el.tagName === "A")
			.map((el) => ({ el, ar: parseFloat(el.style.getPropertyValue("--ar")) || 1 }));
		const fill = (row) => (width - gap * (row.length - 1)) / row.reduce((sum, item) => sum + item.ar, 0);
		const place = (row, height) => {
			for (const { el, ar } of row) {
				el.style.flex = `0 0 ${(ar * height).toFixed(2)}px`;
				el.style.maxWidth = "none";
			}
		};

		let row = [];
		let previous = null;
		for (const item of items) {
			const without = row.length ? fill(row) : Infinity;
			const withItem = fill([...row, item]);
			if (row.length && withItem < target && Math.abs(without - target) <= Math.abs(withItem - target)) {
				place(row, without);
				previous = without;
				row = [];
			}
			row.push(item);
		}
		if (row.length) {
			const height = fill(row);
			const limit = previous ?? target;
			place(row, height <= limit * 1.15 ? height : limit);
		}
	};

	// Re-run only when a group's width changes; the rows it sets change its height, which must not loop back
	const widths = new WeakMap();
	const observer = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const width = Math.round(entry.contentRect.width * 2) / 2;
			if (widths.get(entry.target) === width) continue;
			widths.set(entry.target, width);
			layout(entry.target);
		}
	});
	groups.forEach((group) => observer.observe(group));
})();
