import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { DiscCard } from '../disc-card/disc-card';
import { SpotifyAlbum } from '../../models/spotify.models';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, RouterModule, DiscCard],
  templateUrl: './collection.html',
  styleUrls: ['./collection.scss']
})
export class Collection {
  private collectionService = inject(CollectionService);
  private router = inject(Router);

  // Expose signal directly for UI
  savedDiscs = this.collectionService.collectionItems;

  onDiscClick(disc: SpotifyAlbum) {
    this.router.navigate(['/disc', disc.id], { state: { disc } });
  }

  onRemove(id: string) {
    this.collectionService.removeFromCollection(id);
  }
}
