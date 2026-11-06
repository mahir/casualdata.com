// The 2026 electorate, for "If the country were 100 people".
// UF Election Lab (Michael McDonald), 2026 General Election Turnout, data table v0.2,
// "Initial Estimate", page last updated 4 Nov 2026 9:50 pm ET:
// https://election.lab.ufl.edu/data-downloads/turnoutdata/Turnout_2026G_v0.2.csv
// Ballots are mostly AP estimates the day after the election; California and Washington
// are still uncertain. 2022, for comparison: 112,030,874 of 242,907,672 (46.12%), same lab.
// No reputable national House vote tally for 2026 was published by 5 Nov evening, so the
// voters are not split by party here. house stays null until a tally (e.g. Cook's) is final.
window.TOWN = {
	eligible: 251588219,     // voting-eligible population
	ballots: 122683000,      // ballots counted, initial estimate
	turnout: 48.76,          // percent of the eligible population
	turnout2022: 46.12,
	house: null              // { dem, rep, other } national House votes, once published
};
