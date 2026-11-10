#!/usr/bin/env python3
"""Search and answer-engine metadata for casualdata.com.

Run from the repo root after adding or changing a day:  python3 tools/seo.py

It is idempotent. For every published page it rewrites one block in <head>, between
<!-- seo --> and <!-- /seo -->: the canonical link, Open Graph and Twitter tags the page
does not already set by hand, the feed link and JSON-LD structured data. It also writes
the home grid as static HTML (so crawlers that run no JavaScript still find every day),
and the site files sitemap.xml, robots.txt, feed.xml and llms.txt.

Day metadata comes from kit/days.js and each day's own index.html and data.js; archive
metadata from the ARCHIVE table below. Python 3 standard library only.
"""
import html
import json
import os
import re
import subprocess
from datetime import date, datetime, timezone
from email.utils import format_datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://casualdata.com"
NAME = "casualdata"
TAGLINE = "A new data visualization every day."
SITE_DESC = ("casualdata publishes one new interactive data visualization every day: a chart, map or "
             "picture of the day's news and data, each on its own dated page with its sources. "
             "It also keeps casualdata's data visualization art projects from 2007 to 2014.")
ORG_ID = SITE + "/#org"
SITE_ID = SITE + "/#website"
LOGO = SITE + "/img/og/logo.png"

# Archive pages: path -> name, year, share image, parent page, language.
ARCHIVE = {
    "work/index.html": dict(name="Work 2007–2014", kind="collection", img="nk", title="Work 2007–2014 · casualdata"),
    "newsknitter/index.html": dict(name="News Knitter", year="2007", img="nk"),
    "newsknitter/300dpi/index.html": dict(name="News Knitter press images", year="2007", img="nk",
                                          parent="newsknitter/index.html", title="Press images · News Knitter · casualdata"),
    "valuemachine/index.html": dict(name="Value Machine", year="2008", img="vm"),
    "newshaper/index.html": dict(name="Newshaper", year="2009", img="ns"),
    "socialbits/msdcity.html": dict(name="Materializing Social Data in the City", year="2009", img="sb",
                                    parent="socialbits/index.html",
                                    title="Materializing Social Data in the City · Social Bits · casualdata",
                                    desc="Materializing Social Data in the City: the Social Bits exhibition at AMBER 2009 in Istanbul, "
                                         "on urban information interfaces and artistic output of social data in the city."),
    "socialbits/index.html": dict(name="Social Bits", year="2010", img="sb"),
    "senseofpatterns/index.html": dict(name="Sense of Patterns", year="2011", img="sop"),
    "extra/referandum2010/index.html": dict(name="12 Eylül 2010 Referandum Sonuçları", year="2010", img="ref2010", lang="tr"),
    # Unlinked extras: indexed, but not listed on /work/.
    "extra/secim2011/googlegeo.html": dict(name="2011 Seçim — AKP", year="2011", img=None, lang="tr"),
    "extra/tbmmtweets/index.html": dict(name="TBMM 24. Dönem 3. Yasama Yılı Oturum Süreleri", year="2013", img=None, lang="tr"),
}
WORKS = ["newsknitter/index.html", "valuemachine/index.html", "newshaper/index.html",
         "socialbits/index.html", "senseofpatterns/index.html", "extra/referandum2010/index.html"]
NOINDEX = ["404.html"]

ORG = {
    "@type": "Organization", "@id": ORG_ID, "name": NAME, "alternateName": "{casualdata}",
    "url": SITE + "/", "logo": {"@type": "ImageObject", "url": LOGO, "width": 512, "height": 512},
    "foundingDate": "2005", "description": SITE_DESC,
    "founder": {"@type": "Person", "name": "Mahir Yavuz"},
    "knowsAbout": ["data visualization", "information design", "data journalism", "generative art"],
}


def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()


def write(p, s):
    path = os.path.join(ROOT, p)
    old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
    if old != s:
        with open(path, "w", encoding="utf-8") as f:
            f.write(s)
        print("wrote", p)


def url_of(p):
    p = p[:-len("index.html")] if p.endswith("index.html") else p
    return SITE + "/" + p


def lastmod(p):
    """Date of the last commit to a page, or today if it has uncommitted changes."""
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", p], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        if dirty:
            return date.today().isoformat()
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", p], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        return d or date.today().isoformat()
    except OSError:
        return date.today().isoformat()


def meta(page, attr, key):
    m = re.search(r'<meta\s+%s="%s"\s+content="([^"]*)"' % (attr, re.escape(key)), page)
    return html.unescape(m.group(1)) if m else None


def strip_block(page):
    return re.sub(r"\n?[ \t]*<!-- seo -->.*?<!-- /seo -->", "", page, flags=re.S)


def esc(s):
    return html.escape(s, quote=False).replace('"', "&quot;")


def days():
    src = read("kit/days.js")
    out = []
    for block in re.findall(r"\{(.*?)\}", src, flags=re.S):
        d = dict(re.findall(r'(\w+):\s*"((?:[^"\\]|\\.)*)"', block))
        d["draft"] = bool(re.search(r"draft:\s*true", block))
        if "date" in d:
            out.append(d)
    return out


def human_date(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%B')} {d.year}"


def day_info(d):
    p = d["date"] + "/index.html"
    page = read(p)
    data = read(d["date"] + "/data.js") if os.path.exists(os.path.join(ROOT, d["date"], "data.js")) else ""
    src = re.search(r'data-source="([^"]*)"', page)
    urls = []
    for u in re.findall(r'https?://[^\s"\'<>)\],]+', data):
        u = u.rstrip(".;")
        if u not in urls:
            urls.append(u)
    return dict(
        path=p, url=url_of(p), date=d["date"], title=d["title"], dek=d.get("dek", ""), draft=d["draft"],
        desc=meta(page, "name", "description") or d.get("dek", ""),
        source=html.unescape(src.group(1)) if src else "",
        sources=urls[:20], has_data=bool(data), image=f"{SITE}/{d['date']}/card.png",
        alt=meta(page, "property", "og:image:alt") or d["title"],
    )


def tags(page, url, title, desc, image, alt, otype, lang="en", extra_ld=(), robots=None, feed=True):
    """The <head> block. Skips any tag the page already sets by hand outside the block."""
    page = strip_block(page)
    have = lambda attr, key: meta(page, attr, key) is not None
    t = []
    if robots:
        t.append(f'<meta name="robots" content="{robots}">')
    if not re.search(r'<link rel="canonical"', page):
        t.append(f'<link rel="canonical" href="{url}">')
    if feed:
        t.append(f'<link rel="alternate" type="application/rss+xml" title="casualdata daily" href="{SITE}/feed.xml">')
    if not have("name", "description") and desc:
        t.append(f'<meta name="description" content="{esc(desc)}">')
    og = [("og:site_name", NAME), ("og:locale", "tr_TR" if lang == "tr" else "en_US"), ("og:type", otype),
          ("og:title", title), ("og:description", desc), ("og:url", url)]
    if image:
        og += [("og:image", image), ("og:image:width", "1200"), ("og:image:height", "630"), ("og:image:alt", alt)]
    for k, v in og:
        if v and not have("property", k):
            t.append(f'<meta property="{k}" content="{esc(v)}">')
    tw = [("twitter:card", "summary_large_image" if image else "summary"), ("twitter:title", title),
          ("twitter:description", desc)]
    if image:
        tw += [("twitter:image", image), ("twitter:image:alt", alt)]
    for k, v in tw:
        if v and not have("name", k):
            t.append(f'<meta name="{k}" content="{esc(v)}">')
    if extra_ld:
        graph = {"@context": "https://schema.org", "@graph": list(extra_ld)}
        js = json.dumps(graph, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
        t.append('<script type="application/ld+json">\n' + js + "\n</script>")
    return t


def put_block(page, lines):
    page = strip_block(page)
    indent = "  "
    block = "\n".join([indent + "<!-- seo -->"] + [indent + l for l in lines] + [indent + "<!-- /seo -->"])
    return page.replace("</head>", block + "\n</head>", 1)


def set_title(page, title):
    return re.sub(r"<title>.*?</title>", f"<title>{esc(title)}</title>", page, count=1, flags=re.S)


def crumbs(*items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}


WEBSITE = {"@type": "WebSite", "@id": SITE_ID, "url": SITE + "/", "name": NAME,
           "description": SITE_DESC, "inLanguage": "en", "publisher": {"@id": ORG_ID}}


def do_day(info, prev_next):
    page = read(info["path"])
    pub = info["date"] + "T07:00:00Z"
    article = {
        "@type": "Article", "@id": info["url"] + "#article", "url": info["url"], "mainEntityOfPage": info["url"],
        "headline": info["title"], "alternativeHeadline": info["dek"], "description": info["desc"],
        "datePublished": pub, "dateModified": lastmod(info["path"]) if lastmod(info["path"]) > info["date"] else pub,
        "image": {"@type": "ImageObject", "url": info["image"], "width": 1200, "height": 630, "caption": info["alt"]},
        "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID}, "isPartOf": {"@id": SITE_ID},
        "inLanguage": "en", "genre": "data visualization", "isAccessibleForFree": True,
        "keywords": ["data visualization", "interactive chart", "casualdata daily"],
        "about": {"@id": info["url"] + "#data"},
    }
    dataset = {
        "@type": "Dataset", "@id": info["url"] + "#data", "url": info["url"],
        "name": f"{info['title']} (data, {human_date(info['date'])})",
        "description": f"The data behind the casualdata visualization of {human_date(info['date'])}: {info['desc']}"
                       + (f" Source: {info['source']}." if info["source"] else ""),
        "creator": {"@id": ORG_ID}, "datePublished": info["date"], "isAccessibleForFree": True,
    }
    if info["has_data"]:
        dataset["distribution"] = {"@type": "DataDownload", "encodingFormat": "text/javascript",
                                   "contentUrl": f"{SITE}/{info['date']}/data.js"}
    if info["sources"]:
        dataset["isBasedOn"] = info["sources"]
    if info["source"]:
        dataset["citation"] = info["source"]
    ld = [ORG, WEBSITE, article, dataset,
          crumbs(("casualdata", SITE + "/"), (f"{human_date(info['date'])}: {info['title']}", info["url"]))]
    lines = tags(page, info["url"], info["title"], info["desc"], info["image"], info["alt"], "article",
                 extra_ld=ld, robots="noindex" if info["draft"] else None)
    lines.insert(0, f'<meta property="article:published_time" content="{pub}">')
    prev, nxt = prev_next
    if prev:
        lines.append(f'<link rel="prev" href="{prev}">')
    if nxt:
        lines.append(f'<link rel="next" href="{nxt}">')
    write(info["path"], put_block(page, lines))


def tile(d, i):
    sizes = "(max-width: 960px) 100vw, 66vw" if i == 0 else \
        "(max-width: 600px) 100vw, (max-width: 960px) 50vw, (max-width: 1200px) 33vw, 25vw"
    # Lazy on purpose: the page script replaces this grid before layout, so with JavaScript these
    # images are never fetched; crawlers and readers without JavaScript still get them.
    load = 'loading="lazy"'
    p = f"/{d['date']}/"
    when = date.fromisoformat(d["date"])
    label = f"{when.strftime('%a')} {when.day} {when.strftime('%b')} {when.year}"
    lead = '<i class="dot" aria-hidden="true"></i>Latest · ' if i == 0 else ""
    dek = f'\n      <span class="dek">{esc(d["dek"])}</span>' if i == 0 and d.get("dek") else ""
    return (f'    <li class="tile{" lead" if i == 0 else ""}"><a href="{p}">\n'
            f'      <img srcset="{p}thumb.webp 720w, {p}thumb-1200.webp 1200w" sizes="{sizes}" src="{p}thumb.webp" '
            f'width="1200" height="630" alt="" {load}>\n'
            f'      <span class="cd-meta">{lead}<time datetime="{d["date"]}">{label}</time></span>\n'
            f'      <span class="t">{esc(d["title"])}</span>{dek}\n'
            f'    </a></li>')


def do_home(pub):
    p = "index.html"
    page = read(p)
    latest = pub[-1] if pub else None
    newest = list(reversed(pub))
    # Static grid, replaced by the page script when JavaScript runs.
    grid = "\n".join(tile(d, i) for i, d in enumerate(newest))
    page = re.sub(r'(<ol class="cd-days" id="days" role="list">).*?(</ol>)', lambda m: m.group(1) + "\n" + grid + "\n  " + m.group(2),
                  page, count=1, flags=re.S)
    page = set_title(page, "casualdata · a new data visualization every day")
    page = re.sub(r'<meta name="description" content="[^"]*">',
                  f'<meta name="description" content="{esc(SITE_DESC)}">', page, count=1)
    items = {"@type": "ItemList", "@id": SITE + "/#days", "name": "casualdata daily: every day so far",
             "itemListOrder": "https://schema.org/ItemListOrderDescending", "numberOfItems": len(newest),
             "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": d["url"], "name": d["title"]}
                                 for i, d in enumerate(newest)]}
    home = {"@type": "CollectionPage", "@id": SITE + "/#page", "url": SITE + "/", "name": "casualdata daily",
            "headline": TAGLINE, "description": SITE_DESC, "isPartOf": {"@id": SITE_ID}, "about": "data visualization",
            "publisher": {"@id": ORG_ID}, "mainEntity": {"@id": SITE + "/#days"}, "inLanguage": "en",
            "hasPart": {"@id": SITE + "/work/"}}
    img = latest["image"] if latest else LOGO
    alt = f"The latest casualdata visualization: {latest['title']}" if latest else NAME
    lines = tags(page, SITE + "/", "casualdata · a new data visualization every day", SITE_DESC, img, alt, "website",
                 extra_ld=[ORG, WEBSITE, home, items])
    write(p, put_block(page, lines))


def do_archive(p, a):
    page = read(p)
    lang = a.get("lang", "en")
    title = a.get("title") or a["name"] + " · casualdata"
    if not a.get("lang") == "tr":  # the Turkish article keeps its own title
        page = set_title(page, title)
    else:
        title = re.search(r"<title>(.*?)</title>", page, flags=re.S).group(1)
        title = html.unescape(title).replace(" | { casualdata }", " · casualdata").replace(" | ", " · ")
        page = set_title(page, title)
    if a.get("desc"):
        page = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(a["desc"])}">', page, count=1)
    desc = meta(page, "name", "description") or ""
    url = url_of(p)
    image = f"{SITE}/img/og/{a['img']}.jpg" if a.get("img") else None
    trail = [("casualdata", SITE + "/"), ("Work 2007–2014", SITE + "/work/")]
    if a.get("parent"):
        trail.append((ARCHIVE[a["parent"]]["name"], url_of(a["parent"])))
    if a.get("kind") == "collection":
        node = {"@type": "CollectionPage", "@id": url + "#page", "url": url, "name": "casualdata work, 2007–2014",
                "description": desc, "isPartOf": {"@id": SITE_ID}, "publisher": {"@id": ORG_ID}, "inLanguage": "en",
                "mainEntity": {"@type": "ItemList", "itemListElement": [
                    {"@type": "ListItem", "position": i + 1, "url": url_of(w), "name": ARCHIVE[w]["name"]}
                    for i, w in enumerate(WORKS)]}}
        trail = trail[:1] + [("Work 2007–2014", url)]
    else:
        trail.append((a["name"], url))
        node = {"@type": "Article" if lang == "tr" else "CreativeWork", "@id": url + "#work", "url": url,
                "name": a["name"], "headline": a["name"], "description": desc, "dateCreated": a["year"],
                "datePublished": a["year"], "genre": "data visualization", "inLanguage": lang,
                **({"image": image} if image else {}), "creator": [{"@id": ORG_ID}, {"@type": "Person", "name": "Mahir Yavuz"}],
                "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID}, "isPartOf": {"@id": SITE + "/work/"}}
    lines = tags(page, url, title.replace(" · casualdata", ""), desc, image, a["name"],
                 "website" if a.get("kind") else "article", lang=lang,
                 extra_ld=[ORG, node, crumbs(*trail)], feed=False)
    write(p, put_block(page, lines))


def do_noindex(p):
    page = read(p)
    write(p, put_block(page, ['<meta name="robots" content="noindex">']))


def do_sitemap(pub):
    urls = [(SITE + "/", lastmod("index.html"), "daily", "1.0")]
    for d in reversed(pub):
        urls.append((d["url"], lastmod(d["path"]), "monthly", "0.8"))
    for p in ARCHIVE:
        urls.append((url_of(p), lastmod(p), "yearly", "0.5"))
    body = "\n".join(f"  <url><loc>{u}</loc><lastmod>{m}</lastmod><changefreq>{c}</changefreq><priority>{pr}</priority></url>"
                     for u, m, c, pr in urls)
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n")


def do_robots():
    write("robots.txt", f"""# casualdata.com: one data visualization a day. Every page is open to search and answer engines.
User-agent: *
Allow: /
Disallow: /next/

# AI search and answer engines are welcome; each day's sources and data are on its page.
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Allow: /

Sitemap: {SITE}/sitemap.xml
""")


def do_feed(pub):
    now = format_datetime(datetime.fromisoformat(pub[-1]["date"] + "T07:00:00+00:00")) if pub else ""
    items = []
    for d in reversed(pub):
        when = format_datetime(datetime.fromisoformat(d["date"] + "T07:00:00+00:00"))
        items.append(f"""  <item>
    <title>{esc(d['title'])}</title>
    <link>{d['url']}</link>
    <guid isPermaLink="true">{d['url']}</guid>
    <pubDate>{when}</pubDate>
    <description>{esc(d['desc'])}</description>
    <enclosure url="{d['image']}" type="image/png" length="0"/>
  </item>""")
    write("feed.xml", f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>casualdata daily</title>
  <link>{SITE}/</link>
  <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>{esc(SITE_DESC)}</description>
  <language>en</language>
  <lastBuildDate>{now}</lastBuildDate>
  <image><url>{LOGO}</url><title>casualdata daily</title><link>{SITE}/</link></image>
{chr(10).join(items)}
</channel>
</rss>
""")


def do_llms(pub):
    lines = ["# casualdata", "",
             "> casualdata daily publishes one new interactive data visualization every day, each on its own "
             "dated page at casualdata.com/YYYY-MM-DD/ with its data frozen in the page and its sources named. "
             "casualdata has made data visualization from everyday (\"casual\") data since 2005; its 2007–2014 "
             "art projects are kept at casualdata.com/work/.", "",
             "Made by Mahir Yavuz. Each day states one finding in its title; the description below it says what the "
             "chart shows. The numbers behind each day are in that day's data.js, with sources and timestamps.", "",
             "## Daily visualizations (newest first)", ""]
    for d in reversed(pub):
        src = f" Source: {d['source']}." if d["source"] else ""
        lines.append(f"- [{d['title']}]({d['url']}) ({human_date(d['date'])}): {d['desc']}{src}" + (f" Data: {SITE}/{d['date']}/data.js" if d["has_data"] else ""))
    lines += ["", "## Work 2007–2014", ""]
    for p in WORKS:
        a = ARCHIVE[p]
        desc = meta(read(p), "name", "description") or ""
        lines.append(f"- [{a['name']}]({url_of(p)}) ({a['year']}): {desc}")
    lines += ["", "## Optional", "",
              f"- [RSS feed of every day]({SITE}/feed.xml)",
              f"- [Sitemap]({SITE}/sitemap.xml)", ""]
    write("llms.txt", "\n".join(lines))


def main():
    all_days = [day_info(d) for d in days()]
    pub = [d for d in all_days if not d["draft"]]
    for d in all_days:
        seq = pub if not d["draft"] else all_days
        i = next((k for k, x in enumerate(seq) if x["date"] == d["date"]), None)
        prev = seq[i - 1]["url"] if i else None
        nxt = seq[i + 1]["url"] if i is not None and i + 1 < len(seq) else None
        do_day(d, (prev, nxt))
    do_home(pub)
    for p, a in ARCHIVE.items():
        do_archive(p, a)
    for p in NOINDEX:
        do_noindex(p)
    do_sitemap(pub)
    do_robots()
    do_feed(pub)
    do_llms(pub)


if __name__ == "__main__":
    main()
