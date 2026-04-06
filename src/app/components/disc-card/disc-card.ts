import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyAlbum } from '../../models/spotify.models';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-disc-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disc-card.html',
  styleUrls: ['./disc-card.scss']
})
export class DiscCard {
  @Input() disc!: SpotifyAlbum;
  @Output() discClick = new EventEmitter<SpotifyAlbum>();

  private collectionService = inject(CollectionService);
  imageLoaded = false;

  get isLiked(): boolean {
    return this.collectionService.isInCollection(this.disc.id);
  }

  onClick() {
    this.discClick.emit(this.disc);
  }

  onToggleHeart(event: Event) {
    event.stopPropagation(); // Prevent card navigation
    this.collectionService.toggleCollection(this.disc);
  }
}
