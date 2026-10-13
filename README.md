# Igor de Melo's Portfolio

[igor-de-melo.github.io](https://igor-de-melo.github.io/)

Trilingual personal website (Brazilian Portuguese, English and French) of Igor Augusto de Melo, an Aeronautical Engineering student at EESC-USP, with three tracks: aeronautical engineering, data science, and IT and cybersecurity.

## Pages

| Route | Content |
|---|---|
| `/` | Landing page: introduction and a way into each area |
| `/aero/` | Aeronautical Engineering. Simulation: flow around a Joukowski airfoil |
| `/data/` | Data Science. Simulation: Q-learning in a maze |
| `/it-security/` | IT and Cybersecurity (under construction, hidden from search engines). Simulation: malware spread (SIR model) |

## How the site is built

- **Static, no runtime dependencies.** Plain HTML, CSS and JavaScript hosted on GitHub Pages. All paths are relative, so the site also opens through `file://` or a local server.
- **Three languages.** Every piece of content exists in PT-BR, EN and FR, and the language is switched on the page itself.
- **Two views.** *Themed* (each area has its own palette, typography and animations) and *Simplified* (direct text, no decoration, designed as an online résumé and for printing).
- **Light and dark themes**, with support for `prefers-reduced-motion` and visible keyboard focus.
- **Machine-readable layer.** The indexed areas generate `cv.pt-BR.md`, `cv.en.md` and `cv.fr.md` plus a JSON-LD block from the same text the visitor reads. `llms.txt`, `robots.txt` and `sitemap.xml` complete the layer.
- **Résumé PDFs** in `assets/docs/`, in three languages, as a general set and one set per area, typeset in LaTeX outside this repository.

## Structure

```
index.html, index.template.html   Home (the two files are identical)
aero/ data/ it-security/          Area pages and the generated cv.*.md files
assets/                           CSS, scripts, simulations, images, fonts and PDFs (assets/docs/)
tests/                            Automated checks
tools/                            Generators (machine-readable layer, social sharing images)
```

## Run locally

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Opening `index.html` directly also works.

## Tests and generators

Requires Node.js 22. The scripts neither install nor need any packages.

```
npm test              # run every check
npm run build:cv      # regenerate the cv.*.md files and the JSON-LD of the area pages
npm run build:og      # regenerate the social sharing images (og:image)
```

| Test | What it checks |
|---|---|
| `check-parity` | PT, EN and FR share the same structure on every page |
| `check-links` | Internal links, résumé PDFs and downloaded file names (`--external` also checks external links) |
| `check-cv-sync` | Machine-readable files are up to date and faithful to the page text |
| `check-views` | Simplified and Themed views (uses the installed Chrome) |
| `check-lightbox` | Figure enlargement (uses the installed Chrome) |
| `check-print` | Number of printed pages (uses the installed Chrome) |
| `check-maze`, `check-malware` | Models behind the Q-learning and SIR simulations |

The same checks run on GitHub Actions on every push ([`checks.yml`](.github/workflows/checks.yml)).

## Updating content

1. Edit the text in **all three languages** together.
2. If an area page changed, run `npm run build:cv` and include the output in the commit.
3. To replace a résumé, overwrite the PDF in `assets/docs/` under the same name. Files are `cv-igor-de-melo-<language>.pdf` (general) and `cv-igor-de-melo-<area>-<language>.pdf`, with language `pt`, `en` or `fr` and area `aero` or `data`.
4. Run `npm test`.

## Commits

Conventional Commits in English, formatted as `<type>(<scope>): <summary>`.

## Contact

[igor_amelo@usp.br](mailto:igor_amelo@usp.br) · [LinkedIn](https://www.linkedin.com/in/igorademelo) · [GitHub](https://github.com/igor-de-melo)
