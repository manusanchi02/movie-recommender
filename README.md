# 🎬 Film Recommender

Un'applicazione web SPA per scoprire film consigliati in base ai tuoi rating su Letterboxd.

## 🎯 Caratteristiche

- **Raccomandazioni intelligenti** basate su feature similarity (genere 40%, regista 30%, cast 30%, popularity boost)
- **Filtri avanzati** per genere e ricerca per titolo
- **Mobile-first design** responsive e intuitivo
- **Integrazione TMDB** per dati film completi e copertine
- **Zero backend** - App statica, deployabile su qualsiasi hosting

## 🚀 Setup

### Prerequisiti
- Node.js 16+ e npm

### Installazione

1. Vai nella cartella del progetto:
```bash
cd movie-recommender
```

2. Installa dipendenze:
```bash
npm install
```

3. Configura le API keys nel file `.env`:
```
VITE_TMDB_API_KEY=your_tmdb_key_here
```
(La chiave TMDB è già configurata nel `.env` di default)

4. Avvia il dev server:
```bash
npm run dev
```

5. Apri http://localhost:3000 nel browser

## 📦 Build per produzione (Altervista)

```bash
npm run build
```

Genera la cartella `dist/` con l'app compilata. Upload il contenuto di `dist/` nel root della tua cartella Altervista.

### Configurazione Altervista

1. Carica tutti i file da `dist/` nella root dell'hosting
2. L'app è completamente autonoma (no backend necessario)
3. Funziona offline dopo il primo caricamento (service worker disponibile)

## 🛠️ Tecnologie

- **Vue 3** - Framework UI
- **Vite** - Build tool
- **Pinia** - State management
- **TMDB API** - Database film


## 🎬 Come funziona

### Dati di input
1. **CSV da Letterboxd**: Scarica il tuo file `ratings.csv` dall'account Letterboxd
2. Posiziona il file nella cartella `letterboxd-manusanchi-2026-05-05-16-42-utc/`

### Algoritmo di raccomandazione

1. **Estrazione feature** dai tuoi film visti:
   - Genere
   - Regista
   - Cast (primi 5 attori)
   - Rating personale

2. **Download film TMDB**: Scarica i top 200 film trending

3. **Similarità feature**:
   - Genere: 40% peso
   - Regista: 30% peso
   - Cast: 30% peso

4. **Esclusioni**: Rimuove i film già visti

5. **Ranking**: Ordina per score di similarità + boost di popolarità

## 🔍 Filtri disponibili

- **Ricerca**: Per titolo
- **Regista**: Seleziona uno specifico regista
- **Generi**: Multipli selezionabili
- **Durata**: Range minimo e massimo (futuro)

## 🛠️ Tecnologie

- **Frontend**: Vue 3 + Vite
- **State Management**: Pinia
- **API**: TMDB, Hugging Face (futuro)
- **CSV Parser**: PapaParse
- **Styling**: CSS moderno responsive

## 📝 Prossimi step

- [ ] Integrazione API LLM (Hugging Face) per raccomandazioni semantic
- [ ] Download dinamico da betterboxd
- [ ] Grafico di analisi rating
- [ ] Funzione "Aggiungi a watchlist"
- [ ] Dark mode

## 📄 Licenza

MIT

## 🤝 Contributi

Contributi e feedback sono benvenuti!
