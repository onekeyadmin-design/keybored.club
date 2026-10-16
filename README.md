# keybored.club

The public Key Bored website. Static files only, hosted on GitHub Pages.

## Go live (one time)

1. **Create the repo.** On GitHub: New repository, name it `keybored.club`, set it to **Public** (GitHub Pages needs a public repo on the free plan). Click **uploading an existing file**, drag in everything from this folder, and commit.
2. **Turn on Pages.** Repo **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
3. **Add the domain first.** Still in **Settings → Pages**, under *Custom domain*, type `keybored.club` and Save. (The `CNAME` file in this repo also sets it.)
4. **Point the domain at GitHub.** At your domain registrar's DNS settings, add:

   | Type | Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | YOUR-GITHUB-USERNAME.github.io |

   Optional IPv6: AAAA records for @ pointing to 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153.
   Delete any old A or CNAME records for @ and www (for example, ones pointing at Netlify or a parking page).
5. **Turn on HTTPS.** After DNS updates (minutes to a few hours), go back to **Settings → Pages** and check **Enforce HTTPS**.
6. **Verify the domain** (protects it from takeover): your GitHub profile **Settings → Pages → Add a domain**, then add the TXT record GitHub shows you at your registrar.

## Updating the site

Edit or upload files in the repo. GitHub republishes automatically in about a minute.

- Products, prices, copy, and the ship estimate: `assets/shop/catalog.json`
- Product photos: `assets/shop/img/`
- Styles: `assets/css/site.css`
- Pages: `assets/js/app.js`

## What's here

- `index.html`: the site (home, shop, product pages, pre-order bag, pre-order info)
- `CNAME`: the custom domain
- `.nojekyll`: tells GitHub to serve the files as-is
- `robots.txt`, `sitemap.xml`, `favicon.svg`, `404.html`

Checkout is not live: the bag saves on the visitor's device and "Place pre-order" explains that pre-orders open soon.
