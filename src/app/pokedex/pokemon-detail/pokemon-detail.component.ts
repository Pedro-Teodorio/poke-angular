import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PokemonService } from '../../core/services/pokemon.service';
import { Observable, switchMap } from 'rxjs';
import { Pokemon } from '../../core/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pokemon-detail.component.html',
  styles: [`
    .pokemon-image-bg {
      background-color: #f2f2f2;
      border-radius: 10px;
    }
    .pokemon-name {
      text-transform: capitalize;
    }
    .type-badge {
      text-transform: capitalize;
    }
    .stat-name {
      text-transform: capitalize;
    }
  `]
})
export class PokemonDetailComponent {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(PokemonService);

  pokemon$: Observable<Pokemon> = this.route.params.pipe(
    switchMap(params => this.pokemonService.getPokemonDetails(params['name']))
  );
}