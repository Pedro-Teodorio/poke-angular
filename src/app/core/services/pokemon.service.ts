import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { ApiListResponse, NamedApiResource, Pokemon } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  getPokemons(offset: number = 0, limit: number = 20): Observable<ApiListResponse<NamedApiResource>> {
    const params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get<ApiListResponse<NamedApiResource>>(`${this.baseUrl}/pokemon`, { params });
  }

  getPokemonDetails(name: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${name}`);
  }

  getPokemonDetailsList(apiResources: NamedApiResource[]): Observable<Pokemon[]> {
    const detailObservables = apiResources.map(pokemon => this.getPokemonDetails(pokemon.name));
    return forkJoin(detailObservables);
  }

  getTypes(): Observable<NamedApiResource[]> {
    return this.http.get<ApiListResponse<NamedApiResource>>(`${this.baseUrl}/type`).pipe(
      map(response => response.results)
    );
  }

  getPokemonsByType(type: string): Observable<NamedApiResource[]> {
    if (!type) {
      return this.getPokemons().pipe(map(res => res.results));
    }
    return this.http.get<any>(`${this.baseUrl}/type/${type}`).pipe(
      map(response => response.pokemon.map((p: any) => p.pokemon))
    );
  }
}