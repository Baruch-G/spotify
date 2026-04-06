import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private _accessToken = signal<string | null>(localStorage.getItem('spotify_access_token'));

  public readonly accessToken = computed(() => this._accessToken());
  public readonly isAuthenticated = computed(() => !!this._accessToken());

  constructor() {
    this.fetchToken(); // Automatically fetch/refresh token on initialization
  }

  async fetchToken(): Promise<void> {
    const payload = new URLSearchParams({
      grant_type: 'client_credentials'
    });

    const credentials = btoa(`${environment.spotifyClientId}:${environment.spotifyClientSecret}`);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    });

    try {
      const response = await firstValueFrom(
        this.http.post<any>('https://accounts.spotify.com/api/token', payload.toString(), { headers })
      );

      const token = response.access_token;
      if (token) {
        this._accessToken.set(token);
        localStorage.setItem('spotify_access_token', token);
      }
    } catch (e) {
      console.error('Error fetching client credentials token:', e);
    }
  }

  logout(): void {
    this._accessToken.set(null);
    localStorage.removeItem('spotify_access_token');
  }
}
