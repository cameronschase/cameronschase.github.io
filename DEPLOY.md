# Deployment notes

This folder is what should live at the **root** of your `cameronschase.github.io` repo. The rest of this file is a runbook — delete it (or keep it as a personal reference) before you commit if you don't want it in the repo.

---

## File layout in the repo (after deploy)

```
cameronschase.github.io/
├── index.html            ← new (replaces the old one)
├── photos.html           ← new
├── CNAME                 ← contains your custom domain on a single line
├── Resume.pdf            ← keep your existing one
├── images/
│   ├── favicon.ico       ← keep your existing one
│   ├── deischess.png     ← can remove (no longer referenced)
│   └── blj.jpg           ← can remove (no longer referenced)
└── (everything else from the old template can be deleted)
```

You can safely delete these old folders/files after the swap — the new design is fully self-contained:

- `bootstrap/`
- `css/`
- `fonts/`
- `js/`
- `README.md` (or update it)

---

## One-time deploy steps

### 1. Back up first (one minute, saves you later)

In your local clone:

```bash
git checkout -b old-site-backup
git push -u origin old-site-backup
git checkout main
```

Now if anything goes sideways you can revert.

### 2. Drop in the new files

Copy `index.html`, `photos.html`, and `CNAME` from this folder into the **root** of your local clone of `cameronschase.github.io`.

Open `CNAME` and replace `REPLACE-WITH-YOUR-DOMAIN.com` with your actual domain on a single line — no `https://`, no trailing slash. Examples:

```
cameronchase.com
```

or for a www subdomain:

```
www.cameronchase.com
```

(Pick **one**. The other gets handled by DNS — see below.)

### 3. (Optional) Delete the old template files

```bash
git rm -r bootstrap css fonts js
```

Keep `images/favicon.ico` and `Resume.pdf`.

### 4. Commit + push

```bash
git add .
git commit -m "Redesign: switch to plain HTML/CSS, blue palette, scrapbook gallery"
git push origin main
```

GitHub Pages rebuilds automatically. The new site should be live within ~60 seconds at `https://cameronschase.github.io`.

---

## Wiring up your custom domain

### Step A: Tell GitHub the domain

Go to: **Settings → Pages** in your repo.

1. Under **Custom domain**, enter your domain (e.g. `cameronchase.com`) and click **Save**.
2. Wait until the DNS check passes (can take a few minutes to a few hours after you do step B).
3. Tick **Enforce HTTPS** once it becomes available. If it's greyed out, wait — GitHub needs to issue a Let's Encrypt cert first (usually <24h).

### Step B: Set DNS records at your registrar

You need to tell your DNS provider where to send traffic. There are two scenarios depending on whether your domain is **apex** (`cameronchase.com`) or a **subdomain** (`www.cameronchase.com`).

#### Scenario 1: Apex domain (`cameronchase.com`)

Add these **A records** at the root (`@`):

| Type | Host | Value             |
|------|------|-------------------|
| A    | @    | 185.199.108.153   |
| A    | @    | 185.199.109.153   |
| A    | @    | 185.199.110.153   |
| A    | @    | 185.199.111.153   |

Optionally also add IPv6 (recommended):

| Type | Host | Value                       |
|------|------|-----------------------------|
| AAAA | @    | 2606:50c0:8000::153         |
| AAAA | @    | 2606:50c0:8001::153         |
| AAAA | @    | 2606:50c0:8002::153         |
| AAAA | @    | 2606:50c0:8003::153         |

And add a CNAME so `www.` redirects to apex:

| Type  | Host | Value                          |
|-------|------|--------------------------------|
| CNAME | www  | cameronschase.github.io        |

In your `CNAME` file, put: `cameronchase.com`

#### Scenario 2: www subdomain (`www.cameronchase.com`)

Just one CNAME:

| Type  | Host | Value                          |
|-------|------|--------------------------------|
| CNAME | www  | cameronschase.github.io        |

And typically a redirect from apex → www at your registrar (most provide a "domain forwarding" toggle). In your `CNAME` file, put: `www.cameronchase.com`

---

## Verifying it worked

After the DNS records are saved, run from a terminal:

```bash
dig cameronchase.com +short        # should return the four 185.199.x.153 IPs
dig www.cameronchase.com +short    # should return cameronschase.github.io...
```

DNS propagation usually takes 5–60 minutes, sometimes up to 24 hours.

---

## Common problems and fixes

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "This site can't be reached" | DNS records not saved or wrong | Re-check at your registrar; run `dig` |
| HTTPS warning / "Not secure" | Cert not issued yet, or `Enforce HTTPS` not on | Wait 24h, then toggle in repo Settings → Pages |
| Loads on `www` but not apex (or vice versa) | Missing A records or missing CNAME | Add the missing records from the table above |
| Custom domain keeps unsetting | Missing/deleted `CNAME` file in repo | Make sure `CNAME` (no extension, all caps) exists at repo root and contains your domain |
| 404 on `/photos.html` | Pages still serving old build | Wait 1 min, hard-refresh (Cmd+Shift+R) |

---

## When you have real photos

Open `photos.html` and find the gallery block. Each placeholder looks like:

```html
<figure class="polaroid square" data-cat="chess">
  <div class="ph">photo 01<br>chess club</div>
  <div class="caption">deis chess tourney</div>
  <div class="meta">brandeis · spring '26</div>
</figure>
```

Replace the `<div class="ph">…</div>` with an `<img>`:

```html
<figure class="polaroid square" data-cat="chess">
  <img src="images/photos/chess-tourney-2026.jpg" alt="Chess tournament at Brandeis">
  <div class="caption">deis chess tourney</div>
  <div class="meta">brandeis · spring '26</div>
</figure>
```

Then add this rule to the `<style>` block of `photos.html` (or merge with `.polaroid .ph`):

```css
.polaroid img{
  width:100%;display:block;
  aspect-ratio:1/1;       /* or 3/4 for tall, 4/3 for wide */
  object-fit:cover;
}
```

Aspect ratio classes (`square`, `tall`, `wide`) are already on each figure — keep using them so the masonry layout stays varied.
