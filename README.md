# Singapore Internet History

An interactive, static story about Singapore's internet history.

## Run locally

From the project directory, run:

```sh
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). The site starts at `index.html`.

## Deploy

Upload the repository root to any static web host and serve `index.html`. No build command or server-side code is needed.

## Stack and data

- HTML, CSS, and vanilla JavaScript; there is no framework or backend.
- D3.js v7 renders the connection-speed comparison; Scrollama v3 drives scroll-based story steps.
- Facts and simulation inputs are currently written directly in `index.html` and `script.js`. No CSV/JSON data file is loaded.
- `room-preview.png` is the local room illustration.

The page loads fonts from Google Fonts, D3 and Scrollama from jsDelivr, and sample images from Unsplash. Those external resources need an internet connection.

The story does not show adoption percentages because the draft does not identify a comparable measure, year, population, or source. It retains an early SingNet user count with its National Library Board, Infopedia attribution.
