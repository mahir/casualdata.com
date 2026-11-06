// The 2026 electorate, for "If the country were 100 people".
// Turnout: UF Election Lab (Michael McDonald), 2026 General Election Turnout, data table
// v0.2, "Initial Estimate", page last updated 6 Nov 2026 10:30 am ET (file modified
// 15:25 GMT): https://election.lab.ufl.edu/data-downloads/turnoutdata/Turnout_2026G_v0.2.csv
// Ballots are mostly AP estimates the day after the election; California and Washington
// are still uncertain. The 4 Nov 9:50 pm ET version of the same file had 122,683,000
// ballots (48.76%). 2022, for comparison: 112,030,874 of 242,907,672 (46.12%), same lab.
// House: the sum of AP's vote counts in all 435 races, from NPR's results feed
// https://apps.npr.org/2026-election-results/data/house.json, latest update
// 6 Nov 2026 21:36 UTC (4:36 pm ET), about 92% of the expected vote counted on average.
// Unopposed races report no votes (FL-10) and a few races had no candidate from one of
// the two parties (mostly California's top-two), so these are votes cast, not a measure
// of support. "other" is every candidate who is not a Democrat or a Republican.
// Only the party shares are used: voters are split by them within the turnout above.
window.TOWN = {
	eligible: 251588219,     // voting-eligible population
	ballots: 123490000,      // ballots counted, initial estimate
	turnout: 49.08,          // percent of the eligible population
	turnout2022: 46.12,
	house: { dem: 62424630, rep: 48342570, other: 1692841 }   // national House votes, AP, still counting
};
