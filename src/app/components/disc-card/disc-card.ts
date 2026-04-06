import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-disc-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disc-card.html',
  styleUrls: ['./disc-card.scss']
})
export class DiscCard {
  @Input() disc: any;
  @Output() discClick = new EventEmitter<any>();

  onClick() {
    this.discClick.emit(this.disc);
  }
}
