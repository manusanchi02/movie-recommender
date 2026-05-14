import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  generateCandidateList,
  filterUnwatchedMovies
} from '../services/candidatesService'
import { 
  extractMyMovieFeatures, 
  extractTMDBFeatures, 
  generateRecommendations 
} from '../services/recommendationService'

export const useMovieStore = defineStore('movies', () => {
  // State
  const myRatings = ref([])
  const tmdbMovies = ref([])
  const recommendations = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Filtri
  const selectedGenres = ref([])
  const searchQuery = ref('')
  
  // Computed
  const watchedTitles = computed(() => {
    const set = new Set()
    myRatings.value.forEach(movie => {
      set.add(movie.name.toLowerCase())
    })
    return set
  })
  
  const allGenres = computed(() => {
    const genres = new Set()
    tmdbMovies.value.forEach(movie => {
      movie.genres?.forEach(g => genres.add(g))
    })
    myRatings.value.forEach(movie => {
      movie.genres?.forEach(g => genres.add(g))
    })
    return Array.from(genres).sort()
  })
  
  const filteredRecommendations = computed(() => {
    let filtered = recommendations.value
    
    // Filtro genere
    if (selectedGenres.value.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres?.some(g => selectedGenres.value.includes(g))
      )
    }
    
    // Filtro ricerca
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query)
      )
    }
    
    return filtered
  })
  
  // Actions
  async function initializeApp(featuresPath = './myMovieFeatures.json') {
    loading.value = true
    error.value = null
    
    try {
      // Carica i miei film visti
      const res = await fetch(featuresPath)
      if (!res.ok) throw new Error(`Errore caricamento features: ${res.status}`)
      myRatings.value = await res.json()
      
      // Genera candidati da TMDB (top 200+ non visti)
      try {
        const candidates = await generateCandidateList(myRatings.value, 200)
        tmdbMovies.value = candidates
      } catch (err) {
        const { mockMovies } = await import('../utils/mockData')
        tmdbMovies.value = mockMovies
      }
      
      if (tmdbMovies.value.length === 0) {
        throw new Error('Nessun film disponibile')
      }
      
      // Calcola raccomandazioni basate su similarità
      const myFeatures = extractMyMovieFeatures(myRatings.value, tmdbMovies.value)
      const candidateFeatures = extractTMDBFeatures(tmdbMovies.value)
      
      recommendations.value = generateRecommendations(
        myFeatures,
        candidateFeatures,
        watchedTitles.value,
        tmdbMovies.value.length
      )
      
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  function toggleGenreFilter(genre) {
    const index = selectedGenres.value.indexOf(genre)
    if (index > -1) {
      selectedGenres.value.splice(index, 1)
    } else {
      selectedGenres.value.push(genre)
    }
  }
  
  function resetFilters() {
    selectedGenres.value = []
    searchQuery.value = ''
  }
  
  return {
    // State
    myRatings,
    tmdbMovies,
    recommendations,
    loading,
    error,
    
    // Filtri
    selectedGenres,
    searchQuery,
    
    // Computed
    watchedTitles,
    allGenres,
    filteredRecommendations,
    
    // Actions
    initializeApp,
    toggleGenreFilter,
    resetFilters
  }
})
