<template>
  <div class="app">
    <header class="app-header">
      <div class="container">
        <h1>🎬 Film Recommender</h1>
        <p class="subtitle">Scopri i film perfetti in base alle tue preferenze</p>
      </div>
    </header>
    
    <main class="container">
      <div v-if="store.error" class="error-banner">
        <p>Errore: {{ store.error }}</p>
        <button @click="retryInitialize" class="btn btn-primary">
          Riprova
        </button>
      </div>
      
      <div v-if="store.loading" class="loading-screen">
        <div class="spinner"></div>
        <p>Caricamento film e generazione raccomandazioni...</p>
      </div>
      
      <template v-else-if="store.myRatings.length > 0">
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ store.myRatings.length }}</span>
            <span class="stat-label">Film visti</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ store.filteredRecommendations.length }}</span>
            <span class="stat-label">Raccomandazioni</span>
          </div>
        </div>
        
        <FiltersPanel />
        
        <div v-if="store.filteredRecommendations.length > 0" class="recommendations">
          <h2 class="section-title">
            Raccomandazioni per te
          </h2>
          <div class="movies-grid">
            <MovieCard 
              v-for="movie in store.filteredRecommendations"
              :key="movie.tmdbId"
              :movie="movie"
            />
          </div>
        </div>
        
        <div v-else class="no-results">
          <p>Nessun film trovato con i filtri selezionati.</p>
          <button @click="store.resetFilters" class="btn btn-primary">
            Resetta filtri
          </button>
        </div>
      </template>
      
      <template v-else>
        <div class="empty-state">
          <p>Caricamento dati in corso...</p>
        </div>
      </template>
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2026 Film Recommender. Powered by TMDB & Letterboxd</p>
    </footer>
  </div>
</template>

<script setup>
import { useMovieStore } from './stores/movieStore'
import { onMounted } from 'vue'
import MovieCard from './components/MovieCard.vue'
import FiltersPanel from './components/FiltersPanel.vue'

const store = useMovieStore()

onMounted(async () => {
  await store.initializeApp()
})

function retryInitialize() {
  store.initializeApp()
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.95;
}

main {
  flex: 1;
  padding: 2rem 1rem;
}

.error-banner {
  background: #fee;
  border-left: 4px solid #f44;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner p {
  margin: 0;
  color: #c33;
  font-weight: 500;
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen p {
  color: white;
  font-size: 1.1rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.95rem;
}

.section-title {
  font-size: 1.75rem;
  margin: 2rem 0 1.5rem 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.no-results,
.empty-state {
  background: white;
  padding: 3rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-results p,
.empty-state p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.app-footer {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 3rem;
}

.app-footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
  
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>
