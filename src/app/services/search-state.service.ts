import { Injectable, signal } from '@angular/core';
import { SpotifyAlbum } from '../models/spotify.models';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  currentQuery = signal('');
  currentOffset = signal(0);
  hasMore = signal(true);
  searchResults = signal<SpotifyAlbum[]>([]);
  lastScrollIndex = signal(0);

  resetAndInitSearch(query: string) {
    this.currentQuery.set(query);
    this.currentOffset.set(0);
    this.hasMore.set(true);
    this.searchResults.set([]);
    this.lastScrollIndex.set(0);
  }
}
