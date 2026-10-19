# keybored.club

Static site for GitHub Pages. Every page is its own URL with full content, so search engines and AI answer engines can read it.

## Pages
- `/` home · `/shop/` · `/onekey/` · `/onekey-pro/`
- `/batch-001/` (campaign landing) · `/waitlist/` (sign-up landing) · `/press/` (press kit)
- `/journal/` + 8 articles · `/preorder/` · `/bag/`
- `sitemap.xml`, `robots.txt`, `llms.txt` (a summary for AI assistants), `CNAME`

## Update the live site
1. In the GitHub repo, delete the old `assets` folder and old `index.html` (keep `CNAME`), then upload everything in this folder.
2. GitHub republishes in about a minute.

## Turn on sign-ups (5 minutes, free)
1. Create a free account at formspree.io and make a new form.
2. Copy its ID (the part after `/f/`, like `xyzabcd`).
3. Open `assets/js/config.js` and replace `YOUR_FORM_ID` with it. Upload that one file.
Every form on the site (waitlist, newsletter, press) then lands in your Formspree inbox, tagged by list. Until then, forms work but only save on the visitor's device.

## Get indexed
1. Google Search Console: add `keybored.club` as a Domain property and verify with the TXT record it gives you (add it in Cloudflare DNS).
2. Submit `https://keybored.club/sitemap.xml`.
3. Bing Webmaster Tools: import from Search Console.

## Edit content
Pages are generated, but you can edit any `index.html` directly. Prices, colors, and ship estimate appear in the product pages, `/preorder/`, and the structured data at the top of each page.
