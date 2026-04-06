import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://api.spotify.com/v1';

  private requestCache = new Map<string, Observable<any>>();

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  getTopTracks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/top/tracks?limit=20`);
  }

  getUserPlaylists(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/playlists?limit=20`);
  }
  
  search(query: string, type: string = 'track,artist,album,playlist', offset: number = 0): Observable<any> {
    const cacheKey = `search_${query}_${type}_offset_${offset}`;
    
    if (!this.requestCache.has(cacheKey)) {
      const req$ = this.http.get(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=${type}&limit=10&offset=${offset}`
      ).pipe(shareReplay(1));
      
      this.requestCache.set(cacheKey, req$);
    }
    
    return this.requestCache.get(cacheKey)!;
  }

  getAlbum(id: string): Observable<any> {
    const cacheKey = `album_${id}`;
    
    if (!this.requestCache.has(cacheKey)) {
      const req$ = this.http.get(`${this.baseUrl}/albums/${id}`).pipe(shareReplay(1));
      this.requestCache.set(cacheKey, req$);
    }
    
    return this.requestCache.get(cacheKey)!;
  }

  getSavedAlbums(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/albums?limit=20`);
  }

  getSavedTracks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/tracks?limit=20`);
  }
}
