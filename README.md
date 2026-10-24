# GameVault

GameVault is a curated archive for discovering, filtering and comparing video games. It is a static website built with HTML5, CSS3 and vanilla JavaScript for a school Network and Software course project. There is no backend, build step or package manager.

The interface text is in Persian (Farsi). The page layout is deliberately left-to-right so the design is unchanged; each text block picks its own direction automatically. Game titles and the GameVault name stay in English.

## Features

- Sticky header with a compacting bar, active-section highlighting, a mobile menu, a theme toggle (dark by default, light available, remembered) and a live favorites count.
- Hero section with a search field, two calls to action, live stats and a featured pick.
- Featured and trending area with a large feature tile, horizontal cards and compact rows.
- Catalog of 26 games with search, genre, platform, release-era and tag filters, five sort orders, a result count, a clear-filters action and an empty state. All controls work together.
- Details dialog (native `<dialog>`) with Escape-to-close, backdrop click, close button and focus restored to the trigger.
- Six editorial collections, each with its own palette; every one opens the catalog with the matching tag filter.
- Two-game comparison for year, genres, platforms, score and tags, with shared items marked and a reset button. The same game cannot be picked twice.
- Favorites saved in `localStorage`, with a favorites-only filter.
- About section and a "Meet the Creators" section with exactly five editable profiles.
- Respects `prefers-reduced-motion`, and games with Steam artwork IDs show cover images with CSS-designed fallback covers when an image is unavailable. The site uses Google Fonts (Vazirmatn and Space Grotesk) and remote Steam CDN artwork when internet access is available.

## Project structure

```text
GameVault/
├── index.html
├── README.md
└── assets/
    ├── css/styles.css
    ├── js/
    │   ├── games-data.js   game catalog
    │   ├── team-data.js    the five creator profiles
    │   └── app.js          rendering and interactions
    └── images/             optional local assets
```

Scripts are ordinary (non-module) scripts loaded in order, so the site also works when `index.html` is opened directly from disk.

## Run locally

Unzip the project and double-click `index.html`. Any modern browser works. Optionally, from the project folder run `python3 -m http.server` and open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a free GitHub account and click **New repository**. Name it, for example, `GameVault`, and keep it public.
2. Upload the **contents** of the unzipped folder so that `index.html` sits at the root of the repository (drag and drop works through **Add file > Upload files**). Commit the upload.
3. Open the repository **Settings > Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and the `/ (root)` folder, then **Save**.
5. Wait a minute and refresh. The site appears at `https://YOUR-USERNAME.github.io/GameVault/`.

All paths are relative, so the site works under a repository sub-path.

## Replace the five creator names and roles

Open `assets/js/team-data.js`. It contains one array with five entries:

```js
{ name: 'TEAM_MEMBER_1', role: 'Role / Contribution', bio: 'Add a short introduction here.' },
```

Replace `name`, `role` and `bio` in each entry, save, and refresh the page. Keep exactly five entries. The avatar shows the initials of the name you enter.

## Add a game

Open `assets/js/games-data.js` and add an object to the array:

```js
{ id: 'unique-id', title: 'Game Title', year: 2024, genres: ['RPG'], platforms: ['PC', 'PlayStation'],
  score: 8.8, palette: 'navy', tags: ['Indie'], desc: 'A short original description.' },
```

- `id` must be unique and use lowercase letters, numbers and hyphens.
- `platforms` should use `PC`, `PlayStation`, `Xbox` or `Nintendo`.
- `palette` is one of `navy`, `crimson`, `forest`, `aubergine`, `amber`, `slate`.
- `score` is a GameVault editorial score from 0 to 10, not an official review score.
- Tags used by collections are `Open World`, `Indie`, `Story Rich`, `Co-op`, `Classic` and `Intense`.

Genres, tags, filters, collections and the comparison list update automatically.

## Fonts and game artwork

- The interface uses **Vazirmatn** for Persian text and **Space Grotesk** for Latin headings and the GameVault wordmark.
- Some games use Steam CDN library artwork. These images load from the internet; if a cover fails, the site falls back to its designed gradient artwork.
- To change a game's artwork, edit its `image` URL in `assets/js/games-data.js`. Remove the `image` property to use only the CSS-designed cover.

## How favorites are stored

Favorites are saved as a list of game IDs in the browser's `localStorage` under the key `gv-favs`. They stay on the current browser and device and are not synced anywhere. If storage is blocked or the saved data is malformed, the site still works and favorites last only for the current visit. The theme choice is stored under `gv-theme`.

## Internet access

None is required. There are no external fonts, images, scripts or APIs. Game covers are generated with CSS from each game's palette, so they cannot fail to load.

## Known limitations

- This is a static site without a backend: there are no accounts, and data cannot be shared between devices.
- Favorites are browser-local and are lost if the browser data is cleared.
- Covers are original CSS artwork, not official game art, to avoid copyright problems.
- GameVault scores are editorial values for sorting and comparison only.
- The site does not use AI at runtime.

## Accessibility and responsive design

Semantic HTML, labeled form controls, visible keyboard focus, a skip link, `aria-live` result counts, `aria-pressed` favorite buttons, a keyboard-usable dialog and menu, text labels alongside color cues, and mobile-first layouts designed to work from roughly 320px wide without horizontal scrolling.


## Game artwork

Every game in the archive now has an artwork source. Many titles use Steam's public capsule artwork; games without a dependable matching capsule use a custom local SVG cover designed for GameVault. Local SVG covers are stored in `assets/images/covers/`. Online cover images require an internet connection, while the custom SVG covers are included in the project.
