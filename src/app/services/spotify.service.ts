import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://api.spotify.com/v1';

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
    return this.http.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=${type}&limit=10&offset=${offset}`);
  }

  getAlbum(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/albums/${id}`);
  }

  getSavedAlbums(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/albums?limit=20`);
  }

  getSavedTracks(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me/tracks?limit=20`);
  }
}
