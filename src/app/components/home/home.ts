import { Component, OnInit, AfterViewInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { SpotifyService } from '../../services/spotify.service';
import { SearchStateService } from '../../services/search-state.service';
import { SpotifyAlbum } from '../../models/spotify.models';
import { DiscCard } from '../disc-card/disc-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule, DiscCard],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  private spotifyService = inject(SpotifyService);
  private searchState = inject(SearchStateService);
  private router = inject(Router);

  private initialScrollRestored = false;
  private pendingScrollIndex = 0;

  searchControl = new FormControl('');
  recentQueries = signal<string[]>([]);
  isLoading = signal(false);
  isFetchingMore = signal(false);

  // Directly mapping UI helpers to Global State
  searchResults = this.searchState.searchResults;
  hasMore = this.searchState.hasMore;
  currentQuery = this.searchState.currentQuery;
  currentOffset = this.searchState.currentOffset;

  private searchSubject = new Subject<{query: string, offset: number}>();

  ngOnInit() {
    this.pendingScrollIndex = this.searchState.lastScrollIndex();
    this.loadRecentQueries();

    // Recover value softly if returning from details page
    if (this.currentQuery()) {
      this.searchControl.setValue(this.currentQuery(), { emitEvent: false });
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.trim() !== '') {
          const cleanQuery = query.trim();
          if (cleanQuery !== this.currentQuery()) {
            this.searchState.resetAndInitSearch(cleanQuery);
            this.saveQuery(cleanQuery);
            this.isLoading.set(true);
          }
          this.searchSubject.next({ query: cleanQuery, offset: this.currentOffset() });
        } else {
          this.searchState.resetAndInitSearch('');
        }
      });

    // Handle all search execution here, safely cancelling trailing requests via switchMap
    this.searchSubject.pipe(
      switchMap(({query, offset}) => 
        this.spotifyService.search(query, 'album', offset).pipe(
          catchError(err => {
            console.error('Handled Search network drop keeping stream alive:', err);
            this.isLoading.set(false);
            this.isFetchingMore.set(false);
            // Returns a safe empty array structure instantly preventing the switchMap core from dying
            return of({ albums: { items: [] } }); 
          })
        )
      )
    ).subscribe({
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
    const nextOffset = this.currentOffset() + 10;
    this.currentOffset.set(nextOffset);
    this.searchSubject.next({ query: this.currentQuery(), offset: nextOffset });
  }

  onScroll(index: number) {
    // Ignore the native remounting 0 emission if we are actively trying to restore a past scroll!
    if (!this.initialScrollRestored && index === 0 && this.pendingScrollIndex > 0) {
      return; 
    }

    this.searchState.lastScrollIndex.set(index);
    const totalItems = this.searchResults().length;
    
    // Changing threshold from index + 10 to index + 5.
    // When virtual scroller mounts, it emits index 0. 
    if (index + 5 >= totalItems && !this.isFetchingMore() && this.hasMore()) {
      this.fetchMore();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.viewport && this.pendingScrollIndex > 0) {
        this.viewport.scrollToIndex(this.pendingScrollIndex, 'smooth');
        
        // Wait a frame before unlocking normal scroll recording
        setTimeout(() => this.initialScrollRestored = true, 100);
      } else {
        this.initialScrollRestored = true;
      }
    }, 50);
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

  onDiscClick(disc: SpotifyAlbum) {
    // Navigate to disc details routing, passing the whole disc object via state
    // so we don't necessarily have to re-fetch if we have enough data (depending on requirements)
    // But we'll pass the ID so the details page can fetch more if needed
    this.router.navigate(['/disc', disc.id], { state: { disc } });
  }
}
