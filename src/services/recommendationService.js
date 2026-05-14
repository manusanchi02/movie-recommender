/**
 * Estrae feature dai miei film (ratings.csv)
 * Features: rating, genere, regista, attore
 */
export function extractMyMovieFeatures(myMovies, tmdbMovies) {
  // Crea mappa TMDB per lookup veloce per titolo e anno
  const tmdbMap = new Map()
  for (const movie of tmdbMovies) {
    const key = `${movie.title.toLowerCase()}_${movie.year}`
    tmdbMap.set(key, movie)
  }
  
  return myMovies.map(myMovie => {
    // Cerca corrispondenza in TMDB
    const key = `${myMovie.name.toLowerCase()}_${myMovie.year}`
    const tmdbMovie = tmdbMap.get(key)
    
    return {
      name: myMovie.name,
      year: myMovie.year,
      rating: myMovie.rating,
      letterboxdUri: myMovie.letterboxdUri,
      genres: tmdbMovie?.genres || [],
      director: tmdbMovie?.director || 'Unknown',
      cast: tmdbMovie?.cast || [],
      tmdbId: tmdbMovie?.tmdbId || null
    }
  })
}

/**
 * Estrae feature dai film TMDB
 * Features: genere, regista, attore (NO rating per non essere influenzati)
 */
export function extractTMDBFeatures(tmdbMovies) {
  return tmdbMovies.map(movie => ({
    title: movie.title,
    year: movie.year,
    tmdbId: movie.tmdbId,
    genres: movie.genres || [],
    director: movie.director || 'Unknown',
    cast: movie.cast || [],
    posterPath: movie.posterPath,
    overview: movie.overview,
    voteAverage: movie.voteAverage
  }))
}

export function calculateSimilarity(myMovieFeatures, tmdbMovie) {
  let score = 0
  
  // Similarità generi (peso 0.4)
  const genreScore = calculateSetSimilarity(
    myMovieFeatures.genres,
    tmdbMovie.genres
  )
  score += genreScore * 0.4
  
  // Similarità regista (peso 0.3)
  const directorScore = myMovieFeatures.director === tmdbMovie.director ? 1 : 0
  score += directorScore * 0.3
  
  // Similarità cast (peso 0.3)
  const castScore = calculateSetSimilarity(
    myMovieFeatures.cast,
    tmdbMovie.cast
  )
  score += castScore * 0.3
  
  return score
}

/**
 * Calcola similarità Jaccard tra due set
 */
function calculateSetSimilarity(set1, set2) {
  if (!set1.length && !set2.length) return 1
  if (!set1.length || !set2.length) return 0
  
  const intersection = set1.filter(item => set2.includes(item)).length
  const union = new Set([...set1, ...set2]).size
  
  return intersection / union
}

/**
 * Genera raccomandazioni basate su feature similarity
 * Considera TUTTI i film dell'utente (indipendentemente dal rating)
 * Somma i contributi di similarità e normalizza su scala 0-100
 */
export function generateRecommendations(myMovieFeatures, tmdbFeatures, watchedTitles, topN = 20) {
  // Esclude film già visti
  const candidateMovies = tmdbFeatures.filter(
    movie => !watchedTitles.has(movie.title.toLowerCase())
  )
  
  if (myMovieFeatures.length === 0) {
    return candidateMovies.slice(0, topN)
  }
  
  // Calcola similarità per ogni film usando TUTTI i film dell'utente
  const recommendations = candidateMovies.map(candidateMovie => {
    // Somma i contributi di similarità da tutti i 428 film
    const totalSimilarity = myMovieFeatures.reduce((sum, myMovie) => {
      return sum + calculateSimilarity(myMovie, candidateMovie)
    }, 0)
    
    // Normalizza su scala 0-90 (da tutti i film)
    // Massimo possibile: 428 film * 1.0 similarity max
    const maxPossibleScore = myMovieFeatures.length * 1.0
    const normalizedSimilarity = (totalSimilarity / maxPossibleScore) * 90
    
    // Boost da popularity (0-10, su scala 0-100)
    const popularityBoost = Math.min(candidateMovie.voteAverage / 10, 1) * 10
    
    // Score finale: 0-100
    const recommendationScore = normalizedSimilarity + popularityBoost
    
    return {
      ...candidateMovie,
      recommendationScore
    }
  })
  
  // Ordina per score e ritorna top N
  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, topN)
}
