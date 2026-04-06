import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SpotifyService } from '../../services/spotify.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private spotifyService = inject(SpotifyService);
  private router = inject(Router);

  userProfile = signal<any>(null);
  activeView = signal<'home' | 'search' | 'library'>('home');
  
  // Home Data
  topTracks = signal<any[]>([]);
  userPlaylists = signal<any[]>([]);
  
  // Library Data
  savedAlbums = signal<any[]>([]);
  savedTracks = signal<any[]>([]);

  isLoading = signal(true);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.fetchData();
  }

  fetchData() {
    this.initLoadCount = 0;
    this.spotifyService.getCurrentUser().pipe(
      catchError(err => {
        if (err.status === 401) {
          this.logout();
        }
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
         this.userProfile.set(user);
      }
    });

    this.spotifyService.getTopTracks().pipe(
      catchError(err => of({ items: [] }))
    ).subscribe(res => {
      if (res?.items) {
        this.topTracks.set(res.items);
      }
    });

    this.spotifyService.getUserPlaylists().pipe(
      catchError(err => of({ items: [] }))
    ).subscribe(res => {
       if (res?.items) {
         this.userPlaylists.set(res.items);
       }
       this.checkLoadingState();
    });
  }

  switchView(view: 'home' | 'search' | 'library') {
    this.activeView.set(view);
    if (view === 'library' && this.savedAlbums().length === 0) {
      this.initLoadCount = 0;
      this.isLoading.set(true);
      this.fetchLibraryData();
    }
  }

  fetchLibraryData() {
    this.spotifyService.getSavedAlbums().pipe(
      catchError(err => of({ items: [] }))
    ).subscribe(res => {
      if (res?.items) {
        this.savedAlbums.set(res.items.map((item: any) => item.album));
      }
      this.checkLoadingState();
    });

    this.spotifyService.getSavedTracks().pipe(
      catchError(err => of({ items: [] }))
    ).subscribe(res => {
      if (res?.items) {
        this.savedTracks.set(res.items.map((item: any) => item.track));
      }
      this.checkLoadingState();
    });
  }

  private initLoadCount = 0;
  checkLoadingState() {
    this.initLoadCount++;
    if (this.initLoadCount >= 2) {
      this.isLoading.set(false);
      this.initLoadCount = 0;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
