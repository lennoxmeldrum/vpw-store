# HOT TAG: Southeast Asian wrestling merch (prototype)

A clickable mock-up of a "one stop" merch store for wrestlers and promotions across Southeast Asia. It's for pitching to the manufacturer, so they can see the customer experience and where their order system plugs in.

**HOT TAG is a working name.** Change it in one place: `platform.name` in `tools/build_catalog.py`.

Everything is sample data: designs, prices, stock, orders and payouts. No payments are taken. The page is marked `noindex`.

## Run it

It's a static site with no build step. It needs a web server, because it loads `data/catalog.json`:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

It can be hosted on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages), the same way as vietslam.com. All links are hash routes (`#/p/vpw/ares`), so no rewrite rules are needed.

## What's in it

| Page | Route | Notes |
|---|---|---|
| Home | `#/` | Neutral platform look: promotions, champions, new drops, wrestler finder |
| Promotions | `#/promotions` | One tile per promotion, tinted with its colours |
| Wrestlers | `#/wrestlers` | Every wrestler, filter by promotion or champions |
| Shop | `#/shop` | All products, filter by promotion, type and availability |
| Promotion | `#/p/vpw` | Promotion colours and logo. Champions, roster (VPW roster-card style), teams, merch |
| Wrestler store | `#/p/vpw/da-butcherman` | One store per wrestler, plus tag teams and stables (`#/p/vpw/venomshank`) |
| Product | `#/product/<id>` | Gallery, colour, size and stock, how it's made, shipping quote by country, revenue split |
| Bags | drawer | **One bag per store**; each checks out separately |
| Checkout | `#/checkout/<store>` | Demo. Shipping by zone; payment options change with country (MoMo, GCash, PayNow…) |
| Order | `#/order/<id>`, `#/orders` | Confirmation, status timeline, order lookup |
| Store manager | `#/studio/<promo>/<wrestler>/<tab>` | The wrestler's view: sales, payouts, products (edit price, hide), submit a design with live preview, store settings |
| How it connects | `#/platform` | For the manufacturer: what the storefront needs from their system |
| Help | `#/help` | Shipping zones, returns, size guide |

Other features:
- **Currency:** prices are shown in 12 currencies (sample rates in the catalogue).
- **Language:** English and Vietnamese interface (`assets/js/i18n.js`).

## How it's organised

```
index.html                 page shell
assets/css/site.css        design tokens + components (neutral shell; promotion pages override --brand/--accent/--frame)
assets/js/api.js           THE integration seam: every read/write goes through here
assets/js/app.js           router + pages
assets/js/art.js           draws sample products (tee/hoodie/8x10/poster) from a wrestler's photo + promotion colours
assets/js/i18n.js          EN / VI interface strings
data/source/<promo>.json   real data per promotion: info, theme colours, roster, teams, real merch
data/catalog.json          generated; the single file the site reads (the proposed data contract)
tools/build_catalog.py     builds catalog.json from data/source/, adding sample products for every wrestler
```

### Connecting a real order system

`assets/js/api.js` is the only file that knows where data comes from. Each function has the suggested endpoint written next to it (`GET /products`, `GET /stock`, `POST /checkout` returning a hosted payment page, `GET /stores/:key/stats`, `POST /stores/:key/designs`, and so on). Replace their bodies with calls to the manufacturer's system and the pages stay the same. The `#/platform` page shows the same map with notes.

### Adding or updating a promotion

1. Put its logo, photos and merch photos under `assets/img/...`.
2. Create or edit `data/source/<id>.json`. Use `data/source/vpw.json` as the template. Theme colours are two hex values: `primary` and `accent`.
3. Run `python3 tools/build_catalog.py`.

Products listed in a source file are real and use their photos. Everything else is generated as `"sample": true`. When real designs arrive, add them to the source file and remove the generated ones (see `gen_talent_products`).

### Wrestlers in more than one promotion

A wrestler has one store, under their home promotion, and can also appear on other rosters. For example, Da Butcherman's store is under VPW and he is also listed on SPW's roster.

To add a wrestler to another promotion's roster, put `{"ref": "vpw/da-butcherman"}` in that promotion's `talent` list. Teams can mix promotions too: write the member as `promo/id`, as with `vpw/miles-karu` in MYPW's The Juicy Boyz.

### Sources

| Promotion | Roster and photos | Notes |
|---|---|---|
| VPW (Vietnam) | vietnamprowrestling.com roster | Real merch photos from VPW's shop page |
| SPW (Singapore) | Official site, Wikimedia Commons, official SETUP match graphic | Gold logo from the official site |
| Grapplemax (Singapore) | Official roster portraits | |
| MYPW (Malaysia) | Official video stills, cropped; one SETUP match graphic | Logo keyed out of the official avatar |
| SETUP (Thailand) | Official match graphics, each cropped to the named wrestler; Wikimedia | Monogram logo from the official avatar |
| FPW (Philippines) | Official roster portraits | Logo from Wikimedia Commons, turned white for the dark site |

All data was checked in November 2026. Promotion logos are used with the promotions' approval. Wrestler names and photos belong to their owners.

Left out until better photos arrive: wrestlers with no solo photo (Carlo Cannon, Emman Azman, Ma$on, Ms. Selina, Alexis Lee, Jack Alexander) and FPW champion Cali Nueva, whose roster slot is still a placeholder. Title holders change often, so check champions before a demo.
