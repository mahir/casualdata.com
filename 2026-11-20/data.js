// 2026-11-20 — the world's nuclear warheads at the beginning of 2026, by the country that holds them.
// Source: Federation of American Scientists, "Status of World Nuclear Forces", the table
// "Status of World Nuclear Forces, 2026" (the first table on the page).
// https://fas.org/initiative/status-world-nuclear-forces/
// Fetched 2026-11-20T02:36:45Z (UTC). The page gives the figures "as of the beginning of 2026".
// All figures are FAS estimates, with wide uncertainty. Per country:
//   strategic, nonstrategic = deployed warheads as the table prints them (null = "n.a.")
//   deployed = strategic + nonstrategic (n.a. counted as 0)
//   stockpile = "Military Stockpile": warheads assigned to military forces
//   total = "Total Inventory": the stockpile plus retired warheads waiting to be dismantled
//   share = total as a percent of the nine countries' total, one decimal
// The table's "Reserve/Nondeployed" column is left out: India's row does not add up in it
// (0 deployed + 178 reserve, stockpile 190).
// totals: the sums of the rows. total (12,187) and stockpile (9,745) equal the table's own totals.
// deployed (4,000) is the row sum; the table prints "~3,912" strategic and "~100" nonstrategic and
// notes that totals may not add, so the page says "about 4,000".
// three = Russia, the United States and China together; per100 = their share of each total, rounded.
// A later paragraph of the same page says "an estimated 12,321 at the beginning of 2026"; the
// table and the page's opening sentence say 12,187, which is used here.
// The news: AP, 19 Nov 2026, "Trump, Xi and Putin hold rare 3-way talks on nuclear risks but
// deliver no breakthroughs",
// https://apnews.com/article/trump-xi-putin-nuclear-ukraine-iran-a04dc76ed8e786b087e2c1ea9598783a
// Made by .daily/2026-11-20/make_data.py (not published) from the downloaded page.
window.WARHEADS = {
	asOf: "the beginning of 2026",
	countries: [
		{"name": "Russia", "slug": "russia", "strategic": 1796, "nonstrategic": 0, "deployed": 1796, "stockpile": 4400, "total": 5420, "share": 44.5},
		{"name": "United States", "slug": "united-states", "strategic": 1670, "nonstrategic": 100, "deployed": 1770, "stockpile": 3700, "total": 5042, "share": 41.4},
		{"name": "China", "slug": "china", "strategic": 34, "nonstrategic": null, "deployed": 34, "stockpile": 620, "total": 620, "share": 5.1},
		{"name": "France", "slug": "france", "strategic": 280, "nonstrategic": null, "deployed": 280, "stockpile": 290, "total": 370, "share": 3.0},
		{"name": "United Kingdom", "slug": "united-kingdom", "strategic": 120, "nonstrategic": null, "deployed": 120, "stockpile": 225, "total": 225, "share": 1.8},
		{"name": "India", "slug": "india", "strategic": 0, "nonstrategic": null, "deployed": 0, "stockpile": 190, "total": 190, "share": 1.6},
		{"name": "Pakistan", "slug": "pakistan", "strategic": 0, "nonstrategic": null, "deployed": 0, "stockpile": 170, "total": 170, "share": 1.4},
		{"name": "Israel", "slug": "israel", "strategic": 0, "nonstrategic": null, "deployed": 0, "stockpile": 90, "total": 90, "share": 0.7},
		{"name": "North Korea", "slug": "north-korea", "strategic": 0, "nonstrategic": null, "deployed": 0, "stockpile": 60, "total": 60, "share": 0.5}
	],
	totals: {"total": 12187, "stockpile": 9745, "deployed": 4000},
	three: {"total": 11082, "stockpile": 8720, "deployed": 3600},
	per100: {"total": 91, "stockpile": 89, "deployed": 90}
};
