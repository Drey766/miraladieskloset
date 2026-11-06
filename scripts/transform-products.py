#!/usr/bin/env python3
"""
Transform a Decathlon.co.ke web-scraper export into src/data/products.json.

Usage:
    python3 scripts/transform-products.py path/to/decathlon-export.json

Nothing in here is brand-specific — it only reads the scrape and applies the
field-mapping / category / gender rules. Re-run it whenever you re-scrape.

Sizes are NOT scraped, so every product gets the shop's stated range. To change
the range, edit SIZES below AND `sizeRange` in src/config/brand.ts.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

SIZES = [str(n) for n in range(36, 47)]  # 36–46 (keep in sync with brand.sizeRange)

# The category table is applied top-to-bottom, first match wins.
# Set TRAIL_BEFORE_RUNNING = True if you'd rather have "trail running" models
# land in "Hiking & Trail" instead of "Running Shoes".
TRAIL_BEFORE_RUNNING = False
CATEGORY_RULES = [
    ("running", ["running"]),
    ("skate", ["skateboard", "longboard"]),
    ("court", ["padel", "tennis", "badminton"]),
    ("hiking", ["hiking", "trail"]),
    ("training", ["training", "gym", "fitness"]),
    ("basketball", ["basketball"]),
    ("walking", ["walking"]),
]
if TRAIL_BEFORE_RUNNING:
    CATEGORY_RULES.insert(0, CATEGORY_RULES.pop(3))

COLOUR_WORDS = {
    "black", "white", "grey", "gray", "blue", "green", "pink", "purple", "red", "orange",
    "yellow", "olive", "beige", "coral", "lilac", "cotton", "off-white", "carbon", "smoky",
    "light", "frozen", "brown", "navy", "cream", "and", "&", "colorless",
}
SMALL_WORDS = {"and", "of", "the", "in", "for", "with", "to", "a", "on"}
KEEP_UPPER = {"PS", "SS", "SE", "NBA", "JF", "KS", "TR", "PW", "MT", "II", "III"}

# Hand-tuned display names for titles the automatic cleaner can't make read well.
# Key = product_id from the scrape. Add to this whenever a name looks off.
NAME_OVERRIDES = {
    "8883471": "Kuikma PS Dynamic Padel Shoes",
    "8883532": "Kuikma PS Dynamic Women's Padel Shoes",
    "8891469": "Kuikma PS Comfort Women's Padel Shoes",
    "8916986": "Kiprun KS900 Support Women's Road Running Shoes",
    "8931013": "Kiprun Kipcore Women's Running Shoes",
    "8958687": "Kiprun Kipcore Women's Running Shoes",
    "8914013": "Kiprun Kipcore Women's Running Shoes",
    "8927043": "Kiprun Kipcore Premium Women's Road Running Shoes",
    "8967607": "Kiprun Kipstorm Tempo Women's Road Running Shoes",
    "8913975": "JF190 Grip Women's Running and Trail Shoes",
    "8852094": "Kiprun MT3 Women's Trail Running Shoes",
    "8827187": "Kiprun TR2 Women's Trail Running Shoes",
}


def ws(s):
    return re.sub(r"\s+", " ", s or "").strip()


def parse_money(s):
    m = re.search(r"KES\s*([\d,]+(?:\.\d+)?)", s or "")
    return int(float(m.group(1).replace(",", ""))) if m else None


def parse_int(s):
    m = re.search(r"(\d[\d,]*)", str(s or ""))
    return int(m.group(1).replace(",", "")) if m else 0


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = s.lower().replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def is_colour_suffix(text):
    words = [w for w in re.split(r"[\s/,&-]+", text.lower()) if w]
    return bool(words) and all(w in COLOUR_WORDS for w in words)


def split_colour_suffix(title):
    """'Foo Shoes - Black/White' -> ('Foo Shoes', 'Black/White'); no colour tail -> (title, '')."""
    colour_re = "|".join(sorted((re.escape(c) for c in COLOUR_WORDS if c not in ("and", "&")), key=len, reverse=True))
    title = re.sub(rf"(?<=[a-z])-(?=(?:{colour_re})\b)", " - ", title, flags=re.I)
    words = title.split(" ")
    tail = []
    while len(words) > 1:
        w = words[-1]
        parts = [p for p in re.split(r"[/,&-]+", w.lower()) if p]
        if w in ("-", "&") or (parts and all(p in COLOUR_WORDS or p == "off" for p in parts)):
            tail.insert(0, words.pop())
        else:
            break
    base = " ".join(words).rstrip(" ,-")
    return base, " ".join(tail).strip(" -")


def smart_case(title):
    all_caps = title.upper() == title
    out = []
    for w in title.split(" "):
        letters = re.sub(r"[^A-Za-z]", "", w)
        if not letters or re.search(r"\d", w) or w.upper() in KEEP_UPPER:
            out.append(w)
        elif all_caps:
            out.append(w.capitalize())
        elif w.isupper() and len(letters) >= 5:
            out.append(w.capitalize())
        elif w.islower() and w not in SMALL_WORDS:
            out.append(w[0].upper() + w[1:])
        else:
            out.append(w)
    return " ".join(out)


def tidy_colour(s):
    parts = [p.strip() for p in re.split(r"/", s or "") if p.strip()]
    parts = [p for p in parts if p.lower() != "colorless"]
    return "/".join(p.capitalize() if p.islower() else p for p in parts) or "Multi"


def detect_category(name):
    n = name.lower()
    for slug, words in CATEGORY_RULES:
        if any(w in n for w in words):
            return slug
    return "lifestyle"


def detect_gender(name):
    n = name.lower()
    if re.search(r"\b(kids?|junior)\b", n):
        return "kids"
    has_w = bool(re.search(r"\bwomen(?:'s)?\b", n))
    has_m = bool(re.search(r"\bmen(?:'s)?\b", n))
    if has_w and has_m:
        return "unisex"  # "Men's/Women's ..." is a unisex shoe
    if has_w:
        return "women"
    if has_m:
        return "men"
    return "unisex"


def clean_description(raw, fallback):
    text = ws(raw) or ws(fallback)
    text = re.sub(r"(?<=[a-z\)])\.(?=[A-Z])", ". ", text)
    if len(text) > 400:
        cut = text[:400].rsplit(" ", 1)[0].rstrip(",;:")
        text = cut + "…"
    return text


def main(src):
    raw = json.loads(Path(src).read_text(encoding="utf-8"))
    products = []
    for idx, x in enumerate(raw):
        title = ws(x.get("title") or x.get("data"))
        base, colour_suffix = split_colour_suffix(title)
        pid = str(x.get("product_id"))
        name = NAME_OVERRIDES.get(pid) or smart_case(base)

        price = parse_money(x.get("price")) or 0
        original = parse_money(x.get("price2"))
        pct_match = re.search(r"(\d+)\s*%", x.get("price3") or "")
        discount = int(pct_match.group(1)) if pct_match else None
        if original and original <= price:
            original = None
        if original and not discount:
            discount = round((1 - price / original) * 100)
        if not original:
            discount = None

        images = []
        for url in [x.get("image")] + [x.get(f"image_{n}") for n in range(19, 25)]:
            if url and url not in images:
                images.append(url)

        features = []
        for n in (1, 2, 3):
            t, d = ws(x.get(f"design_benefit_{n}_title")), ws(x.get(f"design_benefit_{n}_description"))
            if t and d:
                features.append({"title": t.lower(), "description": d})

        stock_note = (x.get("data5") or "").strip().lower()
        p = {
            "id": str(idx + 1),
            "name": name,
            "slug": slugify(title),
            "brand": ws(x.get("brand") or x.get("data2")).upper() or "GENERIC",
            "description": clean_description(x.get("description"), x.get("product_description")),
            "price": price,
            **({"original_price": original, "discount_percent": discount} if original else {}),
            "images": images,
            "color": tidy_colour(x.get("color")),
            "sizes": SIZES,
            "category": detect_category(title),
            "gender": detect_gender(title),
            "features": features,
            "sku": pid,
            "is_featured": idx < 8,
            "is_new": idx < 4 or stock_note == "new arrival",
            "is_clearance": "end of line" in stock_note,
            "in_stock": True,
            "rating": float(x.get("ratingValue") or x.get("rating") or 0),
            "review_count": parse_int(x.get("reviewCount")),
            "_suffix": colour_suffix,
        }
        products.append(p)

    # Slugs must be unique.
    seen = {}
    for p in products:
        seen.setdefault(p["slug"], []).append(p)
    for slug, group in seen.items():
        if len(group) > 1:
            for p in group:
                p["slug"] = f"{slug}-{p['sku']}"

    # Display names should be unique too — re-add colour to the ones that collide.
    def dupes():
        counts = {}
        for p in products:
            counts.setdefault(p["name"].lower(), []).append(p)
        return [g for g in counts.values() if len(g) > 1]

    for group in dupes():
        for p in group:
            p["name"] = f'{p["name"]} - {p["color"]}'
    for group in dupes():
        for p in group:
            p["name"] = f'{p["name"]} #{p["sku"][-3:]}'

    for p in products:
        p.pop("_suffix")

    out = Path(__file__).resolve().parent.parent / "src" / "data" / "products.json"
    out.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(products)} products -> {out}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
