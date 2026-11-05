// Day or night by the reader's local hour: a white page from 07:00 to 18:59, black otherwise.
// Loaded in <head> before the stylesheet paints. ?theme=light or ?theme=dark overrides it.
(function () {
	const root = document.documentElement;
	const forced = new URLSearchParams(location.search).get("theme");
	const pick = () => {
		if (forced === "light" || forced === "dark") return forced;
		const h = new Date().getHours();
		return h >= 7 && h < 19 ? "light" : "dark";
	};
	const apply = () => {
		const t = pick();
		if (root.dataset.theme === t) return;
		root.dataset.theme = t;
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.content = t === "light" ? "#FFFFFF" : "#0E0E0E";
		document.dispatchEvent(new CustomEvent("cd-theme", { detail: t }));
	};
	apply();
	setInterval(apply, 60 * 1000);
	document.addEventListener("visibilitychange", () => { if (!document.hidden) apply(); });
})();
