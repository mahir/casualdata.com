// Every 2026 Senate race with both a Democrat and a Republican on the ballot (31 of 35).
// pres: the state's 2024 presidential margin, Trump minus Harris, in points (MIT Election Data and Science Lab).
// dem, rep: 2026 Senate vote shares as reported by ABC News at 3:57 p.m. ET on 5 Nov 2026, rounded, some states still counting.
// held: the party that held the seat; won: the AP call (null = not called yet).
// Compiled for The midterm tide, mahiryavuz.com/works/009/. Idaho, Montana, Nebraska and South Dakota had no Democrat on the ballot.
window.SENATE = [
	{ s: "MA", name: "Massachusetts", pres: -25.9, dem: 63, rep: 32, held: "D", won: "D" },
	{ s: "DE", name: "Delaware", pres: -15.0, dem: 64, rep: 36, held: "D", won: "D" },
	{ s: "OR", name: "Oregon", pres: -14.9, dem: 57, rep: 40, held: "D", won: "D" },
	{ s: "RI", name: "Rhode Island", pres: -14.2, dem: 67, rep: 29, held: "D", won: "D" },
	{ s: "CO", name: "Colorado", pres: -11.3, dem: 60, rep: 36, held: "D", won: "D" },
	{ s: "IL", name: "Illinois", pres: -11.1, dem: 61, rep: 38, held: "D", won: "D" },
	{ s: "ME", name: "Maine", pres: -7.1, dem: 53, rep: 47, held: "R", won: "D" },
	{ s: "NM", name: "New Mexico", pres: -6.1, dem: 63, rep: 37, held: "D", won: "D" },
	{ s: "NJ", name: "New Jersey", pres: -6.0, dem: 62, rep: 35, held: "D", won: "D" },
	{ s: "VA", name: "Virginia", pres: -5.9, dem: 61, rep: 39, held: "D", won: "D" },
	{ s: "MN", name: "Minnesota", pres: -4.3, dem: 54, rep: 44, held: "D", won: "D" },
	{ s: "NH", name: "New Hampshire", pres: -2.8, dem: 56, rep: 42, held: "D", won: "D" },
	{ s: "MI", name: "Michigan", pres: 1.4, dem: 53, rep: 45, held: "D", won: "D" },
	{ s: "GA", name: "Georgia", pres: 2.2, dem: 59, rep: 41, held: "D", won: "D" },
	{ s: "NC", name: "North Carolina", pres: 3.3, dem: 59, rep: 39, held: "R", won: "D" },
	{ s: "OH", name: "Ohio", pres: 11.3, dem: 50, rep: 45, held: "R", won: "D" },
	{ s: "FL", name: "Florida", pres: 13.2, dem: 48, rep: 51, held: "R", won: "R" },
	{ s: "IA", name: "Iowa", pres: 13.4, dem: 51, rep: 46, held: "R", won: "D" },
	{ s: "AK", name: "Alaska", pres: 13.7, dem: 48.2, rep: 47.9, held: "R", won: null },
	{ s: "TX", name: "Texas", pres: 13.9, dem: 55, rep: 43, held: "R", won: "D" },
	{ s: "KS", name: "Kansas", pres: 16.4, dem: 51, rep: 46, held: "R", won: "D" },
	{ s: "SC", name: "South Carolina", pres: 18.1, dem: 51, rep: 47, held: "R", won: "D" },
	{ s: "LA", name: "Louisiana", pres: 22.4, dem: 49, rep: 51, held: "R", won: "R" },
	{ s: "MS", name: "Mississippi", pres: 23.1, dem: 49.0, rep: 48.9, held: "R", won: null },
	{ s: "TN", name: "Tennessee", pres: 30.1, dem: 43, rep: 55, held: "R", won: "R" },
	{ s: "AL", name: "Alabama", pres: 30.9, dem: 45, rep: 55, held: "R", won: "R" },
	{ s: "KY", name: "Kentucky", pres: 31.0, dem: 43, rep: 55, held: "R", won: "R" },
	{ s: "AR", name: "Arkansas", pres: 31.3, dem: 42, rep: 54, held: "R", won: "R" },
	{ s: "OK", name: "Oklahoma", pres: 34.9, dem: 39, rep: 57, held: "R", won: "R" },
	{ s: "WV", name: "West Virginia", pres: 42.7, dem: 38, rep: 58, held: "R", won: "R" },
	{ s: "WY", name: "Wyoming", pres: 47.0, dem: 35, rep: 65, held: "R", won: "R" },
];
