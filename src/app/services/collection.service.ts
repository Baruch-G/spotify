import { Injectable, signal, computed } from '@angular/core';
import { SpotifyAlbum } from '../models/spotify.models';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly STORAGE_KEY = 'disc_collection';
  
  // The definitive source of truth for the user's collection
  private _collection = signal<SpotifyAlbum[]>(this.loadFromStorage());

  // Public readonly signals for the UI
  collectionItems = this._collection.asReadonly();
  count = computed(() => this._collection().length);

  private loadFromStorage(): SpotifyAlbum[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse collection from storage', e);
      return [];
    }
  }

  private saveToStorage(items: SpotifyAlbum[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  isInCollection(id: string): boolean {
    return this._collection().some(item => item.id === id);
  }

  toggleCollection(album: SpotifyAlbum) {
    const current = this._collection();
    const index = current.findIndex(item => item.id === album.id);

    if (index === -1) {
      // Add if missing
      const updated = [...current, album];
      this._collection.set(updated);
      this.saveToStorage(updated);
    } else {
      // Remove if exists
      const updated = current.filter(item => item.id !== album.id);
      this._collection.set(updated);
      this.saveToStorage(updated);
    }
  }

  removeFromCollection(id: string) {
    const updated = this._collection().filter(item => item.id !== id);
    this._collection.set(updated);
    this.saveToStorage(updated);
  }
}
