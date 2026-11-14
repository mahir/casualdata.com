// US airports on 13 November 2026, the day the FAA halted departures across the country for hours
// (a nationwide ground stop from about 4 pm to 8:15 pm ET, after a telecommunications outage; some
// international departures left during it: CBS News, CNBC, The Guardian, 13 Nov 2026):
// how many of each airport's departures were cancelled and delayed.
//
// SOURCE. FlightAware, live flight delay and cancellation statistics, the table of origin airports
// for "yesterday" (13 Nov 2026, US Eastern time; read after the day closed):
// https://www.flightaware.com/live/cancelled/yesterday
// https://www.flightaware.com/ajax/airport/cancelled_count.rvt?type=origin&timePeriod=yesterday&airportFilter=
// both fetched 2026-11-14T05:07:13Z (14 Nov 2026, 12:07 am ET). The day was over.
//
// WHAT THE SET IS. FlightAware's table lists the 100 airports in the world with the most cancelled
// departures. 84 of them are in the United States (ICAO code K..., PH..., PA... or TJ...: the
// states and Puerto Rico) and are here; the other 16 are left out (YYZ, YUL, YVR, CUN, GDL, SJD, YYC, PKX, MEX, PUJ, HRB, PVR, PVG, SXM, YTZ, DEL).
// An airport with few cancellations is not in the table at all, so this is not every US airport and
// the lowest column is not the least-hit airport in the country.
//
// FIELDS, all as FlightAware gives them: code and icao; name and place; cancelled and delayed are
// numbers of departures; cancelledPct and delayedPct are FlightAware's own whole percentages of the
// airport's departures that day. Order: by cancelledPct, then cancelled, then code.
// usCancelled is the page's "Total cancellations within, into, or out of the United States yesterday".
// Copied by script and compared value by value with a second, separate reading of the same download.
// At this fetch: Dallas, DFW 34% and DAL 9%; Houston, IAH 32% and HOU 13%; Chicago, ORD 34% and MDW 13%.
// The day before (12 Nov, no ground stop) the same table had Dallas-Fort Worth at 11 cancelled, 0%,
// and LaGuardia and JFK at 25% each: storms hit New York on both days.
window.STOP = {
	asOf: "14 Nov 2026, 12:07 am ET",
	fetched: "2026-11-14T05:07:13Z",
	usCancelled: 8272,
	pairs: [["Dallas", "DFW", "DAL"], ["Houston", "IAH", "HOU"], ["Chicago", "ORD", "MDW"]],
	rows: [
		{"code": "SDF", "icao": "KSDF", "name": "Muhammad Ali Intl", "place": "Louisville, KY", "cancelled": 19, "cancelledPct": 6, "delayed": 19, "delayedPct": 6},
		{"code": "HPN", "icao": "KHPN", "name": "Westchester County", "place": "White Plains, NY", "cancelled": 19, "cancelledPct": 7, "delayed": 7, "delayedPct": 2},
		{"code": "MEM", "icao": "KMEM", "name": "Frederick W Smith Intl/Memphis", "place": "Memphis, TN", "cancelled": 23, "cancelledPct": 7, "delayed": 15, "delayedPct": 4},
		{"code": "OMA", "icao": "KOMA", "name": "Eppley Airfield", "place": "Omaha, NE", "cancelled": 13, "cancelledPct": 8, "delayed": 22, "delayedPct": 14},
		{"code": "DAL", "icao": "KDAL", "name": "Dallas Love Fld", "place": "Dallas, TX", "cancelled": 42, "cancelledPct": 9, "delayed": 75, "delayedPct": 17},
		{"code": "ELP", "icao": "KELP", "name": "El Paso Intl", "place": "El Paso, TX", "cancelled": 18, "cancelledPct": 10, "delayed": 6, "delayedPct": 3},
		{"code": "TYS", "icao": "KTYS", "name": "McGhee Tyson", "place": "Knoxville, TN", "cancelled": 21, "cancelledPct": 10, "delayed": 15, "delayedPct": 7},
		{"code": "SJU", "icao": "TJSJ", "name": "Luis Munoz Marin Intl", "place": "San Juan, PR", "cancelled": 30, "cancelledPct": 10, "delayed": 44, "delayedPct": 15},
		{"code": "MKE", "icao": "KMKE", "name": "Milwaukee Mitchell Intl Airport", "place": "Milwaukee, WI", "cancelled": 17, "cancelledPct": 11, "delayed": 26, "delayedPct": 17},
		{"code": "SAV", "icao": "KSAV", "name": "Savannah/Hilton Head Intl", "place": "Savannah, GA", "cancelled": 19, "cancelledPct": 11, "delayed": 10, "delayedPct": 6},
		{"code": "SAT", "icao": "KSAT", "name": "San Antonio Intl", "place": "San Antonio, TX", "cancelled": 28, "cancelledPct": 11, "delayed": 30, "delayedPct": 12},
		{"code": "GSO", "icao": "KGSO", "name": "Piedmont Triad Intl", "place": "Greensboro, NC", "cancelled": 15, "cancelledPct": 12, "delayed": 9, "delayedPct": 7},
		{"code": "LIT", "icao": "KLIT", "name": "Clinton National", "place": "Little Rock, AR", "cancelled": 15, "cancelledPct": 12, "delayed": 8, "delayedPct": 6},
		{"code": "DSM", "icao": "KDSM", "name": "Des Moines Intl", "place": "Des Moines, IA", "cancelled": 16, "cancelledPct": 12, "delayed": 8, "delayedPct": 6},
		{"code": "BHM", "icao": "KBHM", "name": "Birmingham-Shuttlesworth Intl", "place": "Birmingham, AL", "cancelled": 22, "cancelledPct": 12, "delayed": 14, "delayedPct": 8},
		{"code": "CVG", "icao": "KCVG", "name": "Cincinnati/Northern Kentucky International Airport", "place": "Hebron, KY", "cancelled": 29, "cancelledPct": 12, "delayed": 29, "delayedPct": 12},
		{"code": "DJT", "icao": "KDJT", "name": "President Donald J Trump Intl", "place": "West Palm Beach, FL", "cancelled": 37, "cancelledPct": 12, "delayed": 26, "delayedPct": 8},
		{"code": "CHS", "icao": "KCHS", "name": "Charleston Intl/AFB", "place": "Charleston, SC", "cancelled": 27, "cancelledPct": 13, "delayed": 27, "delayedPct": 13},
		{"code": "OAK", "icao": "KOAK", "name": "Oakland San Francisco Bay", "place": "Oakland, CA", "cancelled": 30, "cancelledPct": 13, "delayed": 47, "delayedPct": 21},
		{"code": "IND", "icao": "KIND", "name": "Indianapolis Intl", "place": "Indianapolis, IN", "cancelled": 34, "cancelledPct": 13, "delayed": 33, "delayedPct": 12},
		{"code": "MDW", "icao": "KMDW", "name": "Chicago Midway Intl", "place": "Chicago, IL", "cancelled": 39, "cancelledPct": 13, "delayed": 65, "delayedPct": 21},
		{"code": "HOU", "icao": "KHOU", "name": "William P Hobby", "place": "Houston, TX", "cancelled": 44, "cancelledPct": 13, "delayed": 53, "delayedPct": 16},
		{"code": "GRR", "icao": "KGRR", "name": "Gerald R Ford Intl", "place": "Grand Rapids, MI", "cancelled": 17, "cancelledPct": 14, "delayed": 11, "delayedPct": 9},
		{"code": "OKC", "icao": "KOKC", "name": "OKC Will Rogers Intl", "place": "Oklahoma City, OK", "cancelled": 18, "cancelledPct": 14, "delayed": 18, "delayedPct": 14},
		{"code": "AUS", "icao": "KAUS", "name": "Austin-Bergstrom Intl", "place": "Austin, TX", "cancelled": 69, "cancelledPct": 14, "delayed": 106, "delayedPct": 22},
		{"code": "PVD", "icao": "KPVD", "name": "Rhode Island T. F. Green International Airport", "place": "Providence, RI", "cancelled": 13, "cancelledPct": 15, "delayed": 13, "delayedPct": 15},
		{"code": "CAE", "icao": "KCAE", "name": "Columbia Metro", "place": "Columbia, SC", "cancelled": 14, "cancelledPct": 15, "delayed": 1, "delayedPct": 1},
		{"code": "MSN", "icao": "KMSN", "name": "Dane Co Rgnl", "place": "Madison, WI", "cancelled": 19, "cancelledPct": 15, "delayed": 5, "delayedPct": 4},
		{"code": "RIC", "icao": "KRIC", "name": "Richmond Intl", "place": "Richmond, VA", "cancelled": 23, "cancelledPct": 15, "delayed": 20, "delayedPct": 13},
		{"code": "ONT", "icao": "KONT", "name": "Ontario Intl", "place": "Ontario, CA", "cancelled": 24, "cancelledPct": 15, "delayed": 23, "delayedPct": 14},
		{"code": "BWI", "icao": "KBWI", "name": "Baltimore/Washington Intl", "place": "Baltimore, MD", "cancelled": 56, "cancelledPct": 15, "delayed": 99, "delayedPct": 26},
		{"code": "SGF", "icao": "KSGF", "name": "Springfield", "place": "Springfield, MO", "cancelled": 14, "cancelledPct": 16, "delayed": 9, "delayedPct": 10},
		{"code": "PSP", "icao": "KPSP", "name": "Palm Springs Intl", "place": "Palm Springs, CA", "cancelled": 18, "cancelledPct": 16, "delayed": 17, "delayedPct": 15},
		{"code": "TPA", "icao": "KTPA", "name": "Tampa Intl", "place": "Tampa, FL", "cancelled": 59, "cancelledPct": 16, "delayed": 69, "delayedPct": 19},
		{"code": "RDU", "icao": "KRDU", "name": "Raleigh-Durham Intl", "place": "Raleigh/Durham, NC", "cancelled": 60, "cancelledPct": 16, "delayed": 56, "delayedPct": 15},
		{"code": "RNO", "icao": "KRNO", "name": "Reno/Tahoe Intl", "place": "Reno, NV", "cancelled": 19, "cancelledPct": 17, "delayed": 23, "delayedPct": 20},
		{"code": "BOI", "icao": "KBOI", "name": "Gowen Field", "place": "Boise, ID", "cancelled": 28, "cancelledPct": 17, "delayed": 17, "delayedPct": 10},
		{"code": "BUR", "icao": "KBUR", "name": "Hollywood Burbank Airport", "place": "Burbank, CA", "cancelled": 31, "cancelledPct": 17, "delayed": 37, "delayedPct": 21},
		{"code": "MCI", "icao": "KMCI", "name": "Kansas City Intl", "place": "Kansas City, MO", "cancelled": 33, "cancelledPct": 17, "delayed": 42, "delayedPct": 22},
		{"code": "HSV", "icao": "KHSV", "name": "Huntsville Intl", "place": "Huntsville, AL", "cancelled": 14, "cancelledPct": 18, "delayed": 7, "delayedPct": 9},
		{"code": "ORF", "icao": "KORF", "name": "Norfolk Intl", "place": "Norfolk, VA", "cancelled": 21, "cancelledPct": 18, "delayed": 14, "delayedPct": 12},
		{"code": "IAD", "icao": "KIAD", "name": "Washington Dulles Intl", "place": "Washington, DC", "cancelled": 102, "cancelledPct": 18, "delayed": 104, "delayedPct": 19},
		{"code": "LAS", "icao": "KLAS", "name": "Harry Reid Intl", "place": "Las Vegas, NV", "cancelled": 165, "cancelledPct": 18, "delayed": 187, "delayedPct": 20},
		{"code": "CMH", "icao": "KCMH", "name": "John Glenn Columbus Intl Airport", "place": "Columbus, OH", "cancelled": 43, "cancelledPct": 19, "delayed": 27, "delayedPct": 12},
		{"code": "PIT", "icao": "KPIT", "name": "Pittsburgh Intl", "place": "Pittsburgh, PA", "cancelled": 43, "cancelledPct": 19, "delayed": 38, "delayedPct": 17},
		{"code": "SJC", "icao": "KSJC", "name": "San Jose Int'l", "place": "San Jose, CA", "cancelled": 46, "cancelledPct": 19, "delayed": 49, "delayedPct": 20},
		{"code": "PDX", "icao": "KPDX", "name": "Portland Intl", "place": "Portland, OR", "cancelled": 54, "cancelledPct": 19, "delayed": 70, "delayedPct": 24},
		{"code": "XNA", "icao": "KXNA", "name": "Northwest Arkansas Ntl", "place": "Fayetteville/Springdale/Rogers, AR", "cancelled": 16, "cancelledPct": 20, "delayed": 11, "delayedPct": 14},
		{"code": "GSP", "icao": "KGSP", "name": "Greenville/Spartanburg Intl", "place": "Greer, SC", "cancelled": 21, "cancelledPct": 20, "delayed": 13, "delayedPct": 12},
		{"code": "JAX", "icao": "KJAX", "name": "Jacksonville Intl", "place": "Jacksonville, FL", "cancelled": 34, "cancelledPct": 20, "delayed": 20, "delayedPct": 11},
		{"code": "RSW", "icao": "KRSW", "name": "Southwest Florida Intl", "place": "Fort Myers, FL", "cancelled": 34, "cancelledPct": 20, "delayed": 28, "delayedPct": 17},
		{"code": "CLE", "icao": "KCLE", "name": "Cleveland-Hopkins Intl", "place": "Cleveland, OH", "cancelled": 38, "cancelledPct": 20, "delayed": 30, "delayedPct": 16},
		{"code": "SNA", "icao": "KSNA", "name": "John Wayne", "place": "Santa Ana, CA", "cancelled": 55, "cancelledPct": 20, "delayed": 41, "delayedPct": 14},
		{"code": "BNA", "icao": "KBNA", "name": "Nashville Intl", "place": "Nashville, TN", "cancelled": 99, "cancelledPct": 20, "delayed": 108, "delayedPct": 21},
		{"code": "MIA", "icao": "KMIA", "name": "Miami Intl", "place": "Miami, FL", "cancelled": 162, "cancelledPct": 20, "delayed": 198, "delayedPct": 24},
		{"code": "SYR", "icao": "KSYR", "name": "Syracuse Hancock Intl", "place": "Syracuse, NY", "cancelled": 14, "cancelledPct": 21, "delayed": 5, "delayedPct": 7},
		{"code": "MSY", "icao": "KMSY", "name": "Louis Armstrong New Orleans International Airport", "place": "New Orleans, LA", "cancelled": 45, "cancelledPct": 21, "delayed": 43, "delayedPct": 20},
		{"code": "STL", "icao": "KSTL", "name": "St Louis Lambert Intl", "place": "St Louis, MO", "cancelled": 54, "cancelledPct": 22, "delayed": 49, "delayedPct": 20},
		{"code": "AVL", "icao": "KAVL", "name": "Asheville Rgnl", "place": "Asheville, NC", "cancelled": 18, "cancelledPct": 23, "delayed": 4, "delayedPct": 5},
		{"code": "BUF", "icao": "KBUF", "name": "Buffalo Niagara Intl", "place": "Buffalo, NY", "cancelled": 23, "cancelledPct": 23, "delayed": 20, "delayedPct": 20},
		{"code": "PHL", "icao": "KPHL", "name": "Philadelphia Intl", "place": "Philadelphia, PA", "cancelled": 118, "cancelledPct": 23, "delayed": 114, "delayedPct": 22},
		{"code": "MCO", "icao": "KMCO", "name": "Orlando Intl", "place": "Orlando, FL", "cancelled": 141, "cancelledPct": 23, "delayed": 167, "delayedPct": 27},
		{"code": "SEA", "icao": "KSEA", "name": "Seattle-Tacoma Intl", "place": "Seattle, WA", "cancelled": 143, "cancelledPct": 23, "delayed": 187, "delayedPct": 30},
		{"code": "FLL", "icao": "KFLL", "name": "Fort Lauderdale Intl", "place": "Fort Lauderdale, FL", "cancelled": 125, "cancelledPct": 24, "delayed": 107, "delayedPct": 20},
		{"code": "SLC", "icao": "KSLC", "name": "Salt Lake City Intl", "place": "Salt Lake City, UT", "cancelled": 118, "cancelledPct": 25, "delayed": 83, "delayedPct": 17},
		{"code": "STS", "icao": "KSTS", "name": "Schulz-Sonoma County", "place": "Santa Rosa, CA", "cancelled": 13, "cancelledPct": 26, "delayed": 7, "delayedPct": 14},
		{"code": "MSP", "icao": "KMSP", "name": "Minneapolis/St Paul Intl", "place": "Minneapolis, MN", "cancelled": 133, "cancelledPct": 26, "delayed": 100, "delayedPct": 20},
		{"code": "EWR", "icao": "KEWR", "name": "Newark Liberty Intl", "place": "Newark, NJ", "cancelled": 156, "cancelledPct": 26, "delayed": 162, "delayedPct": 27},
		{"code": "PHX", "icao": "KPHX", "name": "Phoenix Sky Harbor Intl", "place": "Phoenix, AZ", "cancelled": 193, "cancelledPct": 26, "delayed": 181, "delayedPct": 25},
		{"code": "LAX", "icao": "KLAX", "name": "Los Angeles Intl", "place": "Los Angeles, CA", "cancelled": 248, "cancelledPct": 26, "delayed": 285, "delayedPct": 29},
		{"code": "DEN", "icao": "KDEN", "name": "Denver Intl", "place": "Denver, CO", "cancelled": 270, "cancelledPct": 26, "delayed": 315, "delayedPct": 30},
		{"code": "SMF", "icao": "KSMF", "name": "Sacramento Intl", "place": "Sacramento, CA", "cancelled": 60, "cancelledPct": 28, "delayed": 54, "delayedPct": 25},
		{"code": "BOS", "icao": "KBOS", "name": "Boston Logan Intl", "place": "Boston, MA", "cancelled": 194, "cancelledPct": 28, "delayed": 123, "delayedPct": 18},
		{"code": "DTW", "icao": "KDTW", "name": "Detroit Metro Wayne Co", "place": "Detroit, MI", "cancelled": 144, "cancelledPct": 29, "delayed": 96, "delayedPct": 19},
		{"code": "JFK", "icao": "KJFK", "name": "John F Kennedy Intl", "place": "New York, NY", "cancelled": 191, "cancelledPct": 29, "delayed": 170, "delayedPct": 26},
		{"code": "SFO", "icao": "KSFO", "name": "San Francisco Int'l", "place": "San Francisco, CA", "cancelled": 222, "cancelledPct": 32, "delayed": 204, "delayedPct": 30},
		{"code": "IAH", "icao": "KIAH", "name": "Houston Bush Int'ctl", "place": "Houston, TX", "cancelled": 225, "cancelledPct": 32, "delayed": 132, "delayedPct": 18},
		{"code": "SAN", "icao": "KSAN", "name": "San Diego Intl", "place": "San Diego, CA", "cancelled": 136, "cancelledPct": 33, "delayed": 109, "delayedPct": 26},
		{"code": "ATL", "icao": "KATL", "name": "Hartsfield-Jackson Intl", "place": "Atlanta, GA", "cancelled": 408, "cancelledPct": 33, "delayed": 249, "delayedPct": 20},
		{"code": "DFW", "icao": "KDFW", "name": "Dallas-Fort Worth Intl", "place": "Dallas-Fort Worth, TX", "cancelled": 397, "cancelledPct": 34, "delayed": 249, "delayedPct": 21},
		{"code": "ORD", "icao": "KORD", "name": "Chicago O'Hare Intl", "place": "Chicago, IL", "cancelled": 502, "cancelledPct": 34, "delayed": 294, "delayedPct": 20},
		{"code": "DCA", "icao": "KDCA", "name": "Reagan National", "place": "Washington, DC", "cancelled": 161, "cancelledPct": 35, "delayed": 74, "delayedPct": 16},
		{"code": "CLT", "icao": "KCLT", "name": "Charlotte/Douglas Intl", "place": "Charlotte, NC", "cancelled": 311, "cancelledPct": 35, "delayed": 163, "delayedPct": 18},
		{"code": "LGA", "icao": "KLGA", "name": "LaGuardia", "place": "New York, NY", "cancelled": 235, "cancelledPct": 41, "delayed": 108, "delayedPct": 19}
	]
};
