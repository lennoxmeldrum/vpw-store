#!/usr/bin/env python3
"""
Builds data/catalog.json from the per-promotion source files in data/source/.

    python3 tools/build_catalog.py

data/catalog.json is the single file the storefront reads. Its shape is the
proposed contract with the manufacturer's order system: when their API is
ready, assets/js/api.js reads from it instead of this file.

Source files hold the real data (promotion, roster, teams, real merch).
Everything marked "sample": true below is generated so every wrestler has a
store to look at. Replace with real designs as they arrive.
"""
import json, glob, hashlib, random, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "source")
OUT = os.path.join(ROOT, "data", "catalog.json")

TODAY = datetime.date(2026, 11, 14)

SIZES = ["S", "M", "L", "XL", "2XL", "3XL"]
BLANKS = {
    "black": {"name": "Black", "hex": "#141414"},
    "white": {"name": "White", "hex": "#f1f0ec"},
    "heather": {"name": "Heather Grey", "hex": "#9a9ca1"},
    "bone": {"name": "Bone", "hex": "#e7dfcf"},
}

# Blank costs and default retail prices (USD). Sample numbers for the mock-up.
TYPES = {
    "tee":      {"label": "Tee", "price": 28, "cost": 9.5, "sizes": SIZES},
    "hoodie":   {"label": "Hoodie", "price": 58, "cost": 21, "sizes": SIZES},
    "tank":     {"label": "Tank", "price": 24, "cost": 8, "sizes": SIZES[:5]},
    "photo":    {"label": "Signed 8x10", "price": 18, "cost": 3, "sizes": None},
    "poster":   {"label": "Poster", "price": 20, "cost": 4, "sizes": None},
    "cap":      {"label": "Cap", "price": 26, "cost": 7, "sizes": None},
    "keychain": {"label": "Keychain", "price": 9, "cost": 2, "sizes": None},
}


def rng_for(*parts):
    h = hashlib.sha256("|".join(parts).encode()).hexdigest()
    return random.Random(int(h[:12], 16))


def variants_for(pid, ptype, colors, fulfilment, options=None):
    r = rng_for(pid, "variants")
    sizes = TYPES[ptype]["sizes"]
    out = []
    color_list = colors or [None]
    size_list = sizes or [None]
    opt_list = options or [None]
    for c in color_list:
        for s in size_list:
            for o in opt_list:
                sku_parts = [pid.upper()]
                if c: sku_parts.append(c["name"][:3].upper())
                if s: sku_parts.append(s)
                if o: sku_parts.append("".join(w[0] for w in o.split()).upper())
                v = {"sku": "-".join(sku_parts).replace(" ", "")}
                if c: v["color"] = c["name"]
                if s: v["size"] = s
                if o: v["option"] = o
                if fulfilment == "stock":
                    roll = r.random()
                    if s in ("3XL", "2XL") and roll < 0.35:
                        v["stock"] = 0
                    elif roll < 0.12:
                        v["stock"] = 0
                    elif roll < 0.3:
                        v["stock"] = r.randint(1, 4)
                    else:
                        v["stock"] = r.randint(6, 40)
                else:
                    v["stock"] = None  # made to order / pre-order: no stock limit
                out.append(v)
    return out


def product(pid, store, promo, talent, title, ptype, design=None, images=None, colors=None,
            fulfilment="made-to-order", price=None, description="", sample=True, options=None,
            created=None, ships_by=None, limited=None):
    t = TYPES[ptype]
    p = {
        "id": pid,
        "store": store,
        "promotion": promo,
        "talent": talent,
        "title": title,
        "type": ptype,
        "price": price if price is not None else t["price"],
        "baseCost": t["cost"],
        "fulfilment": fulfilment,
        "description": description,
        "colors": colors or [],
        "sample": sample,
        "created": (created or TODAY).isoformat(),
    }
    if design: p["design"] = design
    if images: p["images"] = images
    if options: p["options"] = options
    if ships_by: p["shipsBy"] = ships_by
    if limited: p["limited"] = limited
    p["variants"] = variants_for(pid, ptype, p["colors"], fulfilment, options)
    return p


def gen_talent_products(promo, t, teams_by_id):
    """Sample products so every wrestler has a store. Deterministic per wrestler."""
    r = rng_for(promo["id"], t["id"])
    key = f'{promo["id"]}/{t["id"]}'
    base = f'{promo["id"]}-{t["id"]}'
    name = t["name"]
    tag = t.get("nickname") or (t.get("title") or promo["short"])
    out = []
    created = lambda: TODAY - datetime.timedelta(days=r.randint(0, 120))

    # 1. Photo tee: everyone gets one, printed to order.
    out.append(product(
        f"{base}-photo-tee", key, promo["id"], [key], f"{name} Photo Tee", "tee",
        design={"style": "photo"}, colors=[BLANKS["black"], BLANKS["white"]],
        fulfilment="made-to-order", created=created(),
        description=f"Full-colour {name} photo print with name and tagline. Printed when you order."))

    # 2. Champion edition for title holders, otherwise a type-led tee for most.
    if t.get("title"):
        out.append(product(
            f"{base}-champion-tee", key, promo["id"], [key], f"{name} Champion Tee", "tee",
            design={"style": "champion"}, colors=[BLANKS["black"]], fulfilment="preorder",
            price=32, created=TODAY - datetime.timedelta(days=2),
            ships_by=(TODAY + datetime.timedelta(days=26)).isoformat(),
            description=f"Celebrating {name}, {t['title']}. Gold foil-effect print. Pre-order now; ships by the date shown."))
    if r.random() < 0.8:
        out.append(product(
            f"{base}-type-tee", key, promo["id"], [key], f"{name} “{tag}” Tee", "tee",
            design={"style": "type"}, colors=[BLANKS["black"], BLANKS["white"], BLANKS["heather"]],
            fulfilment="made-to-order", created=created(),
            description=f"Big, bold {name} lettering front and back."))

    # 3. Hoodie for some.
    if r.random() < 0.55:
        out.append(product(
            f"{base}-hoodie", key, promo["id"], [key], f"{name} Hoodie", "hoodie",
            design={"style": "photo"}, colors=[BLANKS["black"]],
            fulfilment="stock", created=created(),
            description=f"Heavyweight black hoodie with {name} printed on the chest."))

    # 4. Signed 8x10: stocked, limited.
    if r.random() < 0.7:
        out.append(product(
            f"{base}-signed-8x10", key, promo["id"], [key], f"{name} Signed 8x10", "photo",
            design={"style": "signed"}, fulfilment="stock", created=created(), limited=r.choice([25, 50, 50, 100]),
            description=f"8x10 photo print, hand-signed by {name}. Limited run."))

    # 5. Poster for a few.
    if r.random() < 0.3:
        out.append(product(
            f"{base}-poster", key, promo["id"], [key], f"{name} Poster", "poster",
            design={"style": "poster"}, fulfilment="made-to-order", created=created(),
            description="A3 poster on heavy matte stock. Printed when you order."))
    return out


def gen_team_products(promo, team):
    key = f'{promo["id"]}/{team["id"]}'
    members = [f'{promo["id"]}/{m}' for m in team["members"]]
    return [product(
        f'{promo["id"]}-{team["id"]}-team-tee', key, promo["id"], members, f'{team["name"]} Team Tee', "tee",
        design={"style": "team"}, colors=[BLANKS["black"], BLANKS["white"]], fulfilment="made-to-order",
        created=TODAY - datetime.timedelta(days=9),
        description=f'All of {team["name"]} on one shirt. Printed when you order.')]


def gen_promotion_products(promo, talent_keys, has_real):
    out = []
    pid = promo["id"]
    if not has_real:
        out.append(product(
            f"{pid}-logo-tee", pid, pid, [], f'{promo["short"]} Logo Tee', "tee",
            design={"style": "logo"}, colors=[BLANKS["black"], BLANKS["white"]], fulfilment="made-to-order",
            description=f'The {promo["name"]} logo on a cotton tee.'))
    out.append(product(
        f"{pid}-roster-tee", pid, pid, talent_keys[:12], f'{promo["short"]} Roster Tee', "tee",
        design={"style": "roster"}, colors=[BLANKS["black"]], fulfilment="preorder", price=32,
        ships_by=(TODAY + datetime.timedelta(days=33)).isoformat(),
        created=TODAY - datetime.timedelta(days=1),
        description=f'The whole {promo["short"]} roster on the back, logo on the front. Pre-order: ships by the date shown.'))
    out.append(product(
        f"{pid}-logo-hoodie", pid, pid, [], f'{promo["short"]} Logo Hoodie', "hoodie",
        design={"style": "logo"}, colors=[BLANKS["black"]], fulfilment="stock",
        description=f'Heavyweight hoodie with the {promo["short"]} logo on the chest.'))
    return out


def main():
    promotions, talent, teams, products = [], [], [], []
    files = sorted(glob.glob(os.path.join(SRC, "*.json")))
    # VPW first, then alphabetical.
    files.sort(key=lambda f: (0 if os.path.basename(f) == "vpw.json" else 1, f))
    for f in files:
        src = json.load(open(f, encoding="utf-8"))
        promo = src["promotion"]
        promo.setdefault("order", len(promotions))
        promotions.append(promo)
        tmap = {}
        for t in src.get("talent", []):
            t = dict(t)
            t["promotion"] = promo["id"]
            t["key"] = f'{promo["id"]}/{t["id"]}'
            if t.get("team"):
                t["team"] = f'{promo["id"]}/{t["team"]}'
            talent.append(t)
            tmap[t["id"]] = t
        for tm in src.get("teams", []):
            if len(tm.get("members", [])) < 2:
                continue
            tm = dict(tm)
            tm["promotion"] = promo["id"]
            tm["key"] = f'{promo["id"]}/{tm["id"]}'
            tm["members"] = [f'{promo["id"]}/{m}' for m in tm["members"]]
            teams.append(tm)
        # real products from source
        real = []
        for p in src.get("products", []):
            p = dict(p)
            ptype = p["type"]
            store = p.get("store", promo["id"])
            pr = product(p["id"], store, promo["id"], p.get("talent", []), p["title"], ptype,
                         images=p.get("images"), colors=p.get("colors"), fulfilment=p.get("fulfilment", "stock"),
                         price=p.get("price"), description=p.get("description", ""), sample=False,
                         options=p.get("options"), created=TODAY - datetime.timedelta(days=40))
            if p.get("currency"):
                pr["sourcePrice"] = {"amount": p.get("sourceAmount"), "currency": p["currency"]}
            real.append(pr)
        products.extend(real)
        for t in src.get("talent", []):
            products.extend(gen_talent_products(promo, tmap[t["id"]], {}))
        for tm in src.get("teams", []):
            if len(tm.get("members", [])) >= 2:
                products.extend(gen_team_products(promo, tm))
        products.extend(gen_promotion_products(promo, [t["key"] for t in talent if t["promotion"] == promo["id"]],
                                               has_real=any(p["store"] == promo["id"] for p in real)))

    catalog = {
        "version": "0.1-mockup",
        "generated": TODAY.isoformat(),
        "platform": {
            "name": "HOT TAG",
            "tagline": "Official merch from Southeast Asian wrestling",
            "madeIn": "Ho Chi Minh City, Vietnam",
            "baseCurrency": "USD",
            # Sample display rates (units per 1 USD). Real rates would come from the payment provider.
            "currencies": {
                "USD": {"rate": 1, "symbol": "$"},
                "VND": {"rate": 26300, "symbol": "₫"},
                "SGD": {"rate": 1.31, "symbol": "S$"},
                "MYR": {"rate": 4.42, "symbol": "RM"},
                "PHP": {"rate": 58.5, "symbol": "₱"},
                "THB": {"rate": 34.2, "symbol": "฿"},
                "IDR": {"rate": 16200, "symbol": "Rp"},
                "AUD": {"rate": 1.53, "symbol": "A$"},
                "JPY": {"rate": 152, "symbol": "¥"},
                "EUR": {"rate": 0.93, "symbol": "€"},
                "GBP": {"rate": 0.79, "symbol": "£"},
                "CAD": {"rate": 1.39, "symbol": "C$"},
            },
            # Ships from Vietnam. Sample rates in USD.
            "shipping": [
                {"zone": "domestic", "label": "Vietnam", "countries": ["VN"], "standard": [2.5, "2–4 days"], "express": [5, "1–2 days"]},
                {"zone": "sea", "label": "Southeast Asia", "countries": ["SG", "MY", "TH", "PH", "ID", "KH", "LA", "MM", "BN", "TL"], "standard": [7, "5–10 days"], "express": [15, "2–4 days"]},
                {"zone": "apac", "label": "Asia-Pacific", "countries": ["JP", "KR", "CN", "HK", "TW", "AU", "NZ", "IN"], "standard": [10, "7–14 days"], "express": [22, "3–5 days"]},
                {"zone": "world", "label": "Rest of the world", "countries": ["*"], "standard": [14, "10–20 days"], "express": [32, "4–7 days"]},
            ],
            "revenueShare": {"basis": "profit", "talent": 0.50, "promotion": 0.15, "maker": 0.35, "note": "Sample split of profit (price minus blank, print and payment fees) for the mock-up only."},
        },
        "promotions": promotions,
        "talent": talent,
        "teams": teams,
        "products": products,
    }
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(catalog, fh, ensure_ascii=False, indent=1)
    print(f"{len(promotions)} promotions, {len(talent)} wrestlers, {len(teams)} teams, {len(products)} products -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
