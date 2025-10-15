import { Component, Input } from '@angular/core';
import { Pokemon } from '../../core/models';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pokemon-card.component.html',
  styles: [`
    :host {
      display: block;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    :host:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .pokemon-name {
      text-transform: capitalize;
    }
    .pokemon-image {
      max-width: 90%;
      height: auto;
      margin: 0 auto;
      display: block;
    }
  `]
})
export class PokemonCardComponent {
  @Input() pokemon!: Pokemon;
}