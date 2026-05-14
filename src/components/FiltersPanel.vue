<template>
  <div class="filters-panel">
    <div class="filters-header">
      <h2>Filtri</h2>
      <button @click="store.resetFilters" class="btn btn-secondary">
        Reset
      </button>
    </div>
    
    <div class="filter-group">
      <label for="search">Ricerca Titolo</label>
      <input 
        id="search"
        v-model="store.searchQuery"
        type="text"
        placeholder="Cerca film..."
      >
    </div>
    
    <div class="filter-group">
      <label>Generi</label>
      <div class="genres-list">
        <label v-for="genre in store.allGenres" :key="genre" class="genre-checkbox">
          <input 
            type="checkbox"
            :value="genre"
            :checked="store.selectedGenres.includes(genre)"
            @change="store.toggleGenreFilter(genre)"
          >
          <span>{{ genre }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMovieStore } from '../stores/movieStore'

const store = useMovieStore()
</script>

<style scoped>
.filters-panel {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.filter-group input[type="text"],
.filter-group select {
  width: 100%;
}

.genres-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.genre-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.3s ease;
}

.genre-checkbox:hover {
  background: #f5f5f5;
}

.genre-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.short-input {
  flex: 1;
  max-width: 100px;
}
</style>
