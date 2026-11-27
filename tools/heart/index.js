// casualdata daily: the private heart, a Cloudflare Worker at heart.casualdata.com.
//
// The heart on a day page (kit/cd.js) sends POST /like with {"day": "YYYY-MM-DD", "delta": 1 or -1}
// when a reader likes or un-likes that day. This adds it to the day's row in the D1 table `hearts`
// (schema.sql). Counts are never sent back to readers: the owner reads them with hearts.sh.
//
// Requests come from navigator.sendBeacon as text/plain, so there is no preflight and the page
// ignores the answer. Only casualdata.com may send. Nothing about the reader is stored: no IP, no
// cookie, no id. A reader can like a day once per browser (the page remembers it), but nothing here
// stops someone determined from sending many, so the counts are soft.

const SITE = "https://casualdata.com";
const FIRST_DAY = "2026-11-01";
const DAY = /^20\d\d-\d\d-\d\d$/;

const cors = { "Access-Control-Allow-Origin": SITE, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" };
const answer = status => new Response(null, { status, headers: cors });

export default {
	async fetch(req, env) {
		const url = new URL(req.url);
		if (url.pathname !== "/like") return answer(404);
		if (req.method === "OPTIONS") return answer(204);
		if (req.method !== "POST") return answer(405);

		// from the site only: browsers send Origin with a POST; Referer as a fallback
		const origin = req.headers.get("Origin") || "";
		const referer = req.headers.get("Referer") || "";
		if (origin !== SITE && !referer.startsWith(SITE + "/")) return answer(403);

		const text = await req.text();
		if (text.length > 200) return answer(413);
		let body;
		try { body = JSON.parse(text); } catch { return answer(400); }
		const { day, delta } = body || {};
		if (typeof day !== "string" || !DAY.test(day) || (delta !== 1 && delta !== -1)) return answer(400);

		// a day that can exist: not before the first one, not after tomorrow (UTC; readers east of
		// the owner's clock can be a day ahead)
		const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
		if (day < FIRST_DAY || day > tomorrow) return answer(400);

		await env.DB.prepare(
			"INSERT INTO hearts (day, likes, unlikes) VALUES (?1, ?2, ?3) " +
			"ON CONFLICT(day) DO UPDATE SET likes = likes + ?2, unlikes = unlikes + ?3"
		).bind(day, delta === 1 ? 1 : 0, delta === -1 ? 1 : 0).run();
		return answer(204);
	},
};
