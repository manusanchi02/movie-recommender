#!/usr/bin/env python3
"""
Sincronizza automaticamente i film da Letterboxd con myMovieFeatures.json
Eseguito da GitHub Actions ogni giorno
"""

import requests
import json
import os
from datetime import datetime
from bs4 import BeautifulSoup
import time

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
LETTERBOXD_USERNAME = 'manusanchi'
OUTPUT_FILE = 'public/myMovieFeatures.json'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

# Genere mapping (Italian -> English)
GENRE_MAP = {
    'Dramma': 'Drama',
    'Azione': 'Action',
    'Animazione': 'Animation',
    'Famiglia': 'Family',
    'Avventura': 'Adventure',
    'Fantascienza': 'Science Fiction',
    'Fantasy': 'Fantasy',
    'Commedia': 'Comedy',
    'Thriller': 'Thriller',
    'Crimine': 'Crime',
    'Mistero': 'Mystery',
    'Horror': 'Horror',
    'Romantico': 'Romance',
    'Musicale': 'Musical',
    'Storico': 'History',
    'Guerra': 'War',
    'Western': 'Western',
    'Documentario': 'Documentary',
    'Corto': 'Short Film',
    'Biografia': 'Biography',
    'Sport': 'Sports',
    'Noir': 'Film Noir',
    'Sperimentale': 'Experimental'
}


def scrape_letterboxd_watchlist(username: str) -> list:
    """Scrapa la lista film visti da Letterboxd"""
    print(f"[LOG] Scaricando film da Letterboxd/{username}...")
    
    films = []
    page = 1
    max_pages = 20  # Limite per sicurezza
    
    while page <= max_pages:
        url = f"https://letterboxd.com/{username}/films/page/{page}/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Cerchi film nella pagina
            film_items = soup.find_all('li', class_='filmitemcontainer')
            
            if not film_items:
                print(f"[LOG] Fine lista - pagina {page} vuota")
                break
            
            for item in film_items:
                try:
                    film_link = item.find('a', class_='frame')
                    if not film_link:
                        continue
                    
                    film_url = film_link.get('href', '')
                    title_elem = item.find('img', class_='real')
                    
                    if not title_elem:
                        continue
                    
                    title = title_elem.get('alt', '')
                    
                    # Estrai l'anno dal film_url se possibile
                    # Format: /manusanchi/film/TITLE-YEAR/
                    year = None
                    if film_url:
                        parts = film_url.strip('/').split('/')
                        if len(parts) > 2:
                            potential_year = parts[-1].split('-')[-1]
                            if potential_year.isdigit():
                                year = int(potential_year)
                    
                    if title:
                        films.append({
                            'name': title,
                            'year': year,
                            'url': film_url
                        })
                except Exception as e:
                    print(f"[WARN] Errore parsing film: {e}")
                    continue
            
            print(f"[LOG] Pagina {page}: {len(film_items)} film trovati")
            page += 1
            time.sleep(1)  # Rate limiting
            
        except Exception as e:
            print(f"[ERROR] Errore scaricando pagina {page}: {e}")
            break
    
    print(f"[LOG] Totale film scaricati: {len(films)}")
    return films


def search_tmdb(title: str, year: int = None) -> dict:
    """Cerca un film su TMDB per ottenere i dettagli"""
    try:
        url = f"{TMDB_BASE_URL}/search/movie"
        params = {
            'api_key': TMDB_API_KEY,
            'query': title,
            'year': year if year else None
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data['results']:
            return data['results'][0]  # Primo risultato
        
        return None
    except Exception as e:
        print(f"[WARN] Errore cercando {title} su TMDB: {e}")
        return None


def get_movie_details(movie_id: int) -> dict:
    """Ottiene dettagli completi del film da TMDB (generi, regista, cast)"""
    try:
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        params = {
            'api_key': TMDB_API_KEY,
            'append_to_response': 'credits'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        print(f"[WARN] Errore ottenendo dettagli film {movie_id}: {e}")
        return None


def extract_genres(tmdb_details: dict) -> list:
    """Estrae i generi da TMDB (già in inglese)"""
    if not tmdb_details or 'genres' not in tmdb_details:
        return []
    
    return [g['name'] for g in tmdb_details['genres']]


def extract_director(tmdb_details: dict) -> str:
    """Estrae il regista dai credits"""
    if not tmdb_details or 'credits' not in tmdb_details:
        return ''
    
    crew = tmdb_details['credits'].get('crew', [])
    for person in crew:
        if person.get('job') == 'Director':
            return person.get('name', '')
    
    return ''


def extract_cast(tmdb_details: dict, limit: int = 3) -> list:
    """Estrae il cast dai credits"""
    if not tmdb_details or 'credits' not in tmdb_details:
        return []
    
    cast = tmdb_details['credits'].get('cast', [])
    return [person.get('name', '') for person in cast[:limit]]


def load_existing_features() -> dict:
    """Carica i film già presenti in myMovieFeatures.json"""
    if not os.path.exists(OUTPUT_FILE):
        return {}
    
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            films = json.load(f)
        
        # Crea un dict per lookup veloce
        return {f['name'].lower(): f for f in films}
    except Exception as e:
        print(f"[WARN] Errore caricando {OUTPUT_FILE}: {e}")
        return {}


def update_features():
    """Main function - sincronizza Letterboxd con myMovieFeatures.json"""
    
    print("=" * 60)
    print(f"[START] Update Features - {datetime.now()}")
    print("=" * 60)
    
    # Carica film esistenti
    existing = load_existing_features()
    print(f"[LOG] Film esistenti caricati: {len(existing)}")
    
    # Scrapa Letterboxd
    letterboxd_films = scrape_letterboxd_watchlist(LETTERBOXD_USERNAME)
    print(f"[LOG] Film da Letterboxd: {len(letterboxd_films)}")
    
    # Identifica film NUOVI
    new_films = []
    updated_films = []
    
    for lb_film in letterboxd_films:
        name_lower = lb_film['name'].lower()
        
        if name_lower in existing:
            # Film già presente
            updated_films.append(existing[name_lower])
        else:
            # Film NUOVO - arricchisci da TMDB
            print(f"\n[NEW] Elaborando: {lb_film['name']} ({lb_film['year']})")
            
            # Cerca su TMDB
            tmdb_result = search_tmdb(lb_film['name'], lb_film['year'])
            
            if not tmdb_result:
                print(f"[WARN] Non trovato su TMDB: {lb_film['name']}")
                continue
            
            movie_id = tmdb_result['id']
            print(f"[LOG] TMDB ID: {movie_id}")
            
            # Ottieni dettagli
            time.sleep(0.5)  # Rate limiting TMDB
            tmdb_details = get_movie_details(movie_id)
            
            if not tmdb_details:
                print(f"[ERROR] Non ho potuto ottenere dettagli per {movie_id}")
                continue
            
            # Estrai feature
            genres = extract_genres(tmdb_details)
            director = extract_director(tmdb_details)
            cast = extract_cast(tmdb_details)
            year = tmdb_details.get('release_date', '').split('-')[0] if tmdb_details.get('release_date') else lb_film['year']
            
            new_feature = {
                'name': lb_film['name'],
                'year': int(year) if year else lb_film['year'],
                'rating': 0,  # Senza API ufficiale non lo sappiamo
                'genres': genres,
                'director': director,
                'cast': cast
            }
            
            new_films.append(new_feature)
            print(f"[OK] Arricchito: {len(genres)} generi, regista: {director}, cast: {len(cast)}")
    
    # Combina: film existenti + nuovi
    all_films = list(existing.values()) + new_films
    
    print(f"\n[LOG] Film totali: {len(all_films)}")
    print(f"[LOG] Film nuovi aggiunti: {len(new_films)}")
    
    # Salva
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_films, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] Salvato in {OUTPUT_FILE}")
    print("=" * 60)
    print(f"[END] Sincronizzazione completata")
    print("=" * 60)


if __name__ == '__main__':
    update_features()
