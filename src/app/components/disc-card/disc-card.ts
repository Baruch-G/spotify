import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyAlbum } from '../../models/spotify.models';

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

  imageLoaded = false;

  onClick() {
    this.discClick.emit(this.disc);
  }
}
