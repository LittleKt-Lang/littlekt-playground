# LittleKt Playground

Browser-based interactive playground for the [LittleKt](https://github.com/LittleKt-Lang/JsKt) programming language.

The interpreter runs entirely in the browser via [jsDelivr CDN](https://cdn.jsdelivr.net/gh/LittleKt-Lang/JsKt@main/src/browser.js) — no build step required.

## Run locally

```bash
npx serve .
# Then open http://localhost:3000
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Connect to Cloudflare Pages
3. Build command: *(none)*
4. Output directory: `.`

## Structure

```
index.html      — HTML skeleton
style.css       — Catppuccin-inspired dark theme
app.js          — UI logic, imports JsKt from CDN
examples.js     — 14 built-in example programs
```
