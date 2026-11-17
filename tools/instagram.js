// Posts a day to Instagram: its /YYYY-MM-DD/ig.jpg (rendered by tools/cards.js) with a caption made
// from its title and dek in kit/days.js. Uses the Instagram API with Instagram Login, which fetches
// the image from casualdata.com, so the day must already be deployed.
//
//   node tools/instagram.js [YYYY-MM-DD] [--dry-run | --check]
//   node tools/instagram.js --refresh
//
// With no date it posts the newest published (not draft) day dated today or earlier in New York.
// A day whose casualdata.com/YYYY-MM-DD link is already in a recent caption is skipped, so running
// it twice never posts twice.
//   --dry-run  prints the caption and checks the image; touches nothing on Instagram
//   --check    also creates the post container (Instagram checks the image) but does not publish it;
//              unpublished containers expire after 24 hours and don't count toward the posting limit
//   --refresh  prints a refreshed long-lived token (valid 60 days) on stdout, for the workflow to
//              store back in the repository secret
//
// Needs IG_ACCESS_TOKEN (a long-lived Instagram User token with instagram_business_basic and
// instagram_business_content_publish) in the environment, except with --dry-run.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const API = "https://graph.instagram.com/v27.0";
const SITE = "https://casualdata.com";
const TAGS = ["dataviz", "datavisualization"];

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const token = process.env.IG_ACCESS_TOKEN;

function fail(msg) { console.error(msg); process.exit(1); }

async function api(method, url, params = {}) {
	const u = new URL(url.startsWith("http") ? url : API + url);
	const opts = { method, headers: { Authorization: `Bearer ${token}` } };
	if (method === "GET") for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
	else opts.body = new URLSearchParams(params);
	const res = await fetch(u, opts);
	const json = await res.json().catch(() => ({}));
	if (!res.ok || json.error) {
		const e = json.error || {};
		throw new Error(`${method} ${u.pathname}: ${e.message || res.status}${e.error_user_msg ? " (" + e.error_user_msg + ")" : ""}`);
	}
	return json;
}

async function refresh() {
	if (!token) fail("IG_ACCESS_TOKEN is not set");
	const res = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
	const json = await res.json();
	if (!json.access_token) fail("refresh failed: " + ((json.error && json.error.message) || res.status));
	console.error(`token refreshed, valid ${Math.round(json.expires_in / 86400)} days`);
	process.stdout.write(json.access_token);
}

function days() {
	const src = fs.readFileSync(path.join(__dirname, "../kit/days.js"), "utf8");
	const ctx = { window: {} };
	vm.runInNewContext(src, ctx);
	return ctx.window.CD_DAYS;
}

function caption(day) {
	const tags = TAGS.concat(day.tags || []).map(t => "#" + t).join(" ");
	return `${day.title}\n\n${day.dek}\n\nExplore it, change the view and see the sources: casualdata.com/${day.date}\n(link in bio)\n\n${tags}`;
}

async function post() {
	const all = days();
	const asked = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
	const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
	const day = asked
		? all.find(d => d.date === asked)
		: all.filter(d => !d.draft && d.date <= today).pop();
	if (!day) fail(asked ? `${asked} is not in kit/days.js` : "no published day to post");
	if (day.draft) fail(`${day.date} is a draft`);

	const image = `${SITE}/${day.date}/ig.jpg`;
	const head = await fetch(image, { method: "HEAD" });
	if (!head.ok || !/jpeg/.test(head.headers.get("content-type") || ""))
		fail(`${image} is not live yet (${head.status}); render it with tools/cards.js and push`);

	const text = caption(day);
	console.log(`${day.date}\n${image}\n---\n${text}\n---`);
	if (flag("--dry-run")) return;
	if (!token) fail("IG_ACCESS_TOKEN is not set");

	const me = await api("GET", "/me", { fields: "user_id,username" });
	const recent = await api("GET", `/${me.user_id}/media`, { fields: "caption", limit: 25 });
	if ((recent.data || []).some(m => (m.caption || "").includes(`casualdata.com/${day.date}`))) {
		console.log(`already posted on @${me.username}; skipping`);
		return;
	}

	const { id: container } = await api("POST", `/${me.user_id}/media`, {
		image_url: image,
		caption: text,
		alt_text: `${day.title}. ${day.dek}`.slice(0, 1000)
	});
	// image containers are usually ready at once; Meta asks for no more than one check a minute for 5 minutes
	for (let i = 0; ; i++) {
		const { status_code } = await api("GET", `/${container}`, { fields: "status_code" });
		if (status_code === "FINISHED") break;
		if (status_code === "ERROR" || status_code === "EXPIRED" || i >= 5) fail(`container ${container}: ${status_code}`);
		await new Promise(r => setTimeout(r, 60000));
	}
	if (flag("--check")) { console.log(`Instagram accepted the image (container ${container}); not published`); return; }

	const { id: media } = await api("POST", `/${me.user_id}/media_publish`, { creation_id: container });
	const { permalink } = await api("GET", `/${media}`, { fields: "permalink" });
	console.log(`posted to @${me.username}: ${permalink}`);
}

(flag("--refresh") ? refresh() : post()).catch(e => fail(e.message));
