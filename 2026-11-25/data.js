// 2026-11-25 — women and girls murdered in 2025, one dot for every 100: the 47,000 killed by a partner
// or a relative, by region (count / 100: 221 + 151 + 74 + 21 + 3 = 470 dots), and the 31,000 killed by
// someone else (allWomen - World count = 78,000 - 47,000, both rounded in the brief; 310 dots), 780 in
// all. Redrawn on 25 Nov 2026 from shares to counts (the first version was two 100-dot squares).
// Source: UNODC and UN Women, "Femicides in 2025: Global estimates of intimate partner/family member
//   femicides" (research brief, published 24 Nov 2026),
//   https://www.unodc.org/documents/data-and-analysis/briefs/Femicide_Brief_2026.pdf
//   fetched 25 Nov 2026 02:36 UTC. All figures are UNODC estimates for 2025, printed in the brief:
//   women / men = per cent of female / male victims of intentional homicide killed by an intimate
//     partner (current or former) or another family member, from the chart "Proportion of male and
//     female intentional homicide victims killed by intimate partner or other family member" (p. 13);
//   count, low, high = women and girls killed by a partner or family member, with the brief's
//     uncertainty band (p. 7); rate = the same per 100,000 women and girls (p. 1, 8);
//   partner = per cent of those victims killed by a current or former intimate partner, Americas and
//     Europe only (p. 1 gives them for 2025; p. 8 says they rest on data for 2010–2025);
//     no such figure for Africa, Asia or Oceania.
//   allWomen = women and girls intentionally killed worldwide in 2025; perDay = count / 365 (p. 1).
//   menOfAll / womenOfAll = per cent of all homicide victims in 2025 who were men / women (p. 13).
// Second check: UN News, https://news.un.org/en/story/2026/11/1168863 (47,000; 60 per cent of 78,000).
// Made by make_data.py.
window.FEMICIDE = {
 "year": 2025,
 "allWomen": 78000,
 "perDay": 129,
 "menOfAll": 81,
 "womenOfAll": 19,
 "rows": [
  {
   "slug": "world",
   "name": "World",
   "women": 60,
   "men": 11,
   "count": 47000,
   "low": 37100,
   "high": 56700,
   "rate": 1.1
  },
  {
   "slug": "africa",
   "name": "Africa",
   "women": 75,
   "men": 8,
   "count": 22100,
   "low": 15200,
   "high": 29000,
   "rate": 2.9
  },
  {
   "slug": "oceania",
   "name": "Oceania",
   "women": 57,
   "men": 21,
   "count": 300,
   "low": 200,
   "high": 400,
   "rate": 1.1
  },
  {
   "slug": "asia",
   "name": "Asia",
   "women": 54,
   "men": 15,
   "count": 15100,
   "low": 12500,
   "high": 17600,
   "rate": 0.6
  },
  {
   "slug": "europe",
   "name": "Europe",
   "women": 51,
   "men": 11,
   "count": 2100,
   "low": 2000,
   "high": 2200,
   "rate": 0.5,
   "partner": 63
  },
  {
   "slug": "americas",
   "name": "Americas",
   "women": 48,
   "men": 13,
   "count": 7400,
   "low": 7300,
   "high": 7600,
   "rate": 1.4,
   "partner": 70
  }
 ]
};
