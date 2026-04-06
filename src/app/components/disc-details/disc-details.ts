import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';

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

  discId = '';
  discData = signal<any>(null);
  isLoading = signal(true);

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
}
