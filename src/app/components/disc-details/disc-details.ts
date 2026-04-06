import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-disc-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disc-details.html',
  styleUrls: ['./disc-details.scss']
})
export class DiscDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spotifyService = inject(SpotifyService);
  private collectionService = inject(CollectionService);

  discId = '';
  discData = signal<any>(null);
  isLoading = signal(true);
  imageLoaded = signal(false);

  // Helper to check if currently liked
  get isLiked(): boolean {
    return this.discData() ? this.collectionService.isInCollection(this.discData().id) : false;
  }

  ngOnInit() {
    this.discId = this.route.snapshot.paramMap.get('id') || '';
    
    // Check if we passed data via router state (for instant loading of basic info)
    const state = history.state;
    if (state && state.disc) {
      this.discData.set(state.disc);
      this.isLoading.set(false);
    }

    // Always fetch the rich detailed data for the album requirements
    this.fetchAlbumDetails();
  }

  fetchAlbumDetails() {
    if (!this.discId) return;

    this.isLoading.set(true);
    this.spotifyService.getAlbum(this.discId).subscribe({
      next: (res) => {
        this.discData.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch album details', err);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onToggleCollection() {
    if (this.discData()) {
      this.collectionService.toggleCollection(this.discData());
    }
  }
}
