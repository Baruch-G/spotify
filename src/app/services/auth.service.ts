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

  // PKCE helpers
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }

  private base64encode(input: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  async login(): Promise<void> {
    const codeVerifier = this.generateRandomString(64);
    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const hashed = await this.sha256(codeVerifier);
    const codeChallenge = this.base64encode(hashed);

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-library-read',
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: environment.spotifyClientId,
      response_type: 'code',
      redirect_uri: environment.redirectUri,
      scope: scopes,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: 'true' // Force show dialog so user can switch accounts if needed
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found in local storage.');
    }

    const payload = new URLSearchParams({
      client_id: environment.spotifyClientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: environment.redirectUri,
      code_verifier: codeVerifier
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
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
      
      localStorage.removeItem('spotify_code_verifier');
    } catch (e) {
      console.error('Error exchanging token:', e);
      throw e;
    }
  }

  logout(): void {
    this._accessToken.set(null);
    localStorage.removeItem('spotify_access_token');
  }
}
