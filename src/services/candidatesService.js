/**
 * Service per generare candidati di film da consigliare
 * Fase 1: Scarica da TMDB i top film, filtra quelli già visti, estrae feature
 * Fase 2: Ogni volta che apri il sito, sincronizza con Letterboxd e aggiorna candidati
 */

const TMDB_API_KEY = 'c982b0d362f7e84aefe3d307de4bd696'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return res
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * Scarica i top film da TMDB (pagina per pagina)
 * @param {number} limit - Quanti film scaricare in totale
 * @returns {Array} Array di film con id, title, year, genres, director, cast
 */
export async function downloadTopMoviesFromTMDB(limit = 250) {
  const movies = []
  let page = 1
  const maxPages = Math.ceil(limit / 20) + 5

  while (movies.length < limit && page <= maxPages) {
    try {
      const url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
      const res = await fetchWithTimeout(url, 8000)
      
      if (!res.ok) {
        break
      }

      const data = await res.json()
      
      if (!data.results || data.results.length === 0) break

      for (const movie of data.results) {
        if (movies.length >= limit) break

        // Scarica dettagli con generi e credits
        const details = await getMovieDetailsWithCredits(movie.id)
        if (details) {
          movies.push(details)
        }
      }

      page++
      await new Promise(r => setTimeout(r, 200)) // Delay tra pagine
    } catch (err) {
      page++
    }
  }

  return movies
}

/**
 * Scarica dettagli di un singolo film (generi, director, cast)
 */
async function getMovieDetailsWithCredits(movieId) {
  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    const res = await fetchWithTimeout(url, 8000)
    
    if (!res.ok) return null

    const data = await res.json()

    // Estrai info
    const genres = data.genres?.map(g => g.name) || []
    
    let director = 'Unknown'
    if (data.credits?.crew) {
      const dir = data.credits.crew.find(p => p.job === 'Director')
      if (dir) director = dir.name
    }

    const cast = data.credits?.cast?.slice(0, 3).map(p => p.name) || []

    return {
      id: movieId,
      title: data.title,
      year: data.release_date ? parseInt(data.release_date.split('-')[0]) : null,
      posterPath: data.poster_path,
      overview: data.overview,
      genres,
      director,
      cast,
      popularity: data.popularity,
      voteAverage: data.vote_average || 0
    }
  } catch (err) {
    return null
  }
}

/**
 * Filtra i film già visti (dal CSV di Letterboxd)
 * @param {Array} candidateMovies - Film scaricati da TMDB
 * @param {Array} watchedMovies - Film già visti (dal CSV)
 * @returns {Array} Film non visti
 */
export function filterUnwatchedMovies(candidateMovies, watchedMovies) {
  const watchedTitles = new Set(
    watchedMovies.map(m => `${m.name} ${m.year}`.toLowerCase())
  )

  return candidateMovies.filter(m => {
    const key = `${m.title} ${m.year}`.toLowerCase()
    return !watchedTitles.has(key)
  })
}

/**
 * Genera la lista finale di candidati da proporre
 * Scarica da TMDB fino a raggiungere il numero desiderato di film non visti
 */
export async function generateCandidateList(watchedMovies, targetCount = 200) {
  // Scarica più film di quelli necessari per sicurezza
  const allTmdbMovies = await downloadTopMoviesFromTMDB(targetCount + 100)
  
  // Filtra quelli non visti
  const unwatchedMovies = filterUnwatchedMovies(allTmdbMovies, watchedMovies)

  // Se ne abbiamo meno di targetCount, continua a scaricare
  if (unwatchedMovies.length < targetCount) {
    const additionalMovies = await downloadTopMoviesFromTMDB(targetCount + 200)
    const moreUnwatched = filterUnwatchedMovies(additionalMovies, watchedMovies)
    unwatchedMovies.push(
      ...moreUnwatched.filter(
        m => !unwatchedMovies.find(u => u.id === m.id)
      )
    )
  }

  // Ritorna i primi targetCount
  return unwatchedMovies.slice(0, targetCount)
}

/**
 * Estrae feature di similarità dai film candidati
 * (generi, director, cast per il matching)
 */
export function extractCandidateFeatures(movies) {
  return movies.map(m => ({
    id: m.id,
    title: m.title,
    year: m.year,
    genres: m.genres,
    director: m.director,
    cast: m.cast
  }))
}
