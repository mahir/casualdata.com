// Estimated deaths of children under five from lower respiratory infections (LRI, which UNICEF
// reports as pneumonia), both sexes, in 2015 and 2024, for the six countries with the most such
// deaths in 2024 (of 194 countries in the file), and for the world.
//
// Source: UNICEF Data Warehouse, CA-CODE (Child and Adolescent Causes of Death Estimation)
// estimates, dataflow CME_CAUSE_OF_DEATH, indicator DEATHS, cause LRI, sex _T, age Y0T4:
// https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/UNICEF,CME_CAUSE_OF_DEATH,1.0/.DEATHS.LRI._T.Y0T4?format=csv&startPeriod=2015
// fetched 2026-11-12 02:35 UTC; 2210 rows.
//
// Each value is [estimate, lower bound, upper bound] (OBS_VALUE, LOWER_BOUND, UPPER_BOUND), rounded
// to whole deaths, copied by script (.daily/2026-11-12/make_data.py, not published) and paired by
// REF_AREA and TIME_PERIOD. These are modelled estimates, not counts of registered deaths.
// rangesApart: true where the 2015 and 2024 ranges do not overlap; changePct is the change in the
// central estimate, in percent, and the page prints it only where rangesApart is true.
// indiaNote is UNICEF's COUNTRY_NOTES for India, as in the file.
//
// Checked when this file was built:
// - the six largest in 2024, in order: NGA, IND, COD, PAK, ETH, BGD.
// - India: 179,275 to 70,242 (-61%); at the edges of the ranges least
//   favourable to the claim (lowest 2015, highest 2024) still -54%: more than halved.
// - Nigeria: 152,763 to 147,153 (-4%), inside the ranges.
// - ranges apart only for India and Pakistan.
window.LRI = {
	"years": [
		2015,
		2024
	],
	"countries": [
		{
			"iso": "NGA",
			"name": "Nigeria",
			"y2015": [152763, 137704, 167823],
			"y2024": [147153, 120739, 173567],
			"rangesApart": false,
			"changePct": -4
		},
		{
			"iso": "IND",
			"name": "India",
			"y2015": [179275, 171940, 186611],
			"y2024": [70242, 61275, 79210],
			"rangesApart": true,
			"changePct": -61
		},
		{
			"iso": "COD",
			"name": "DR Congo",
			"y2015": [40101, 33040, 47161],
			"y2024": [47416, 33100, 61731],
			"rangesApart": false,
			"changePct": 18
		},
		{
			"iso": "PAK",
			"name": "Pakistan",
			"y2015": [54825, 49257, 60392],
			"y2024": [35243, 24658, 45828],
			"rangesApart": true,
			"changePct": -36
		},
		{
			"iso": "ETH",
			"name": "Ethiopia",
			"y2015": [38933, 32542, 45324],
			"y2024": [28013, 16098, 39927],
			"rangesApart": false,
			"changePct": -28
		},
		{
			"iso": "BGD",
			"name": "Bangladesh",
			"y2015": [21655, 17997, 25313],
			"y2024": [18730, 15540, 21921],
			"rangesApart": false,
			"changePct": -14
		}
	],
	"world": {
		"y2015": [898974, 855841, 942107],
		"y2024": [658310, 602392, 714227]
	},
	"indiaNote": "The CA CODE estimates are not the official statistics of India. The Sample Registration  System (SRS) of ORGI is the official data source of India for all mortality estimates."
};
