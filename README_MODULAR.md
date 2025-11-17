# Cognify Intern — Modular Frontend (no build)

Files:
- index.html — shell, loads fragments
- fragments/*.html — header, hero, topics, feedback, modal, footer
- styles.css — all styles (tokens at top)
- scripts.js — loader + interactive behaviors

How to run:
1. Put all files in the same folder (create `fragments/` and save fragment files inside it).
2. Use VS Code Live Server (recommended) or any static server (python -m http.server) and open `index.html`.
3. Edit fragments individually — changes will reflect on reload.

How to merge back to single-file:
- Use the browser devtools to view page source after fragments are loaded, or
- Concatenate fragments into `index.html` by copying fragment contents into placeholders, and inlining CSS/JS.
- For production, minify `styles.css` and `scripts.js` with any minifier.

Notes:
- `fetch` requires file served over http(s). Use Live Server or a static server.
- To disable fragment loading and use a single HTML file, copy fragment HTML into `index.html` directly.
