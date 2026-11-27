#!/bin/sh
# The hearts each day has had, newest first: hearts = likes - likes taken back. Needs a wrangler
# login to the casualdata Cloudflare account (once on this Mac: npx wrangler@4.168.0 login).
cd "$(dirname "$0")" && npx --yes wrangler@4.168.0 d1 execute casualdata-hearts --remote --json \
  --command "SELECT day, likes - unlikes AS hearts, likes, unlikes FROM hearts ORDER BY day DESC" 2>/dev/null |
python3 -c '
import json, sys
rows = json.load(sys.stdin)[0]["results"]
if not rows: print("No hearts yet.")
for r in rows:
    back = ", %d taken back" % r["unlikes"] if r["unlikes"] else ""
    print("%s  %3d hearts  (%d likes%s)" % (r["day"], r["hearts"], r["likes"], back))
'
