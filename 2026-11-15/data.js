// Every rugby union test match between Wales and New Zealand, 16 December 1905 to 14 November 2026:
// 39 matches, in date order.
//
// SOURCE. Wikipedia, "History of rugby union matches between New Zealand and Wales", the table in
// the section "Results" (the page's summary boxes are not used: they disagree with the table):
// https://en.wikipedia.org/wiki/History_of_rugby_union_matches_between_New_Zealand_and_Wales
// wikitext: https://en.wikipedia.org/w/index.php?title=History_of_rugby_union_matches_between_New_Zealand_and_Wales&action=raw
// fetched 2026-11-15T02:35:56Z.
// The match of 14 November 2026 (Wales 35–28 New Zealand, Cardiff) is also in the results list of
// lassen.co.nz (pick and go): https://www.lassen.co.nz/pickandgo.php
// fetched 2026-11-15T02:35:59Z. The data is final: every match is over.
// CHECKED on 2026-11-15T03:07Z against a second table, Wikipedia's "List of Wales national rugby
// union team results" (home side, away side, score, winner for all 39 matches): every score and
// winner agrees. That list dates the 1963 match 12 December; the 1963-64 tour's page and the
// table used here say 21 December (a Saturday), which is kept. BBC Sport's match page also gives
// 14 November 2026 as Wales 35, New Zealand 28: https://www.bbc.co.uk/sport/rugby-union/match/EVP5087126
//
// FIELDS. date: the day of the match. venue: ground and city as the table gives them; a country in
// brackets marks a neutral ground. walesPts and nzPts: the final score. The table writes the home
// side's score first (at a neutral ground, the side listed as home), so each side's points are
// taken from its "Winner" column (the winner has the larger score; no match was drawn). occasion: the table's "Competition" column
// (the tour, tournament or series the match belonged to).
// Scoring changed over the period (a try was worth 3 points until 1971 and 4 until 1992), so
// margins from different eras are not records to rank against each other.
// Copied by script (.daily/2026-11-15/make_data.py, not published); the page derives the margins
// and the counts from these rows.
window.WALNZ = {
	fetched: "2026-11-15T02:35:56Z",
	matches: [
		{"date": "1905-12-16", "venue": "Cardiff Arms Park, Cardiff", "walesPts": 3, "nzPts": 0, "occasion": "The Original All Blacks"},
		{"date": "1924-11-29", "venue": "St Helen's, Swansea", "walesPts": 0, "nzPts": 19, "occasion": "1924–25 New Zealand tour of France, Great Britain and Ireland"},
		{"date": "1935-12-21", "venue": "National Stadium, Cardiff", "walesPts": 13, "nzPts": 12, "occasion": "1935–36 New Zealand tour of Canada, Great Britain and Ireland"},
		{"date": "1953-12-19", "venue": "National Stadium, Cardiff", "walesPts": 13, "nzPts": 8, "occasion": "1953–54 New Zealand tour of Europe and North America"},
		{"date": "1963-12-21", "venue": "National Stadium, Cardiff", "walesPts": 0, "nzPts": 6, "occasion": "1963–64 New Zealand tour of Europe and North America"},
		{"date": "1967-11-11", "venue": "National Stadium, Cardiff", "walesPts": 6, "nzPts": 13, "occasion": "1967 New Zealand tour of Great Britain, France and Canada"},
		{"date": "1969-05-31", "venue": "Lancaster Park, Christchurch", "walesPts": 0, "nzPts": 19, "occasion": "1969 Wales tour of New Zealand, Australia and Fiji"},
		{"date": "1969-06-14", "venue": "Eden Park, Auckland", "walesPts": 12, "nzPts": 33, "occasion": "1969 Wales tour of New Zealand, Australia and Fiji"},
		{"date": "1972-12-02", "venue": "National Stadium, Cardiff", "walesPts": 16, "nzPts": 19, "occasion": "1972–73 New Zealand tour of Europe and North America"},
		{"date": "1978-11-11", "venue": "National Stadium, Cardiff", "walesPts": 12, "nzPts": 13, "occasion": "1978 New Zealand tour of Great Britain and Ireland"},
		{"date": "1980-11-01", "venue": "National Stadium, Cardiff", "walesPts": 3, "nzPts": 23, "occasion": "1980 New Zealand tour of North America and Wales"},
		{"date": "1987-06-14", "venue": "Ballymore Stadium, Brisbane (Australia)", "walesPts": 6, "nzPts": 49, "occasion": "1987 Rugby World Cup"},
		{"date": "1988-05-28", "venue": "Lancaster Park, Christchurch", "walesPts": 3, "nzPts": 52, "occasion": "1988 Wales tour of New Zealand"},
		{"date": "1988-06-11", "venue": "Eden Park, Auckland", "walesPts": 9, "nzPts": 54, "occasion": "1988 Wales tour of New Zealand"},
		{"date": "1989-11-04", "venue": "National Stadium, Cardiff", "walesPts": 9, "nzPts": 34, "occasion": "1989 New Zealand tour of Great Britain, Ireland and North America"},
		{"date": "1995-05-31", "venue": "Ellis Park, Johannesburg (South Africa)", "walesPts": 9, "nzPts": 34, "occasion": "1995 Rugby World Cup"},
		{"date": "1997-11-29", "venue": "Wembley Stadium, London (England)", "walesPts": 7, "nzPts": 42, "occasion": "1997 New Zealand tour of Great Britain and Ireland"},
		{"date": "2002-11-23", "venue": "Millennium Stadium, Cardiff", "walesPts": 17, "nzPts": 43, "occasion": "2002 Autumn Internationals"},
		{"date": "2003-06-21", "venue": "Waikato Stadium, Hamilton", "walesPts": 3, "nzPts": 55, "occasion": "2003 Wales tour of Australia and New Zealand"},
		{"date": "2003-11-02", "venue": "Stadium Australia, Sydney (Australia)", "walesPts": 37, "nzPts": 53, "occasion": "2003 Rugby World Cup"},
		{"date": "2004-11-20", "venue": "Millennium Stadium, Cardiff", "walesPts": 25, "nzPts": 26, "occasion": "2004 Autumn Internationals"},
		{"date": "2005-11-05", "venue": "Millennium Stadium, Cardiff", "walesPts": 3, "nzPts": 41, "occasion": "2005 Autumn Internationals"},
		{"date": "2006-11-25", "venue": "Millennium Stadium, Cardiff", "walesPts": 10, "nzPts": 45, "occasion": "2006 Autumn Internationals"},
		{"date": "2008-11-22", "venue": "Millennium Stadium, Cardiff", "walesPts": 9, "nzPts": 29, "occasion": "2008 Autumn Internationals"},
		{"date": "2009-11-07", "venue": "Millennium Stadium, Cardiff", "walesPts": 12, "nzPts": 19, "occasion": "2009 Autumn Internationals"},
		{"date": "2010-06-19", "venue": "Carisbrook, Dunedin", "walesPts": 9, "nzPts": 42, "occasion": "2010 Wales tour of New Zealand"},
		{"date": "2010-06-26", "venue": "Waikato Stadium, Hamilton", "walesPts": 10, "nzPts": 29, "occasion": "2010 Wales tour of New Zealand"},
		{"date": "2010-11-27", "venue": "Millennium Stadium, Cardiff", "walesPts": 25, "nzPts": 37, "occasion": "2010 Autumn Internationals"},
		{"date": "2012-11-24", "venue": "Millennium Stadium, Cardiff", "walesPts": 10, "nzPts": 33, "occasion": "2012 Autumn Internationals"},
		{"date": "2014-11-22", "venue": "Millennium Stadium, Cardiff", "walesPts": 16, "nzPts": 34, "occasion": "2014 Autumn Internationals"},
		{"date": "2016-06-11", "venue": "Eden Park, Auckland", "walesPts": 21, "nzPts": 39, "occasion": "2016 Wales tour of New Zealand"},
		{"date": "2016-06-18", "venue": "Wellington Regional Stadium, Wellington", "walesPts": 22, "nzPts": 36, "occasion": "2016 Wales tour of New Zealand"},
		{"date": "2016-06-25", "venue": "Forsyth Barr Stadium, Dunedin", "walesPts": 6, "nzPts": 46, "occasion": "2016 Wales tour of New Zealand"},
		{"date": "2017-11-25", "venue": "Millennium Stadium, Cardiff", "walesPts": 18, "nzPts": 33, "occasion": "2017 Autumn Internationals"},
		{"date": "2019-11-01", "venue": "Tokyo Stadium, Chōfu (Japan)", "walesPts": 17, "nzPts": 40, "occasion": "2019 Rugby World Cup"},
		{"date": "2021-10-30", "venue": "Millennium Stadium, Cardiff", "walesPts": 16, "nzPts": 54, "occasion": "2021 Autumn Internationals"},
		{"date": "2022-11-05", "venue": "Millennium Stadium, Cardiff", "walesPts": 23, "nzPts": 55, "occasion": "2022 Autumn Internationals"},
		{"date": "2025-11-22", "venue": "Millennium Stadium, Cardiff", "walesPts": 26, "nzPts": 52, "occasion": "2025 Autumn Internationals"},
		{"date": "2026-11-14", "venue": "Millennium Stadium, Cardiff", "walesPts": 35, "nzPts": 28, "occasion": "2026 Nations Championship"}
	]
};
