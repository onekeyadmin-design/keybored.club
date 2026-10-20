# keybored.club

Static site for GitHub Pages: 17 pages, each with its own URL, plus a pre-order bag and a not-found page.

## Upload (do this on a computer, not a phone)
Phones and Safari quietly drop folders when uploading to GitHub. That's what broke the last upload.

1. Unzip this file. Open the `keybored.club` folder.
2. In Chrome or Edge, open the repo on GitHub and click **Add file → Upload files**.
3. Select everything *inside* the folder (folders included) and drag it onto the page. Commit.
4. **Check it worked:** the repo's main page should list these folders:
   `assets`, `bag`, `batch-001`, `journal`, `onekey`, `onekey-pro`, `preorder`, `press`, `shop`, `waitlist`.
   Open `assets` → `js` and you should see `site.js` and `config.js`. If any folder is missing, drag that folder in again.
5. Wait about a minute, then open keybored.club/shop/ on your phone. If it loads, you're live.

Tip: if the `.nojekyll` file doesn't show up after uploading (hidden files sometimes get skipped), click **Add file → Create new file**, name it `.nojekyll`, type anything, and commit.

## Optional cleanup: old leftover files
An earlier upload put copies of these at the top level of the repo. The new site doesn't use them. They're harmless, but you can delete each one (open the file → ⋯ → Delete file):
`app.js`, `intro.js`, `shopviewer.js`, `studio.js`, `site.css`, `catalog.json`, `models.json`,
`OrbitControls.js`, `three.min.js`, `SpaceGrotesk.ttf`, `kb.png`, `nested.png`, `screw.png`, `solid.png`, `stack.png`, `lineup.jpg`, `og.jpg`
(Only the ones at the top level. Keep everything inside `assets/`.)
Also safe to delete: `assets/shop/catalog.json`, `assets/shop/img/kb.png`, `screw.png`, `stack.png`.

## Sign-ups with Airtable (about 10 minutes)
1. In Airtable, create a base called **Key Bored** with a table called **Signups** and these fields:
   `Email` (Email), `List` (Single line text), `Page` (Single line text), `Notes` (Long text, optional).
2. Add a **Form** view. Put `Email`, `List`, `Page`, and `Notes` on it, and make `Email` required.
3. Click **Share form**, turn sharing on, and copy the link (`https://airtable.com/appXXXX/shrYYYY/form`).
4. Open `assets/js/config.js`, replace `PASTE_YOUR_AIRTABLE_FORM_LINK` with that link, and upload that one file.

Every sign-up box then shows your Airtable form, with `List` (waitlist, newsletter, or press) and `Page` filled in and hidden.
Until the link is in, the boxes still work but only save on the visitor's own device.

## Google Search Console (once)
1. search.google.com/search-console → **Add property** → **Domain** → `keybored.club`.
2. Copy the `google-site-verification=` TXT code. In Cloudflare: **DNS → Records → Add record**, type **TXT**, name `@`, paste it, save.
3. Click **Verify**, then **Sitemaps** → enter `sitemap.xml` → **Submit**.
4. Bing: bing.com/webmasters → **Import from Google Search Console**.

## Pages
`/` · `/shop/` · `/onekey/` · `/onekey-pro/` · `/batch-001/` · `/waitlist/` · `/press/` · `/journal/` + 8 Shop Notes articles · `/preorder/` · `/bag/`
Plus `sitemap.xml`, `robots.txt`, `llms.txt`, `CNAME`, `.nojekyll`, `404.html`.
