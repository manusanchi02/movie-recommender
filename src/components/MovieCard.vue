<template>
  <div class="movie-card">
    <div class="movie-poster">
      <img 
        v-if="movie.posterPath" 
        :src="`https://image.tmdb.org/t/p/w200${movie.posterPath}`"
        :alt="movie.title"
        class="poster-image"
      >
      <div v-else class="no-poster">No Image</div>
      <div class="score-badge">
        {{ movie.recommendationScore?.toFixed(2) || movie.voteAverage?.toFixed(1) }}
      </div>
    </div>
    
    <div class="movie-info">
      <h3 class="movie-title">{{ movie.title }}</h3>
      <p class="movie-year">{{ movie.year }}</p>
      
      <div class="genres">
        <span 
          v-for="genre in movie.genres?.slice(0, 3)" 
          :key="genre"
          class="genre-tag"
        >
          {{ genre }}
        </span>
      </div>
      
      <div v-if="movie.director" class="director">
        <strong>Dir:</strong> {{ movie.director }}
      </div>
      
      <div v-if="movie.cast?.length" class="cast">
        <strong>Con:</strong> {{ movie.cast.slice(0, 2).join(', ') }}
      </div>
      
      <p v-if="movie.overview" class="overview">
        {{ truncateText(movie.overview, 100) }}
      </p>
      
      <a 
        :href="movieLink" 
        target="_blank" 
        rel="noopener noreferrer"
        class="btn btn-primary"
      >
        Letterboxd
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const movieLink = computed(() => {
  // Cerca di costruire link Letterboxd dal titolo
  // Per ora usiamo URL generico di ricerca
  return `https://letterboxd.com/search/${encodeURIComponent(props.movie.title)}/`
})

function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
</script>

<style scoped>
.movie-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.movie-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  background: #f0f0f0;
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.score-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: #ffd700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
  font-size: 0.875rem;
}

.movie-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.movie-year {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.genre-tag {
  display: inline-block;
  background: #f0f0f0;
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.director,
.cast {
  font-size: 0.875rem;
  color: #555;
  margin: 0.25rem 0;
}

.overview {
  font-size: 0.85rem;
  color: #777;
  margin: 0.5rem 0;
  flex: 1;
  line-height: 1.4;
}

.btn {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>
