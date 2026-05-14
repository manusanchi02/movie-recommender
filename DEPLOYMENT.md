# 🚀 Guida al Deployment su Altervista

## Prerequisiti
- Account Altervista attivo
- Accesso al File Manager (FTP o Web Interface)

## Passo 1: Genera la Build

```bash
npm install  # Se non l'hai fatto
npm run build
```

La build sarà generata nella cartella `dist/`

## Passo 2: Upload su Altervista

### Opzione A: Web File Manager (Consigliato)
1. Accedi al tuo account Altervista
2. Vai a **Gestione File** → **File Manager**
3. Naviga nella **root della tua cartella** (es. `www/`)
4. Copia tutti i file da `dist/` nel root:
   - `index.html`
   - `assets/` (cartella completa)
   - `.htaccess`
   - `myMovieFeatures.json`

### Opzione B: FTP Client
1. Connettiti via FTP al tuo account Altervista
2. Copia il contenuto di `dist/` nella **root del tuo dominio**
3. Assicurati che `.htaccess` sia caricato (file nascosti devono essere visibili)

## Passo 3: Verifica il Deployment

1. Apri il tuo browser
2. Accedi a `https://tuodominio.altervista.org`
3. L'app dovrebbe caricare e mostrare il loading spinner
4. Dopo 10-15 secondi, vedrai le raccomandazioni

## Troubleshooting

### "Errore 404" o pagina bianca
- Verifica che tutti i file da `dist/` siano caricati
- Controlla che `.htaccess` sia presente nella root
- Verifica che `myMovieFeatures.json` sia nella root

### App non carica i film
- Apri la console del browser (F12)
- Verifica che non ci siano errori di fetch
- Controlla che `myMovieFeatures.json` sia accessibile a `/myMovieFeatures.json`

### CSS/JS non caricano
- Svuota la cache del browser (Ctrl+Shift+Canc)
- Prova con una finestra anonima
- Verifica che i file in `assets/` siano caricati

## Performance

- **Dimensione build**: ~85KB compresso (29KB gzip)
- **Caricamento iniziale**: 10-15 secondi (tempo di fetch TMDB)
- **Caricamento film**: ~2-3 secondi per pagina TMDB
- **Performance a regime**: Istantaneo (no backend)

## Update Future

Per aggiornare i film raccomandati con i nuovi rating di Letterboxd:

1. Esegui `python feature_extractor.py` per estrarre le feature aggiornate
2. Rigenera la build: `npm run build`
3. Carica i nuovi file da `dist/` su Altervista

## Sicurezza

- La chiave API TMDB è pubblica (usata dal client) - questo è normale
- Non memorizzare dati sensibili nel browser
- L'app non utilizza backend, nessun dato è inviato a server esterno
