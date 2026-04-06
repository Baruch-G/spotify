import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SpotifyService } from '../../services/spotify.service';
import { DiscCard } from '../disc-card/disc-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule, DiscCard],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  private spotifyService = inject(SpotifyService);
  private router = inject(Router);

  searchControl = new FormControl('');
  searchResults = signal<any[]>([]);
  recentQueries = signal<string[]>([]);
  isLoading = signal(false);
  
  // Infinite Scroll State
  currentQuery = signal('');
  currentOffset = signal(0);
  isFetchingMore = signal(false);
  hasMore = signal(true);

  ngOnInit() {
    this.loadRecentQueries();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.trim() !== '') {
          this.performSearch(query.trim());
        } else {
          this.searchResults.set([]);
        }
      });
  }

  performSearch(query: string) {
    if (query !== this.currentQuery()) {
      this.searchResults.set([]);
      this.currentOffset.set(0);
      this.hasMore.set(true);
      this.currentQuery.set(query);
    }

    if (this.currentOffset() === 0) {
      this.isLoading.set(true);
    }
    
    this.saveQuery(query);
    
    // Using the search endpoint strictly for 'album' to map to the 'discs' requirement
    this.spotifyService.search(query, 'album', this.currentOffset()).subscribe({
      next: (res) => {
        if (res?.albums?.items) {
          const items = res.albums.items;
          this.searchResults.set([...this.searchResults(), ...items]);
          if (items.length < 10) {
            this.hasMore.set(false);
          }
        } else {
          this.hasMore.set(false);
        }
        this.isLoading.set(false);
        this.isFetchingMore.set(false);
      },
      error: (err) => {
        console.error('Search error', err);
        this.isLoading.set(false);
        this.isFetchingMore.set(false);
      }
    });
  }

  fetchMore() {
    if (this.isFetchingMore() || !this.hasMore()) return;
    
    this.isFetchingMore.set(true);
    this.currentOffset.set(this.currentOffset() + 10);
    this.performSearch(this.currentQuery());
  }

  onScroll(index: number) {
    const totalItems = this.searchResults().length;
    // Trigger when user scrolls within 5 items of the bottom
    if (index + 10 >= totalItems && !this.isFetchingMore() && this.hasMore()) {
      this.fetchMore();
    }
  }

  saveQuery(query: string) {
    let queries = [...this.recentQueries()];
    
    // Remove if already exists to push it to the top
    queries = queries.filter(q => q.toLowerCase() !== query.toLowerCase());
    
    // Add to beginning
    queries.unshift(query);
    
    // Keep only last 5
    if (queries.length > 5) {
      queries = queries.slice(0, 5);
    }
    
    this.recentQueries.set(queries);
    localStorage.setItem('disc_recent_queries', JSON.stringify(queries));
  }

  loadRecentQueries() {
    const saved = localStorage.getItem('disc_recent_queries');
    if (saved) {
      try {
        this.recentQueries.set(JSON.parse(saved));
      } catch (e) {
        this.recentQueries.set([]);
      }
    }
  }

  onRecentQueryClick(query: string) {
    this.searchControl.setValue(query);
  }

  onDiscClick(disc: any) {
    // Navigate to disc details routing, passing the whole disc object via state
    // so we don't necessarily have to re-fetch if we have enough data (depending on requirements)
    // But we'll pass the ID so the details page can fetch more if needed
    this.router.navigate(['/disc', disc.id], { state: { disc } });
  }
}
