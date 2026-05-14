# 🎬 Film Recommender

Movie recommendation engine using similarity-based algorithms for Letterboxd users.

## 🎯 Features

- **Similarity Algorithm**: Combines Jaccard similarity for genres/cast (70%) + exact director match (30%)
- **All-Film Analysis**: Considers ALL watched films (not just favorites) to identify patterns
- **Weighted Scoring**: Normalized to 0-100 scale with popularity boost from TMDB
- **Automatic Sync**: Updates from Letterboxd → TMDB enrichment → Recommendations (daily via GitHub Actions)
- **No Backend**: Fully static site, deployable anywhere (Altervista, GitHub Pages, etc.)
- **Fast**: ~85,600 similarity calculations complete in 30 seconds

## 🚀 Architecture

```
Letterboxd Profile (via scraping)
    ↓
update_features_from_letterboxd.py (GitHub Actions)
    ├─ Scrapes all watched films
    ├─ Detects NEW films
    ├─ Enriches with TMDB (genres, director, cast)
    └─ Updates myMovieFeatures.json
    ↓
myMovieFeatures.json (428 films + features)
    ↓
Vue 3 SPA
    ├─ Loads movie database
    ├─ Downloads 200 unwatched candidates from TMDB
    ├─ Calculates similarity scores
    └─ Displays ranked recommendations
    ↓
User Views Recommendations
    └─ Search on Letterboxd for each suggestion
```

## 📊 Algorithm Details

### Similarity Calculation

For each TMDB candidate:

```
1. totalSimilarity = SUM( calculateSimilarity(myFilm, candidate) for all 428 myFilms )

2. calculateSimilarity():
   - genreJaccard = intersection(genres) / union(genres)
   - directorMatch = 1 if directors match, 0 otherwise
   - castJaccard = intersection(cast) / union(cast)
   → score = (genreJaccard × 0.4) + (directorMatch × 0.3) + (castJaccard × 0.3)

3. normalizedSimilarity = (totalSimilarity / 428) × 90
   popularityBoost = min(voteAverage / 10, 1) × 10
   
4. recommendationScore = normalizedSimilarity + popularityBoost (0-100 scale)
```

### Why All Films Matter

- Low-rated films reveal negative patterns (genres/styles to avoid)
- Mid-rated films show general preferences
- High-rated films show strong affinities
- Outliers (highly rated uncommon genres) influence recommendations for similar rare gems

## 📦 Tech Stack

- **Frontend**: Vue 3.4 + Pinia 2.1 + Vite 5
- **Data Source**: Letterboxd (webscraping) + TMDB API
- **Automation**: GitHub Actions (daily sync)
- **Build**: Terser minification, single CSS bundle, no code splitting
- **Deployment**: Static site (77KB JS, 6.43KB CSS minified)

## 🔄 Automatic Sync Workflow

Every day at 2:00 AM UTC:

1. **GitHub Actions** runs `update_features_from_letterboxd.py`
2. **Scrapes** your Letterboxd profile (all watched films)
3. **Detects** new films since last sync
4. **Enriches** new films with TMDB data:
   - Genres (English)
   - Director name
   - Top 3 cast members
5. **Updates** `myMovieFeatures.json`
6. **Auto-commits** to repo
7. **App loads** updated recommendations on next page refresh

### GitHub Secrets Required

Only ONE secret needed for automatic sync:

- `TMDB_API_KEY`: `c982b0d362f7e84aefe3d307de4bd696`

(No Letterboxd API key needed - we scrape publicly available data)

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server on http://localhost:3002
npm run dev

# Build for production
npm run build

# Preview built site
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── MovieCard.vue        # Movie recommendation card
│   └── FiltersPanel.vue     # Genre/search filters
├── services/
│   ├── candidatesService.js # Downloads TMDB candidates
│   └── recommendationService.js # Similarity algorithm
├── stores/
│   └── movieStore.js        # Pinia state management
└── App.vue                  # Main layout

.github/workflows/
└── update-features.yml      # Daily Letterboxd sync

public/
└── myMovieFeatures.json     # 428 watched films with features

dist/                        # Production build
```

## 📊 Data Format

`myMovieFeatures.json` contains films with:

```json
[
  {
    "name": "Piper",
    "year": 2016,
    "rating": 5.0,
    "genres": ["Animation", "Family", "Adventure"],
    "director": "Alan Barillaro",
    "cast": ["Unnamed Voice Actors"]
  }
]
```

## 🎮 Usage

1. Open the app (local or deployed)
2. Wait 10-15 seconds for calculations
3. See top 20 recommendations sorted by score (0-100)
4. Filter by genre or search by title
5. Click "Guarda su Letterboxd" to check on Letterboxd

## 🚀 Deployment

### Altervista

```bash
npm run build
# Upload dist/ to movie-recommender/ folder in Altervista web manager
# App runs at: https://yourdomain.altervista.org/movie-recommender/
```

See `DEPLOYMENT.md` for detailed instructions.

### GitHub Pages

```bash
npm run build
git add dist/
git commit -m "Deploy"
git push
# Enable GitHub Pages in repo Settings
```

## 📈 Performance

- **Build Size**: 77KB minified → 30KB gzip
- **Load Time**: 10-15 seconds (85,600 comparisons)
- **Calculation**: ~850 μs per film pair
- **Runtime**: No backend requests, instant filtering

## 🔐 Privacy

- No data sent to external servers (except TMDB for enrichment)
- All recommendations calculated client-side
- TMDB API key is public (movie DB standard)
- Letterboxd scraping respects rate limits

## 📝 License

MIT - Feel free to use, modify, and share!

## 🎓 How I Built This

This project evolved through several iterations:

1. **Phase 1**: Initial Vue + CSV loading (blocked by performance)
2. **Phase 2**: Static JSON + Python feature extraction (works but manual updates)
3. **Phase 3**: GitHub Actions + automated Letterboxd scraping (current - fully automatic)
4. **Algorithm**: Evolved from averaging 209 favorite films to summing all 428 films for better pattern detection

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to open an issue!

---

**Last Updated**: May 2026
**Films Analyzed**: 428 + ~200 candidates daily
**Recommendation Freshness**: Updated daily via GitHub Actions
