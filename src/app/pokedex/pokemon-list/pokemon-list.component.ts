import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../core/services/pokemon.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { Pokemon, NamedApiResource } from '../../core/models';
import { Observable, BehaviorSubject, switchMap, debounceTime, distinctUntilChanged, combineLatest, startWith, map, shareReplay, tap, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styles: [`
    .pokemon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
  `]
})
export class PokemonListComponent implements OnInit {
  private pokemonService = inject(PokemonService);

  // Subjects for reactive streams
  public searchSubject = new BehaviorSubject<string>('');
  public typeSubject = new BehaviorSubject<string>('');
  private pageSubject = new BehaviorSubject<number>(0);

  // Observables
  pokemons$!: Observable<Pokemon[]>;
  types$: Observable<NamedApiResource[]> = this.pokemonService.getTypes();
  
  // All pokemons for client-side search
  private allPokemons: Pokemon[] = [];

  // Pagination
  limit = 20;
  currentPage = 1;
  totalPokemons = 0;

  ngOnInit(): void {
    // Fetch all pokemons for client-side searching
    this.pokemonService.getAllPokemons().pipe(
      switchMap(response => this.pokemonService.getPokemonDetailsList(response.results))
    ).subscribe(pokemons => {
      this.allPokemons = pokemons;
    });

    const search$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    const type$ = this.typeSubject.pipe(startWith(''));
    const page$ = this.pageSubject.pipe(startWith(0));

    const combined$ = combineLatest([search$, type$, page$]).pipe(
      switchMap(([searchTerm, type, page]) => {
        if (searchTerm) {
          const filteredPokemons = this.allPokemons.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return of({ results: filteredPokemons, count: filteredPokemons.length });
        } else if (type) {
          return this.pokemonService.getPokemonsByType(type).pipe(
            map(results => ({ results, count: results.length }))
          );
        } else {
          return this.pokemonService.getPokemons(page * this.limit, this.limit);
        }
      }),
      tap(response => this.totalPokemons = response.count),
      switchMap(response => {
        if (response.results.length > 0) {
          // If results are already Pokemon objects (from search), just return them
          if (response.results[0].hasOwnProperty('sprites')) {
            return of(response.results as Pokemon[]);
          }
          return this.pokemonService.getPokemonDetailsList(response.results as NamedApiResource[]);
        }
        return of([]); // Retorna vazio se não houver resultados
      }),
      shareReplay(1)
    );

    this.pokemons$ = combined$;
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
    this.resetPage();
  }

  onTypeChange(event: Event): void {
    const type = (event.target as HTMLSelectElement).value;
    this.typeSubject.next(type);
    this.resetPage();
  }

  clearFilters(): void {
    this.searchSubject.next('');
    this.typeSubject.next('');
    this.resetPage();
  }

  nextPage(): void {
    if ((this.currentPage * this.limit) < this.totalPokemons) {
      this.currentPage++;
      this.pageSubject.next(this.currentPage - 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageSubject.next(this.currentPage - 1);
    }
  }

  private resetPage(): void {
    this.currentPage = 1;
    this.pageSubject.next(0);
  }
}