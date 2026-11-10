// CO2 in the air in the month each UN climate summit (COP) opened, COP1 Berlin 1995 to COP31 Antalya 2026.
//
// ppm: Mauna Loa monthly mean CO2, seasonal cycle removed (the file's fifth column, "de-seasonalized";
// NOT the fourth, "monthly average": summits open in different months, and on the raw monthly mean
// Bonn, Oct 1999, is below Buenos Aires, Nov 1998). Parts per million, dry air mole fraction.
// Source: NOAA Global Monitoring Laboratory, https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt
// fetched 10 Nov 2026 02:56 UTC. One station: Mauna Loa Observatory, Hawaii (Dec 2022 to Jul 2023
// measured at Maunakea, as the file notes).
// y, m: the year and month the value is for. It is the month of the summit's opening day (opened),
// so Paris is Nov 2015 (opened 30 Nov), Glasgow Oct 2021 (31 Oct), Dubai Nov 2023 (30 Nov).
// Antalya opened 9 Nov 2026; NOAA has no November value yet, so it carries the latest month
// published, September 2026 (latest: true). The page and the drawing say so.
//
// Summit list and opening dates: Wikipedia, "United Nations Climate Change Conference" and the yearly
// conference articles (2013, 2019, 2022, 2023, 2024, 2025, 2026), raw wikitext read 10 Nov 2026 02:57 UTC,
// https://en.wikipedia.org/wiki/United_Nations_Climate_Change_Conference
// UNFCCC's own list: https://unfccc.int/process/bodies/supreme-bodies/conference-of-the-parties-cop
// COP6 resumed in Bonn in July 2001 (COP6-2); it is one summit, placed at The Hague, Nov 2000.
// No summit in 2020: COP26 was postponed to 2021.
//
// BASE: 280 ppm, the level before industry. NOAA Climate.gov, "Climate change: atmospheric carbon
// dioxide": "Before the Industrial Revolution started in the mid-1700s, atmospheric carbon dioxide
// was 280 ppm or less." https://www.climate.gov/news-features/understanding-climate/climate-change-atmospheric-carbon-dioxide
// read 10 Nov 2026 02:57 UTC.
//
// Checked when this file was built: every one of the 30 steps from one summit to the next is positive
// (smallest +1.10, largest +4.43).
window.CO2_BASE = 280;
window.COPS = [
	{ n: 1, city: "Berlin", opened: "1995-03-28", y: 1995, m: 3, ppm: 360.37 },
	{ n: 2, city: "Geneva", opened: "1996-07-08", y: 1996, m: 7, ppm: 362.98 },
	{ n: 3, city: "Kyoto", opened: "1997-12-01", y: 1997, m: 12, ppm: 365.28 },
	{ n: 4, city: "Buenos Aires", opened: "1998-11-02", y: 1998, m: 11, ppm: 367.70 },
	{ n: 5, city: "Bonn", opened: "1999-10-25", y: 1999, m: 10, ppm: 368.80 },
	{ n: 6, city: "The Hague", opened: "2000-11-13", y: 2000, m: 11, ppm: 370.48 },
	{ n: 7, city: "Marrakech", opened: "2001-10-29", y: 2001, m: 10, ppm: 371.85 },
	{ n: 8, city: "New Delhi", opened: "2002-10-23", y: 2002, m: 10, ppm: 374.06 },
	{ n: 9, city: "Milan", opened: "2003-12-01", y: 2003, m: 12, ppm: 376.93 },
	{ n: 10, city: "Buenos Aires", opened: "2004-12-06", y: 2004, m: 12, ppm: 378.48 },
	{ n: 11, city: "Montreal", opened: "2005-11-28", y: 2005, m: 11, ppm: 380.69 },
	{ n: 12, city: "Nairobi", opened: "2006-11-06", y: 2006, m: 11, ppm: 382.52 },
	{ n: 13, city: "Bali", opened: "2007-12-03", y: 2007, m: 12, ppm: 385.07 },
	{ n: 14, city: "Poznań", opened: "2008-12-01", y: 2008, m: 12, ppm: 386.64 },
	{ n: 15, city: "Copenhagen", opened: "2009-12-07", y: 2009, m: 12, ppm: 388.43 },
	{ n: 16, city: "Cancún", opened: "2010-11-28", y: 2010, m: 11, ppm: 390.99 },
	{ n: 17, city: "Durban", opened: "2011-11-28", y: 2011, m: 11, ppm: 392.64 },
	{ n: 18, city: "Doha", opened: "2012-11-26", y: 2012, m: 11, ppm: 395.25 },
	{ n: 19, city: "Warsaw", opened: "2013-11-11", y: 2013, m: 11, ppm: 397.35 },
	{ n: 20, city: "Lima", opened: "2014-12-01", y: 2014, m: 12, ppm: 399.81 },
	{ n: 21, city: "Paris", opened: "2015-11-30", y: 2015, m: 11, ppm: 402.24 },
	{ n: 22, city: "Marrakech", opened: "2016-11-07", y: 2016, m: 11, ppm: 405.74 },
	{ n: 23, city: "Bonn", opened: "2017-11-06", y: 2017, m: 11, ppm: 407.36 },
	{ n: 24, city: "Katowice", opened: "2018-12-03", y: 2018, m: 12, ppm: 409.99 },
	{ n: 25, city: "Madrid", opened: "2019-12-02", y: 2019, m: 12, ppm: 412.71 },
	{ n: 26, city: "Glasgow", opened: "2021-10-31", y: 2021, m: 10, ppm: 417.14 },
	{ n: 27, city: "Sharm el-Sheikh", opened: "2022-11-06", y: 2022, m: 11, ppm: 419.51 },
	{ n: 28, city: "Dubai", opened: "2023-11-30", y: 2023, m: 11, ppm: 422.41 },
	{ n: 29, city: "Baku", opened: "2024-11-11", y: 2024, m: 11, ppm: 425.80 },
	{ n: 30, city: "Belém", opened: "2025-11-10", y: 2025, m: 11, ppm: 428.40 },
	{ n: 31, city: "Antalya", opened: "2026-11-09", y: 2026, m: 9, ppm: 429.55, latest: true },
];
