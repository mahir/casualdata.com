// 2026-11-19 — people with no toilet to use (open defecation), 2000 and 2024.
// Source: WHO Global Health Observatory, indicator WSH_SANITATION_OD, "Population practising open
// defecation (%)", the estimates of the WHO/UNICEF Joint Monitoring Programme (JMP).
// https://ghoapi.azureedge.net/api/WSH_SANITATION_OD
// Fetched 2026-11-19T02:36:33Z (UTC). The file's rows are dated 2026-01-23.
// Values are the file's "Value" field: percent of the population, whole numbers. t = the whole
// country, rural and urban = by place of residence; each is [2000, 2024]. null = no value in the file.
// countries: every country with 10 or more in 2024 (27 of the 195 countries that have a 2024
// value), highest first; equal values are ties. reference: India, shown for comparison.
// Country names are written by hand; the file has ISO codes only (code).
// Made by .daily/2026-11-19/make_data.py (not published) from the downloaded file.
window.TOILETS = {
	years: [2000, 2024],
	countriesWithValue: 195,
	countries: [
		{"code": "NER", "name": "Niger", "t": [81, 66], "rural": [92, 78], "urban": [22, 8]},
		{"code": "SSD", "name": "South Sudan", "t": [null, 63], "rural": [null, 75], "urban": [null, 17]},
		{"code": "TCD", "name": "Chad", "t": [71, 62], "rural": [86, 78], "urban": [18, 15]},
		{"code": "BEN", "name": "Benin", "t": [68, 47], "rural": [88, 65], "urban": [37, 29]},
		{"code": "SLB", "name": "Solomon Islands", "t": [59, 45], "rural": [69, 59], "urban": [7, 8]},
		{"code": "NAM", "name": "Namibia", "t": [59, 35], "rural": [80, 54], "urban": [16, 20]},
		{"code": "LBR", "name": "Liberia", "t": [54, 34], "rural": [75, 58], "urban": [29, 14]},
		{"code": "STP", "name": "São Tomé and Príncipe", "t": [73, 33], "rural": [81, 43], "urban": [65, 30]},
		{"code": "TGO", "name": "Togo", "t": [65, 32], "rural": [86, 51], "urban": [24, 9]},
		{"code": "KIR", "name": "Kiribati", "t": [49, 32], "rural": [62, 50], "urban": [31, 20]},
		{"code": "BFA", "name": "Burkina Faso", "t": [74, 30], "rural": [88, 42], "urban": [10, 5]},
		{"code": "MDG", "name": "Madagascar", "t": [44, 27], "rural": [53, 37], "urban": [21, 13]},
		{"code": "CAF", "name": "Central African Republic", "t": [23, 25], "rural": [34, 39], "urban": [4, 7]},
		{"code": "GHA", "name": "Ghana", "t": [20, 18], "rural": [30, 31], "urban": [8, 9]},
		{"code": "NGA", "name": "Nigeria", "t": [24, 18], "rural": [30, 31], "urban": [13, 7]},
		{"code": "CIV", "name": "Côte d’Ivoire", "t": [38, 17], "rural": [62, 31], "urban": [7, 4]},
		{"code": "PNG", "name": "Papua New Guinea", "t": [13, 16], "rural": [15, 17], "urban": [3, 5]},
		{"code": "MRT", "name": "Mauritania", "t": [59, 16], "rural": [83, 36], "urban": [21, 2]},
		{"code": "MOZ", "name": "Mozambique", "t": [59, 16], "rural": [73, 24], "urban": [24, 4]},
		{"code": "SDN", "name": "Sudan", "t": [48, 16], "rural": [62, 24], "urban": [19, 3]},
		{"code": "ETH", "name": "Ethiopia", "t": [72, 16], "rural": [81, 20], "urban": [21, 3]},
		{"code": "LSO", "name": "Lesotho", "t": [46, 15], "rural": [55, 20], "urban": [9, 4]},
		{"code": "SLE", "name": "Sierra Leone", "t": [26, 15], "rural": [36, 25], "urban": [7, 4]},
		{"code": "SOM", "name": "Somalia", "t": [59, 14], "rural": [83, 26], "urban": [11, 2]},
		{"code": "ZWE", "name": "Zimbabwe", "t": [33, 13], "rural": [48, 19], "urban": [3, 0]},
		{"code": "COD", "name": "DR Congo", "t": [10, 12], "rural": [15, 19], "urban": [3, 4]},
		{"code": "AFG", "name": "Afghanistan", "t": [24, 11], "rural": [29, 15], "urban": [6, 0]}
	],
	reference: {"code": "IND", "name": "India", "t": [73, 7], "rural": [91, 11], "urban": [25, 0]}
};
